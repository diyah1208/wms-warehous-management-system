<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrderModel;
use App\Models\PurchaseOrderDetailModel;
use App\Models\PurchaseRequestModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\PoListExport;
use Maatwebsite\Excel\Facades\Excel;

class PurchaseOrderController extends Controller
{
    public function getPrOpen(Request $request)
    {
        $data = PurchaseRequestModel::with([
                'details',
                'details.mr',
            ])
            ->where('pr_status', 'open')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $data
        ]);
    }


    public function index()
    {
        $pos = PurchaseOrderModel::with('purchaseRequest')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(
            $pos->map(fn ($po) => [
                'id' => $po->po_id,
                'kode' => $po->po_kode,
                'kode_pr' => $po->purchaseRequest->pr_kode ?? null,
                'tanggal' => $po->po_tanggal,
                'tanggal_estimasi' => $po->po_estimasi,
                'status' => strtolower($po->po_status),
                'detail_status' => $po->po_detail_status, 
                'pic' => $po->po_pic,
                'keterangan' => $po->po_keterangan,
                'created_at' => $po->created_at?->toDateTimeString(),
                'updated_at' => $po->updated_at?->toDateTimeString(),
            ])
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'po_kode'        => 'required|unique:tb_purchase_order,po_kode',
            'pr_id'          => 'required|exists:tb_purchase_request,pr_id',
            'po_tanggal'     => 'required|date',
            'po_estimasi'    => 'nullable|date',
            'po_keterangan'  => 'nullable|string',
            'po_pic'         => 'required|string',
            'po_payment_term' => 'required|string',
            'po_status'      => 'required|in:pending,purchased',
            'details'        => 'required|array',
            'details.*.part_id' => 'required',
            'details.*.dtl_po_qty' => 'required|numeric|min:1',
            'details.*.dtl_po_harga' => 'required|numeric|min:1',
// 'details.*.vendor_id'   => 'required|exists:vendors,id',

        ]);

        DB::transaction(function () use ($request) {

            $pr = PurchaseRequestModel::lockForUpdate()
                ->where('pr_id', $request->pr_id)
                ->firstOrFail();
foreach ($request->details as $item) {
    if ($item['dtl_po_qty'] <= 0) {
        abort(422, 'Qty PO harus lebih dari 0');
    }
}

            $po = PurchaseOrderModel::create([
                'po_kode' => $request->po_kode,
                'pr_id' => $request->pr_id,
                'po_tanggal' => $request->po_tanggal,
                'po_estimasi' => $request->po_estimasi,
                'po_payment_term' => $request->po_payment_term,
                'po_status' => $request->po_status,
                'po_detail_status' =>  $request->po_detail_status,
                'po_keterangan' => $request->po_keterangan,
                'po_pic' => $request->po_pic,
                
            ]);

            foreach ($request->details as $item) {
                PurchaseOrderDetailModel::create([
                    'po_id'              => $po->po_id,
                    'part_id'            => $item['part_id'],
                    'dtl_po_part_number' => $item['dtl_po_part_number'],
                    'dtl_po_part_name'   => $item['dtl_po_part_name'],
                    'dtl_po_satuan'      => $item['dtl_po_satuan'],
                    'dtl_po_qty'         => $item['dtl_po_qty'],
                     'dtl_po_harga'       => $item['dtl_po_harga'] ?? null, // 🔥
    'vendor_id'          => $item['vendor_id'] ?? null,    // 🔥
                    'dtl_qty_received'   => 0,
                ]);
            }

            if ($request->po_status === 'purchased') {
                $pr->update(['pr_status' => 'closed']);
            }
        });

        return response()->json([
            'message' => 'Purchase Order berhasil dibuat'
        ], 201);
    }
public function showKode($kode)
{
    $kode = urldecode($kode);

    $po = PurchaseOrderModel::with([
        'purchaseRequest',
        'purchaseRequest.details',
        'purchaseRequest.details.mr',
        'details',
        'details.vendor',
    ])
    ->where('po_kode', $kode)
    ->firstOrFail();

return response()->json([
    'po_id' => $po->po_id,
    'po_kode' => $po->po_kode,
    'po_status' => $po->po_status,
    'po_detail_status' => $po->po_detail_status,
    'po_tanggal' => $po->po_tanggal,
    'po_estimasi' => $po->po_estimasi,
    'po_payment_term' => $po->po_payment_term, // 🔥 INI WAJIB
    'po_pic' => $po->po_pic,
    'po_keterangan' => $po->po_keterangan,
    'signed_pengaju_sign' => $po->signed_pengaju_sign,
    'signed_pengaju_name' => $po->signed_pengaju_name,
    'signed_pengaju_at' => $po->signed_pengaju_at,
    'details' => $po->details,
    'purchase_request' => $po->purchaseRequest,
]);
}


    public function show($id)
    {
        $po = PurchaseOrderModel::with(['purchaseRequest', 'details'])
            ->findOrFail($id);

        return response()->json([
            'id' => $po->po_id,
            'kode' => $po->po_kode,
            'kode_pr' => $po->purchaseRequest->pr_kode ?? null,
            'tanggal' => $po->po_tanggal,
            'tanggal_estimasi' => $po->po_estimasi,
            'po_payment_term' => $request->po_payment_term,
            'status' => strtolower($po->po_status),
            'po_detail_status' => $po->po_detail_status, 
            'pic' => $po->po_pic,
            'keterangan' => $po->po_keterangan,
            'created_at' => $po->created_at?->toDateTimeString(),
            'updated_at' => $po->updated_at?->toDateTimeString(),
            'details' => $po->details->map(fn ($d) => [
                'po_detail_id' => $d->dtl_po_id,
                'part_id' => $d->part_id,
                'part_number' => $d->dtl_po_part_number,
                'part_name' => $d->dtl_po_part_name,
                'satuan' => $d->dtl_po_satuan,
                'qty_order' => $d->dtl_po_qty,
                'qty_received' => $d->dtl_qty_received,
            ]),
        ]);
    }

    public function update(Request $request, $id)
    {
        $po = PurchaseOrderModel::lockForUpdate()->findOrFail($id);

        if ($po->po_status !== 'pending') {
            return response()->json([
                'message' => 'PO tidak dapat diedit karena status sudah ' . $po->po_status
            ], 403);
        }

      $data = $request->validate([
    'po_status' => 'required|in:pending,purchased',
    'po_detail_status' => 'required|string|max:50',
    'po_keterangan' => 'nullable|string',
    'po_estimasi' => 'nullable|date',
]);

      DB::transaction(function () use ($po, $data) {
    $po->update([
        'po_status'        => $data['po_status'],   // 🔥 INI YANG KURANG
        'po_detail_status' => $data['po_detail_status'],
        'po_keterangan'    => $data['po_keterangan'] ?? $po->po_keterangan,
        'po_estimasi'      => $data['po_estimasi'] ?? $po->po_estimasi,
    ]);
});


        return response()->json([
            'status' => true,
            'message' => 'Sub status PO berhasil diupdate',
            'data' => [
                'id' => $po->po_id,
                'kode' => $po->po_kode,
                'status' => $po->po_status,
                'detail_status' => $po->po_detail_status,
            ]
        ]);
    }
public function exportPdf(string $kode)
{
    $kode = urldecode($kode);

    $po = PurchaseOrderModel::with([
        'details',
        'purchaseRequest'   // 🔥 WAJIB
    ])
    ->where('po_kode', $kode)
    ->firstOrFail();

    $pdf = Pdf::loadView(
        'exports.po-pdf',
        compact('po')
    )->setPaper('A4', 'portrait');

    return $pdf->download(
        'PO_' . str_replace('/', '_', $po->po_kode) . '.pdf'
    );
}


    public function destroy($id)
    {
        $po = PurchaseOrderModel::findOrFail($id);
        $po->delete();

        return response()->json([
            'status' => true,
            'message' => 'Purchase Order berhasil dihapus'
        ]);
    }

public function sign(Request $request): JsonResponse
{
    $request->validate([
        'kode'      => 'required|string',
        'signature' => 'required|string',
        'name'      => 'required|string',
        'role'      => 'required|string',
    ]);

    $kode = urldecode($request->kode);

    $po = PurchaseOrderModel::where('po_kode', $kode)->firstOrFail();

    /* 🔒 HANYA PURCHASING */
    if ($request->role !== 'purchasing') {
        return response()->json([
            'message' => 'Tidak berhak melakukan tanda tangan'
        ], 403);
    }

    /* 🔒 CEGAH SIGN ULANG */
    if ($po->signed_pengaju_at) {
        return response()->json([
            'message' => 'PO sudah ditandatangani'
        ], 422);
    }

    /* ================= SIMPAN SIGNATURE ================= */
    $path = $this->saveSignature(
        $request->signature,
        $po->po_kode,
        'pengaju'
    );

    $po->update([
        'signed_pengaju_name' => $request->name,
        'signed_pengaju_sign' => $path,
        'signed_pengaju_at'   => now(),
        'sign_step'           => 'done',
    ]);

    return response()->json([
        'message'   => 'Tanda tangan berhasil',
        'sign_step' => 'done',
    ]);
}

private function saveSignature(string $base64, string $kode, string $level): string
{
    $clean = preg_replace('#^data:image/\w+;base64,#i', '', $base64);
    $clean = str_replace(' ', '+', $clean);

    $image = base64_decode($clean);
    if ($image === false) {
        throw new \Exception('Signature tidak valid');
    }

    $safeKode = str_replace('/', '_', $kode);
    $filename = "{$level}_{$safeKode}_" . uniqid() . ".png";
    $path = 'signatures/' . $filename;

    Storage::disk('public')->put($path, $image);

    return $path;
}


public function clearSignature(string $kode): JsonResponse
{
    $kode = urldecode($kode);

    $po = PurchaseOrderModel::where('po_kode', $kode)->firstOrFail();

    if ($po->signed_pengaju_sign &&
        Storage::disk('public')->exists($po->signed_pengaju_sign)) {
        Storage::disk('public')->delete($po->signed_pengaju_sign);
    }

    $po->update([
        'signed_pengaju_name' => null,
        'signed_pengaju_sign' => null,
        'signed_pengaju_at'   => null,
        'sign_step'           => 'purchasing',
    ]);

    return response()->json([
        'message' => 'Signature berhasil direset'
    ]);
}

public function exportPo()
{
    $pos = PurchaseOrderModel::orderBy('created_at', 'desc')->get();

    return Excel::download(
        new PoListExport($pos),
        'DAFTAR_PURCHASE_ORDER.xlsx'
    );
}

}