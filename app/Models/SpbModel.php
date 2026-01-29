<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpbModel extends Model
{
    protected $table = 'tb_spb';
    protected $primaryKey = 'spb_id';

    protected $fillable = [
        'spb_tanggal',
        'spb_no',
        'spb_no_wo',
        'spb_section',
        'spb_pic_gmi',
        'spb_pic_ppa',
        'spb_kode_unit',
        'spb_tipe_unit',
        'spb_brand',
        'spb_hm',
        'spb_problem_remark',
        'spb_status',
        'spb_pic',
        'spb_gudang',
    ];

    public function details()
    {
        return $this->hasMany(SpbDetailModel::class, 'spb_id', 'spb_id');
    }

    public function po()
    {
        return $this->hasMany(SpbPoModel::class, 'spb_id', 'spb_id');
    }

    public function do()
    {
        return $this->hasMany(SpbDo::class, 'spb_id', 'spb_id');
    }

    public function invoice()
    {
        return $this->hasMany(SpbInvoice::class, 'spb_id', 'spb_id');
    }
}
