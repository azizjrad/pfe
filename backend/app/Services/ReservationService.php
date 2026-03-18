<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReservationService
{
    /**
     * Book a new reservation
     *
     * @param array $data Validated reservation data
     * @param User $user Authenticated user
     * @return Reservation
     * @throws \Exception
     */
    public function book(array $data, User $user): Reservation
    {
        // Check client reliability score
        if ($user->role === 'client') {
            $score = $user->reliabilityScore ? $user->reliabilityScore->reliability_score : 100;
            if ($score < 40) {
                throw new \Exception('Vous ne pouvez plus effectuer de réservations. Score de fiabilité insuffisant.');
            }
        }

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);

        // Check vehicle availability
        if (!$this->checkAvailability($vehicle->id, $data['start_date'], $data['end_date'])) {
            throw new \Exception('Véhicule indisponible pour les dates sélectionnées. Veuillez choisir d\'autres dates ou un autre véhicule.');
        }

        $startDate = Carbon::parse($data['start_date']);
        $endDate = Carbon::parse($data['end_date']);
        $options = $data['options'] ?? [];

        // Calculate pricing server-side (security)
        $pricingBreakdown = $this->calculatePrice($vehicle, $startDate, $endDate, $options);

        // Calculate platform commission (8%)
        $commissionRate = config('pfe.commission.platform_rate', 0.08);
        $minCommission = config('pfe.commission.min_commission', 5);

        $platformCommission = max(
            $pricingBreakdown['total'] * $commissionRate,
            $minCommission
        );
        $agencyPayout = $pricingBreakdown['total'] - $platformCommission;

        // Create reservation
        return Reservation::create([
            'user_id' => $user->id,
            'vehicle_id' => $vehicle->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'pickup_location' => $data['pickup_location'],
            'dropoff_location' => $data['dropoff_location'] ?? $data['pickup_location'],
            'base_price' => $pricingBreakdown['base_total'],
            'discount_amount' => 0,
            'additional_charges' => $pricingBreakdown['total'] - $pricingBreakdown['base_total'],
            'total_price' => $pricingBreakdown['total'],
            'platform_commission_rate' => $commissionRate,
            'platform_commission' => $platformCommission,
            'agency_payout' => $agencyPayout,
            'paid_amount' => 0,
            'remaining_amount' => $pricingBreakdown['total'],
            'payment_status' => 'pending',
            'status' => 'pending',
            'pricing_details' => $pricingBreakdown,
            'notes' => $data['notes'] ?? null,
        ]);
    }

    /**
     * Update a reservation (only if pending)
     *
     * @param Reservation $reservation
     * @param array $data Validated update data
     * @return Reservation
     * @throws \Exception
     */
    public function update(Reservation $reservation, array $data): Reservation
    {
        // Only pending reservations can be edited
        if ($reservation->status !== 'pending') {
            throw new \Exception('Seules les réservations en attente peuvent être modifiées. Contactez l\'agence pour toute modification.');
        }

        // If dates changed, check availability
        if (isset($data['start_date']) || isset($data['end_date'])) {
            $startDate = $data['start_date'] ?? $reservation->start_date;
            $endDate = $data['end_date'] ?? $reservation->end_date;

            if (!$this->checkAvailability($reservation->vehicle_id, $startDate, $endDate, $reservation->id)) {
                throw new \Exception('Véhicule indisponible pour les nouvelles dates sélectionnées.');
            }

            // Recalculate pricing if dates or options changed
            if (isset($data['start_date']) || isset($data['end_date']) || isset($data['options'])) {
                $vehicle = $reservation->vehicle;
                $options = $data['options'] ?? ($reservation->pricing_details['options'] ?? []);

                $pricingBreakdown = $this->calculatePrice(
                    $vehicle,
                    Carbon::parse($startDate),
                    Carbon::parse($endDate),
                    $options
                );

                $commissionRate = config('pfe.commission.platform_rate', 0.08);
                $minCommission = config('pfe.commission.min_commission', 5);
                $platformCommission = max($pricingBreakdown['total'] * $commissionRate, $minCommission);
                $agencyPayout = $pricingBreakdown['total'] - $platformCommission;

                $data['base_price'] = $pricingBreakdown['base_total'];
                $data['discount_amount'] = 0;
                $data['additional_charges'] = $pricingBreakdown['total'] - $pricingBreakdown['base_total'];
                $data['total_price'] = $pricingBreakdown['total'];
                $data['platform_commission'] = $platformCommission;
                $data['agency_payout'] = $agencyPayout;
                $data['remaining_amount'] = $pricingBreakdown['total'];
                $data['pricing_details'] = $pricingBreakdown;
            }
        }

        $reservation->update($data);
        return $reservation;
    }

    /**
     * Cancel a reservation with role-based authorization
     *
     * @param Reservation $reservation
     * @param User $user
     * @param array $data Cancellation details
     * @return Reservation
     * @throws \Exception
     */
    public function cancel(Reservation $reservation, User $user, array $data = []): Reservation
    {
        // Authorization: Agency admin can only cancel their own vehicles
        if ($user->role === 'agency_admin' && $reservation->vehicle->agency_id !== $user->agency_id) {
            throw new \Exception('Non autorisé. Vous ne pouvez annuler que les réservations de vos propres véhicules.');
        }

        // Check cancellation eligibility
        if (in_array($reservation->status, ['completed', 'cancelled'])) {
            throw new \Exception('Cette réservation ne peut pas être annulée.');
        }

        // Clients can only cancel pending reservations
        if ($user->role === 'client' && $reservation->status !== 'pending') {
            throw new \Exception('Réservation déjà confirmée. Veuillez contacter l\'agence pour l\'annuler.');
        }

        $reservation->update([
            'status' => 'cancelled',
            'cancellation_reason' => $data['cancellation_reason'] ?? null,
            'cancelled_at' => now(),
        ]);

        return $reservation;
    }

    /**
     * Update reservation status (agency only)
     *
     * @param Reservation $reservation
     * @param string $status
     * @return Reservation
     * @throws \Exception
     */
    public function updateStatus(Reservation $reservation, string $status): Reservation
    {
        $validStatuses = ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'];
        if (!in_array($status, $validStatuses)) {
            throw new \Exception("Statut invalide: {$status}");
        }

        $reservation->update(['status' => $status]);
        return $reservation;
    }

    /**
     * Mark vehicle as picked up
     *
     * @param Reservation $reservation
     * @return Reservation
     * @throws \Exception
     */
    public function pickupVehicle(Reservation $reservation): Reservation
    {
        if ($reservation->status !== 'confirmed') {
            throw new \Exception('Seules les réservations confirmées peuvent être en cours.');
        }

        $reservation->update(['status' => 'ongoing']);
        return $reservation;
    }

    /**
     * Mark vehicle as returned and complete reservation
     *
     * @param Reservation $reservation
     * @param array $returnData
     * @return Reservation
     * @throws \Exception
     */
    public function returnVehicle(Reservation $reservation, array $returnData = []): Reservation
    {
        if ($reservation->status !== 'ongoing') {
            throw new \Exception('Seules les réservations en cours peuvent être retournées.');
        }

        $reservation->vehicleReturn()->create([
            'mileage_on_return' => $returnData['mileage_on_return'] ?? 0,
            'condition' => $returnData['condition'] ?? 'good',
            'returned_at' => now(),
        ]);

        $reservation->update(['status' => 'completed']);
        return $reservation;
    }

    /**
     * Check if vehicle is available for given date range
     *
     * @param int $vehicleId
     * @param mixed $startDate
     * @param mixed $endDate
     * @param int|null $excludeReservationId
     * @return bool
     */
    public function checkAvailability($vehicleId, $startDate, $endDate, $excludeReservationId = null): bool
    {
        $query = Reservation::where('vehicle_id', $vehicleId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                    });
            });

        if ($excludeReservationId) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return !$query->exists();
    }

    /**
     * Calculate pricing for a vehicle rental
     *
     * Price = (Vehicle daily price × rental days) + optional add-ons
     *
     * @param Vehicle $vehicle
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @param array $options
     * @return array Price breakdown
     */
    public function calculatePrice(
        Vehicle $vehicle,
        Carbon $startDate,
        Carbon $endDate,
        array $options = []
    ): array {
        $rentalDays = max(1, $startDate->diffInDays($endDate));
        $basePrice = $vehicle->price;
        $baseTotal = $basePrice * $rentalDays;

        $breakdown = [
            'base_price' => $basePrice,
            'rental_days' => $rentalDays,
            'base_total' => $baseTotal,
            'options' => [],
            'total' => $baseTotal,
        ];

        // Add optional services
        if (!empty($options['full_insurance'])) {
            $amount = $baseTotal * 0.15; // 15% of base
            $breakdown['options'][] = [
                'name' => 'Assurance tous risques',
                'amount' => round($amount, 2),
            ];
            $breakdown['total'] += $amount;
        }

        if (!empty($options['airport_delivery'])) {
            $amount = 10;
            $breakdown['options'][] = [
                'name' => 'Livraison aéroport',
                'amount' => $amount,
            ];
            $breakdown['total'] += $amount;
        }

        if (!empty($options['home_delivery'])) {
            $amount = 25;
            $breakdown['options'][] = [
                'name' => 'Livraison à domicile',
                'amount' => $amount,
            ];
            $breakdown['total'] += $amount;
        }

        if (!empty($options['after_hours_pickup'])) {
            $amount = 15;
            $breakdown['options'][] = [
                'name' => 'Prise en charge hors horaires',
                'amount' => $amount,
            ];
            $breakdown['total'] += $amount;
        }

        $breakdown['total'] = round($breakdown['total'], 2);
        $breakdown['average_daily_rate'] = round($breakdown['total'] / $rentalDays, 2);

        return $breakdown;
    }
}
