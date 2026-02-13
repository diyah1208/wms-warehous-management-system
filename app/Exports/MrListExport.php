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

class MrListExport implements
    FromCollection,
    WithHeadings,
    WithStyles,
    ShouldAutoSize
{
    protected Collection $mrs;

    public function __construct(Collection $mrs)
    {
        $this->mrs = $mrs;
    }

public function collection()
{
    $no = 1;

    return $this->mrs->flatMap(function ($mr) use (&$no) {

        if ($mr->details->isEmpty()) {
            return [[
                'no'            => $no++,
                'mr_kode'       => $mr->mr_kode,
                'tanggal_mr'    => optional($mr->mr_tanggal)->format('d-m-Y'),
                'due_date'      => optional($mr->mr_due_date)->format('d-m-Y'),
                'lokasi'        => $mr->mr_lokasi,
                'pic'           => $mr->mr_pic,
                'status'        => strtoupper($mr->mr_status),
                'jumlah_barang' => 0,

                'part_number'   => '',
                'part_name'     => '',
                'satuan'        => '',
                'prioritas'     => '',
                'qty_request'   => 0,
                'qty_received'  => 0,
            ]];
        }

        $jumlahBarang = $mr->details->count();

        return $mr->details->map(function ($dtl) use ($mr, &$no, $jumlahBarang) {
            return [
                'no'            => $no++,
                'mr_kode'       => $mr->mr_kode,
                'tanggal_mr'    => optional($mr->mr_tanggal)->format('d-m-Y'),
                'due_date'      => optional($mr->mr_due_date)->format('d-m-Y'),
                'lokasi'        => $mr->mr_lokasi,
                'pic'           => $mr->mr_pic,
                'status'        => strtoupper($mr->mr_status),
                'jumlah_barang' => $jumlahBarang,

                'part_number'   => $dtl->dtl_mr_part_number,
                'part_name'     => $dtl->dtl_mr_part_name,
                'satuan'        => $dtl->dtl_mr_satuan,
                'prioritas'     => $dtl->dtl_mr_prioritas,
                'qty_request'   => $dtl->dtl_mr_qty_request,
                'qty_received'  => $dtl->dtl_mr_qty_received,
            ];
        });
    });
}


    public function headings(): array
    {
        return [
            'No',
            'Kode MR',
            'Tanggal MR',
            'Due Date',
            'Lokasi',
            'PIC',
            'Status',
            'Jumlah Barang',
            'Part Number',
            'Nama Part',
            'Satuan',
            'Prioritas',
            'Qty Request',
            'Qty Received',
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
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                    ],
                ],
            ],

            // BODY
            "A2:{$lastColumn}{$lastRow}" => [
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                    ],
                ],
            ],

            // TANGGAL CENTER
            "C2:D{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],

            // JUMLAH BARANG & QTY RIGHT
            "H2:H{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                ],
            ],
            "L2:M{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                ],
            ],
        ];
    }
}