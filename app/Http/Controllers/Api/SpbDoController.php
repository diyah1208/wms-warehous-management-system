<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SpbModel;
use App\Models\SpbDoModel;
use App\Models\SpbPoModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\ClosingBook;

class SpbDoController extends Controller
{
    public function index()
    {
       $data = SpbDoModel::with([
            'po.details.spbDetail',
            'details.poDetail.spbDetail'
        ])
            ->orderByDesc('spb_do_id')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $data
        ]);
    }

    // public function store(Request $request)
    // {
    //     ClosingBook::check($request->do_date);

    //     $request->validate([
    //         'spb_po_id' => 'required',
    //         'do_no'     => 'required',
    //         'do_date'   => 'required|date',
    //         'details'   => 'required|array|min:1',
    //     ]);

    //     $do = null;

    //     DB::transaction(function () use ($request, &$do) {

    //         /** HEADER DO */
    //         $do = SpbDoModel::create([
    //             'spb_po_id' => $request->spb_po_id,
    //             'do_no'     => $request->do_no,
    //             'do_date'   => $request->do_date,
    //             'do_status_part' => 'DELIVERED'
    //         ]);

    //         /** DETAIL DO */
    //         foreach ($request->details as $item) {
    //             DB::table('dtl_spb_do')->insert([
    //                 'spb_do_id' => $do->spb_do_id,
    //                 'spb_po_dtl_id' => $item['spb_po_dtl_id'],
    //                 'created_at' => now(),
    //                 'updated_at' => now(),
    //             ]);
    //         }

    //         /** UPDATE STATUS SPB */
    //         $po = SpbPoModel::findOrFail($request->spb_po_id);

    //         SpbModel::where('spb_id', $po->spb_id)
    //             ->update([
    //                 'spb_status' => 'DO_ATTACH'
    //             ]);
    //     });

    //     return response()->json([
    //         'status' => true,
    //         'message' => 'Delivery Order berhasil dibuat',
    //         'spb_do_id' => $do->spb_do_id,
    //         'do_no' => $do->do_no
    //     ]);
    // }
//     public function store(Request $request)
// {
//     ClosingBook::check($request->do_date);

//     $request->validate([
//         'spb_po_id' => 'required',
//         'do_no'     => 'required',
//         'do_date'   => 'required|date',
//         'details'   => 'required|array|min:1',
//     ]);

//     $do = null;
//     if (SpbDoModel::where('spb_po_id', $request->spb_po_id)->exists()) {
//     return response()->json([
//         'message' => 'DO untuk PO ini sudah dibuat'
//     ], 422);
// }

//     DB::transaction(function () use ($request, &$do) {

//         /** HEADER DO */
        
//         $do = SpbDoModel::create([
//             'spb_po_id' => $request->spb_po_id,
//             'do_no'     => $request->do_no,
//             'do_date'   => $request->do_date,
//             'do_status_part' => 'DELIVERED',
//         ]);

//         /** DETAIL DO (SAMA POLA PO) */
//         foreach ($request->details as $item) {
//             DB::table('dtl_spb_do')->insert([
//                 'spb_do_id'     => $do->spb_do_id,
//                 'spb_po_dtl_id'=> $item['spb_po_dtl_id'],
//                 'created_at'   => now(),
//                 'updated_at'   => now(),
//             ]);
//         }

//         /** UPDATE STATUS SPB */
//         $po = SpbPoModel::findOrFail($request->spb_po_id);

//         SpbModel::where('spb_id', $po->spb_id)
//             ->update([
//                 'spb_status' => 'DO_ATTACH'
//             ]);
//     });

//     return response()->json([
//         'status' => true,
//         'message' => 'Delivery Order berhasil dibuat',
//         'spb_do_id' => $do->spb_do_id,
//         'do_no' => $do->do_no,
//     ]);
// }
public function store(Request $request)
{
    ClosingBook::check($request->do_date);

    $request->validate([
        'spb_po_id' => 'required',
        'do_no'     => 'required',
        'do_date'   => 'required|date',
        'details'   => 'required|array|min:1',
    ]);

    $do = null;

    DB::transaction(function () use ($request, &$do) {

        // 🔥 CEK APAKAH SUDAH ADA DO UNTUK PO INI
        $do = SpbDoModel::where('spb_po_id', $request->spb_po_id)->first();

        if (!$do) {
            // Kalau belum ada → create
            $do = SpbDoModel::create([
                'spb_po_id' => $request->spb_po_id,
                'do_no'     => $request->do_no,
                'do_date'   => $request->do_date,
                'do_status_part' => 'DELIVERED',
            ]);
        } else {
            // Kalau sudah ada → update saja
            $do->update([
                'do_no'   => $request->do_no,
                'do_date' => $request->do_date,
            ]);

            // HAPUS DETAIL LAMA
            DB::table('dtl_spb_do')
                ->where('spb_do_id', $do->spb_do_id)
                ->delete();
        }

        // INSERT DETAIL BARU
        foreach ($request->details as $item) {
            DB::table('dtl_spb_do')->insert([
                'spb_do_id'     => $do->spb_do_id,
                'spb_po_dtl_id' => $item['spb_po_dtl_id'],
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }

        // UPDATE STATUS SPB
        $po = SpbPoModel::findOrFail($request->spb_po_id);

        SpbModel::where('spb_id', $po->spb_id)
            ->update([
                'spb_status' => 'DO_ATTACH'
            ]);
    });

    return response()->json([
        'status' => true,
        'message' => 'Delivery Order berhasil disimpan',
        'spb_do_id' => $do->spb_do_id,
        'do_no' => $do->do_no,
    ]);
}
}