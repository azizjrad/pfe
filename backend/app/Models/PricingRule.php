<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingRule extends Model
{
    protected $fillable = [
        'name',
        'description',
        'rule_type',
        'adjustment_type',
        'adjustment_value',
        'start_date',
        'end_date',
        'category_id',
        'agency_id',
        'min_rental_days',
        'max_rental_days',
        'priority',
        'is_active',
    ];

    protected $casts = [
        'adjustment_value' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'priority' => 'integer',
        'min_rental_days' => 'integer',
        'max_rental_days' => 'integer',
    ];

    /**
     * Scope to get only active rules.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get rules ordered by priority.
     */
    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'desc');
    }

    /**
     * Check if rule is currently valid based on dates.
     */
    public function isCurrentlyValid()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }

        return true;
    }

    /**
     * Apply rule to a base price.
     */
    public function applyToPrice($basePrice)
    {
        if ($this->adjustment_type === 'fixed') {
            return $this->adjustment_value;
        }

        // percentage adjustment
        return $basePrice * (1 + ($this->adjustment_value / 100));
    }

    /**
     * Get rule type label in French.
     */
    public function getTypeLabel()
    {
        return match($this->rule_type) {
            'seasonal' => 'Saisonnière',
            'duration' => 'Durée',
            'category' => 'Catégorie',
            'agency' => 'Agence',
            default => $this->rule_type,
        };
    }

    /**
     * Get relations for category or agency if specified.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }
}
