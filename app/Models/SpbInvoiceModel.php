<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpbInvoiceModel extends Model
{
    protected $table = 'tb_spb_invoice';
    protected $primaryKey = 'spb_invoice_id';

    protected $fillable = [
        'spb_do_id',
        'invoice_no',
        'invoice_date',
        'invoice_email_date',
    ];

    public function do()
    {
        return $this->belongsTo(
            SpbDoModel::class,
            'spb_do_id',
            'spb_do_id'
        );
    }

    public function details()
    {
        return $this->hasMany(
            SpbInvDetailModel::class,
            'spb_invoice_id',
            'spb_invoice_id'
        );
    }
}