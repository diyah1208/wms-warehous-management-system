<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpbPoDetailModel extends Model
{
    protected $table = 'dtl_spb_po';

    protected $primaryKey = 'spb_po_dtl_id';

    protected $fillable = [
        'spb_po_id',
        'spb_dtl_id',
    ];

    public function po()
    {
        return $this->belongsTo(SpbPo::class, 'spb_po_id', 'spb_po_id');
    }

    public function spbDetail()
    {
        return $this->belongsTo(SpbDetailModel::class, 'spb_dtl_id', 'spb_dtl_id');
    }
}