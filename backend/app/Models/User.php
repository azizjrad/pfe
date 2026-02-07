<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'agency_id',
        'phone',
        'address',
        'driver_license',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the agency that the user (agency admin) belongs to.
     */
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * Get all reservations made by this user.
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get the reliability score for this user.
     */
    public function reliabilityScore()
    {
        return $this->hasOne(ClientReliabilityScore::class);
    }

    /**
     * Check if user is a super admin.
     */
    public function isSuperAdmin()
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if user is an agency admin.
     */
    public function isAgencyAdmin()
    {
        return $this->role === 'agency_admin';
    }

    /**
     * Check if user is a client.
     */
    public function isClient()
    {
        return $this->role === 'client';
    }
}
