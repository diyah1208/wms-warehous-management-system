<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SpbModel;
use App\Models\SpbPoModel;
use App\Models\SpbPoDetailModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\ClosingBook;


class SpbPoController extends Controller
{
    public function index()
    {
        $data = SpbPoModel::with('spb', 'details.spbDetail')
            ->orderByDesc('spb_po_id')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $data
        ]);
    }
    // public function store(Request $request)
    // {
    //     ClosingBook::check($request->so_date);

    //     $request->validate([
    //         'spb_id' => 'required',
    //         'po_no' => 'required',
    //         'details' => 'required|array|min:1',
    //     ]);

    //     $po = null;

    //     DB::transaction(function () use ($request, &$po) {

    //         $po = SpbPoModel::create([
    //             'spb_id' => $request->spb_id,
    //             'po_no' => $request->po_no,
    //             'so_no' => $request->so_no,
    //             'so_date' => $request->so_date,
    //         ]);

    //         foreach ($request->details as $item) {
    //             DB::table('dtl_spb_po')->insert([
    //                 'spb_po_id' => $po->spb_po_id,
    //                 'spb_dtl_id' => $item['spb_dtl_id'],
    //                 'created_at' => now(),
    //                 'updated_at' => now(),
    //             ]);
    //         }

    //          SpbModel::where('spb_id', $request->spb_id)
    //         ->update([
    //             'spb_status' => 'PO_ATTACH'
    //         ]);

    //     });
    //     return response()->json([
    //         'status' => true,
    //         'message' => 'PO berhasil di-attach ke SPB',
    //         'spb_po_id' => $po->spb_po_id,
    //         'po_no' => $po->po_no,
            
    //     ]);
    // }
//     public function store(Request $request)
// {
//     ClosingBook::check($request->so_date);

//     $request->validate([
//         'spb_id'  => 'required',
//         'po_no'   => 'required',
//         'details' => 'required|array|min:1',
//     ]);

//     $po = null;

//     DB::transaction(function () use ($request, &$po) {

//         $po = SpbPoModel::where('spb_id', $request->spb_id)->first();

//         if (!$po) {
//             $po = SpbPoModel::create([
//                 'spb_id'  => $request->spb_id,
//                 'po_no'   => $request->po_no,
//                 'so_no'   => $request->so_no,
//                 'so_date' => $request->so_date,
//             ]);
//         } else {
//             $po->update([
//                 'po_no'   => $request->po_no,
//                 'so_no'   => $request->so_no,
//                 'so_date' => $request->so_date,
//             ]);

//             DB::table('dtl_spb_po')
//                 ->where('spb_po_id', $po->spb_po_id)
//                 ->delete();
//         }

//         foreach ($request->details as $item) {
//             DB::table('dtl_spb_po')->insert([
//                 'spb_po_id' => $po->spb_po_id,
//                 'spb_dtl_id'=> $item['spb_dtl_id'],
//                 'created_at'=> now(),
//                 'updated_at'=> now(),
//             ]);
//         }

//         SpbModel::where('spb_id', $request->spb_id)
//             ->update([
//                 'spb_status' => 'PO_ATTACH'
//             ]);
//     });

//     return response()->json([
//         'status' => true,
//         'message' => 'PO berhasil disimpan',
//         'spb_po_id' => $po->spb_po_id,
//         'po_no' => $po->po_no,
//     ]);
// }
public function store(Request $request)
{
    // ClosingBook::check($request->so_date);

    $request->validate([
        'spb_id' => 'required|exists:tb_spb,spb_id',
        'po_no' => 'required|unique:tb_spb_po,po_no',
        'details' => 'required|array|min:1',
        'details.*.spb_dtl_id' => 'required|exists:tb_spb_detail,spb_dtl_id'
    ]);

    $po = null;

    DB::transaction(function () use ($request, &$po) {

        /** CREATE PO HEADER */
        $po = SpbPoModel::create([
            'spb_id' => $request->spb_id,
            'po_no' => $request->po_no,
            'so_no' => $request->so_no,
            'so_date' => $request->so_date,
        ]);

        /** INSERT PO DETAIL */
        foreach ($request->details as $item) {

            DB::table('dtl_spb_po')->insert([
                'spb_po_id' => $po->spb_po_id,
                'spb_dtl_id'=> $item['spb_dtl_id'],
                'created_at'=> now(),
                'updated_at'=> now(),
            ]);
        }

        /** UPDATE STATUS SPB */
        SpbModel::where('spb_id', $request->spb_id)
            ->update([
                'spb_status' => 'PO_ATTACH'
            ]);
    });

    return response()->json([
        'status' => true,
        'message' => 'PO berhasil dibuat',
        'spb_po_id' => $po->spb_po_id,
        'po_no' => $po->po_no,
    ]);
}
}

