<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnSpbDetailModel extends Model
{
    protected $table = 'tb_return_spb_detail';

    protected $primaryKey = 'rtn_detail_id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'rtn_id',
        'spb_dtl_id',
        'part_id',
        'dtl_rtn_qty_return',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    // Relasi ke Header Return
    public function header()
    {
        return $this->belongsTo(SpbReturnModel::class, 'rtn_id', 'rtn_id');
    }

    // Relasi ke SPB Detail
    public function spbDetail()
    {
        return $this->belongsTo(SpbDetailModel::class, 'spb_dtl_id', 'spb_dtl_id');
    }

    // Relasi ke Part / Barang
    public function part()
    {
        return $this->belongsTo(BarangModel::class, 'part_id', 'part_id');
    }
}