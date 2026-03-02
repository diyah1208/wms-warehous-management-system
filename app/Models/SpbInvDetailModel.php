<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpbInvDetailModel extends Model
{
    protected $table = 'dtl_spb_invoice';
    protected $primaryKey = 'spb_invoice_dtl_id';

    protected $fillable = [
        'spb_invoice_id',
        'spb_do_dtl_id',
        'invoice_qty',
    ];

    public function invoice()
    {
        return $this->belongsTo(
            SpbInvoiceModel::class,
            'spb_invoice_id',
            'spb_invoice_id'
        );
    }

    public function doDetail()
    {
        return $this->belongsTo(
            SpbDoDetailModel::class,
            'spb_do_dtl_id',
            'spb_do_dtl_id'
        );
    }
}