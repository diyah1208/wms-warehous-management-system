<?php

namespace App\Helpers;

use Carbon\Carbon;

class ClosingBook
{

    public static function check(string $trxDate): void
    {
        $closingDay = config('closing.day', 5);

        $transactionDate = Carbon::parse($trxDate)->startOfDay();
        $closingDate = now()->startOfMonth()->day($closingDay)->startOfDay();

        if ($transactionDate->lessThanOrEqualTo($closingDate)) {
            abort(422, 'Transaksi ditutup untuk periode ini');
        }
    }
}