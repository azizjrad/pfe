<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientReliabilityScore extends Model
{
    protected $fillable = [
        'user_id',
        'total_reservations',
        'completed_reservations',
        'cancelled_reservations',
        'late_returns',
        'payment_delays',
        'damage_incidents',
        'total_unpaid_amount',
        'reliability_score',
        'risk_level',
        'admin_notes',
        'last_calculated_at',
    ];

    protected $casts = [
        'total_reservations' => 'integer',
        'completed_reservations' => 'integer',
        'cancelled_reservations' => 'integer',
        'late_returns' => 'integer',
        'payment_delays' => 'integer',
        'damage_incidents' => 'integer',
        'total_unpaid_amount' => 'decimal:2',
        'reliability_score' => 'integer',
        'last_calculated_at' => 'datetime',
    ];

    /**
     * Get the user (client) this score belongs to.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate reliability score based on user behavior.
     */
    public function calculateScore()
    {
        $penalties = config('pfe.reliability_scoring');

        $score = 100 - (
            ($this->cancelled_reservations * $penalties['cancelled_penalty']) +
            ($this->late_returns * $penalties['late_return_penalty']) +
            ($this->payment_delays * $penalties['payment_delay_penalty']) +
            ($this->damage_incidents * $penalties['damage_penalty']) +
            ($this->total_unpaid_amount > 0 ? $penalties['unpaid_penalty'] : 0)
        );

        // Ensure score is between 0 and 100
        $this->reliability_score = max(0, min(100, $score));

        // Update risk level based on score
        $this->risk_level = $this->determineRiskLevel();
        $this->last_calculated_at = now();

        $this->save();

        return $this->reliability_score;
    }

    /**
     * Determine risk level based on score.
     */
    protected function determineRiskLevel()
    {
        $thresholds = config('pfe.reliability_scoring');

        if ($this->reliability_score < $thresholds['blocked_threshold']) {
            return 'blocked';
        } elseif ($this->reliability_score < $thresholds['high_risk_threshold']) {
            return 'high';
        } elseif ($this->reliability_score < $thresholds['medium_risk_threshold']) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Check if client is blocked.
     */
    public function isBlocked()
    {
        return $this->risk_level === 'blocked';
    }

    /**
     * Check if client is high risk.
     */
    public function isHighRisk()
    {
        return in_array($this->risk_level, ['high', 'blocked']);
    }

    /**
     * Get risk level label in French.
     */
    public function getRiskLabel()
    {
        return match($this->risk_level) {
            'low' => 'Faible',
            'medium' => 'Moyen',
            'high' => 'Élevé',
            'blocked' => 'Bloqué',
            default => $this->risk_level,
        };
    }
}
