<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Http\Requests\CancelReservationRequest;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    private ReservationService $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
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
     * Create a new reservation
     */
    public function store(StoreReservationRequest $request)
    {
        try {
            DB::beginTransaction();

            $reservation = $this->reservationService->book(
                $request->validated(),
                auth()->user()
            );

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
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 422);
        }
    }

    /**
     * Get reservation details
     */
    public function show($id)
    {
        $reservation = Reservation::with(['vehicle', 'user', 'payments', 'vehicleReturn'])
            ->findOrFail($id);

        $this->authorize('view', $reservation);

        return response()->json([
            'success' => true,
            'data' => $reservation,
        ]);
    }

    /**
     * Update reservation (only if pending)
     */
    public function update($id, UpdateReservationRequest $request)
    {
        $reservation = Reservation::findOrFail($id);
        $this->authorize('update', $reservation);

        try {
            DB::beginTransaction();

            $updated = $this->reservationService->update(
                $reservation,
                $request->validated()
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Réservation modifiée avec succès.',
                'data' => $updated->load('vehicle'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 422);
        }
    }

    /**
     * Cancel a reservation
     */
    public function cancel($id, CancelReservationRequest $request)
    {
        $reservation = Reservation::findOrFail($id);
        $this->authorize('cancel', $reservation);

        try {
            DB::beginTransaction();

            $cancelled = $this->reservationService->cancel(
                $reservation,
                auth()->user(),
                $request->validated()
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Réservation annulée avec succès.',
                'data' => $cancelled,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 422);
        }
    }

    /**
     * Update reservation status (agency admin only)
     */
    public function updateStatus($id, Request $request)
    {
        $reservation = Reservation::with(['vehicle', 'user'])->findOrFail($id);

        $this->authorize('updateStatus', $reservation);

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

        $reservation = $this->reservationService->updateStatus(
            $reservation,
            $validated['status']
        );

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

        $this->authorize('pickup', $reservation);

        try {
            DB::beginTransaction();

            $updated = $this->reservationService->pickupVehicle($reservation);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Véhicule marqué comme retiré. La réservation est maintenant en cours.',
                'data' => $updated->load(['vehicle', 'user', 'payments']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 422);
        }
    }

    /**
     * Mark reservation as returned and complete
     */
    public function returnVehicle($id, Request $request)
    {
        $reservation = Reservation::with(['vehicle', 'user'])->findOrFail($id);

        $this->authorize('return', $reservation);

        $validated = $request->validate([
            'mileage_on_return' => 'nullable|integer',
            'condition' => 'nullable|in:good,fair,damaged',
        ]);

        try {
            DB::beginTransaction();

            $updated = $this->reservationService->returnVehicle($reservation, $validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Véhicule retourné et réservation complétée.',
                'data' => $updated->load(['vehicle', 'user', 'payments', 'vehicleReturn']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 422);
        }
    }
}
