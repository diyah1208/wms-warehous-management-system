<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\BarangModel;
use App\Models\StockModel;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\JobCostingExport;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Models\JobCosting;
use App\Models\JobCostingItem;
use Barryvdh\DomPDF\Facade\Pdf;




class JobCostingController extends Controller
{
    /* =========================
       GET ALL (INDEX)
    ========================= */
    public function index()
    {
        try {
            $data = DB::table('job_costing')
                ->orderBy('jc_id', 'desc')
                ->get();

            return response()->json($data, 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    public function export()
{
    $jobs = JobCosting::with('items.barang')
        ->orderByDesc('jc_id')
        ->get();

    return Excel::download(
        new JobCostingExport($jobs),
        'JOB-COSTING.xlsx'
    );
}

public function showByKode($kode)
{
  $jc = JobCosting::with('items.barang')

        ->where('batch_no', $kode)
        ->first();

    if (!$jc) {
        return response()->json([
            'message' => 'Job Costing tidak ditemukan'
        ], 404);
    }

    return response()->json($jc);
}


    /* =========================
       STORE (CREATE)
    ========================= */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {

            /** ================= LOKASI ================= */
            $lokasi = $request->lokasi;

            /** ================= INSERT HEADER ================= */
            $jc_id = DB::table('job_costing')->insertGetId([
                'batch_no' => $request->batch_no,
                'jc_date' => $request->jc_date,
                'jc_status' => $request->jc_status,
                'description' => $request->description,
                'finish_part' => $request->finish_part,
                'created_by' => $request->created_by,
                'created_at' => now(),
                'barang_1' => $request->barang_1,
                'sign_step' => 'warehouse',
            ]);

            /** ================= INSERT ITEMS (SELALU) ================= */
            foreach ($request->items as $item) {

                DB::table('job_costing_item')->insert([
                    'jc_id' => $jc_id,
                    'part_no' => $item['part_no'],
                    'item_description' => $item['item_description'] ?? null,
                    'qty' => $item['qty'],
                    'unit' => $item['unit'],
                ]);
            }

            /** ================= JIKA DONE ================= */
            if (strtolower(trim($request->jc_status)) === 'done') {

                /** ================= HITUNG QTY HASIL ================= */
                $qtyHasil = min(array_column($request->items, 'qty'));

                /** ================= KURANGI STOK ================= */
                foreach ($request->items as $item) {

                    $part = DB::table('tb_barang')
                        ->where('part_number', $item['part_no'])
                        ->first();

                    $stock = DB::table('tb_stock')
                        ->where('part_id', $part->part_id)
                        ->where('stk_location', $lokasi)
                        ->first();

                    DB::table('tb_stock')
                        ->where('stk_id', $stock->stk_id)
                        ->decrement('stk_qty', $item['qty']);
                }

                /** ================= TAMBAH HASIL ================= */
                $partHasil = DB::table('tb_barang')
                    ->where('part_number', $request->finish_part)
                    ->first();

                if (!$partHasil) {

                    $partIdHasil = DB::table('tb_barang')->insertGetId([
                        'part_number' => $request->finish_part,
                        'part_name' => $request->finish_part,
                        'part_satuan' => 'PCS',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('tb_stock')->insert([
                        'part_id' => $partIdHasil,
                        'stk_location' => $lokasi,
                        'stk_qty' => $qtyHasil,
                        'stk_min' => 0,
                        'stk_max' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                } else {

                    DB::table('tb_stock')
                        ->where('part_id', $partHasil->part_id)
                        ->where('stk_location', $lokasi)
                        ->increment('stk_qty', $qtyHasil);
                }
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Job Costing berhasil',
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    /* =========================
       SHOW (DETAIL)
    ========================= */
    public function show($id)
    {
        try {
            $header = DB::table('job_costing')->where('jc_id', $id)->first();

            if (!$header) {
                return response()->json([
                    'status' => false,
                    'message' => 'Job Costing tidak ditemukan',
                ], 404);
            }

            $items = DB::table('job_costing_item')
                ->where('jc_id', $id)
                ->get();

            return response()->json([
                'header' => $header,
                'items' => $items,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function sign(Request $request): JsonResponse
    {
        $request->validate([
            'batch_no'  => 'required|string',
            'signature' => 'required|string',
            'name'      => 'required|string',
            'role'      => 'required|string',
        ]);

        $jc = JobCosting::where('batch_no', $request->batch_no)->firstOrFail();

        if (!in_array($request->role, ['warehouse', 'spv', 'ppic'])) {
            return response()->json(['message' => 'Tidak berhak melakukan tanda tangan'], 403);
        }

        if ($request->role === 'spv' && !$jc->signed_pengaju_at) {
            return response()->json(['message' => 'Pengaju belum tanda tangan'], 422);
        }

        if ($request->role === 'ppic' && !$jc->signed_spv_at) {
            return response()->json(['message' => 'SPV belum tanda tangan'], 422);
        }

        $map = [
            'warehouse' => 'pengaju',
            'spv'       => 'spv',
            'ppic'      => 'ppic',
        ];

        $level = $map[$request->role];

        // cegah double sign
        if ($jc->{"signed_{$level}_at"}) {
            return response()->json(['message' => 'Sudah melakukan tanda tangan'], 422);
        }

        $path = $this->saveSignature(
            $request->signature,
            $jc->batch_no,
            $level
        );

        $nextStep = match ($request->role) {
            'warehouse' => 'spv',
            'spv'       => 'ppic',
            'ppic'      => 'done',
        };

        $jc->update([
            "signed_{$level}_name" => $request->name,
            "signed_{$level}_sign" => $path,
            "signed_{$level}_at"   => now(),
            "sign_step"            => $nextStep,
        ]);

        return response()->json([
            'message'   => 'Tanda tangan berhasil',
            'sign_step' => $nextStep,
        ]);
    }

    private function saveSignature(string $base64, string $batchNo, string $level): string
    {
        $clean = preg_replace('#^data:image/\w+;base64,#i', '', $base64);
        $clean = str_replace(' ', '+', $clean);

        $image = base64_decode($clean);
        if ($image === false) {
            throw new \Exception('Signature tidak valid');
        }

        $safeBatch = str_replace('/', '_', $batchNo);
        $filename = "{$level}_{$safeBatch}_" . uniqid() . ".png";
        $path = 'signatures/' . $filename;

        Storage::disk('public')->put($path, $image);

        return $path;
    }
    public function exportPdf(string $kode)
    {
        $kode = urldecode($kode);

        $jc = JobCosting::with(['items.barang'])
            ->where('batch_no', $kode)
            ->first();

        if (!$jc) {
            abort(404, 'Job Costing tidak ditemukan');
        }

        $pdf = Pdf::loadView('exports.job-costing-pdf', compact('jc'))
            ->setPaper('A4', 'portrait');

        return $pdf->download(
            'JobCosting_' . str_replace('/', '_', $jc->batch_no) . '.pdf'
        );
    }
    public function updateStatusToDone(Request $request, $id)
    {
        DB::beginTransaction();

        try {

            $lokasi = $request->lokasi;

            $jc = DB::table('job_costing')->where('jc_id', $id)->first();

            if (!$jc) {
                return response()->json([
                    'status' => false,
                    'message' => 'Job Costing tidak ditemukan'
                ], 404);
            }

            // Cegah double proses
            if (strtolower($jc->jc_status) === 'done') {
                return response()->json([
                    'status' => false,
                    'message' => 'Job Costing sudah DONE'
                ], 400);
            }

            // Ambil item
            $items = DB::table('job_costing_item')
                ->where('jc_id', $id)
                ->get();

            if ($items->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Item tidak ditemukan'
                ], 400);
            }

            // Hitung qty hasil (ambil qty terkecil)
            $qtyHasil = $items->min('qty');

            /** ================= KURANGI STOK BAHAN ================= */
            foreach ($items as $item) {

                $part = DB::table('tb_barang')
                    ->where('part_number', $item->part_no)
                    ->first();

                $stock = DB::table('tb_stock')
                    ->where('part_id', $part->part_id)
                    ->where('stk_location', $lokasi)
                    ->first();

                if ($stock) {
                    DB::table('tb_stock')
                        ->where('stk_id', $stock->stk_id)
                        ->decrement('stk_qty', $item->qty);
                }
            }

            /** ================= TAMBAH HASIL PRODUK ================= */
            $partHasil = DB::table('tb_barang')
                ->where('part_number', $jc->finish_part)
                ->first();

            if (!$partHasil) {

                $partIdHasil = DB::table('tb_barang')->insertGetId([
                    'part_number' => $jc->finish_part,
                    'part_name' => $jc->finish_part,
                    'part_satuan' => 'PCS',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('tb_stock')->insert([
                    'part_id' => $partIdHasil,
                    'stk_location' => $lokasi,
                    'stk_qty' => $qtyHasil,
                    'stk_min' => 0,
                    'stk_max' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

            } else {

                DB::table('tb_stock')
                    ->where('part_id', $partHasil->part_id)
                    ->where('stk_location', $lokasi)
                    ->increment('stk_qty', $qtyHasil);
            }

            /** ================= UPDATE STATUS ================= */
            DB::table('job_costing')
                ->where('jc_id', $id)
                ->update([
                    'jc_status' => 'done',
                    'updated_at' => now()
                ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Job Costing berhasil diubah ke DONE dan stok diperbarui'
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

}