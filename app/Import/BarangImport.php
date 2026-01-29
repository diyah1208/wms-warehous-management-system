<?php

namespace App\Import;

use App\Models\BarangModel;
use App\Models\StockModel;
use Maatwebsite\Excel\Concerns\{
    ToModel,
    WithHeadingRow,
    WithChunkReading,
    WithBatchInserts,
    ShouldQueue
};

class BarangImport implements
    ToModel,
    WithHeadingRow,
    WithChunkReading,
    WithBatchInserts,
    ShouldQueue
{
    private const LOKASI_LIST = [
        'JAKARTA',
        'MUARA ENIM',
        'BALIKPAPAN',
        'SITE BA',
        'SITE TAL',
        'SITE MIP',
        'SITE MIFA',
        'SITE BIB',
        'SITE AMI',
        'SITE TABANG',
    ];

    public function model(array $row)
    {
        // skip baris kosong
        if (
            empty($row['part_number']) ||
            empty($row['part_name']) ||
            empty($row['part_satuan'])
        ) {
            return null;
        }

        // skip kalau sudah ada
        if (BarangModel::where('part_number', $row['part_number'])->exists()) {
            return null;
        }

        // insert master part
        $barang = BarangModel::create([
            'part_number' => $row['part_number'],
            'part_name'   => $row['part_name'],
            'part_satuan' => $row['part_satuan'],
        ]);

        // auto-generate stock = 0 untuk semua lokasi
        foreach (self::LOKASI_LIST as $lokasi) {
            StockModel::create([
                'part_id'      => $barang->part_id,
                'stk_location' => $lokasi,
                'stk_qty'      => 0,
                'stk_min'      => 0,
                'stk_max'      => 0,
            ]);
        }

        return null;
    }

    public function chunkSize(): int
    {
        return 500; // aman untuk server
    }

    public function batchSize(): int
    {
        return 500;
    }
}
