<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleReturn extends Model
{
    protected $table = 'returns';

    protected $fillable = [
        'reservation_id',
        'return_date',
        'return_mileage',
        'fuel_level',
        'vehicle_condition',
        'damage_description',
        'additional_charges',
        'damage_notes',
        'inspection_notes',
        'notes',
    ];

    protected $casts = [
        'return_date' => 'datetime',
        'return_mileage' => 'integer',
        'additional_charges' => 'decimal:2',
    ];

    /**
     * Get the reservation this return belongs to.
     */
    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    /**
     * Check if vehicle has damage.
     */
    public function hasDamage()
    {
        return in_array($this->vehicle_condition, ['fair', 'damaged']);
    }

    /**
     * Check if there are additional charges.
     */
    public function hasAdditionalCharges()
    {
        return $this->additional_charges > 0;
    }

    /**
     * Get vehicle condition label in French.
     */
    public function getConditionLabel()
    {
        return match($this->vehicle_condition) {
            'excellent' => 'Excellent',
            'good' => 'Bon',
            'fair' => 'Acceptable',
            'damaged' => 'Endommagé',
            default => $this->vehicle_condition,
        };
    }
}
