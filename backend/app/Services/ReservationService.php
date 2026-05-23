<?php

namespace App\Services;

use App\Domain\Enums\ReservationPaymentStatus;
use App\Domain\Enums\ReservationStatus;
use App\Domain\Enums\VehicleStatus;
use App\Exceptions\Domain\BusinessRuleViolationException;
use App\Exceptions\Domain\ConflictException;
use App\Models\Reservation;
use App\Models\User;
use App\Models\UserNotification;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReservationService
{
    private ClientService $clientService;
    private ?BrevoService $brevoService = null;

    public function __construct(ClientService $clientService, ?BrevoService $brevoService = null)
    {
        $this->clientService = $clientService;
        $this->brevoService = $brevoService;
    }

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
            $scoreModel = $this->clientService->recalculateReliabilityScore($user);
            $score = $scoreModel->reliability_score ?? 100;
            if ($score < 40) {
                throw new BusinessRuleViolationException(
                    'Vous ne pouvez plus effectuer de réservations. Score de fiabilité insuffisant.',
                    403,
                    'BOOKING_BLOCKED_LOW_SCORE'
                );
            }
        }

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);

        // Prevent race conditions: lock the vehicle row for update so concurrent
        // bookings cannot bypass the availability check. This relies on the
        // surrounding controller to run inside a DB transaction (it does), but
        // locking here is protective if called elsewhere.
        try {
            $vehicle = Vehicle::where('id', $vehicle->id)->lockForUpdate()->first();
        } catch (\Exception $e) {
            // If locking is unsupported or fails, continue — availability checks remain.
        }

        // Check vehicle availability
        if (!$this->checkAvailability($vehicle->id, $data['start_date'], $data['end_date'])) {
            throw new ConflictException(
                'Véhicule indisponible pour les dates sélectionnées. Veuillez choisir d\'autres dates ou un autre véhicule.',
                'VEHICLE_NOT_AVAILABLE'
            );
        }

        // Enforce max active reservations per user
        $maxActive = config('pfe.limits.max_active_reservations', 2);
        $activeCount = Reservation::where('user_id', $user->id)
            ->whereIn('status', ReservationStatus::activeValues())
            ->count();

        if ($activeCount >= $maxActive) {
            throw new BusinessRuleViolationException(
                "Vous avez atteint le nombre maximum de réservations actives ({$maxActive}). Merci d\'annuler une réservation existante avant d\'en créer une nouvelle.",
                403,
                'MAX_ACTIVE_RESERVATIONS_REACHED'
            );
        }

        $startDate = Carbon::parse($data['start_date']);
        $endDate = Carbon::parse($data['end_date']);
        $options = $data['options'] ?? [];

        // In this flow, renter is also the driver.
        // If dedicated driver fields are absent, derive them from renter info.
        $fullName = trim((string) ($data['full_name'] ?? $user->name ?? ''));
        $nameParts = preg_split('/\s+/', $fullName) ?: [];
        $derivedFirstName = $nameParts[0] ?? null;
        $derivedLastName = count($nameParts) > 1
            ? implode(' ', array_slice($nameParts, 1))
            : null;

        $driverFirstName = $data['driver_first_name'] ?? $derivedFirstName;
        $driverLastName = $data['driver_last_name'] ?? $derivedLastName;
        $driverBirthDate = $data['driver_birth_date'] ?? ($data['client_birth_date'] ?? null);

        // Calculate pricing server-side (security)
        $pricingBreakdown = $this->calculatePrice($vehicle, $startDate, $endDate, $options);

        // Calculate platform commission (5%)
        $commissionRate = config('pfe.commission.platform_rate');
        $minCommission = config('pfe.commission.min_commission');

        $platformCommission = max(
            $pricingBreakdown['total'] * $commissionRate,
            $minCommission
        );
        $agencyPayout = $pricingBreakdown['total'] - $platformCommission;

        // Create reservation
        $reservation = Reservation::create([
            'user_id' => $user->id,
            'vehicle_id' => $vehicle->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'pickup_location' => $data['pickup_location'],
            'dropoff_location' => $data['dropoff_location'] ?? $data['pickup_location'],
            'client_birth_date' => $data['client_birth_date'] ?? null,
            'driver_first_name' => $driverFirstName,
            'driver_last_name' => $driverLastName,
            'driver_birth_date' => $driverBirthDate,
            'driver_license_number' => $data['driver_license_number'] ?? null,
            'driver_license_date' => $data['driver_license_date'] ?? null,
            'base_price' => $pricingBreakdown['base_total'],
            'discount_amount' => 0,
            'additional_charges' => $pricingBreakdown['total'] - $pricingBreakdown['base_total'],
            'total_price' => $pricingBreakdown['total'],
            'platform_commission_rate' => $commissionRate,
            'platform_commission' => $platformCommission,
            'agency_payout' => $agencyPayout,
            'paid_amount' => 0,
            'remaining_amount' => $pricingBreakdown['total'],
            'payment_status' => ReservationPaymentStatus::UNPAID->value,
            'status' => ReservationStatus::PENDING->value,
            'pricing_details' => $pricingBreakdown,
            'notes' => $data['notes'] ?? null,
        ]);

        if ($user->role === 'client') {
            $this->clientService->recalculateReliabilityScore($user);
        }

        return $reservation;
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
        if ($reservation->status !== ReservationStatus::PENDING->value) {
            throw new BusinessRuleViolationException(
                'Seules les réservations en attente peuvent être modifiées. Contactez l\'agence pour toute modification.',
                422,
                'RESERVATION_NOT_EDITABLE'
            );
        }

        // If dates changed, check availability
        if (isset($data['start_date']) || isset($data['end_date'])) {
            $startDate = $data['start_date'] ?? $reservation->start_date;
            $endDate = $data['end_date'] ?? $reservation->end_date;

            if (!$this->checkAvailability($reservation->vehicle_id, $startDate, $endDate, $reservation->id)) {
                throw new ConflictException(
                    'Véhicule indisponible pour les nouvelles dates sélectionnées.',
                    'VEHICLE_NOT_AVAILABLE'
                );
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

                $commissionRate = config('pfe.commission.platform_rate');
                $minCommission = config('pfe.commission.min_commission');
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
            throw new BusinessRuleViolationException(
                'Non autorisé. Vous ne pouvez annuler que les réservations de vos propres véhicules.',
                403,
                'RESERVATION_CANCEL_FORBIDDEN'
            );
        }

        // Check cancellation eligibility
        if (in_array($reservation->status, ReservationStatus::immutableValues(), true)) {
            throw new BusinessRuleViolationException(
                'Cette réservation ne peut pas être annulée.',
                422,
                'RESERVATION_NOT_CANCELLABLE'
            );
        }

        // Clients can only cancel pending reservations
        if ($user->role === 'client' && $reservation->status !== ReservationStatus::PENDING->value) {
            throw new BusinessRuleViolationException(
                'Réservation déjà confirmée. Veuillez contacter l\'agence pour l\'annuler.',
                422,
                'RESERVATION_ALREADY_CONFIRMED'
            );
        }

        $reservation->update([
            'status' => ReservationStatus::CANCELLED->value,
            'cancellation_reason' => $data['cancellation_reason'] ?? null,
            'cancelled_at' => now(),
        ]);

        // If no active reservation remains, vehicle can become available again.
        $this->resetVehicleStatusIfNoActiveReservations($reservation);

        // Notify client when cancellation is performed by agency/super admin.
        if (in_array($user->role, ['agency_admin', 'super_admin']) && $reservation->user_id) {
            UserNotification::create([
                'user_id' => $reservation->user_id,
                'type' => 'reservation_refused',
                'title' => 'Réservation refusée',
                'message' => "Votre réservation #{$reservation->id} a été refusée par l'agence.",
                'data' => [
                    'reservation_id' => $reservation->id,
                    'status' => ReservationStatus::CANCELLED->value,
                    'vehicle_id' => $reservation->vehicle_id,
                ],
            ]);
        }

        if ($reservation->user && $reservation->user->role === 'client') {
            $this->clientService->recalculateReliabilityScore($reservation->user);
        }

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
        if (!in_array($status, ReservationStatus::values(), true)) {
            throw new BusinessRuleViolationException(
                "Statut invalide: {$status}",
                422,
                'INVALID_RESERVATION_STATUS'
            );
        }

        $previousStatus = $reservation->status;
        $reservation->update(['status' => $status]);

        if ($status === ReservationStatus::CONFIRMED->value) {
            $this->updateVehicleLifecycleStatus($reservation, VehicleStatus::RESERVED->value);
        }

        if ($status === ReservationStatus::ONGOING->value) {
            $this->updateVehicleLifecycleStatus($reservation, VehicleStatus::IN_USE->value);
        }

        if ($status === ReservationStatus::COMPLETED->value) {
            $this->updateVehicleLifecycleStatus($reservation, VehicleStatus::RETURNED->value);
        }

        if ($status === ReservationStatus::CANCELLED->value) {
            $this->resetVehicleStatusIfNoActiveReservations($reservation);
        }

        // Notify client for acceptance/refusal decision.
        if ($reservation->user_id && $previousStatus !== $status) {
            if ($status === ReservationStatus::CONFIRMED->value) {
                UserNotification::create([
                    'user_id' => $reservation->user_id,
                    'type' => 'reservation_accepted',
                    'title' => 'Réservation acceptée',
                    'message' => "Bonne nouvelle ! Votre réservation #{$reservation->id} a été acceptée.",
                    'data' => [
                        'reservation_id' => $reservation->id,
                        'status' => $status,
                        'vehicle_id' => $reservation->vehicle_id,
                    ],
                ]);

                // Send contract email with PDF attachment (if Brevo configured)
                try {
                    if ($this->brevoService !== null) {
                        $this->brevoService->sendReservationContract($reservation->load(['vehicle', 'user']));
                    }
                } catch (\Throwable $e) {
                    // Log error but don't interrupt flow
                    logger()->error('ReservationService: sendReservationContract failed: ' . $e->getMessage());
                }
            }

            if ($status === ReservationStatus::CANCELLED->value) {
                UserNotification::create([
                    'user_id' => $reservation->user_id,
                    'type' => 'reservation_refused',
                    'title' => 'Réservation refusée',
                    'message' => "Votre réservation #{$reservation->id} a été refusée.",
                    'data' => [
                        'reservation_id' => $reservation->id,
                        'status' => $status,
                        'vehicle_id' => $reservation->vehicle_id,
                    ],
                ]);
            }
        }

        if ($reservation->user && $reservation->user->role === 'client') {
            $this->clientService->recalculateReliabilityScore($reservation->user);
        }

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
        if ($reservation->status !== ReservationStatus::CONFIRMED->value) {
            throw new BusinessRuleViolationException(
                'Seules les réservations confirmées peuvent être en cours.',
                422,
                'RESERVATION_PICKUP_INVALID_STATE'
            );
        }

        $reservation->update(['status' => ReservationStatus::ONGOING->value]);
        $this->updateVehicleLifecycleStatus($reservation, VehicleStatus::IN_USE->value);
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
        // Allow recording a return if reservation is ONGOING, or if it's already
        // COMPLETED but no return record exists (admin recording inspection after the fact).
        if (!in_array($reservation->status, [ReservationStatus::ONGOING->value, ReservationStatus::COMPLETED->value], true)) {
            throw new BusinessRuleViolationException(
                'Seules les réservations en cours ou terminées peuvent être traitées pour un retour.',
                422,
                'RESERVATION_RETURN_INVALID_STATE'
            );
        }

        // If a return record already exists, do not duplicate
        if ($reservation->vehicleReturn) {
            return $reservation;
        }

        $additionalCharges = round(floatval($returnData['additional_charges'] ?? 0), 2);
        $mileage = isset($returnData['mileage_on_return']) ? intval($returnData['mileage_on_return']) : null;
        $returnedAt = isset($returnData['actual_return_date']) ? Carbon::parse($returnData['actual_return_date']) : now();
        $vehicleCondition = $returnData['condition'] ?? ($returnData['vehicle_condition'] ?? 'good');

        // Create returns record using expected column names
        $reservation->vehicleReturn()->create([
            'reservation_id' => $reservation->id,
            'return_date' => $returnedAt,
            'return_mileage' => $mileage ?? 0,
            'fuel_level' => $returnData['fuel_level'] ?? null,
            'vehicle_condition' => $vehicleCondition,
            'damage_description' => $returnData['damage_description'] ?? null,
            'additional_charges' => $additionalCharges,
            'damage_notes' => $returnData['damage_notes'] ?? null,
            'inspection_notes' => $returnData['inspection_notes'] ?? null,
            'notes' => $returnData['notes'] ?? null,
        ]);

        // Update reservation financials and return meta
        $newTotal = $reservation->total_price + $additionalCharges;
        $newRemaining = max(0, $reservation->remaining_amount + $additionalCharges);

        $paymentStatus = $reservation->payment_status;
        if ($newRemaining <= 0) {
            $paymentStatus = ReservationPaymentStatus::PAID->value;
        } elseif ($newRemaining < $reservation->total_price) {
            $paymentStatus = ReservationPaymentStatus::PARTIALLY_PAID->value;
        }

        $isLate = false;
        if ($reservation->end_date) {
            $end = Carbon::parse($reservation->end_date)->endOfDay();
            $isLate = $returnedAt->gt($end);
        }

        $reservation->update([
            'additional_charges' => $reservation->additional_charges + $additionalCharges,
            'total_price' => $newTotal,
            'remaining_amount' => $newRemaining,
            'payment_status' => $paymentStatus,
            'actual_return_date' => $returnedAt->toDateString(),
            'is_late_return' => $isLate,
            'status' => ReservationStatus::COMPLETED->value,
        ]);

        $this->updateVehicleLifecycleStatus($reservation, VehicleStatus::RETURNED->value);

        // If there are no other active reservations for the vehicle, reset status
        $this->resetVehicleStatusIfNoActiveReservations($reservation);

        // Recalculate client reliability score
        if ($reservation->user && $reservation->user->role === 'client') {
            $this->clientService->recalculateReliabilityScore($reservation->user);
        }

        return $reservation->fresh();
    }

    /**
     * Force vehicle lifecycle status to match reservation workflow.
     */
    private function updateVehicleLifecycleStatus(Reservation $reservation, string $status): void
    {
        $vehicle = $reservation->vehicle;

        if (!$vehicle) {
            return;
        }

        $vehicle->update(['status' => $status]);
    }

    /**
     * Set vehicle back to available when no active reservation remains.
     * Do not override manual maintenance state.
     */
    private function resetVehicleStatusIfNoActiveReservations(Reservation $reservation): void
    {
        $vehicle = $reservation->vehicle;

        if (!$vehicle) {
            return;
        }

        $hasActiveReservations = Reservation::where('vehicle_id', $vehicle->id)
            ->whereIn('status', ReservationStatus::activeValues())
            ->where('id', '!=', $reservation->id)
            ->exists();

        if (!$hasActiveReservations && $vehicle->status !== VehicleStatus::MAINTENANCE->value) {
            $vehicle->update(['status' => VehicleStatus::AVAILABLE->value]);
        }
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
            ->where('status', '!=', ReservationStatus::CANCELLED->value)
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
     * All add-on prices are configured in config/pfe.php
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
        $basePrice = (float) ($vehicle->daily_price ?? $vehicle->daily_rate ?? $vehicle->price ?? 0);
        $baseTotal = $basePrice * $rentalDays;

        $breakdown = [
            'base_price' => $basePrice,
            'rental_days' => $rentalDays,
            'base_total' => $baseTotal,
            'options' => [],
            'total' => $baseTotal,
        ];

        // Get add-ons config
        $addOns = config('pfe.pricing.add_ons', []);

        if (!empty($options['airport_delivery']) && isset($addOns['airport_delivery'])) {
            $config = $addOns['airport_delivery'];
            $amount = $config['value'];
            $breakdown['options'][] = [
                'name' => $config['display_name'],
                'amount' => $amount,
            ];
            $breakdown['total'] += $amount;
        }

        if (!empty($options['home_delivery']) && isset($addOns['home_delivery'])) {
            $config = $addOns['home_delivery'];
            $amount = $config['value'];
            $breakdown['options'][] = [
                'name' => $config['display_name'],
                'amount' => $amount,
            ];
            $breakdown['total'] += $amount;
        }

        if (!empty($options['after_hours_pickup']) && isset($addOns['after_hours_pickup'])) {
            $config = $addOns['after_hours_pickup'];
            $amount = $config['value'];
            $breakdown['options'][] = [
                'name' => $config['display_name'],
                'amount' => $amount,
            ];
            $breakdown['total'] += $amount;
        }

        $breakdown['total'] = round($breakdown['total'], 2);
        $breakdown['average_daily_rate'] = round($breakdown['total'] / $rentalDays, 2);

        return $breakdown;
    }
}
