<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeminjmanModel extends Model
{
    use HasFactory;

    protected $table = 'tb_peminjman';
    protected $primaryKey = 'pmj_id';
    
    protected $fillable = [
        'pmj_kode',
        'pmj_tanggal',
        'pmj_status',
        'pmj_peminjam', 
        'pmj_keterangan',
        'pmj_lokasi',
    ];

    public function details()
    {
        return $this->hasMany(PeminjamanDetailModel::class, 'pmj_id');
    }
}
