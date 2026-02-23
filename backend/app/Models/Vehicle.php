<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'brand',
        'model',
        'year',
        'mileage',
        'daily_price',
        'license_plate',
        'color',
        'seats',
        'transmission',
        'fuel_type',
        'status',
        'image',
        'agency_id',
        'category_id',
    ];

    protected $casts = [
        'daily_price' => 'decimal:2',
        'year' => 'integer',
        'mileage' => 'integer',
        'seats' => 'integer',
    ];

    /**
     * Get the agency that owns the vehicle.
     */
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * Get the category of the vehicle.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all reservations for this vehicle.
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Check if vehicle is available for rent.
     */
    public function isAvailable()
    {
        return $this->status === 'available';
    }

    /**
     * Get full vehicle name.
     */
    public function getFullNameAttribute()
    {
        return "{$this->brand} {$this->model} ({$this->year})";
    }

    /**
     * Check if vehicle has overlapping reservation for given dates.
     */
    public function hasOverlappingReservation($startDate, $endDate, $excludeReservationId = null)
    {
        $query = $this->reservations()
            ->whereIn('status', ['confirmed', 'ongoing'])
            ->where(function($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function($q2) use ($startDate, $endDate) {
                      $q2->where('start_date', '<=', $startDate)
                         ->where('end_date', '>=', $endDate);
                  });
            });

        if ($excludeReservationId) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return $query->exists();
    }
}
