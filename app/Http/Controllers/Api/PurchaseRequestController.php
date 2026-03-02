<?php

namespace App\Http\Controllers\Api;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PrListExport;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PurchaseRequestModel;
use App\Models\BarangModel;
use App\Models\PurchaseRequestItemModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;


class PurchaseRequestController extends Controller
{
    public function index()
    {
        $data = PurchaseRequestModel::with([
            'details',
            'details.mr', 
        ]); 
        return response()->json($data->get());
    }
// public function index(Request $request)
// {
//     $query = PurchaseRequestModel::query()
//         ->select(
//             'pr_id',
//             'pr_kode',
//             'pr_tanggal',
//             'pr_status',
//             'pr_lokasi',
//             'pr_pic'
//         );

//     // 🔎 FILTER
//     if ($request->filled('kode')) {
//         $query->where('pr_kode', 'like', '%' . $request->kode . '%');
//     }

//     if ($request->filled('status')) {
//         $query->where('pr_status', $request->status);
//     }

//     if ($request->filled('lokasi')) {
//         $query->where('pr_lokasi', 'like', '%' . $request->lokasi . '%');
//     }

//     if ($request->filled('pic')) {
//         $query->where('pr_pic', 'like', '%' . $request->pic . '%');
//     }

//     return response()->json(
//         $query->orderByDesc('pr_tanggal')->paginate(10)
//     );
// }

    // public function showKode($kode)
    // {
    //     $kode = urldecode($kode);
    //     $pr = PurchaseRequestModel::with([
    //         'details',
    //         'details.mr',
    //     ])
    //     ->where('pr_kode', $kode)
    //     ->firstOrFail();

    //     return response()->json($pr);
    // }

// public function showKode($kode)
// {
//     return PurchaseRequestModel::with([
//         'details',
//         'details.mr',
//     ])
//     ->where('pr_kode', urldecode($kode))
//     ->firstOrFail();
// }
    public function showKode($kode)
    {
        $base64 = str_replace(['-', '_'], ['+', '/'], $kode);

        $padLength = strlen($base64) % 4;
        if ($padLength) {
            $base64 .= str_repeat('=', 4 - $padLength);
        }

        $decodedKode = base64_decode($base64);

        return PurchaseRequestModel::with([
            'details',
            'details.mr',
        ])
        ->where('pr_kode', $decodedKode)
        ->firstOrFail();
    }


    public function show($id)
    {
        $pr = PurchaseRequestModel::with([
            'details',
            'details.mr',
        ])->findOrFail($id);

        return response()->json($pr);
    }

    public function store(Request $request)
    {
        $request->validate([
            'pr_kode'        => 'required|unique:tb_purchase_request,pr_kode',
            'pr_lokasi'      => 'required',
            'pr_tanggal'     => 'required',
            'pr_pic'         => 'required',
            'details.*.dtl_pr_qty' => 'required|numeric|min:1',
            'details'        => 'required|array',
        ]);

        DB::transaction(function () use ($request) {

            $delivery = PurchaseRequestModel::create([
                'pr_kode'     => $request->pr_kode,
                'pr_lokasi'   => $request->pr_lokasi,
                'pr_tanggal'  => $request->pr_tanggal,
                'pr_status'   => 'open',
                'pr_pic'      => $request->pr_pic,
                'sign_step'   => 'warehouse', 
            ]);

            foreach ($request->details as $item) {
                PurchaseRequestItemModel::create([
                    'pr_id'                 => $delivery->pr_id,
                    'mr_id'                 => $item['mr_id'],
                    'part_id'               => $item['part_id'],
                    'dtl_pr_part_number'    => $item['dtl_pr_part_number'],
                    'dtl_pr_part_name'      => $item['dtl_pr_part_name'],
                    'dtl_pr_satuan'         => $item['dtl_pr_satuan'],
                    'dtl_pr_qty'            => $item['dtl_pr_qty'] ?? 0,
                ]);
            }
        });

        return response()->json(['message' => 'Purchase Request created']);
    }
    public function sign(Request $request): JsonResponse
    {
        $request->validate([
            'kode'      => 'required|string',
            'signature' => 'required|string',
            'name'      => 'required|string',
            'role'      => 'required|string',
        ]);

        $pr = PurchaseRequestModel::where('pr_kode', $request->kode)->firstOrFail();

        if (!in_array($request->role, ['warehouse', 'spv', 'ppic'])) {
            return response()->json([
                'message' => 'Tidak berhak melakukan tanda tangan'
            ], 403);
        }

        if ($request->role === 'spv' && !$pr->signed_pengaju_at) {
            return response()->json([
                'message' => 'Pengaju belum melakukan tanda tangan'
            ], 422);
        }

        if ($request->role === 'ppic' && !$pr->signed_spv_at) {
            return response()->json([
                'message' => 'SPV belum melakukan tanda tangan'
            ], 422);
        }

        $map = [
            'warehouse' => 'pengaju',
            'spv'          => 'spv',
            'ppic'         => 'ppic',
        ];

        $level = $map[$request->role];

        $path = $this->saveSignature(
            $request->signature,
            $pr->pr_kode,
            $level
        );

        $nextStep = match ($request->role) {
            'warehouse' => 'spv',
            'spv'          => 'ppic',
            'ppic'         => 'done',
        };

        $pr->update([
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

 


// public function sign(Request $request): JsonResponse
// {
//     try {
//         $request->validate([
//             'kode' => 'required|string',
//             'signature' => 'required|string',
//         ]);

//         $pr = PurchaseRequestModel::where('pr_kode', $request->kode)->first();

//         if (!$pr) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Purchase Request tidak ditemukan'
//             ], 404);
//         }

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

//         $safeKode = str_replace('/', '_', $pr->pr_kode);
//         $path = 'signatures/signature_' . $safeKode . '.png';

//         Storage::disk('public')->put($path, $decodedImage);

//         $pr->update([
//             'signature_url' => $path,
//             'signed_at' => now(),
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
//             'message' => $e->getMessage()
//         ], 500);
//     }
// }

// public function exportPdf(string $kode)
// {
//     //$kode = urldecode($kode);

//     $pr = PurchaseRequestModel::with(['details'])
//         ->where('pr_kode', $kode)
//         ->firstOrFail();

//     $pdf = Pdf::loadView(
//         'exports.pr-pdf',
//         compact('pr')
//     )->setPaper('A4', 'portrait');

//     return $pdf->download(
//         'PR_' . str_replace('/', '_', $pr->pr_kode) . '.pdf'
//     );
// }
    public function exportPdf(string $kode)
    {
        $kode = urldecode($kode);

        $pr = PurchaseRequestModel::with(['details.mr'])
            ->where('pr_kode', $kode)
            ->first();

        if (!$pr) {
            abort(404, 'PR tidak ditemukan');
        }

        // DEBUG
        // dd($pr->toArray());

        $pdf = Pdf::loadView('exports.pr-pdf', compact('pr'))
            ->setPaper('A4', 'portrait');

        return $pdf->download(
            'PR_' . str_replace('/', '_', $pr->pr_kode) . '.pdf'
        );
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
            $kode = urldecode($kode);

            $pr = PurchaseRequestModel::where('pr_kode', $kode)->first();

            if (!$pr) {
                return response()->json([
                    'success' => false,
                    'message' => 'Purchase Request tidak ditemukan'
                ], 404);
            }

            if ($pr->signature_url && Storage::disk('public')->exists($pr->signature_url)) {
                Storage::disk('public')->delete($pr->signature_url);
            }

            $pr->update([
                'signature_url' => null,
                'signed_at' => null,
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
    public function exportPr()
    {
        $prs = PurchaseRequestModel::with('details')->get();

        return Excel::download(
            new PrListExport($prs),
            'DAFTAR_PURCHASE_REQUEST.xlsx'
        );
    }
}