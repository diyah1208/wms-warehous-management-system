<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PeminjmanModel;
use App\Models\PeminjamanDetailModel;
use App\Models\PurchaseOrderModel;
use App\Models\StockModel;
use App\Models\MaterialRequestModel;
use App\Models\MaterialRequestItemModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\ReceiveListExport;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ClosingBook;
use App\Exports\PeminjamanListExport;


class PeminjamanController extends Controller
{
    public function index()
    {
        $data = PeminjmanModel::with([
            'details'
        ])
        ->orderBy('pmj_tanggal', 'desc')
        ->get();

        return response()->json($data);
    }

    public function showByKode($kode)
    {
        $kode = base64_decode($kode);

        $peminjaman = PeminjmanModel::with('details')
            ->where('pmj_kode', $kode)
            ->first();

        if (!$peminjaman) {
            return response()->json([
                'kode_dicari' => $kode,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        return response()->json($peminjaman);
    }

    public function store(Request $request)
    {
        // ClosingBook::check($request->pmj_tanggal);

        $request->validate([
            "pmj_lokasi" => "required",
            "pmj_tanggal"   => "required|date",
            "pmj_peminjam" => "required",
            "details"       => "required|array|min:1",
        ]);

        $peminjaman = null;

        DB::transaction(function () use ($request, &$peminjaman) {

            $peminjaman = PeminjmanModel::create([
                "pmj_kode"       => $request->pmj_kode,
                "pmj_tanggal"    => $request->pmj_tanggal,
                "pmj_lokasi"     => $request->pmj_lokasi,
                "pmj_peminjam"   => $request->pmj_peminjam,
                "pmj_keterangan" => $request->pmj_keterangan,
                "pmj_status"     => 'Borrowed', 
            ]);

            foreach ($request->details as $item) {
                PeminjamanDetailModel::create([
                    "pmj_id"                  => $peminjaman->pmj_id,
                    "part_id"                 => $item['part_id'],
                    "dtl_pmj_part_number"     => $item['dtl_pmj_part_number'],
                    "dtl_pmj_part_name"       => $item['dtl_pmj_part_name'],
                    "dtl_pmj_part_satuan"     => $item['dtl_pmj_part_satuan'],
                    "dtl_pmj_qty_borrowed"    => $item['dtl_pmj_qty_borrowed'],
                    "dtl_pmj_qty_returned"    => 0, 
                ]);
            }
        });

        return response()->json([
            "status" => true,
            "message" => "Peminjaman berhasil dibuat",
            "pmj_id" => $peminjaman->pmj_id,
            "pmj_kode" => $peminjaman->pmj_kode
        ]);
    }

    public function returnPart(Request $request, $pmj_id)
    {
        $request->validate([
            'details' => 'required|array|min:1',
            'details.*.qty_returned' => 'required|integer|min:1',
        ]);

         $peminjaman = PeminjmanModel::with('details')->findOrFail($pmj_id);

         DB::transaction(function () use ($request, $peminjaman) {
            foreach ($request->details as $item) {
                $detail = $peminjaman->details->firstWhere('dtl_pmj_id', $item['dtl_pmj_id']);

                if ($detail) {
                    $newQtyReturned = min(
                        $detail->dtl_pmj_qty_borrowed, 
                        $detail->dtl_pmj_qty_returned + $item['qty_returned']
                    );
                    $detail->update([
                        'dtl_pmj_qty_returned' => $newQtyReturned
                    ]);
                }
            }
             $allReturned = $peminjaman->details->every(function($d){
                return $d->dtl_pmj_qty_borrowed == $d->dtl_pmj_qty_returned;
            });
            $peminjaman->update([
                'pmj_status' => $allReturned ? 'Returned' : 'Borrowed'
            ]);
        });
        return response()->json([
            'status' => true,
            'message' => 'Pengembalian part berhasil diupdate',
            'pmj_status' => $peminjaman->pmj_status
        ]);
    }

    public function generateKodePmj()
    {
        $lokasiKode = 'PMJ'; 
        $tahun = now()->format('Y'); 
        $bulan = now()->format('m'); 

        $lastId = PeminjmanModel::max('pmj_id');

        $nextNumber = $lastId ? $lastId + 1 : 1;

        $kode = "PMJ/{$tahun}/{$bulan}/{$nextNumber}";

        return response()->json($kode);
    }

    public function exportPeminjaman(Request $request)
    {
        $query = PeminjmanModel::with('details');

        if ($request->filled('kode')) {
            $query->where('pmj_kode', 'like', "%{$request->kode}%");
        }

        if ($request->filled('status')) {
            $query->where('pmj_status', $request->status);
        }

        if ($request->filled('peminjam')) {
            $query->where('pmj_peminjam', 'like', "%{$request->peminjam}%");
        }

        if ($request->filled('tanggal')) {
            $query->whereDate('pmj_tanggal', $request->tanggal);
        }

        $data = $query
            ->orderByDesc('pmj_tanggal')
            ->get();

        $tanggalFile = $request->tanggal ?? now()->format('Y-m-d');

        return Excel::download(
            new PeminjamanListExport($data),
            "Peminjaman_{$tanggalFile}.xlsx"
        );
    }

}