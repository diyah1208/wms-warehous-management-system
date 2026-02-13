<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Carbon\Carbon;

class PoListExport implements
    FromCollection,
    WithHeadings,
    WithStyles,
    ShouldAutoSize
{
    protected Collection $pos;

    public function __construct(Collection $pos)
    {
        $this->pos = $pos;
    }

    public function collection()
    {
        $no = 1;

        return $this->pos
            ->load([
                'purchaseRequest',
                'details.vendor', // 🔥 detail PO + vendor
            ])
            ->flatMap(function ($po) use (&$no) {

                // 🔹 PO TANPA DETAIL → tetap 1 baris
                if ($po->details->isEmpty()) {
                    return [[
                        'no'           => $no++,
                        'po_kode'      => $po->po_kode,
                        'pr_kode'      => $po->purchaseRequest?->pr_kode ?? '-',
                        'tanggal_po'   => $po->po_tanggal
                            ? Carbon::parse($po->po_tanggal)->format('d-m-Y')
                            : '-',
                        'estimasi'     => $po->po_estimasi
                            ? Carbon::parse($po->po_estimasi)->format('d-m-Y')
                            : '-',
                        'status'       => strtoupper($po->po_status),

                        'part_number'  => '',
                        'part_name'    => '',
                        'qty_po'       => 0,
                        'harga'        => 0,
                        'vendor'       => '',
                    ]];
                }

                // 🔹 PO DENGAN DETAIL
                return $po->details->map(function ($dtl) use ($po, &$no) {
                    return [
                        'no'           => $no++,
                        'po_kode'      => $po->po_kode,
                        'pr_kode'      => $po->purchaseRequest?->pr_kode ?? '-',
                        'tanggal_po'   => $po->po_tanggal
                            ? Carbon::parse($po->po_tanggal)->format('d-m-Y')
                            : '-',
                        'estimasi'     => $po->po_estimasi
                            ? Carbon::parse($po->po_estimasi)->format('d-m-Y')
                            : '-',
                        'status'       => strtoupper($po->po_status),

                        'part_number'  => $dtl->dtl_po_part_number,
                        'part_name'    => $dtl->dtl_po_part_name,
                        'qty_po'       => $dtl->dtl_po_qty,
                        'harga'        => $dtl->dtl_po_harga ?? 0,
                        'vendor'       => $dtl->vendor?->vendor_name ?? '-',
                    ];
                });
            });
    }

    public function headings(): array
    {
        return [
            'No',
            'Kode PO',
            'Kode PR',
            'Tanggal PO',
            'Tanggal Estimasi',
            'Status',
            'Part Number',
            'Nama Part',
            'Qty PO',
            'Harga',
            'Vendor',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow    = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        return [
            // HEADER
            1 => [
                'font' => ['bold' => true],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN],
                ],
            ],

            // BODY
            "A2:{$lastColumn}{$lastRow}" => [
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN],
                ],
            ],

            // TANGGAL CENTER
            "D2:E{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],

            // QTY & HARGA RIGHT
            "I2:J{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                ],
            ],
        ];
    }
}