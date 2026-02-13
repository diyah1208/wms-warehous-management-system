<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeminjamanDetailModel extends Model
{
    use HasFactory;

    protected $table = 'dtl_peminjaman';
    protected $primaryKey = 'dtl_pmj_id';
    
    protected $fillable = [
        'pmj_id',
        'part_id',
        'dtl_pmj_part_number',
        'dtl_pmj_part_name',
        'dtl_pmj_part_satuan',
        'dtl_pmj_qty_borrowed',
        'dtl_pmj_qty_returned',
    ];

    public function peminjaman()
    {
        return $this->belongsTo(PeminjmanModel::class, 'pmj_id');
    }

    public function part()
    {
        return $this->belongsTo(BarangModel::class, 'part_id');
    }
}
