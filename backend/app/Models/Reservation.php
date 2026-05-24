<?php

namespace App\Models;

use App\Domain\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'vehicle_id',
        'start_date',
        'end_date',
        'pickup_location',
        'dropoff_location',
        'client_birth_date',
        'driver_first_name',
        'driver_last_name',
        'driver_birth_date',
        'driver_license_number',
        'driver_license_date',
        'total_price',
        'platform_commission',
        'agency_payout',
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
        'client_birth_date' => 'date',
        'driver_birth_date' => 'date',
        'driver_license_date' => 'date',
        'total_price' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'agency_payout' => 'decimal:2',

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
        $startDate = Carbon::parse($this->start_date);
        $endDate = Carbon::parse($this->end_date);

        return $startDate->diffInDays($endDate) + 1;
    }

    /**
     * Check if reservation is fully paid.
     */
    public function isFullyPaid()
    {
        return false;
    }

    /**
     * Check if reservation is overdue.
     */
    public function isOverdue()
    {
        if ($this->end_date && now()->gt(
            \Carbon\Carbon::parse($this->end_date)->endOfDay()
        )) {
            return true;
        }
        return false;
    }

    /**
     * Check if reservation is active (confirmed or ongoing).
     */
    public function isActive()
    {
        return in_array($this->status, [
            ReservationStatus::CONFIRMED->value,
            ReservationStatus::ONGOING->value,
        ], true);
    }
}
