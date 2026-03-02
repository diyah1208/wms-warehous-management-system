<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class PurchaseOrderModel extends Model
{
    protected $table = 'tb_purchase_order';
    protected $primaryKey = 'po_id';

    protected $fillable = [
        'po_kode',
        'pr_id',
        'po_tanggal',
        'po_estimasi',
        'po_detail_status',
        'po_keterangan',
        'po_status',
        'po_pic',
 'po_payment_term',
        // 🔥 SIGNATURE FIELD (WAJIB ADA)
        'sign_step',
        'signed_pengaju_name',
        'signed_pengaju_sign',
        'signed_pengaju_at',
    ];

    public function purchaseRequest()
    {
        return $this->belongsTo(PurchaseRequestModel::class, 'pr_id', 'pr_id');
    }

    public function details()
    {
        return $this->hasMany(PurchaseOrderDetailModel::class, 'po_id', 'po_id');
    }
}