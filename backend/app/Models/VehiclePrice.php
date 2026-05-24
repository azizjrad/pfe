<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehiclePrice extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'vehicle_id',
        'price',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
