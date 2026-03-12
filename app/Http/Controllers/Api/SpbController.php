<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryModel;
use App\Models\DeliveryDetailModel;
use App\Models\MaterialRequestModel;
use App\Models\MaterialRequestItemModel;
use App\Models\StockModel;
use App\Models\SpbDetailModel;
use App\Models\BarangModel;
use Exception;
use App\Models\SpbModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\DeliveryListExport;
use App\Exports\SpbListExport;
use App\Helpers\ClosingBook;

use Carbon\Carbon;

class SpbController extends Controller
{
     private array $lokasiKodeMap = [
        'JAKARTA'        => 'JKT',
        'MUARA ENIM'     => 'ENIM',
        'BALIKPAPAN'     => 'BPN',
        'SITE BA'        => 'TJE',
        'SITE TAL'       => 'AMMSBS',
        'SITE MIP'       => 'LHT',
        'SITE MIFA'      => 'AMM',
        'SITE BIB'       => 'BIB',
        'SITE AMI'       => 'AMI',
        'SITE TABANG'    => 'AMMIPT',
        'SITE BCP_PIK'   => 'BCP',
        'SITE DIZA'      => 'AMMDMP',
    ];
    public function index()
    {
        $data = SpbModel::with(['po','details','po.details.spbDetail'])
            ->where('spb_is_deleted', 0)
            ->orderByDesc('spb_id')
            ->get();

        return response()->json($data);
    }


    public function showKode(string $kode)
    {
        $decodedKode = base64_decode(strtr($kode, '-_', '+/'));
    
        if (!$decodedKode) {
            return response()->json([
                'message' => 'Kode SPB tidak valid'
            ], 400);
        }
    
        $spb = SpbModel::with(['details'])
            ->where('spb_no', $decodedKode)
            ->where('spb_is_deleted', 0)
            ->firstOrFail();
    
        return response()->json($spb);
    }

    // public function view(Request $request)
    // {
    //     $limit  = $request->get('limit', 10);
    //     $search = $request->get('search');

    //     $query = DB::table('v_spb_report')
    //     ->where('spb_is_deleted', 0);

    //     if ($search) {
    //         $query->where(function ($q) use ($search) {
    //             $q->where('spb_no', 'like', "%$search%")
    //               ->orWhere('spb_part_name', 'like', "%$search%")
    //               ->orWhere('spb_part_number', 'like', "%$search%")
    //               ->orWhere('po_no', 'like', "%$search%")
    //               ->orWhere('do_no', 'like', "%$search%")
    //               ->orWhere('invoice_no', 'like', "%$search%");
    //         });
    //     }

    //     return response()->json(
    //         $query->orderBy('spb_created_at', 'desc')
    //               ->paginate($limit)
    //     );
    // }
    public function view(Request $request)
    {
        $search = $request->get('search');
    
        $query = DB::table('v_spb_report')
            ->where('spb_is_deleted', 0);
    
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('spb_no', 'like', "%$search%")
                  ->orWhere('spb_part_name', 'like', "%$search%")
                  ->orWhere('spb_part_number', 'like', "%$search%")
                  ->orWhere('po_no', 'like', "%$search%")
                  ->orWhere('do_no', 'like', "%$search%")
                  ->orWhere('invoice_no', 'like', "%$search%");
            });
        }
    
        return response()->json(
            $query->orderBy('spb_created_at', 'desc')
                  ->get()
        );
    }

    public function store(Request $request)
    {
        // ClosingBook::check($request->spb_tanggal);
        $request->validate([
            'spb_tanggal' => 'required|date',
            'spb_no'      => 'required',
            'spb_gudang' => 'required|string|max:50',
            'details'               => 'required|array|min:1',
            'details.*.part_id'     => 'required|exists:tb_barang,part_id',
            'details.*.dtl_spb_qty' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request, &$spb) {

            $spb = SpbModel::create([
                'spb_tanggal'        => $request->spb_tanggal,
                'spb_no'             => $request->spb_no,
                'spb_no_wo'          => $request->spb_no_wo,
                'spb_section'        => $request->spb_section,
                'spb_pic_gmi'        => $request->spb_pic_gmi,
                'spb_pic_ppa'        => $request->spb_pic_ppa,
                'spb_kode_unit'      => $request->spb_kode_unit,
                'spb_tipe_unit'      => $request->spb_tipe_unit,
                'spb_brand'          => $request->spb_brand,
                'spb_hm'             => $request->spb_hm,
                'spb_problem_remark' => $request->spb_problem_remark,
                'spb_status'         => 'DONE QUOT',
                'spb_gudang'         => $request->spb_gudang,
                'spb_pic'            => $request->spb_pic,
            ]);
            foreach ($request->details as $item) {

                $part = BarangModel::findOrFail($item['part_id']);
                $stock = StockModel::where('part_id', $part->part_id)
                ->where('stk_location', $request->spb_gudang)
                ->lockForUpdate()
                ->first();

                if (!$stock || $stock->stk_qty < $item['dtl_spb_qty']) {
                    throw new \Exception(
                        "Stok {$part->part_number} tidak mencukupi"
                    );
                }

                $stock->decrement('stk_qty', $item['dtl_spb_qty']);

                SpbDetailModel::create([
                    'spb_id'               => $spb->spb_id,
                    'part_id'              => $part->part_id,
                    'dtl_spb_part_number'  => $part->part_number,
                    'dtl_spb_part_name'    => $part->part_name,
                    'dtl_spb_part_satuan'  => $part->part_satuan,
                    'dtl_spb_qty'          => $item['dtl_spb_qty']?? 0,
                ]);
            }
        });

        return response()->json([
            'status' => true,
            'message' => 'SPB berhasil dibuat',
            'data' => $spb->load('details')
        ], 201);
    }
    public function update(Request $request, $id)
    {
        $spb = SpbModel::find($id);

        if (!$spb) {
            return response()->json([
                'status' => false,
                'message' => 'SPB tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'spb_no_wo' => 'nullable|string|max:100',
        ]);

        $spb->update([
            'spb_no_wo' => $request->spb_no_wo,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'SPB berhasil diupdate',
            'data' => $spb
        ]);
    }
    private function getLokasiKode(string $lokasi): string
    {
        return $this->lokasiKodeMap[strtoupper($lokasi)] ?? 'UNK';
    }
    
    // public function generateKodeSpb(Request $request)
    // {
    //     $lokasiNama = strtoupper(trim($request->spb_gudang));
    //     $lokasiKode = $this->getLokasiKode($lokasiNama);
    //     $tahunBulan = now()->format('Y/m');
    
    //     $last = SpbModel::where('spb_gudang', $lokasiNama)
    //         ->where('spb_no', 'like', "%/$tahunBulan/%")
    //         ->orderBy('spb_id', 'desc')
    //         ->first();
    
    //     $nextNumber = $last
    //         ? ((int) substr($last->spb_no, -5)) + 1
    //         : 1;
    
    //     return response()->json(sprintf(
    //         "GMI%s/%s/%05d",
    //         $lokasiKode,
    //         $tahunBulan,
    //         $nextNumber
    //     ));
    // }
    public function generateKodeSpb(Request $request)
{
    $lokasiNama = strtoupper(trim($request->spb_gudang));
    $lokasiKode = $this->getLokasiKode($lokasiNama);
    $tahunBulan = now()->format('Y/m');

    $last = SpbModel::where('spb_no', 'like', "GMI{$lokasiKode}/$tahunBulan/%")
        ->orderBy('spb_no', 'desc')
        ->first();

    $nextNumber = 1;

    if ($last) {
        $lastNumber = (int) last(explode('/', $last->spb_no));
        $nextNumber = $lastNumber + 1;
    }

    return response()->json(sprintf(
        "GMI%s/%s/%0d",
        $lokasiKode,
        $tahunBulan,
        $nextNumber
    ));
}

    // public function generateKodeSpb()
    // {
    //     $lokasiKode = 'TJE'; 
    //     $tahun = now()->format('Y'); 
    //     $bulan = now()->format('m'); 

    //     $lastId = SpbModel::max('spb_id');

    //     $nextNumber = $lastId ? $lastId + 1 : 1;

    //     $kode = "GMITJIE/{$tahun}/{$bulan}/{$nextNumber}";

    //     return response()->json($kode);
    // }

    // public function exportSpbExcel()
    // {
    //     $data = DB::table('v_spb_report')
    //         ->orderBy('spb_created_at', 'desc')
    //         ->get();

    //     return Excel::download(
    //         new SpbListExport($data),
    //         'DAFTAR_SPB.xlsx'
    //     );
    // }

    public function exportSpbExcel(Request $request)
    {
        $query = DB::table('v_spb_report')
        ->where('spb_is_deleted', 0);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('spb_no', 'like', "%{$search}%")
                ->orWhere('dtl_spb_part_name', 'like', "%{$search}%")
                ->orWhere('dtl_spb_part_number', 'like', "%{$search}%")
                ->orWhere('po_no', 'like', "%{$search}%")
                ->orWhere('do_no', 'like', "%{$search}%")
                ->orWhere('invoice_no', 'like', "%{$search}%");
            });
        }

        if ($request->filled('startDate')) {
            $query->whereDate('spb_tanggal', '>=', $request->startDate);
        }

        if ($request->filled('endDate')) {
            $query->whereDate('spb_tanggal', '<=', $request->endDate);
        }
        if ($request->status === 'NO_PO') {
            $query->where(function ($q) {
                $q->whereNull('po_no')
                ->orWhereRaw("TRIM(po_no) = ''")
                ->orWhere('po_no', '-',)
                ->orWhere('po_no', 'NULL');
            });
        }

        if ($request->status === 'NO_DO') {
            $query->where(function ($q) {
                $q->whereNotNull('po_no')
                ->whereRaw("TRIM(po_no) != ''");
            })
            ->where(function ($q) {
                $q->whereNull('do_no')
                ->orWhereRaw("TRIM(do_no) = ''")
                ->orWhere('do_no', '-')
                ->orWhere('do_no', 'NULL');
            });
        }

        if ($request->status === 'NO_INV') {
            $query->where(function ($q) {
                $q->whereNotNull('do_no')
                ->whereRaw("TRIM(do_no) != ''");
            })
            ->where(function ($q) {
                $q->whereNull('invoice_no')
                ->orWhereRaw("TRIM(invoice_no) = ''")
                ->orWhere('invoice_no', '-')
                ->orWhere('invoice_no', 'NULL');
            });
        }

        $data = $query
            ->orderBy('spb_created_at', 'desc')
            ->get();

        return Excel::download(
            new SpbListExport($data),
            'DAFTAR_SPB.xlsx'
        );
    }
   
    public function printSpb(string $kode)
    {
        $decodedKode = base64_decode(strtr($kode, '-_', '+/'));
    
        if (!$decodedKode) {
            abort(400, 'Kode SPB tidak valid');
        }
    
        $spb = SpbModel::with(['details'])
            ->where('spb_no', $decodedKode) 
            ->firstOrFail();
    
        $pdf = Pdf::loadView(
            'exports.spb-pdf',
            compact('spb')
        )->setPaper('A4', 'portrait');
    
        return $pdf->download(
            'SPB_' . str_replace('/', '_', $spb->spb_no) . '.pdf'
        );
    }

    public function deleteSpb($id)
    {
        DB::transaction(function () use ($id) {

            $spb = SpbModel::with('details')->findOrFail($id);

            if ($spb->spb_is_deleted == 1) {
                throw new Exception('SPB sudah pernah dihapus');
            }

            foreach ($spb->details as $detail) {

                $stock = StockModel::where('part_id', $detail->part_id)
                    ->where('stk_location', $spb->spb_gudang)
                    ->lockForUpdate()
                    ->first();

                if (!$stock) {
                    throw new Exception("Stock tidak ditemukan untuk part_id {$detail->part_id}");
                }

                $stock->increment('stk_qty', $detail->dtl_spb_qty);
            }

            $spb->update([
                'spb_is_deleted' => 1
            ]);
        });

        return response()->json([
            'status' => true,
            'message' => 'SPB berhasil dihapus dan stok dikembalikan'
        ]);
    }
}
