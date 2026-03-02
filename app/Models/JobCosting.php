<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobCosting extends Model
{
    protected $table = 'job_costing';
    protected $primaryKey = 'jc_id';
    public $timestamps = false;

    protected $fillable = [
        'batch_no',
        'jc_date',
        'description',
        'barang_1',
        'finish_part',
        'created_by',
        'created_at',
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
        'jc_status'
    ];

    /* RELATION */
    public function items()
    {
        return $this->hasMany(JobCostingItem::class, 'jc_id', 'jc_id');
    }
}