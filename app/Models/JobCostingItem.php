<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobCostingItem extends Model
{
    protected $table = 'job_costing_item';
    protected $primaryKey = 'jc_item_id';
    public $timestamps = false;

    protected $fillable = [
        'jc_id',
        'part_no',
        'item_description',
        'qty',
        'unit',
        'finish_part'
    ];

    public function barang()
{
    return $this->belongsTo(BarangModel::class, 'part_no', 'part_number');
}

}