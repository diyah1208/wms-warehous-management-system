<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\UserModel; 


class PurchaseRequestModel extends Model
{
    protected $table = 'tb_purchase_request';
    protected $primaryKey = 'pr_id';

    protected $fillable = [
        'pr_kode',
        'pr_lokasi',
        'pr_tanggal',
        'pr_status',
        'pr_pic',
              'signature_url',
  'sign_at',
   'signed_pengaju_name',
        'signed_pengaju_sign',
        'signed_pengaju_at',

        'signed_spv_name',
        'signed_spv_sign',
        'signed_spv_at',

        'signed_ppic_name',
        'signed_ppic_sign',
        'signed_ppic_at',
        'sign_step',
   
    ];

    // RELASI KE USER (PIC)
    public function details()
    {
        return $this->hasMany(PurchaseRequestItemModel ::class, 'pr_id', 'pr_id');
    }
}
