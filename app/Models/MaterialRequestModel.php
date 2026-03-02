<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\UserModel;
use Illuminate\Http\JsonResponse;

class MaterialRequestModel extends Model
{
    protected $table = 'tb_material_request';
    protected $primaryKey = 'mr_id';

    protected $fillable = [
        'mr_kode',
        'mr_lokasi',
        'mr_pic',
        'mr_tanggal',
        'mr_due_date',
        'mr_status',
         // 🔥 TAMBAHKAN INI
    'mr_last_edit_by',
    'mr_last_edit_at',
      'signature_url',
  'sign_at',
   // 🔥 SIGN FLOW MR
    'sign_step',

    'signed_pengaju_name',
    'signed_pengaju_sign',
    'signed_pengaju_at',

    'signed_gl_name',
    'signed_gl_sign',
    'signed_gl_at',

    ];

    public function details()
    {
        return $this->hasMany(MaterialRequestItemModel::class, 'mr_id', 'mr_id');
    }
    
}