<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobCosting extends Model
{
    protected $table = 'job_costing';
    protected $primaryKey = 'jc_id';
    public $timestamps = false;

    protected $fillable = [
        'batch_no',
        'jc_date',
        'description',
        'barang_1',
        'created_by',
        'created_at'
    ];

    /* RELATION */
    public function items()
    {
        return $this->hasMany(JobCostingItem::class, 'jc_id', 'jc_id');
    }
}