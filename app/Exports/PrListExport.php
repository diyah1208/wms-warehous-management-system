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

class PrListExport implements
    FromCollection,
    WithHeadings,
    WithStyles,
    ShouldAutoSize
{
    protected Collection $prs;

    public function __construct(Collection $prs)
    {
        $this->prs = $prs;
    }

    public function collection()
    {
        $no = 1;

        return $this->prs->flatMap(function ($pr) use (&$no) {

            // 🔥 FORMAT TANGGAL SEKALI
            $tanggalPr = $pr->pr_tanggal
                ? Carbon::parse($pr->pr_tanggal)->format('d-m-Y')
                : '';

            $jumlahBarang = $pr->details?->count() ?? 0;

            // PR TANPA DETAIL
            if ($pr->details->isEmpty()) {
                return [[
                    'no'             => $no++,
                    'pr_kode'        => $pr->pr_kode,
                    'tanggal_pr'     => $tanggalPr,
                    'lokasi'         => $pr->pr_lokasi,
                    'pic'            => $pr->pr_pic,
                    'status'         => strtoupper($pr->pr_status),
                    'jumlah_barang'  => 0,
                    'part_number'    => '',
                    'part_name'      => '',
                    'satuan'         => '',
                    'qty'            => 0,
                    'mr_kode'        => '',
                ]];
            }

            // PR DENGAN DETAIL
            return $pr->details->map(function ($dtl) use ($pr, &$no, $jumlahBarang, $tanggalPr) {
                return [
                    'no'             => $no++,
                    'pr_kode'        => $pr->pr_kode,
                    'tanggal_pr'     => $tanggalPr,
                    'lokasi'         => $pr->pr_lokasi,
                    'pic'            => $pr->pr_pic,
                    'status'         => strtoupper($pr->pr_status),
                    'jumlah_barang'  => $jumlahBarang,
                    'part_number'    => $dtl->dtl_pr_part_number,
                    'part_name'      => $dtl->dtl_pr_part_name,
                    'satuan'         => $dtl->dtl_pr_satuan,
                    'qty'            => $dtl->dtl_pr_qty,
                    'mr_kode'        => $dtl->mr?->mr_kode,
                ];
            });
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'Kode PR',
            'Tanggal PR',
            'Lokasi',
            'PIC',
            'Status',
            'Jumlah Barang',
            'Part Number',
            'Nama Part',
            'Satuan',
            'Qty',
            'Berdasarkan MR',
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
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN],
                ],
            ],

            "A2:{$lastColumn}{$lastRow}" => [
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN],
                ],
            ],

            "C2:C{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],

            "J2:J{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                ],
            ],
        ];
    }
}