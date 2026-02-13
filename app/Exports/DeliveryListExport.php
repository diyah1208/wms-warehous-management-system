<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class DeliveryListExport implements
    FromCollection,
    WithHeadings,
    WithStyles,
    ShouldAutoSize
{
    protected $deliveries;

    public function __construct($deliveries)
    {
        $this->deliveries = $deliveries;
    }

    public function collection()
    {
        $rows = collect();
        $no = 1;

        foreach ($this->deliveries as $delivery) {
            foreach ($delivery->details as $detail) {
                $rows->push([
                    'no'            => $no++,
                    'dlv_kode'      => $delivery->dlv_kode,
                    'mr_kode'       => $delivery->mr?->mr_kode ?? '-',
                    'dari_gudang'   => $delivery->dlv_dari_gudang,
                    'ke_gudang'     => $delivery->dlv_ke_gudang,
                    'ekspedisi'     => $delivery->dlv_ekspedisi,
                    'resi'          => $delivery->dlv_no_resi,

                    // DETAIL
                    'part_number'   => $detail->dtl_dlv_part_number,
                    'part_name'     => $detail->dtl_dlv_part_name,
                    'part_satuan'   => $detail->dtl_dlv_satuan,
                    'qty_pending'   => $detail->qty_pending,
                    'qty_delivered' => $detail->qty_delivered,

                    'jumlah_koli'   => $delivery->dlv_jumlah_koli,
                    'status'        => strtoupper($delivery->dlv_status),
                ]);
            }
        }

        return $rows;
    }



    public function headings(): array
    {
        return [
            'No',
            'Kode Delivery',
            'Kode MR',
            'Dari Gudang',
            'Ke Gudang',
            'Ekspedisi',
            'No Resi',
            'Part Number',
            'Part Name',
            'Part Satuan',
            'Qty Pending',
            'Qty Delivered',
            'Jumlah Koli',
            'Status',
        ];
    }


    public function styles(Worksheet $sheet)
    {
        $lastRow    = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        return [
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

            "A2:A{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
            "G2:G{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
            "H2:H{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];
    }
}
