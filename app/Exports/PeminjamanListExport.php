<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class PeminjamanListExport implements
    FromCollection,
    WithHeadings,
    WithStyles,
    ShouldAutoSize
{
    protected $peminjaman;

    public function __construct($peminjaman)
    {
        $this->peminjaman = $peminjaman;
    }

    public function collection()
    {
        $rows = collect();
        $no = 1;

        foreach ($this->peminjaman as $pmj) {
            foreach ($pmj->details as $detail) {
                $rows->push([
                    'no'        => $no++,
                    'kode'      => $pmj->pmj_kode,
                    'tanggal'   => $pmj->pmj_tanggal,
                    'lokasi'    => $pmj->pmj_lokasi,
                    'peminjam'  => $pmj->pmj_peminjam,

                    // DETAIL
                    'part'      => $detail->dtl_pmj_part_number,
                    'nama'      => $detail->dtl_pmj_part_name,
                    'satuan'    => $detail->dtl_pmj_part_satuan,
                    'qty_pinjam'=> $detail->dtl_pmj_qty_borrowed,
                    'qty_kembali'=> $detail->dtl_pmj_qty_returned,

                    'status'    => strtoupper($pmj->pmj_status),
                ]);
            }
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'No',
            'Kode Peminjaman',
            'Tanggal',
            'Lokasi',
            'Peminjam',
            'Part',
            'Nama',
            'Satuan',
            'Qty Dipinjam',
            'Qty Dikembalikan',
            'Status',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow    = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        return [
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
        ];
    }
}
