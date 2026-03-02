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

class JobCostingExport implements
    FromCollection,
    WithHeadings,
    WithStyles,
    ShouldAutoSize
{
    protected Collection $jobs;

    public function __construct(Collection $jobs)
    {
        $this->jobs = $jobs;
    }

    /* =========================
       DATA
    ========================= */
    public function collection()
    {
        $no = 1;

        return $this->jobs->flatMap(function ($jc) use (&$no) {

            // jika tidak ada item
            if ($jc->items->isEmpty()) {
                return [[
                    'no'            => $no++,
                    'batch_no'      => $jc->batch_no,
                    'tanggal' => \Carbon\Carbon::parse($jc->jc_date)->format('d-m-Y'),

                    'barang_hasil'  => $jc->finish_part,
                    'dibuat_oleh'   => $jc->created_by,
                    'jumlah_item'   => 0,

                    'part_number'   => '',
                    'part_name'     => '',
                    'qty'           => 0,
                    'unit'          => '',
                    'keterangan'    => '',
                ]];
            }

            $jumlahItem = $jc->items->count();

            return $jc->items->map(function ($item) use ($jc, &$no, $jumlahItem) {

                return [
                    'no'            => $no++,
                    'batch_no'      => $jc->batch_no,
                   'tanggal' => \Carbon\Carbon::parse($jc->jc_date)->format('d-m-Y'),

                    'barang_hasil'  => $jc->finish_part,
                    'dibuat_oleh'   => $jc->created_by,
                    'jumlah_item'   => $jumlahItem,

                    'part_number'   => $item->part_no,
                    'part_name'     => $item->barang->part_name ?? '',
                    'qty'           => $item->qty,
                    'unit'          => $item->unit,
            
                ];
            });
        });
    }

    /* =========================
       HEADER KOLOM
    ========================= */
    public function headings(): array
    {
        return [
            'No',
            'Batch No',
            'Tanggal',
            'Barang Baru',
            'Dibuat Oleh',
            'Jumlah Item',
            'Part Number',
            'Nama Part',
            'Qty',
            'Unit',
        ];
    }

    /* =========================
       STYLE EXCEL
    ========================= */
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

            // BODY BORDER
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
            "C2:C{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],

            // JUMLAH & QTY RIGHT
            "F2:F{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                ],
            ],
            "I2:I{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                ],
            ],
        ];
    }
}