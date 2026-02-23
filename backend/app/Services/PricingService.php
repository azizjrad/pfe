<?php

namespace App\Services;

use App\Models\Vehicle;
use Carbon\Carbon;

class PricingService
{
    /**
     * Calculate dynamic price for a vehicle rental
     *
     * @param Vehicle $vehicle
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @param int|null $clientReliabilityScore
     * @param array $options Additional options (insurance, gps, etc.)
     * @return array Price breakdown
     */
    public function calculatePrice(
        Vehicle $vehicle,
        Carbon $startDate,
        Carbon $endDate,
        ?int $clientReliabilityScore = null,
        array $options = []
    ): array {
        $basePrice = $vehicle->daily_price;
        $rentalDays = max(1, $startDate->diffInDays($endDate));
        $daysInAdvance = now()->diffInDays($startDate, false);

        $breakdown = [
            'base_price' => $basePrice,
            'rental_days' => $rentalDays,
            'subtotal' => $basePrice * $rentalDays,
            'adjustments' => [],
        ];

        // 1. Seasonal Pricing (Demand-Based)
        $seasonalMultiplier = $this->getSeasonalMultiplier($startDate);
        if ($seasonalMultiplier != 1.0) {
            $amount = $breakdown['subtotal'] * ($seasonalMultiplier - 1);
            $breakdown['adjustments'][] = [
                'type' => 'seasonal',
                'label' => $this->getSeasonLabel($startDate),
                'multiplier' => $seasonalMultiplier,
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        // 2. Advance Booking Discount
        $advanceDiscount = $this->getAdvanceBookingDiscount($daysInAdvance);
        if ($advanceDiscount > 0) {
            $amount = -($breakdown['subtotal'] * $advanceDiscount);
            $breakdown['adjustments'][] = [
                'type' => 'advance_booking',
                'label' => 'Réservation anticipée (' . abs($daysInAdvance) . ' jours)',
                'percentage' => $advanceDiscount * 100,
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        // Last minute premium
        $lastMinutePremium = $this->getLastMinutePremium($daysInAdvance);
        if ($lastMinutePremium > 0) {
            $amount = $breakdown['subtotal'] * $lastMinutePremium;
            $breakdown['adjustments'][] = [
                'type' => 'last_minute',
                'label' => 'Réservation de dernière minute',
                'percentage' => $lastMinutePremium * 100,
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        // 3. Rental Duration Discount
        $durationDiscount = $this->getDurationDiscount($rentalDays);
        if ($durationDiscount > 0) {
            $amount = -($breakdown['subtotal'] * $durationDiscount);
            $breakdown['adjustments'][] = [
                'type' => 'duration',
                'label' => 'Réduction durée (' . $rentalDays . ' jours)',
                'percentage' => $durationDiscount * 100,
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        // 4. Weekend Premium
        $weekendPremium = $this->getWeekendPremium($startDate);
        if ($weekendPremium > 0) {
            $amount = $breakdown['subtotal'] * $weekendPremium;
            $breakdown['adjustments'][] = [
                'type' => 'weekend',
                'label' => 'Supplément weekend',
                'percentage' => $weekendPremium * 100,
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        // 5. Client Loyalty/Reliability Score
        if ($clientReliabilityScore !== null) {
            $loyaltyDiscount = $this->getLoyaltyDiscount($clientReliabilityScore);
            if ($loyaltyDiscount > 0) {
                $amount = -($breakdown['subtotal'] * $loyaltyDiscount);
                $breakdown['adjustments'][] = [
                    'type' => 'loyalty',
                    'label' => 'Réduction fidélité (Score: ' . $clientReliabilityScore . '%)',
                    'percentage' => $loyaltyDiscount * 100,
                    'amount' => round($amount, 2),
                ];
                $breakdown['subtotal'] += $amount;
            } elseif ($loyaltyDiscount < 0) {
                // Low score penalty
                $amount = $breakdown['subtotal'] * abs($loyaltyDiscount);
                $breakdown['adjustments'][] = [
                    'type' => 'risk_premium',
                    'label' => 'Supplément risque (Score: ' . $clientReliabilityScore . '%)',
                    'percentage' => abs($loyaltyDiscount) * 100,
                    'amount' => round($amount, 2),
                ];
                $breakdown['subtotal'] += $amount;
            }
        }

        // 6. Vehicle Availability (Smart Pricing)
        $availabilityMultiplier = $this->getAvailabilityMultiplier($vehicle, $startDate, $endDate);
        if ($availabilityMultiplier != 1.0) {
            $amount = $breakdown['subtotal'] * ($availabilityMultiplier - 1);
            $label = $availabilityMultiplier > 1 ? 'Haute demande' : 'Faible demande';
            $breakdown['adjustments'][] = [
                'type' => 'availability',
                'label' => $label,
                'multiplier' => $availabilityMultiplier,
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        // 7. Insurance & Add-ons
        if (!empty($options['full_insurance'])) {
            $amount = $breakdown['subtotal'] * 0.15;
            $breakdown['adjustments'][] = [
                'type' => 'insurance',
                'label' => 'Assurance tous risques',
                'percentage' => 15,
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        if (!empty($options['gps'])) {
            $amount = 5 * $rentalDays;
            $breakdown['adjustments'][] = [
                'type' => 'addon',
                'label' => 'GPS',
                'daily_rate' => 5,
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        if (!empty($options['child_seat'])) {
            $amount = 3 * $rentalDays;
            $breakdown['adjustments'][] = [
                'type' => 'addon',
                'label' => 'Siège enfant',
                'daily_rate' => 3,
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        if (!empty($options['additional_driver'])) {
            $amount = 8 * $rentalDays;
            $breakdown['adjustments'][] = [
                'type' => 'addon',
                'label' => 'Conducteur additionnel',
                'daily_rate' => 8,
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        // 8. Special Services
        if (!empty($options['airport_delivery'])) {
            $amount = 10;
            $breakdown['adjustments'][] = [
                'type' => 'service',
                'label' => 'Livraison aéroport',
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        if (!empty($options['home_delivery'])) {
            $amount = 25;
            $breakdown['adjustments'][] = [
                'type' => 'service',
                'label' => 'Livraison à domicile',
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        if (!empty($options['after_hours_pickup'])) {
            $amount = 15;
            $breakdown['adjustments'][] = [
                'type' => 'service',
                'label' => 'Prise en charge hors horaires',
                'amount' => round($amount, 2),
            ];
            $breakdown['subtotal'] += $amount;
        }

        // 9. Mileage Options
        if (isset($options['mileage_option'])) {
            switch ($options['mileage_option']) {
                case 'unlimited':
                    $amount = $breakdown['subtotal'] * 0.10;
                    $breakdown['adjustments'][] = [
                        'type' => 'mileage',
                        'label' => 'Kilométrage illimité',
                        'percentage' => 10,
                        'amount' => round($amount, 2),
                    ];
                    $breakdown['subtotal'] += $amount;
                    break;
                case '100km':
                    $amount = -($breakdown['subtotal'] * 0.05);
                    $breakdown['adjustments'][] = [
                        'type' => 'mileage',
                        'label' => 'Limite 100 km/jour',
                        'percentage' => -5,
                        'amount' => round($amount, 2),
                    ];
                    $breakdown['subtotal'] += $amount;
                    break;
                // '200km' is base price (no adjustment)
            }
        }

        $breakdown['total'] = round($breakdown['subtotal'], 2);
        $breakdown['average_daily_rate'] = round($breakdown['total'] / $rentalDays, 2);

        return $breakdown;
    }

    /**
     * Get seasonal multiplier based on date
     */
    public function getSeasonalMultiplier(Carbon $date): float
    {
        $month = $date->month;

        // High Season (June-September): +25%
        if (in_array($month, [6, 7, 8, 9])) {
            return 1.25;
        }

        // Holiday Season (December-January): +20%
        if (in_array($month, [12, 1])) {
            return 1.20;
        }

        // Low Season (October-November, February-March): -15%
        if (in_array($month, [10, 11, 2, 3])) {
            return 0.85;
        }

        // Regular Season (April-May): Base price
        return 1.0;
    }

    /**
     * Get season label
     */
    public function getSeasonLabel(Carbon $date): string
    {
        $month = $date->month;

        if (in_array($month, [6, 7, 8, 9])) {
            return 'Haute saison (+25%)';
        }
        if (in_array($month, [12, 1])) {
            return 'Saison des fêtes (+20%)';
        }
        if (in_array($month, [10, 11, 2, 3])) {
            return 'Basse saison (-15%)';
        }
        return 'Saison régulière';
    }

    /**
     * Get advance booking discount
     */
    private function getAdvanceBookingDiscount(int $daysInAdvance): float
    {
        if ($daysInAdvance >= 30) {
            return 0.10; // -10%
        }
        if ($daysInAdvance >= 15) {
            return 0.05; // -5%
        }
        if ($daysInAdvance >= 7) {
            return 0.02; // -2%
        }
        return 0;
    }

    /**
     * Get last minute premium
     */
    private function getLastMinutePremium(int $daysInAdvance): float
    {
        if ($daysInAdvance < 2 && $daysInAdvance >= 0) {
            return 0.15; // +15%
        }
        return 0;
    }

    /**
     * Get duration discount
     */
    private function getDurationDiscount(int $days): float
    {
        if ($days >= 21) {
            return 0.20; // -20%
        }
        if ($days >= 14) {
            return 0.15; // -15%
        }
        if ($days >= 7) {
            return 0.10; // -10%
        }
        if ($days >= 3) {
            return 0.05; // -5%
        }
        return 0;
    }

    /**
     * Get weekend premium
     */
    private function getWeekendPremium(Carbon $date): float
    {
        // Friday (5), Saturday (6), Sunday (0)
        if (in_array($date->dayOfWeek, [0, 5, 6])) {
            return 0.15; // +15%
        }
        return 0;
    }

    /**
     * Get loyalty discount based on reliability score
     */
    private function getLoyaltyDiscount(int $score): float
    {
        if ($score >= 90) {
            return 0.05; // -5%
        }
        if ($score >= 75) {
            return 0.02; // -2%
        }
        if ($score >= 60) {
            return 0; // Base price
        }
        // Low score: penalty
        return -0.05; // +5%
    }

    /**
     * Get availability-based multiplier
     * This would normally query the database for fleet availability
     */
    private function getAvailabilityMultiplier(Vehicle $vehicle, Carbon $startDate, Carbon $endDate): float
    {
        // Placeholder: In real implementation, query reservation counts for the agency
        // For now, return base multiplier
        // Low availability (< 20% fleet available): +15%
        // High availability (> 60% available): -10%
        
        return 1.0; // Base multiplier for now
    }
}
