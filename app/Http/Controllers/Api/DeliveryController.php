<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryModel;
use App\Models\DeliveryDetailModel;
use App\Models\MaterialRequestModel;
use App\Models\MaterialRequestItemModel;
use App\Models\StockModel;
use App\Models\BarangModel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Helpers\ClosingBook;

class DeliveryController extends Controller
{
    // public function index(Request $request)
    // {
    //     return response()->json(
    //         DB::table('tb_delivery')
    //             ->leftJoin(
    //                 'tb_material_request',
    //                 'tb_delivery.mr_id',
    //                 '=',
    //                 'tb_material_request.mr_id'
    //             )
    //             ->select(
    //                 'tb_delivery.dlv_id',
    //                 'tb_delivery.dlv_kode',
    //                 'tb_delivery.dlv_status',
    //                 'tb_delivery.dlv_dari_gudang',
    //                 'tb_delivery.dlv_ke_gudang',
    //                 'tb_delivery.dlv_ekspedisi',
    //                 'tb_delivery.created_at',
    //                 'tb_material_request.mr_kode as mr_kode'

    //             )
    //             ->orderByDesc('tb_delivery.created_at')
    //             ->paginate(5)
    //     );
    // }
     public function index()
    {
        return response()->json(
            DeliveryModel::with(['details', 'mr'])
                ->orderByDesc('dlv_kode')
                ->get()
        );
    }


    public function showKode($kode)
    {
        return response()->json(
            DeliveryModel::with(['details', 'mr.details'])
                ->where('dlv_kode', $kode)
                ->firstOrFail()
        );
    }

    public function store(Request $request)
    {
        ClosingBook::check($request->dlv_tanggal);
        $request->validate([
            'dlv_kode'        => 'required|unique:tb_delivery,dlv_kode',
            'mr_id'           => 'required|exists:tb_material_request,mr_id',
            'dlv_dari_gudang' => 'required',
            'dlv_ke_gudang'   => 'required',
            'dlv_ekspedisi'   => 'required',
            'dlv_tanggal'   => 'required',
            'dlv_pic'         => 'required',
            'details'         => 'required|array|min:1',
            'details.*.part_id' => 'required|exists:tb_barang,part_id',
            'details.*.qty_pending' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request) {

            $delivery = DeliveryModel::create([
                'dlv_kode'        => $request->dlv_kode,
                'mr_id'           => $request->mr_id,
                'dlv_dari_gudang' => $request->dlv_dari_gudang,
                'dlv_ke_gudang'   => $request->dlv_ke_gudang,
                'dlv_ekspedisi'   => $request->dlv_ekspedisi,
                'dlv_tanggal'   => $request->dlv_tanggal,
                'dlv_pic'         => $request->dlv_pic,
                'dlv_status'      => 'pending',
            ]);

            foreach ($request->details as $item) {

                $barang = BarangModel::findOrFail($item['part_id']);

                $mrDetail = MaterialRequestItemModel::where('mr_id', $request->mr_id)
                    ->where('part_id', $item['part_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                $sisaMr = $mrDetail->dtl_mr_qty_request - $mrDetail->dtl_mr_qty_received;

                if ($item['qty_pending'] > $sisaMr) {
                    throw new Exception(
                        "Qty delivery melebihi sisa MR ({$barang->part_number})"
                    );
                }

                DeliveryDetailModel::create([
                    'dlv_id'              => $delivery->dlv_id,
                    'part_id'             => $item['part_id'],
                    'dtl_dlv_part_number' => $item['dtl_dlv_part_number'],
                    'dtl_dlv_part_name'   => $item['dtl_dlv_part_name'],
                    'dtl_dlv_satuan'      => $item['dtl_dlv_satuan'],
                    'qty_pending'         => $item['qty_pending'],
                    'qty_on_delivery'     => 0,
                    'qty_delivered'       => 0,
                    'receive_note'        => null,
                ]);
            }
        });

        return response()->json([
            'status' => true,
            'message' => 'Delivery berhasil dibuat',
        ]);
    }

    /* =======================================================
     * UPDATE STATUS DELIVERY
     * ======================================================= */

    public function updateStatus(Request $request, $kode)
    {
        $delivery = DeliveryModel::with('details')
            ->where('dlv_kode', $kode)
            ->firstOrFail();

        $request->validate([
            'status' => 'required|in:packing,ready to pickup,on delivery,delivered',
        ]);

        $allowed = [
            'pending'         => ['packing'],
            'packing'         => ['ready to pickup', 'delivered'],
            'ready to pickup' => ['on delivery'],
            'on delivery'     => ['delivered'],
        ];

        if (!in_array($request->status, $allowed[$delivery->dlv_status] ?? [])) {
            throw new Exception('Perubahan status tidak valid');
        }

        if ($request->status === 'packing') {
            $this->moveToPacking($delivery);
        }

        $delivery->update([
            'dlv_status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Status delivery diperbarui',
        ]);
    }

    /* =======================================================
     * PACKING → PINDAH KE ON DELIVERY
     * ======================================================= */

    private function moveToPacking($delivery)
    {
        DB::transaction(function () use ($delivery) {

            foreach ($delivery->details as $item) {

                if ($item->qty_pending <= 0) continue;

                $stock = StockModel::where('part_id', $item->part_id)
                    ->where('stk_location', $delivery->dlv_dari_gudang)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($stock->stk_qty < $item->qty_pending) {
                    throw new Exception(
                        "Stock tidak mencukupi ({$item->dtl_dlv_part_number})"
                    );
                }

                $stock->decrement('stk_qty', $item->qty_pending);

                $item->update([
                    'qty_on_delivery' => $item->qty_pending,
                    'qty_pending'     => 0,
                ]);
            }
        });
    }


    public function receive(Request $request, $kode)
    {
        $delivery = DeliveryModel::with(['details', 'mr.details'])
            ->where('dlv_kode', $kode)
            ->firstOrFail();

        $isHandCarry = strtolower($delivery->dlv_ekspedisi) === 'hand carry';

        if (
            (!$isHandCarry && $delivery->dlv_status !== 'on delivery') ||
            ($isHandCarry && $delivery->dlv_status !== 'packing')
        ) {
            throw new Exception(
                $isHandCarry
                    ? 'Hand carry belum selesai packing'
                    : 'Delivery belum on delivery'
            );
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.part_id' => 'required|integer',
            'items.*.qty_received' => 'required|integer|min:0',
            'items.*.receive_note' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $delivery) {

            foreach ($request->items as $input) {

                $detail = DeliveryDetailModel::where('dlv_id', $delivery->dlv_id)
                    ->where('part_id', $input['part_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($input['qty_received'] > $detail->qty_on_delivery) {
                    throw new Exception(
                        "Qty diterima melebihi qty dikirim ({$detail->dtl_dlv_part_number})"
                    );
                }
                $qtyKirim    = $detail->qty_on_delivery; // SUMBER KEBENARAN
                $qtyReceived = $input['qty_received'];

                if ($qtyReceived > $qtyKirim) {
                    throw new Exception(
                        "Qty diterima melebihi qty dikirim ({$detail->dtl_dlv_part_number})"
                    );
                }

                $qtyRejected = $qtyKirim - $qtyReceived;

                $detail->update([
                    'qty_delivered'   => $qtyReceived,
                    'qty_rejected'    => $qtyRejected,
                    'qty_pending'     => 0,
                    'qty_on_delivery' => 0,
                    'receive_note'    => $input['receive_note'],
                ]);


                $stock = StockModel::firstOrCreate(
                    [
                        'part_id' => $detail->part_id,
                        'stk_location' => $delivery->dlv_ke_gudang,
                    ],
                    ['stk_qty' => 0]
                );

                $stock->increment('stk_qty', $input['qty_received']);

                MaterialRequestItemModel::where('mr_id', $delivery->mr_id)
                    ->where('part_id', $detail->part_id)
                    ->increment('dtl_mr_qty_received', $input['qty_received']);
            }

            /* UPDATE STATUS MR */
            $mr = MaterialRequestModel::with('details')
                ->lockForUpdate()
                ->findOrFail($delivery->mr_id);

            $totalRequest  = $mr->details->sum('dtl_mr_qty_request');
            $totalReceived = $mr->details->sum('dtl_mr_qty_received');

            $mr->update([
                'mr_status' =>
                    $totalReceived <= 0 ? 'open'
                    : ($totalReceived < $totalRequest ? 'partial' : 'close')
            ]);
            $delivery->update([
                'dlv_status'   => 'delivered',
                'delivered_at'=> now(),
            ]);
        });

        return response()->json([
            'message' => 'Barang berhasil diterima',
            'dlv_status'   => 'delivered',
        ]);
    }
    public function signPenerima(Request $request, $kode)
    {
        $request->validate([
            'signature' => 'required|string',
        ]);

        $delivery = DeliveryModel::with('details')
            ->where('dlv_kode', $kode)
            ->firstOrFail();

        if ($delivery->dlv_status !== 'delivered') {
            throw new Exception('Belum bisa TTD penerima');
        }

        $path = $this->saveSignature($request->signature);

        $delivery->update([
            'signed_penerima_sign' => $path,
            'signed_penerima_at'   => now(),
            'delivered_at'         => now(),
        ]);

        return response()->json([
            'message' => 'Delivery selesai',
        ]);
    }

    private function saveSignature(string $base64): string
    {
        $clean = preg_replace('#^data:image/\w+;base64,#i', '', $base64);
        $clean = str_replace(' ', '+', $clean);

        $image = base64_decode($clean);

        if ($image === false) {
            throw new Exception('Signature tidak valid');
        }

        $filename = 'penerima_' . uniqid() . '.png';
        $path = 'signatures/' . $filename;

        Storage::disk('public')->put($path, $image);

        return $path;
    }

    public function exportPdf($kode)
    {
        $delivery = DeliveryModel::with(['details', 'mr.details'])
            ->where('dlv_kode', $kode)
            ->firstOrFail();

        $pdf = Pdf::loadView(
            'exports.delivery-pdf',
            compact('delivery')
        )->setPaper('A4', 'portrait');

        return $pdf->download(
            'DELIVERY_' . $delivery->dlv_kode . '.pdf'
        );
    }

    public function testPdf()
{
    set_time_limit(0);

    $path = storage_path('app/tmp/test.pdf');

    Browsershot::html('<h1>TEST OK</h1>')
        ->timeout(120)
        ->save($path);

    return response()->file($path);
}


    public function exportDeliveryHeader()
    {
        $deliveries = DeliveryModel::with('mr')->get();

        return Excel::download(
            new DeliveryListExport($deliveries),
            'DAFTAR_DELIVERY.xlsx'
        );
    }
}