<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Services\PricingService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Calculate dynamic pricing for a vehicle
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function calculatePrice(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'options' => 'nullable|array',
            'options.full_insurance' => 'nullable|boolean',
            'options.gps' => 'nullable|boolean',
            'options.child_seat' => 'nullable|boolean',
            'options.additional_driver' => 'nullable|boolean',
            'options.airport_delivery' => 'nullable|boolean',
            'options.home_delivery' => 'nullable|boolean',
            'options.after_hours_pickup' => 'nullable|boolean',
            'options.mileage_option' => 'nullable|in:100km,200km,unlimited',
        ]);

        try {
            $vehicle = Vehicle::findOrFail($validated['vehicle_id']);
            
            // Get authenticated user's reliability score if available
            $reliabilityScore = null;
            if (auth()->check()) {
                $user = auth()->user();
                // Load the relationship if it exists
                if ($user->clientReliabilityScore) {
                    $reliabilityScore = $user->clientReliabilityScore->score;
                }
            }

            $breakdown = $this->pricingService->calculatePrice(
                $vehicle,
                Carbon::parse($validated['start_date']),
                Carbon::parse($validated['end_date']),
                $reliabilityScore,
                $validated['options'] ?? []
            );

            return response()->json([
                'success' => true,
                'data' => $breakdown
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate price',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pricing information for a specific vehicle (base price + current season)
     *
     * @param int $vehicleId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getVehiclePricing($vehicleId)
    {
        try {
            $vehicle = Vehicle::findOrFail($vehicleId);
            
            // Get current seasonal information
            $today = Carbon::now();
            $seasonalMultiplier = $this->pricingService->getSeasonalMultiplier($today);
            $seasonLabel = $this->pricingService->getSeasonLabel($today);
            
            // Calculate approximate daily rate for current season
            $estimatedDailyRate = round($vehicle->daily_price * $seasonalMultiplier, 2);

            return response()->json([
                'success' => true,
                'data' => [
                    'vehicle_id' => $vehicle->id,
                    'base_daily_price' => $vehicle->daily_price,
                    'current_season' => $seasonLabel,
                    'seasonal_multiplier' => $seasonalMultiplier,
                    'estimated_daily_rate' => $estimatedDailyRate,
                    'note' => 'Le prix final peut varier en fonction de la durée, des dates de réservation et des options choisies.'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get vehicle pricing',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all pricing rules and current seasonal information
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPricingRules()
    {
        try {
            $today = Carbon::now();
            $seasonLabel = $this->pricingService->getSeasonLabel($today);
            $seasonalMultiplier = $this->pricingService->getSeasonalMultiplier($today);

            return response()->json([
                'success' => true,
                'data' => [
                    'current_season' => [
                        'label' => $seasonLabel,
                        'multiplier' => $seasonalMultiplier,
                        'display' => $this->getSeasonDisplay($seasonalMultiplier)
                    ],
                    'seasonal_pricing' => [
                        'high_season' => ['months' => 'Juin-Septembre', 'multiplier' => 1.25, 'adjustment' => '+25%'],
                        'holiday_season' => ['months' => 'Décembre-Janvier', 'multiplier' => 1.20, 'adjustment' => '+20%'],
                        'low_season' => ['months' => 'Octobre-Novembre, Février-Mars', 'multiplier' => 0.85, 'adjustment' => '-15%'],
                        'regular_season' => ['months' => 'Avril-Mai', 'multiplier' => 1.0, 'adjustment' => 'Base']
                    ],
                    'advance_booking' => [
                        ['days' => '30+', 'discount' => '10%'],
                        ['days' => '15-29', 'discount' => '5%'],
                        ['days' => '7-14', 'discount' => '2%'],
                        ['days' => '<2', 'premium' => '+15% (dernière minute)']
                    ],
                    'duration_discounts' => [
                        ['days' => '21+', 'discount' => '20%'],
                        ['days' => '14-20', 'discount' => '15%'],
                        ['days' => '7-13', 'discount' => '10%'],
                        ['days' => '3-6', 'discount' => '5%']
                    ],
                    'other_factors' => [
                        'weekend_premium' => '+15% (vendredi-dimanche)',
                        'loyalty_score' => [
                            ['score' => '90-100%', 'discount' => '5%'],
                            ['score' => '75-89%', 'discount' => '2%'],
                            ['score' => '<60%', 'premium' => '+5%']
                        ]
                    ],
                    'options' => [
                        'insurance' => ['full_insurance' => '+15% du sous-total'],
                        'equipment' => [
                            'gps' => '5 DT/jour',
                            'child_seat' => '3 DT/jour',
                            'additional_driver' => '8 DT/jour'
                        ],
                        'services' => [
                            'airport_delivery' => '10 DT',
                            'home_delivery' => '25 DT',
                            'after_hours_pickup' => '15 DT'
                        ],
                        'mileage' => [
                            'unlimited' => '+10%',
                            '100km' => '-5%',
                            '200km' => 'Base'
                        ]
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get pricing rules',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get display text for seasonal multiplier
     */
    private function getSeasonDisplay($multiplier)
    {
        if ($multiplier > 1.0) {
            return '+' . round(($multiplier - 1) * 100) . '%';
        } elseif ($multiplier < 1.0) {
            return '-' . round((1 - $multiplier) * 100) . '%';
        }
        return 'Prix de base';
    }
}
