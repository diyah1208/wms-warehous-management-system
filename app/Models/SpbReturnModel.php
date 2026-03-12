<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpbReturnModel extends Model
{
    protected $table = 'tb_return_spb';

    protected $primaryKey = 'rtn_id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'rtn_kode',
        'spb_id',
        'rtn_tanggal',
        'rtn_note',
        'rtn_status'
    ];

    protected $casts = [
        'rtn_tanggal' => 'date',
    ];

    public function spb()
    {
        return $this->belongsTo(SpbModel::class, 'spb_id', 'spb_id');
    }
    public function details()
    {
        return $this->hasMany(ReturnSpbDetailModel::class, 'rtn_id', 'rtn_id');
    }
}