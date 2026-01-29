<?php

namespace App\Import;

use App\Models\BarangModel;
use App\Models\StockModel;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\{
    ToCollection,
    WithHeadingRow,
    SkipsErrors,
    SkipsOnError
};

class StockImport implements ToCollection, WithHeadingRow, SkipsOnError
{
    use SkipsErrors;

    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {

            foreach ($rows as $row) {

                if (
                    empty($row['part_number']) ||
                    empty($row['stk_location'])
                ) {
                    continue;
                }

                $barang = BarangModel::where(
                    'part_number',
                    $row['part_number']
                )->first();

                // kalau part belum ada → skip
                if (!$barang) {
                    continue;
                }

                $stock = StockModel::where('part_id', $barang->part_id)
                    ->where('stk_location', $row['stk_location'])
                    ->first();

                // kalau lokasi tidak ada → skip
                if (!$stock) {
                    continue;
                }

                $stock->update([
                    'stk_qty' => $row['stk_qty'] ?? $stock->stk_qty,
                    'stk_min' => $row['stk_min'] ?? $stock->stk_min,
                    'stk_max' => $row['stk_max'] ?? $stock->stk_max,
                ]);
            }
        });
    }
}
