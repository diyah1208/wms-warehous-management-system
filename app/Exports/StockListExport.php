<?php

namespace App\Exports;

use Generator;
use App\Models\StockModel;
use Maatwebsite\Excel\Concerns\FromGenerator;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class StockListExport implements 
    FromGenerator,
    WithHeadings,
    WithStyles
{

    public function generator(): Generator
    {
        $stocks = StockModel::with('barang')
            ->orderBy('part_id')
            ->cursor();

        $grouped = [];

        foreach ($stocks as $stock) {

            $partId = $stock->part_id;

            if (!isset($grouped[$partId])) {
                $grouped[$partId] = [
                    'barang' => $stock->barang,
                    'locations' => []
                ];
            }

            $grouped[$partId]['locations'][$stock->stk_location] =
                ($grouped[$partId]['locations'][$stock->stk_location] ?? 0)
                + $stock->stk_qty;
        }

        $i = 1;

        foreach ($grouped as $data) {

            $loc = $data['locations'];
            $barang = $data['barang'];

            $balikpapan = $loc['BALIKPAPAN'] ?? 0;
            $jakarta    = $loc['JAKARTA'] ?? 0;
            $ami        = $loc['SITE AMI'] ?? 0;
            $ba         = $loc['SITE BA'] ?? 0;
            $bib        = $loc['SITE BIB'] ?? 0;
            $mifa       = $loc['SITE MIFA'] ?? 0;
            $mip        = $loc['SITE MIP'] ?? 0;
            $tabang     = $loc['SITE TABANG'] ?? 0;
            $tal        = $loc['SITE TAL'] ?? 0;
            $tanjung    = $loc['MUARA ENIM'] ?? 0;
            $bcp        = $loc['BCP+PIK'] ?? 0;
            $diza       = $loc['SITE DIZA'] ?? 0;

            $sum = $balikpapan + $jakarta + $ami + $ba + $bib
                 + $mifa + $mip + $tabang + $tal + $tanjung + $bcp + $diza;

            yield [
                $i++,
                $barang->part_number ?? '',
                $barang->part_name ?? '',
                $barang->part_satuan ?? '',
                $balikpapan,
                $jakarta,
                $ami,
                $ba,
                $bib,
                $mifa,
                $mip,
                $tabang,
                $tal,
                $tanjung,
                $bcp,
                $diza,
                $sum
            ];
        }
    }

    public function headings(): array
    {
        return [
            'No',
            'Part Number',
            'Part Name',
            'Satuan',
            'BALIKPAPAN',
            'JAKARTA',
            'SITE AMI',
            'SITE BA',
            'SITE BIB',
            'SITE MIFA',
            'SITE MIP',
            'SITE TABANG',
            'SITE TAL',
            'MUARA ENIM',
            'BCP+PIK',
            'SITE DIZA',
            'TOTAL',
        ];
    }

    // public function styles(Worksheet $sheet)
    // {
    //     $lastRow    = $sheet->getHighestRow();
    //     $lastColumn = $sheet->getHighestColumn();

    //     return [

    //         1 => [
    //             'font' => [
    //                 'bold' => true,
    //             ],
    //             'alignment' => [
    //                 'horizontal' => Alignment::HORIZONTAL_CENTER,
    //                 'vertical'   => Alignment::VERTICAL_CENTER,
    //             ],
    //             'borders' => [
    //                 'allBorders' => [
    //                     'borderStyle' => Border::BORDER_THIN,
    //                 ],
    //             ],
    //         ],

    //         "A2:{$lastColumn}{$lastRow}" => [
    //             'alignment' => [
    //                 'vertical' => Alignment::VERTICAL_CENTER,
    //             ],
    //             'borders' => [
    //                 'allBorders' => [
    //                     'borderStyle' => Border::BORDER_THIN,
    //                 ],
    //             ],
    //         ],

    //         "E2:{$lastColumn}{$lastRow}" => [
    //             'alignment' => [
    //                 'horizontal' => Alignment::HORIZONTAL_RIGHT,
    //             ],
    //         ],
    //     ];
    // }
    public function styles(Worksheet $sheet)
    {
        $lastRow    = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();
    
        return [
    
            // HEADER
            1 => [
                'font' => [
                    'bold' => true,
                ],
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
    
            // ANGKA rata kanan
            "E2:{$lastColumn}{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                ],
            ],
    
            // KECILKAN PART NAME
            "C2:C{$lastRow}" => [
                'font' => [
                    'size' => 9
                ],
                'alignment' => [
                    'wrapText' => false
                ],
            ],
    
        ];
    }
}