<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

class MaterialRequestItemModel extends Model
{
    protected $table = 'dtl_material_request';
    protected $primaryKey = 'dtl_mr_id';

protected $fillable = [
'mr_id',
        'part_id',
        'dtl_mr_part_number',
        'dtl_mr_part_name',
        'dtl_mr_satuan',
        'dtl_mr_prioritas',
        'dtl_mr_qty_request',
        'dtl_mr_qty_received',
        'mr_last_edit_at',
                'mr_last_edit_by',
                  'signature_url',
  'sign_at',
   // 🔥 APPROVAL FIELD
    'dtl_mr_approved',
    'dtl_mr_approved_at',
    'dtl_mr_approved_by',
'dtl_mr_rejected',
'dtl_mr_rejected_at',
'dtl_mr_rejected_by',
    // 🔥 SIGN FLOW MR
    'sign_step',

    'signed_pengaju_name',
    'signed_pengaju_sign',
    'signed_pengaju_at',

    'signed_gl_name',
    'signed_gl_sign',
    'signed_gl_at',
];

    public function materialRequest()
    {
        return $this->belongsTo(
            MaterialRequestModel::class,
            'mr_id',
            'mr_id'
        );
    }
    public function barang()
    {
        return $this->belongsTo(BarangModel::class, 'part_id', 'part_id');
    }
}