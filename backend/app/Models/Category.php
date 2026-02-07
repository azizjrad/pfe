<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get all vehicles in this category.
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}
