<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SpbReturnModel;
use App\Models\ReturnSpbDetailModel;
use App\Models\SpbModel;
use App\Models\SpbDetailModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\ClosingBook;

class SpbReturnController extends Controller
{

    public function index()
    {
        $data = SpbReturnModel::with([
                'details.part'
            ])
            ->orderBy('rtn_tanggal', 'desc')
            ->get();

        return response()->json($data);
    }


    public function showByKode($kode)
    {
        $kode = base64_decode($kode);

        $return = SpbReturnModel::with([
                'details.part','spb'
            ])
            ->where('rtn_kode', $kode)
            ->first();

        if (!$return) {
            return response()->json([
                'kode_dicari' => $kode,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        return response()->json($return);
    }


    // public function store(Request $request)
    // {
    //     ClosingBook::check($request->rtn_tanggal);

    //     $request->validate([
    //         "spb_id" => "required|exists:tb_spb,spb_id",
    //         "rtn_tanggal" => "required|date",
    //         "details"     => "required|array|min:1",
    //         "details.*.spb_dtl_id" => "required|exists:tb_spb_detail,spb_dtl_id",
    //     ]);

    //     $return = null;

    //     DB::transaction(function () use ($request, &$return) {

    //         $return = SpbReturnModel::create([
    //             "rtn_kode"     => $request->rtn_kode,
    //             "spb_id"       => $request->spb_id,
    //             "rtn_tanggal"  => $request->rtn_tanggal,
    //             "rtn_note"     => $request->rtn_note,
    //             "rtn_status"   => 'Posted',
    //         ]);

    //         foreach ($request->details as $item) {

    //             $spbDetail = SpbDetailModel::findOrFail($item['spb_dtl_id']);

    //             $maxReturn = $spbDetail->dtl_spb_qty - $spbDetail->dtl_spb_qty_returned;

    //             if ($item['qty_return'] > $maxReturn) {
    //                 throw new \Exception(
    //                     "Qty return melebihi sisa qty untuk item ID {$spbDetail->spb_dtl_id}"
    //                 );
    //             }

    //             ReturnSpbDetailModel::create([
    //                 "rtn_id"             => $return->rtn_id,
    //                 "spb_dtl_id"         => $spbDetail->spb_dtl_id,
    //                 "part_id"            => $spbDetail->part_id,
    //                 "dtl_rtn_qty_return" => $item['qty_return'],
    //             ]);
    //             $spbDetail->increment(
    //                 'dtl_spb_qty_returned',
    //                 $item['qty_return']
    //             );

    //             DB::table('tb_stock')
    //                 ->where('part_id', $spbDetail->part_id)
    //                 ->increment('stk_qty', $item['qty_return']);
    //         }

    //         $allReturned = SpbDetailModel::where('spb_id', $request->spb_id)
    //             ->whereColumn('dtl_spb_qty', '!=', 'dtl_spb_qty_returned')
    //             ->doesntExist();

    //         SpbModel::where('spb_id', $request->spb_id)
    //             ->update([
    //                 'spb_status' => $allReturned ? 'Returned' : 'Partial'
    //             ]);
    //     });

    //     return response()->json([
    //         "status" => true,
    //         "message" => "Return SPB berhasil dibuat",
    //         "rtn_id" => $return->rtn_id,
    //         "rtn_kode" => $return->rtn_kode
    //     ]);
    // }

    public function store(Request $request)
    {
        // ClosingBook::check($request->rtn_tanggal);

        $request->validate([
            "spb_id" => "required|exists:tb_spb,spb_id",
            "rtn_tanggal" => "required|date",
            "details"     => "required|array|min:1",
            "details.*.spb_dtl_id" => "required|exists:tb_spb_detail,spb_dtl_id",
        ]);

        $return = null;

        DB::transaction(function () use ($request, &$return) {

            $spb = SpbModel::findOrFail($request->spb_id);

            $return = SpbReturnModel::create([
                "rtn_kode"     => $request->rtn_kode,
                "spb_id"       => $request->spb_id,
                "rtn_tanggal"  => $request->rtn_tanggal,
                "rtn_note"     => $request->rtn_note,
                "rtn_status"   => 'Posted',
            ]);

            foreach ($request->details as $item) {

                $spbDetail = SpbDetailModel::findOrFail($item['spb_dtl_id']);

                $maxReturn = $spbDetail->dtl_spb_qty - $spbDetail->dtl_spb_qty_returned;

                if ($item['qty_return'] > $maxReturn) {
                    throw new \Exception(
                        "Qty return melebihi sisa qty untuk item ID {$spbDetail->spb_dtl_id}"
                    );
                }

                // simpan detail return
                ReturnSpbDetailModel::create([
                    "rtn_id"             => $return->rtn_id,
                    "spb_dtl_id"         => $spbDetail->spb_dtl_id,
                    "part_id"            => $spbDetail->part_id,
                    "dtl_rtn_qty_return" => $item['qty_return'],
                ]);

                // update qty returned di detail SPB
                $spbDetail->increment(
                    'dtl_spb_qty_returned',
                    $item['qty_return']
                );

                /*
                =================================================
                UPDATE STOCK BERDASARKAN LOKASI ASAL SPB
                =================================================
                */

                $stock = DB::table('tb_stock')
                    ->where('part_id', $spbDetail->part_id)
                    ->where('stk_location', $spb->spb_gudang)
                    ->first();

                if ($stock) {

                    DB::table('tb_stock')
                        ->where('part_id', $spbDetail->part_id)
                        ->where('stk_location', $spb->spb_gudang)
                        ->increment('stk_qty', $item['qty_return']);

                } else {

                    DB::table('tb_stock')->insert([
                        'part_id' => $spbDetail->part_id,
                        'stk_location' => $spb->spb_gudang,
                        'stk_qty' => $item['qty_return']
                    ]);
                }
            }

            /*
            =================================================
            UPDATE STATUS SPB
            =================================================
            */

            $allReturned = SpbDetailModel::where('spb_id', $request->spb_id)
                ->whereColumn('dtl_spb_qty', '!=', 'dtl_spb_qty_returned')
                ->doesntExist();

            SpbModel::where('spb_id', $request->spb_id)
                ->update([
                    'spb_status' => $allReturned ? 'Returned' : 'Partial'
                ]);
        });

        return response()->json([
            "status" => true,
            "message" => "Return SPB berhasil dibuat",
            "rtn_id" => $return->rtn_id,
            "rtn_kode" => $return->rtn_kode
        ]);
    }

    public function generateKodeRtn()
    {
        $tahun = now()->format('Y');
        $bulan = now()->format('m');

        $lastId = SpbReturnModel::max('rtn_id');
        $nextNumber = $lastId ? $lastId + 1 : 1;

        $kode = "RTN/{$tahun}/{$bulan}/{$nextNumber}";

        return response()->json($kode);
    }
}