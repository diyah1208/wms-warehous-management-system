<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpbDoModel extends Model
{
    protected $table = 'tb_spb_do';
    protected $primaryKey = 'spb_do_id';

    protected $fillable = [
        'spb_po_id',
        'do_no',
        'do_date',
        'do_status_part',
        'do_pic',
    ];

    public function po()
    {
        return $this->belongsTo(
            SpbPoModel::class,
            'spb_po_id',
            'spb_po_id'
        );
    }

    public function details()
    {
        return $this->hasMany(
            SpbDoDetailModel::class,
            'spb_do_id',
            'spb_do_id'
        );
    }

    public function invoices()
    {
        return $this->hasMany(
            SpbInvoiceModel::class,
            'spb_do_id',
            'spb_do_id'
        );
    }
}