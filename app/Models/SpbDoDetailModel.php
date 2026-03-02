<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpbDoDetailModel extends Model
{
    protected $table = 'dtl_spb_do';

    protected $primaryKey = 'spb_do_dtl_id';

    public $timestamps = true;

    protected $fillable = [
        'spb_do_id',
        'spb_dtl_id',
    ];

    public function doHeader()
    {
        return $this->belongsTo(
            SpbDoModel::class,
            'spb_do_id',
            'spb_do_id'
        );
    }

    public function spbDetail()
    {
        return $this->belongsTo(
            SpbDetailModel::class,
            'spb_dtl_id',
            'spb_dtl_id'
        );
    }
     public function poDetail()
    {
        return $this->belongsTo(SpbPoDetailModel::class, 'spb_po_dtl_id', 'spb_po_dtl_id');
    }
}