<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Vehicle;
use App\Services\PricingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Get all reservations for a client
     */
    public function clientIndex()
    {
        $reservations = Reservation::with(['vehicle', 'payments'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reservations,
        ]);
    }

    /**
     * Get all reservations for an agency
     */
    public function agencyIndex()
    {
        $user = auth()->user();

        // Get all vehicles belonging to this agency
        $reservations = Reservation::with(['vehicle', 'user', 'payments'])
            ->whereHas('vehicle', function ($query) use ($user) {
                $query->where('agency_id', $user->agency_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reservations,
        ]);
    }

    /**
     * Create a new reservation with dynamic pricing validation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'pickup_location' => 'required|string|max:255',
            'dropoff_location' => 'nullable|string|max:255',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'notes' => 'nullable|string|max:1000',
            'options' => 'nullable|array',
            'pricing_breakdown' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            // Check client reliability score
            $user = auth()->user();
            if ($user->role === 'client') {
                $score = $user->clientScore ? $user->clientScore->total_score : 100;
                if ($score < 40) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous ne pouvez plus effectuer de réservations. Score de fiabilité insuffisant.',
                    ], 403);
                }
            }

            $vehicle = Vehicle::findOrFail($validated['vehicle_id']);

            // Check vehicle availability
            $isAvailable = $this->checkVehicleAvailability(
                $vehicle->id,
                $validated['start_date'],
                $validated['end_date']
            );

            if (!$isAvailable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Véhicule indisponible pour les dates sélectionnées. Veuillez choisir d\'autres dates ou un autre véhicule.',
                ], 422);
            }

            // Recalculate pricing on backend for security validation
            $startDate = Carbon::parse($validated['start_date']);
            $endDate = Carbon::parse($validated['end_date']);

            $reliabilityScore = auth()->check() && auth()->user()->clientScore
                ? auth()->user()->clientScore->total_score
                : null;

            $options = $validated['options'] ?? [];

            $backendPricing = $this->pricingService->calculatePrice(
                $vehicle,
                $startDate,
                $endDate,
                $reliabilityScore,
                $options
            );

            // Validate that frontend price matches backend calculation (within 1% tolerance)
            $frontendTotal = $validated['pricing_breakdown']['total_price'] ?? 0;
            $backendTotal = $backendPricing['total_price'];
            $priceDifference = abs($frontendTotal - $backendTotal);
            $tolerance = $backendTotal * 0.01; // 1% tolerance for rounding

            if ($priceDifference > $tolerance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de calcul de prix. Veuillez actualiser et réessayer.',
                    'details' => [
                        'frontend_total' => $frontendTotal,
                        'backend_total' => $backendTotal,
                        'difference' => $priceDifference,
                    ],
                ], 422);
            }

            // Create reservation with backend-calculated pricing (security)
            // Calculate platform commission (8%)
            $commissionRate = config('pfe.commission.platform_rate', 0.08);
            $minCommission = config('pfe.commission.min_commission', 5);

            $platformCommission = max(
                $backendPricing['total_price'] * $commissionRate,
                $minCommission
            );
            $agencyPayout = $backendPricing['total_price'] - $platformCommission;

            $reservation = Reservation::create([
                'user_id' => auth()->id(),
                'vehicle_id' => $vehicle->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'pickup_location' => $validated['pickup_location'],
                'dropoff_location' => $validated['dropoff_location'] ?? $validated['pickup_location'],
                'base_price' => $backendPricing['base_price'],
                'discount_amount' => $this->calculateTotalDiscounts($backendPricing['adjustments']),
                'additional_charges' => $this->calculateTotalCharges($backendPricing['adjustments']),
                'total_price' => $backendPricing['total_price'],
                'platform_commission_rate' => $commissionRate,
                'platform_commission' => $platformCommission,
                'agency_payout' => $agencyPayout,
                'paid_amount' => 0,
                'remaining_amount' => $backendPricing['total_price'],
                'payment_status' => 'pending',
                'status' => 'pending',
                'pricing_details' => $backendPricing, // Store complete pricing breakdown
                'notes' => $validated['notes'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Réservation confirmée! Vous recevrez un email de confirmation ou un appel de l\'agence bientôt.',
                'data' => $reservation->load('vehicle'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la réservation.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Check if vehicle is available for the given date range
     */
    private function checkVehicleAvailability($vehicleId, $startDate, $endDate, $excludeReservationId = null)
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

        // Exclude current reservation when updating
        if ($excludeReservationId) {
            $query->where('id', '!=', $excludeReservationId);
        }

        $conflictingReservations = $query->exists();

        return !$conflictingReservations;
    }

    /**
     * Calculate total discounts from adjustments
     */
    private function calculateTotalDiscounts($adjustments)
    {
        return collect($adjustments)
            ->filter(fn($adj) => $adj['amount'] < 0)
            ->sum('amount') * -1; // Convert to positive
    }

    /**
     * Calculate total additional charges from adjustments
     */
    private function calculateTotalCharges($adjustments)
    {
        return collect($adjustments)
            ->filter(fn($adj) => $adj['amount'] > 0)
            ->sum('amount');
    }

    /**
     * Get reservation details
     */
    public function show($id)
    {
        $reservation = Reservation::with(['vehicle', 'user', 'payments', 'vehicleReturn'])
            ->findOrFail($id);

        // Authorization check
        $user = auth()->user();
        if ($user->role === 'client' && $reservation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
            ], 403);
        }

        if ($user->role === 'agency_admin' && $reservation->vehicle->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $reservation,
        ]);
    }

    /**
     * Cancel a reservation
     */
    /**
     * Update reservation (only if pending)
     */
    public function update($id, Request $request)
    {
        $reservation = Reservation::findOrFail($id);

        // Authorization check
        $user = auth()->user();
        if ($user->role === 'client' && $reservation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
            ], 403);
        }

        // Only pending reservations can be edited
        if ($reservation->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Seules les réservations en attente peuvent être modifiées. Contactez l\'agence pour toute modification.',
            ], 422);
        }

        $validated = $request->validate([
            'start_date' => 'sometimes|date|after_or_equal:today',
            'end_date' => 'sometimes|date|after:start_date',
            'pickup_location' => 'sometimes|string|max:255',
            'dropoff_location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'options' => 'sometimes|array',
            'pricing_breakdown' => 'sometimes|array',
        ]);

        try {
            DB::beginTransaction();

            // If dates changed, check availability
            if (isset($validated['start_date']) || isset($validated['end_date'])) {
                $startDate = $validated['start_date'] ?? $reservation->start_date;
                $endDate = $validated['end_date'] ?? $reservation->end_date;

                $isAvailable = $this->checkVehicleAvailability(
                    $reservation->vehicle_id,
                    $startDate,
                    $endDate,
                    $reservation->id // Exclude current reservation
                );

                if (!$isAvailable) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Véhicule indisponible pour les nouvelles dates sélectionnées.',
                    ], 422);
                }

                // Recalculate pricing if dates changed
                if (isset($validated['pricing_breakdown'])) {
                    $vehicle = $reservation->vehicle;
                    $reliabilityScore = $user->clientScore ? $user->clientScore->total_score : null;
                    $options = $validated['options'] ?? [];

                    $backendPricing = $this->pricingService->calculatePrice(
                        $vehicle,
                        Carbon::parse($startDate),
                        Carbon::parse($endDate),
                        $reliabilityScore,
                        $options
                    );

                    // Update pricing fields
                    $commissionRate = config('pfe.commission.platform_rate', 0.08);
                    $minCommission = config('pfe.commission.min_commission', 5);
                    $platformCommission = max($backendPricing['total_price'] * $commissionRate, $minCommission);
                    $agencyPayout = $backendPricing['total_price'] - $platformCommission;

                    $validated['base_price'] = $backendPricing['base_price'];
                    $validated['discount_amount'] = $this->calculateTotalDiscounts($backendPricing['adjustments']);
                    $validated['additional_charges'] = $this->calculateTotalCharges($backendPricing['adjustments']);
                    $validated['total_price'] = $backendPricing['total_price'];
                    $validated['platform_commission'] = $platformCommission;
                    $validated['agency_payout'] = $agencyPayout;
                    $validated['remaining_amount'] = $backendPricing['total_price'];
                }
            }

            $reservation->update($validated);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Réservation modifiée avec succès.',
                'data' => $reservation->load('vehicle'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Cancel reservation
     * - Client: Only if status is 'pending'
     * - Agency: Anytime except 'completed' or 'cancelled'
     */
    public function cancel($id, Request $request)
    {
        $reservation = Reservation::findOrFail($id);

        // Authorization check
        $user = auth()->user();
        if ($user->role === 'client' && $reservation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
            ], 403);
        }

        // Agency authorization: must own the vehicle
        if ($user->role === 'agency_admin') {
            $vehicleAgencyId = $reservation->vehicle->agency_id;
            if ($vehicleAgencyId !== $user->agency_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé.',
                ], 403);
            }
        }

        // Check if reservation can be cancelled
        if (in_array($reservation->status, ['completed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cette réservation ne peut pas être annulée.',
            ], 422);
        }

        // Clients can only cancel pending reservations
        if ($user->role === 'client' && $reservation->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Réservation déjà confirmée. Veuillez contacter l\'agence pour l\'annuler.',
            ], 422);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'nullable|string|max:1000',
        ]);

        $reservation->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['cancellation_reason'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Réservation annulée avec succès.',
            'data' => $reservation,
        ]);
    }

    /**
     * Update reservation status (Agency only)
     * Allows changing status: pending -> confirmed -> ongoing -> completed
     */
    public function updateStatus($id, Request $request)
    {
        $reservation = Reservation::with(['vehicle', 'user'])->findOrFail($id);

        // Authorization: must be agency admin owning the vehicle
        $user = auth()->user();
        if ($user->role !== 'agency_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
            ], 403);
        }

        $vehicleAgencyId = $reservation->vehicle->agency_id;
        if ($vehicleAgencyId !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,ongoing,completed,cancelled',
        ]);

        // Don't allow changing cancelled or completed reservations
        if (in_array($reservation->status, ['cancelled', 'completed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de modifier le statut d\'une réservation annulée ou terminée.',
            ], 422);
        }

        $reservation->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Statut de la réservation mis à jour avec succès.',
            'data' => $reservation->load(['vehicle', 'user', 'payments']),
        ]);
    }

    /**
     * Mark reservation as picked up (ongoing status)
     */
    public function pickupVehicle($id, Request $request)
    {
        $reservation = Reservation::with(['vehicle', 'user'])->findOrFail($id);

        // Authorization check
        $user = auth()->user();
        if ($user->role !== 'agency_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
            ], 403);
        }

        $vehicleAgencyId = $reservation->vehicle->agency_id;
        if ($vehicleAgencyId !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
            ], 403);
        }

        // Can only pickup confirmed reservations
        if ($reservation->status !== 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'La réservation doit être confirmée avant le retrait du véhicule.',
            ], 422);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $reservation->update([
            'status' => 'ongoing',
            'notes' => $validated['notes'] ?? $reservation->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Véhicule retiré avec succès. Location en cours.',
            'data' => $reservation->load(['vehicle', 'user', 'payments']),
        ]);
    }

    /**
     * Mark reservation as returned (completed status)
     */
    public function returnVehicle($id, Request $request)
    {
        $reservation = Reservation::with(['vehicle', 'user'])->findOrFail($id);

        // Authorization check
        $user = auth()->user();
        if ($user->role !== 'agency_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
            ], 403);
        }

        $vehicleAgencyId = $reservation->vehicle->agency_id;
        if ($vehicleAgencyId !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
            ], 403);
        }

        // Can only return ongoing reservations
        if ($reservation->status !== 'ongoing') {
            return response()->json([
                'success' => false,
                'message' => 'La réservation doit être en cours avant le retour du véhicule.',
            ], 422);
        }

        $validated = $request->validate([
            'actual_return_date' => 'nullable|date',
            'additional_charges' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $actualReturnDate = isset($validated['actual_return_date'])
            ? Carbon::parse($validated['actual_return_date'])
            : Carbon::now();

        $isLate = $actualReturnDate->greaterThan($reservation->end_date);

        $additionalCharges = $validated['additional_charges'] ?? 0;
        $newTotalPrice = $reservation->total_price + $additionalCharges;
        $newRemainingAmount = $newTotalPrice - $reservation->paid_amount;

        $reservation->update([
            'status' => 'completed',
            'actual_return_date' => $actualReturnDate,
            'is_late_return' => $isLate,
            'additional_charges' => $reservation->additional_charges + $additionalCharges,
            'total_price' => $newTotalPrice,
            'remaining_amount' => $newRemainingAmount,
            'notes' => $validated['notes'] ?? $reservation->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Véhicule retourné avec succès. Location terminée.',
            'data' => $reservation->load(['vehicle', 'user', 'payments']),
        ]);
    }
}
