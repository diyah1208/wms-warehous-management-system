<?php

namespace App\Helpers;

use Carbon\Carbon;

class ClosingBook
{
    public static function check(string $trxDate): void
    {
        $closingDay = config('closing.day', 5);

        $today = now();
        $trx = Carbon::parse($trxDate);

        // tanggal 5 bulan ini jam 23:59
        $closingThisMonth = now()
            ->copy()
            ->day($closingDay)
            ->endOfDay();

        // kalau hari ini masih sebelum / sama dengan closing
        // masih bebas transaksi
        if ($today->lte($closingThisMonth)) {
            return;
        }

        // sudah lewat tanggal 5
        // maka bulan sebelumnya LOCK
        $firstDayThisMonth = now()->startOfMonth();

        if ($trx->lt($firstDayThisMonth)) {
            abort(422, 'Periode sudah ditutup (closing buku)');
        }
    }
}
