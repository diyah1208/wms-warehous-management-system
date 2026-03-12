<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SpbInvoiceModel;
use App\Models\SpbInvDetailModel;
use App\Models\SpbDoModel;
use App\Models\SpbModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\ClosingBook;

class SpbInvoiceController extends Controller
{
    public function index()
    {
        $data = SpbInvoiceModel::with([
            'do.po.spb', 
            'details.doDetail.poDetail.spbDetail'
        ])
        ->orderByDesc('spb_invoice_id')
        ->get();

        return response()->json([
            'status' => true,
            'data' => $data
        ]);
    }

    // public function store(Request $request)
    // {
    //     ClosingBook::check($request->invoice_date);

    //     $request->validate([
    //         'spb_do_id'   => 'required',
    //         'invoice_no'  => 'required',
    //         'invoice_date' => 'required|date',
    //         'details'     => 'required|array|min:1',
    //     ]);

    //     $invoice = null;

    //     DB::transaction(function () use ($request, &$invoice) {

    //         /** HEADER INVOICE */
    //         $invoice = SpbInvoiceModel::create([
    //             'spb_do_id' => $request->spb_do_id,
    //             'invoice_no' => $request->invoice_no,
    //             'invoice_date' => $request->invoice_date,
    //             'invoice_email_date' => $request->invoice_email_date,
    //         ]);

    //         /** DETAIL INVOICE */
    //         foreach ($request->details as $item) {
    //             SpbInvDetailModel::create([
    //                 'spb_invoice_id' => $invoice->spb_invoice_id,
    //                 'spb_do_dtl_id'  => $item['spb_do_dtl_id'],
    //             ]);
    //         }

    //         /** UPDATE STATUS SPB */
    //         $do = SpbDoModel::findOrFail($request->spb_do_id);

    //         $spbId = $do->po->spb_id;

    //         SpbModel::where('spb_id', $spbId)
    //             ->update([
    //                 'spb_status' => 'DONE_QUOTE'
    //             ]);
    //     });

    //     return response()->json([
    //         'status' => true,
    //         'message' => 'Invoice berhasil dibuat',
    //         'spb_invoice_id' => $invoice->spb_invoice_id,
    //         'invoice_no' => $invoice->invoice_no
    //     ]);
    // }
//     public function store(Request $request)
// {
//     ClosingBook::check($request->invoice_date);

//     $request->validate([
//         'spb_do_id'    => 'required',
//         'invoice_no'   => 'required',
//         'invoice_date' => 'required|date',
//         'details'      => 'required|array|min:1',
//     ]);

//     $invoice = null;

//     DB::transaction(function () use ($request, &$invoice) {

//         $invoice = SpbInvoiceModel::where('spb_do_id', $request->spb_do_id)->first();

//         if (!$invoice) {
//             // CREATE
//             $invoice = SpbInvoiceModel::create([
//                 'spb_do_id'         => $request->spb_do_id,
//                 'invoice_no'        => $request->invoice_no,
//                 'invoice_date'      => $request->invoice_date,
//                 'invoice_email_date'=> $request->invoice_email_date,
//             ]);
//         } else {
//             $invoice->update([
//                 'invoice_no'        => $request->invoice_no,
//                 'invoice_date'      => $request->invoice_date,
//                 'invoice_email_date'=> $request->invoice_email_date,
//             ]);

//             SpbInvDetailModel::where('spb_invoice_id', $invoice->spb_invoice_id)
//                 ->delete();
//         }

//         foreach ($request->details as $item) {
//             SpbInvDetailModel::create([
//                 'spb_invoice_id' => $invoice->spb_invoice_id,
//                 'spb_do_dtl_id'  => $item['spb_do_dtl_id'],
//             ]);
//         }

//         $do = SpbDoModel::findOrFail($request->spb_do_id);
//         $spbId = $do->po->spb_id;

//         SpbModel::where('spb_id', $spbId)
//             ->update([
//                 'spb_status' => 'DONE_QUOTE'
//             ]);
//     });

//     return response()->json([
//         'status' => true,
//         'message' => 'Invoice berhasil disimpan',
//         'spb_invoice_id' => $invoice->spb_invoice_id,
//         'invoice_no' => $invoice->invoice_no
//     ]);
// }
public function store(Request $request)
{
    // ClosingBook::check($request->invoice_date);

    $request->validate([
        'spb_do_id' => 'required|exists:tb_spb_do,spb_do_id',
        'invoice_no' => 'required|unique:tb_spb_invoice,invoice_no',
        'invoice_date' => 'required|date',
        'details' => 'required|array|min:1',
        'details.*.spb_do_dtl_id' => 'required|exists:dtl_spb_do,spb_do_dtl_id'
    ]);

    $invoice = null;

    DB::transaction(function () use ($request, &$invoice) {

        /** CREATE HEADER INVOICE */
        $invoice = SpbInvoiceModel::create([
            'spb_do_id' => $request->spb_do_id,
            'invoice_no' => $request->invoice_no,
            'invoice_date' => $request->invoice_date,
            'invoice_email_date' => $request->invoice_email_date,
        ]);

        /** INSERT DETAIL */
        foreach ($request->details as $item) {

            SpbInvDetailModel::create([
                'spb_invoice_id' => $invoice->spb_invoice_id,
                'spb_do_dtl_id' => $item['spb_do_dtl_id'],
            ]);
        }

        /** UPDATE STATUS SPB */
        $do = SpbDoModel::findOrFail($request->spb_do_id);

        $spbId = $do->po->spb_id;

        SpbModel::where('spb_id', $spbId)
            ->update([
                'spb_status' => 'DONE_QUOTE'
            ]);
    });

    return response()->json([
        'status' => true,
        'message' => 'Invoice berhasil dibuat',
        'spb_invoice_id' => $invoice->spb_invoice_id,
        'invoice_no' => $invoice->invoice_no
    ]);
}
}