<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\MrListExport;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\MaterialRequestModel;
use App\Models\MaterialRequestItemModel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\MaterialRequestModel as MaterialRequest;
class MaterialRequestController extends Controller
{
    private array $lokasiKodeMap = [
        'JAKARTA'        => 'HO',
        'MUARA ENIM'   => 'ENIM',
        'BALIKPAPAN'     => 'BPP',
        'SITE BA'        => 'BA',
        'SITE TAL'       => 'TAL',
        'SITE MIP'       => 'MIP',
        'SITE MIFA'      => 'MIFA',
        'SITE BIB'       => 'BIB',
        'SITE AMI'       => 'AMI',
        'SITE TABANG'    => 'IPT',
        'SITE BCP_PIK'   => 'BCP',
        'SITE DIZA'      => 'DIZA',
    ];

    private function getLokasiKode(string $lokasi): string
    {
        return $this->lokasiKodeMap[strtoupper($lokasi)] ?? 'UNK';
    }

    public function exportPdf(string $kode)
    {
        // decode URL (%2F → /)
        // $decodedKode = urldecode($kode);
        $decodedKode = base64_decode(strtr($kode, '-_', '+/'));
    
        if (!$decodedKode) {
            abort(400, 'Kode MR tidak valid');
        }

        $mr = MaterialRequestModel::with('details')
            ->where('mr_kode', $decodedKode)
            ->firstOrFail();

        $pdf = Pdf::loadView('exports.mr-pdf', compact('mr'))
            ->setPaper('A4', 'portrait');

    return $pdf->stream(
        'MR_' . str_replace('/', '_', $mr->mr_kode) . '.pdf'
    );

    }



    public function index()
    {
        return response()->json(
            MaterialRequestModel::with('details')
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    /* =====================================================
     * STORE (CREATE MR)
     * ===================================================== */
    public function store(Request $request)
    {
        $request->validate([
            'mr_tanggal'  => 'required|date',
            'mr_lokasi'   => 'required|string',
            'mr_pic'      => 'required',
            'mr_due_date' => 'required|date',
            'details'     => 'required|array|min:1'
        ]);

        return DB::transaction(function () use ($request) {

            $lokasiNama = strtoupper($request->mr_lokasi);
            $lokasiKode = $this->getLokasiKode($lokasiNama);
            $now = now();

            $lastMr = MaterialRequestModel::where('mr_lokasi', $lokasiNama)
                ->whereYear('created_at', $now->year)
                ->whereMonth('created_at', $now->month)
                ->lockForUpdate()
                ->orderBy('mr_id', 'desc')
                ->first();

            $urutan = $lastMr
                ? ((int) substr($lastMr->mr_kode, -5)) + 1
                : 1;

            $mrKode = sprintf(
                "GMI/%s/%s/%05d",
                $lokasiKode,
                $now->format('y/m'),
                $urutan
            );

            $mr = MaterialRequestModel::create([
                'mr_kode'     => $mrKode,
                'mr_tanggal'  => $request->mr_tanggal,
                'mr_lokasi'   => $lokasiNama,
                'mr_pic'      => $request->mr_pic,
                'mr_due_date' => $request->mr_due_date,
                'mr_status' => 'pending',
                'mr_last_edit_by' => $request->mr_last_edit_by,
                'sign_step'  => 'warehouse',
                'mr_last_edit_at' => now(),
            ]);

            foreach ($request->details as $item) {
                MaterialRequestItemModel::create([
                    'mr_id'               => $mr->mr_id,
                    'part_id'             => $item['part_id'],
                    'dtl_mr_part_number'  => $item['dtl_mr_part_number'],
                    'dtl_mr_part_name'    => $item['dtl_mr_part_name'],
                    'dtl_mr_satuan'       => $item['dtl_mr_satuan'],
                    'dtl_mr_prioritas'    => $item['dtl_mr_prioritas'],
                    'dtl_mr_qty_request'  => (int) $item['dtl_mr_qty_request'],
                    'dtl_mr_qty_received' => 0
                ]);
            }

            return response()->json($mr, 201);
        });
    }

    public function show($id)
    {
        return response()->json(
            MaterialRequestModel::with(['details'])->findOrFail($id)
        );
    }

public function showKode($kode)
{
    // 1️⃣ convert base64url → base64 normal
    $base64 = str_replace(['-', '_'], ['+', '/'], $kode);

    // 2️⃣ TAMBAHKAN padding yang hilang
    $padding = strlen($base64) % 4;
    if ($padding !== 0) {
        $base64 .= str_repeat('=', 4 - $padding);
    }

    // 3️⃣ decode
    $decodedKode = base64_decode($base64);

    // 🔍 DEBUG sementara
    if (!$decodedKode) {
        return response()->json([
            'message' => 'Decode gagal',
            'kode_dikirim' => $kode,
            'base64_setelah_padding' => $base64,
        ], 400);
    }

    // 4️⃣ cari MR
    $mr = MaterialRequestModel::with('details')
        ->where('mr_kode', $decodedKode)
        ->first();

    if (!$mr) {
        return response()->json([
            'message' => 'MR tidak ditemukan',
            'kode_decode' => $decodedKode,
        ], 404);
    }

    return response()->json($mr);
}


    public function getOpenMR()
    {
        return response()->json(
            MaterialRequestModel::where('mr_status', 'open')
                ->orderBy('created_at', 'desc')
                ->get(['mr_id', 'mr_kode'])
        );
    }

    public function update(Request $request, $id)
    {
        $mr = MaterialRequestModel::with('details')->findOrFail($id);

        // 🔒 hanya boleh edit saat OPEN
        if ($mr->mr_status !== 'open') {
            return response()->json([
                'message' => 'MR tidak bisa diedit karena status bukan OPEN'
            ], 403);
        }

        if ($request->has('mr_status')) {

            $status = $request->mr_status === 'close'
                ? 'closed'
                : $request->mr_status;

            $mr->update([
                'mr_status' => $status,
                'mr_last_edit_at' => now(),
                'mr_last_edit_by' => $request->mr_last_edit_by,
            ]);

            return response()->json([
                'message' => 'Status MR berhasil diupdate'
            ]);
        }

        $request->validate([
            'dtl_mr_id' => 'required',
            'part_id' => 'required',
            'dtl_mr_part_number' => 'required|string',
            'dtl_mr_part_name' => 'required|string',
            'dtl_mr_satuan' => 'required|string',
            'dtl_mr_prioritas' => 'required|string',
            'dtl_mr_qty_request' => 'required|integer|min:1'
        ]);

        $item = MaterialRequestItemModel::findOrFail($request->dtl_mr_id);

        // pastikan item milik MR ini
        if ($item->mr_id !== $mr->mr_id) {
            return response()->json([
                'message' => 'Item bukan milik MR ini'
            ], 403);
        }

        $item->update([
            'part_id' => $request->part_id,
            'dtl_mr_part_number' => $request->dtl_mr_part_number,
            'dtl_mr_part_name' => $request->dtl_mr_part_name,
            'dtl_mr_satuan' => $request->dtl_mr_satuan,
            'dtl_mr_prioritas' => $request->dtl_mr_prioritas,
            'dtl_mr_qty_request' => $request->dtl_mr_qty_request
        ]);

        $mr->update([
            'mr_last_edit_at' => now(),
            'mr_last_edit_by' => $request->mr_last_edit_by
        ]);

        return response()->json([
            'message' => 'Item MR berhasil diupdate'
        ]);
    }
public function deleteDetail(string $detailId): JsonResponse
{
    return DB::transaction(function () use ($detailId) {

        $detail = MaterialRequestItemModel::with('materialRequest')
            ->findOrFail($detailId);

        $mr = $detail->materialRequest;

        if ($mr->mr_status !== 'open') {
            return response()->json([
                'message' => 'Detail tidak bisa dihapus karena MR bukan OPEN'
            ], 403);
        }

        if ((int) $detail->dtl_mr_qty_received > 0) {
            return response()->json([
                'message' => 'Detail tidak bisa dihapus karena sudah ada barang diterima'
            ], 403);
        }

        $detail->delete();

        $mr->update([
            'mr_last_edit_at' => now(),
            'mr_last_edit_by' => auth()->user()->name,
        ]);

        return response()->json([
            'message' => 'Detail MR berhasil dihapus'
        ]);
    });
}

public function sign(Request $request): JsonResponse
{
    $request->validate([
        'kode'      => 'required|string',
        'signature' => 'required|string',
        'name'      => 'required|string',
        'role'      => 'required|string',
    ]);

$decodedKode = urldecode($request->kode);

$mr = MaterialRequest::where('mr_kode', $decodedKode)->firstOrFail();

    if (!in_array($request->role, ['warehouse', 'gl_mekanik'])) {
        return response()->json(['message' => 'Tidak berhak'], 403);
    }

    if ($request->role === 'gl_mekanik' && !$mr->signed_pengaju_at) {
        return response()->json(['message' => 'Pengaju belum TTD'], 422);
    }

    $map = [
        'warehouse'  => 'pengaju',
        'gl_mekanik' => 'gl',
    ];

    $level = $map[$request->role];

    $path = $this->saveSignature($request->signature, $mr->mr_kode, $level);

    $nextStep = match ($request->role) {
        'warehouse'  => 'gl_mekanik',
        'gl_mekanik' => 'done',
    };

    $mr->update([
        "signed_{$level}_name" => $request->name,
        "signed_{$level}_sign" => $path,
        "signed_{$level}_at"   => now(),
        "sign_step"            => $nextStep,
    ]);
    Log::info('SIGN DEBUG', [
    'kode_request' => $request->kode,
    'kode_decode'  => $decodedKode,
]);
    return response()->json([
        'message' => 'Tanda tangan berhasil',
        'sign_step' => $nextStep,
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
    try {
        $mr = MaterialRequest::where('mr_kode', $kode)->first();

        if (!$mr) {
            return response()->json([
                'success' => false,
                'message' => 'Material Request tidak ditemukan'
            ], 404);
        }

        if (!empty($mr->signature_url)) {
            $path = $mr->signature_url; 
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $mr->update([
            'signature_url' => null,
            'sign_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Signature berhasil direset'
        ]);
    } catch (\Throwable $e) {
        Log::error('CLEAR SIGNATURE ERROR', [
            'message' => $e->getMessage(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Gagal reset signature'
        ], 500);
    }
}
public function exportMr()
{
    $mrs = MaterialRequestModel::with('details')->get();

    return Excel::download(
        new MrListExport($mrs), // ✅ PAKAI CLASS YANG BENAR
        'DAFTAR_MATERIAL_REQUEST.xlsx'
    );
}

    /* =====================================================
     * GET OPEN MR
     * ===================================================== */
    // public function getOpenMR()
    // {
    //     return response()->json(
    //         MaterialRequestModel::where('mr_status', 'open')
    //             ->orderBy('created_at', 'desc')
    //             ->get(['mr_id', 'mr_kode'])
    //     );
    // }

    /* =====================================================
     * UPDATE MR (STATUS / ITEM) — SINGLE ENDPOINT
     * ===================================================== */
    // public function update(Request $request, $id)
    // {
    //     $mr = MaterialRequestModel::with('details')->findOrFail($id);

    //     // 🔒 hanya boleh edit saat OPEN
    //     if ($mr->mr_status !== 'open') {
    //         return response()->json([
    //             'message' => 'MR tidak bisa diedit karena status bukan OPEN'
    //         ], 403);
    //     }

    //     /* ===============================
    //      * UPDATE STATUS MR
    //      * =============================== */
    //     if ($request->has('mr_status')) {

    //         $status = $request->mr_status === 'close'
    //             ? 'closed'
    //             : $request->mr_status;

    //         $mr->update([
    //             'mr_status' => $status,
    //             'mr_last_edit_at' => now(),
    //             'mr_last_edit_by' => auth()->user()->name,
    //         ]);

    //         return response()->json([
    //             'message' => 'Status MR berhasil diupdate'
    //         ]);
    //     }

    //     /* ===============================
    //      * UPDATE ITEM MR
    //      * =============================== */
    //     $request->validate([
    //         'dtl_mr_id' => 'required',
    //         'part_id' => 'required',
    //         'dtl_mr_part_number' => 'required|string',
    //         'dtl_mr_part_name' => 'required|string',
    //         'dtl_mr_satuan' => 'required|string',
    //         'dtl_mr_prioritas' => 'required|string',
    //         'dtl_mr_qty_request' => 'required|integer|min:1'
    //     ]);

    //     $item = MaterialRequestItemModel::findOrFail($request->dtl_mr_id);

    //     // pastikan item milik MR ini
    //     if ($item->mr_id !== $mr->mr_id) {
    //         return response()->json([
    //             'message' => 'Item bukan milik MR ini'
    //         ], 403);
    //     }

    //     $item->update([
    //         'part_id' => $request->part_id,
    //         'dtl_mr_part_number' => $request->dtl_mr_part_number,
    //         'dtl_mr_part_name' => $request->dtl_mr_part_name,
    //         'dtl_mr_satuan' => $request->dtl_mr_satuan,
    //         'dtl_mr_prioritas' => $request->dtl_mr_prioritas,
    //         'dtl_mr_qty_request' => $request->dtl_mr_qty_request
    //         // ❌ qty_received tidak boleh diupdate
    //     ]);

    //     // audit MR
    //     $mr->update([
    //         'mr_last_edit_at' => now(),
    //         'mr_last_edit_by' => auth()->user()->name ?? 'SYSTEM'
    //     ]);

    //     return response()->json([
    //         'message' => 'Item MR berhasil diupdate'
    //     ]);
    // }
// public function deleteDetail(string $detailId): JsonResponse
// {
//     return DB::transaction(function () use ($detailId) {

//         $detail = MaterialRequestItemModel::with('materialRequest')
//             ->findOrFail($detailId);

//         $mr = $detail->materialRequest;

//         // 🔒 MR harus OPEN
//         if ($mr->mr_status !== 'open') {
//             return response()->json([
//                 'message' => 'Detail tidak bisa dihapus karena MR bukan OPEN'
//             ], 403);
//         }

//         // 🔒 Tidak boleh hapus kalau sudah ada penerimaan
//         if ((int) $detail->dtl_mr_qty_received > 0) {
//             return response()->json([
//                 'message' => 'Detail tidak bisa dihapus karena sudah ada barang diterima'
//             ], 403);
//         }

//         // 🗑️ HAPUS DETAIL
//         $detail->delete();

//         // 📝 Audit MR
//         $mr->update([
//             'mr_last_edit_at' => now(),
//             'mr_last_edit_by' => auth()->user()->name,
//         ]);

//         return response()->json([
//             'message' => 'Detail MR berhasil dihapus'
//         ]);
//     });
// }




// public function sign(Request $request)
// {
//     try {
//         // Validasi input
//         $validator = Validator::make($request->all(), [
//             'kode' => 'required|string',
//             'signature' => 'required|string',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Validasi gagal',
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         // 🔥 AMBIL KODE DARI REQUEST (BUKAN PARAMETER FUNCTION)
//         $kode = $request->kode;

//         // Cari MR berdasarkan kode
//         $mr = MaterialRequest::where('mr_kode', $kode)->first();

//         if (!$mr) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Material Request tidak ditemukan'
//             ], 404);
//         }

//         // Ambil base64 signature
//         $signatureData = $request->signature;

//         // Remove prefix base64
//         $signatureData = preg_replace(
//             '/^data:image\/\w+;base64,/',
//             '',
//             $signatureData
//         );

//         // Decode base64
//         $decodedImage = base64_decode($signatureData);

//         if ($decodedImage === false) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Format signature tidak valid'
//             ], 400);
//         }

//         // Generate filename
//         $filename = 'signature_' . time() . '.png';
//         $path = 'signatures/' . $filename;

//         // Simpan ke storage public
//         Storage::disk('public')->put($path, $decodedImage);

//         // Update MR
//         $mr->signature_url = Storage::url($path); // /storage/signatures/xxx.png
//         $mr->sign_at = now();
//         $mr->save();

//         return response()->json([
//             'success' => true,
//             'message' => 'Tanda tangan berhasil disimpan',
//             'data' => [
//                 'kode' => $mr->mr_kode,
//                 'signature_url' => $mr->signature_url,
//                 'sign_at' => $mr->sign_at
//             ]
//         ], 200);

//     } catch (\Exception $e) {
//         \Log::error('Error saving signature: ' . $e->getMessage());

//         return response()->json([
//             'success' => false,
//             'message' => 'Gagal menyimpan tanda tangan'
//         ], 500);
//     }
// }

/* =====================================================
     * SIGN MR (FROM MOBILE)
     * ===================================================== */
// public function sign(Request $request): JsonResponse
// {
//     try {
//         $request->validate([
//             'kode' => 'required|string',
//             'signature' => 'required|string',
//         ]);

//         // 🔍 Cari MR
//         $mr = MaterialRequest::where('mr_kode', $request->kode)->first();

//         if (!$mr) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Material Request tidak ditemukan'
//             ], 404);
//         }

//         // 🗑️ Hapus signature lama jika ada
//         if (!empty($mr->signature_url)) {
//             $oldPath = str_replace('/storage/', '', $mr->signature_url);
//             if (Storage::disk('public')->exists($oldPath)) {
//                 Storage::disk('public')->delete($oldPath);
//             }
//         }

//         // ✂️ Bersihkan base64 (WAJIB)
//         $signatureData = preg_replace(
//             '#^data:image/\w+;base64,#i',
//             '',
//             $request->signature
//         );
//         $signatureData = str_replace(' ', '+', $signatureData);

//         $decodedImage = base64_decode($signatureData);

//         if ($decodedImage === false) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Format signature tidak valid'
//             ], 422);
//         }

//         // 📁 Generate nama file AMAN (tanpa slash)
//         $safeKode = str_replace('/', '_', $mr->mr_kode);
//         $filename = 'signature_' . $safeKode . '.png';
//         $relativePath = 'signatures/' . $filename;

//         // 💾 Simpan ke storage/public
//         Storage::disk('public')->put($relativePath, $decodedImage);

//         // ✅ SIMPAN PATH RELATIF (BUKAN URL FULL)
//         $mr->update([
//             'signature_url' => $relativePath, // contoh: signatures/signature_GMI_JKT_25_7_00001.png
//             'sign_at' => now(),
//         ]);

//         return response()->json([
//             'success' => true,
//             'message' => 'Tanda tangan berhasil disimpan'
//         ]);

//     } catch (\Throwable $e) {
//         Log::error('SIGN ERROR', [
//             'message' => $e->getMessage(),
//             'line' => $e->getLine(),
//             'file' => $e->getFile(),
//         ]);

//         return response()->json([
//             'success' => false,
//             'message' => 'Gagal menyimpan tanda tangan'
//         ], 500);
//     }
// }



// /* =====================================================
//  * CLEAR SIGNATURE (RESET SEBELUM SCAN ULANG)
//  * ===================================================== */
// public function clearSignature(string $kode): JsonResponse
// {
//     try {
//         $mr = MaterialRequest::where('mr_kode', $kode)->first();

//         if (!$mr) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Material Request tidak ditemukan'
//             ], 404);
//         }

//         // 🗑️ Hapus file signature lama
//         if (!empty($mr->signature_url)) {
//             $path = $mr->signature_url; // sudah RELATIF
//             if (Storage::disk('public')->exists($path)) {
//                 Storage::disk('public')->delete($path);
//             }
//         }

//         // ♻️ Reset kolom signature
//         $mr->update([
//             'signature_url' => null,
//             'sign_at' => null,
//         ]);

//         return response()->json([
//             'success' => true,
//             'message' => 'Signature berhasil direset'
//         ]);
//     } catch (\Throwable $e) {
//         Log::error('CLEAR SIGNATURE ERROR', [
//             'message' => $e->getMessage(),
//         ]);

//         return response()->json([
//             'success' => false,
//             'message' => 'Gagal reset signature'
//         ], 500);
//     }
// }

    /* =====================================================
     * GENERATE KODE MR
     * ===================================================== */
    // public function generateKode(Request $request)
    // {
    //     $lokasiNama = strtoupper(trim($request->lokasi));
    //     $lokasiKode = $this->getLokasiKode($lokasiNama);
    //     $tahunBulan = now()->format('y/m');

    //     $last = MaterialRequestModel::where('mr_lokasi', $lokasiNama)
    //         ->where('mr_kode', 'like', "%/$tahunBulan/%")
    //         ->orderBy('mr_id', 'desc')
    //         ->first();

    //     $nextNumber = $last
    //         ? ((int) substr($last->mr_kode, -5)) + 1
    //         : 1;

    //     return response()->json(sprintf(
    //         "GMI%s/%s/%03d",
    //         $lokasiKode,
    //         $tahunBulan,
    //         $nextNumber
    //     ));
    // }
    public function generateKode(Request $request)
    {
        $lokasiNama = strtoupper(trim($request->lokasi));
        $lokasiKode = $this->getLokasiKode($lokasiNama);
    
        $tanggalFormat = now()->format('Y/m/d'); // 2026/03/04
    
        $last = MaterialRequestModel::where('mr_lokasi', $lokasiNama)
            ->where('mr_kode', 'like', "GMI$lokasiKode/$tanggalFormat/%")
            ->orderBy('mr_id', 'desc')
            ->first();
    
        $nextNumber = $last
            ? ((int) substr($last->mr_kode, -3)) + 1
            : 1;
    
        return response()->json(sprintf(
            "GMI%s/%s/%0d",
            $lokasiKode,
            $tanggalFormat,
            $nextNumber
        ));
    }

public function approveDetail(Request $request, $detailId)
{
    return DB::transaction(function () use ($detailId) {

        $detail = MaterialRequestItemModel::with('materialRequest')
            ->findOrFail($detailId);

        $mr = $detail->materialRequest; 
        if ($mr->sign_step !== 'done') {
            return response()->json([
                'message' => 'MR belum selesai tanda tangan Warehouse dan GL'
            ], 403);
        }

        if ($mr->mr_status === 'closed') {
            return response()->json([
                'message' => 'MR sudah CLOSED'
            ], 403);
        }

        if ($detail->dtl_mr_approved == 1) {
            return response()->json([
                'message' => 'Detail sudah diapprove'
            ], 400);
        }

        $detail->update([
            'dtl_mr_approved'    => 1,
            'dtl_mr_approved_at' => now(),
            'dtl_mr_approved_by' => auth()->user()->name ?? 'SYSTEM',
        ]);

        // ================= STATUS LOGIC =================

        $totalDetails = $mr->details()->count();

        $approvedCount = $mr->details()
            ->where('dtl_mr_approved', 1)
            ->count();

        $rejectedCount = $mr->details()
            ->where('dtl_mr_rejected', 1)
            ->count();

        $decidedCount = $approvedCount + $rejectedCount;

        if ($decidedCount < $totalDetails) {
            $status = 'pending';
        } 
        elseif ($approvedCount === 0 && $rejectedCount === $totalDetails) {
            $status = 'closed';
        } 
        else {
            $status = 'open';
        }

        $mr->update([
            'mr_status' => $status,
            'mr_last_edit_at' => now(),
            'mr_last_edit_by' => auth()->user()->name ?? 'SYSTEM',
        ]);

        return response()->json([
            'message' => 'Detail berhasil diapprove',
            'mr_status' => $status
        ]);
    });
}
public function rejectDetail($detailId)
{
    return DB::transaction(function () use ($detailId) {

        $detail = MaterialRequestItemModel::with('materialRequest')
            ->findOrFail($detailId);

        $mr = $detail->materialRequest;
        if ($mr->sign_step !== 'done') {
            return response()->json([
                'message' => 'MR belum selesai tanda tangan Warehouse dan GL'
            ], 403);
        }

        if ($mr->mr_status === 'closed') {
            return response()->json([
                'message' => 'MR sudah CLOSED'
            ], 403);
        }

        if ($detail->dtl_mr_approved == 1) {
            return response()->json([
                'message' => 'Detail sudah diapprove'
            ], 422);
        }

        $detail->update([
            'dtl_mr_rejected'    => 1,
            'dtl_mr_rejected_at' => now(),
            'dtl_mr_rejected_by' => auth()->user()->name ?? 'SYSTEM',
        ]);

        // ================= STATUS LOGIC =================

        $totalDetails = $mr->details()->count();

        $approvedCount = $mr->details()
            ->where('dtl_mr_approved', 1)
            ->count();

        $rejectedCount = $mr->details()
            ->where('dtl_mr_rejected', 1)
            ->count();

        $decidedCount = $approvedCount + $rejectedCount;

        if ($decidedCount < $totalDetails) {
            $status = 'pending';
        } 
        elseif ($approvedCount === 0 && $rejectedCount === $totalDetails) {
            $status = 'closed';
        } 
        else {
            $status = 'open';
        }

        $mr->update([
            'mr_status' => $status,
            'mr_last_edit_at' => now(),
            'mr_last_edit_by' => auth()->user()->name ?? 'SYSTEM',
        ]);

        return response()->json([
            'message' => 'Detail berhasil direject',
            'mr_status' => $status
        ]);
    });
}
}