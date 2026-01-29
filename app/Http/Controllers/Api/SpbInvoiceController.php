<?php

// app/Http/Controllers/Api/SpbInvoiceController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SpbModel;
use App\Models\SpbInvoiceModel;
use Illuminate\Http\Request;
use App\Helpers\ClosingBook;

class SpbInvoiceController extends Controller
{
    public function index()
    {
        $data = SpbInvoiceModel::with('spb','do')
            ->orderByDesc('spb_invoice_id')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $data
        ]);
    }
    public function store(Request $request)
    {
        ClosingBook::check($request->invoice_date);
        $request->validate([
            'spb_id' => 'required|exists:tb_spb,spb_id',
            'invoice_no' => 'required',
        ]);

        $invoice = SpbInvoiceModel::create([
            'spb_id' => $request->spb_id,
            'spb_do_id' => $request->spb_do_id,
            'invoice_no' => $request->invoice_no,
            'invoice_date' => $request->invoice_date,
            'invoice_email_date' => $request->invoice_email_date,
        ]);

        // UPDATE STATUS SPB
        SpbModel::where('spb_id', $request->spb_id)
            ->update(['spb_status' => 'DONE']);

        return response()->json($invoice, 201);
    }
}
