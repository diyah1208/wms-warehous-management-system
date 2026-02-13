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

use App\Models\JobCosting;
use App\Models\JobCostingItem;



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
    $validator = Validator::make($request->all(), [
        'batch_no' => 'required',
        'jc_date' => 'required|date',
        'description' => 'required',
      
        'created_by' => 'required',
        'items' => 'required|array|min:1',
        'items.*.part_no' => 'required',
        'items.*.qty' => 'required|numeric|min:1',
        'items.*.unit' => 'required',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'message' => $validator->errors()->first(),
        ], 422);
    }

    DB::beginTransaction();

    try {

        /** ================= LOKASI ================= */
        $lokasi = $request->lokasi ?? 'SITE BA';


        /** ================= INSERT HEADER ================= */
        $jc_id = DB::table('job_costing')->insertGetId([
            'batch_no' => $request->batch_no,
            'jc_date' => $request->jc_date,

        

            'description' => $request->description,
     
            'created_by' => $request->created_by,
            'created_at' => now(),

            // hasil produksi = dari keterangan
            'barang_1' => $request->description,
        ]);


        /** ================= HITUNG QTY HASIL ================= */
        $qtyHasil = min(array_column($request->items, 'qty'));


        /** ================= KURANGI STOK BAHAN BAKU ================= */
        foreach ($request->items as $item) {

            $part = DB::table('tb_barang')
                ->where('part_number', $item['part_no'])
                ->first();

            if (!$part) {
                throw new \Exception("Part {$item['part_no']} tidak ditemukan");
            }

            $stock = DB::table('tb_stock')
                ->where('part_id', $part->part_id)
                ->where('stk_location', $lokasi)
                ->first();

            if (!$stock) {
                throw new \Exception("Stok {$item['part_no']} di {$lokasi} tidak ditemukan");
            }

            if ($stock->stk_qty < $item['qty']) {
                throw new \Exception("Stok {$item['part_no']} tidak mencukupi");
            }

            DB::table('job_costing_item')->insert([
                'jc_id' => $jc_id,
                'part_no' => $item['part_no'],
                'item_description' => $item['item_description'] ?? null,
                'qty' => $item['qty'],
                'unit' => $item['unit'],
            ]);

            DB::table('tb_stock')
                ->where('stk_id', $stock->stk_id)
                ->decrement('stk_qty', $item['qty']);
        }


        /** ================= BUAT BARANG HASIL ================= */
        $partHasil = DB::table('tb_barang')
            ->where('part_number', $request->description)
            ->first();

        if (!$partHasil) {

            $partIdHasil = DB::table('tb_barang')->insertGetId([
                'part_number' => $request->description,
                'part_name'   => $request->description,
                'part_satuan' => 'PCS',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            // 🔥 buat stok semua lokasi
            $lokasiList = [
                'JAKARTA','MUARA ENIM','BALIKPAPAN','SITE BA','SITE TAL',
                'SITE MIP','SITE MIFA','SITE BIB','SITE AMI','SITE TABANG'
            ];

            foreach ($lokasiList as $lok) {
                DB::table('tb_stock')->insert([
                    'part_id' => $partIdHasil,
                    'stk_location' => $lok,
                    'stk_qty' => ($lok == $lokasi) ? $qtyHasil : 0,
                    'stk_min' => 0,
                    'stk_max' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

        } else {

            DB::table('tb_stock')
                ->where('part_id', $partHasil->part_id)
                ->where('stk_location', $lokasi)
                ->increment('stk_qty', $qtyHasil);
        }


        DB::commit();

        return response()->json([
            'status' => true,
            'message' => 'Job Costing berhasil → bahan baku berkurang & barang hasil masuk stok',
        ], 201);

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
}