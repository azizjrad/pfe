<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agency extends Model
{
    protected $fillable = [
        'name',
        'address',
        'city',
        'phone',
        'email',
        'opening_time',
        'closing_time',
        'status',
    ];

    protected $casts = [
        'opening_time' => 'datetime:H:i',
        'closing_time' => 'datetime:H:i',
    ];

    /**
     * Get all vehicles that belong to this agency.
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    /**
     * Get all agency admins for this agency.
     */
    public function admins()
    {
        return $this->hasMany(User::class)->where('role', 'agency_admin');
    }

    /**
     * Check if agency is currently active.
     */
    public function isActive()
    {
        return $this->status === 'active';
    }
}
