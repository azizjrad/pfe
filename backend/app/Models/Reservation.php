<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'vehicle_id',
        'start_date',
        'end_date',
        'base_price',
        'discount_amount',
        'additional_charges',
        'total_price',
        'paid_amount',
        'remaining_amount',
        'payment_status',
        'status',
        'actual_return_date',
        'is_late_return',
        'cancellation_reason',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'actual_return_date' => 'date',
        'base_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'additional_charges' => 'decimal:2',
        'total_price' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'is_late_return' => 'boolean',
    ];

    /**
     * Get the user (client) who made the reservation.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the vehicle being reserved.
     */
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get all payments for this reservation.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the return record for this reservation.
     */
    public function vehicleReturn()
    {
        return $this->hasOne(VehicleReturn::class);
    }

    /**
     * Calculate rental duration in days.
     */
    public function getDurationAttribute()
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    /**
     * Check if reservation is fully paid.
     */
    public function isFullyPaid()
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Check if reservation is overdue.
     */
    public function isOverdue()
    {
        return $this->payment_status === 'overdue';
    }

    /**
     * Check if reservation is active (confirmed or ongoing).
     */
    public function isActive()
    {
        return in_array($this->status, ['confirmed', 'ongoing']);
    }
}
