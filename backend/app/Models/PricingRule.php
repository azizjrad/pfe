<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingRule extends Model
{
    protected $fillable = [
        'name',
        'rule_type',
        'condition_type',
        'condition_value',
        'percentage',
        'start_date',
        'end_date',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'priority' => 'integer',
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
        if ($this->rule_type === 'discount') {
            return $basePrice * (1 - ($this->percentage / 100));
        }

        // markup or seasonal
        return $basePrice * (1 + ($this->percentage / 100));
    }

    /**
     * Get rule type label in French.
     */
    public function getTypeLabel()
    {
        return match($this->rule_type) {
            'discount' => 'Réduction',
            'markup' => 'Majoration',
            'seasonal' => 'Saisonnier',
            default => $this->rule_type,
        };
    }
}
