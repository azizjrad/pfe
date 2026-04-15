<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Http\Requests\CancelReservationRequest;
use App\Http\Requests\ReturnVehicleRequest;
use App\Http\Requests\UpdateReservationStatusRequest;
use App\Http\Resources\ReservationResource;
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
     * Get all reservations for the super admin dashboard.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Reservation::class);

        $perPage = $this->resolvePerPage($request, 25, 100);

        $reservations = Reservation::with(['vehicle.agency', 'user', 'payments'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return response()->json([
            'success' => true,
            'data' => ReservationResource::collection($reservations->items()),
            'pagination' => $this->paginationMeta($reservations),
        ]);
    }

    /**
     * Get all reservations for a client
     */
    public function clientIndex(Request $request)
    {
        $perPage = $this->resolvePerPage($request, 20, 100);

        $reservations = Reservation::with(['vehicle.agency', 'payments'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return response()->json([
            'success' => true,
            'data' => ReservationResource::collection($reservations->items()),
            'pagination' => $this->paginationMeta($reservations),
        ]);
    }

    /**
     * Get all reservations for an agency
     */
    public function agencyIndex(Request $request)
    {
        $user = auth()->user();
        $perPage = $this->resolvePerPage($request, 20, 100);

        // Get all vehicles belonging to this agency
        $reservations = Reservation::with(['vehicle.agency', 'user', 'payments'])
            ->whereHas('vehicle', function ($query) use ($user) {
                $query->where('agency_id', $user->agency_id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return response()->json([
            'success' => true,
            'data' => ReservationResource::collection($reservations->items()),
            'pagination' => $this->paginationMeta($reservations),
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
                'data' => new ReservationResource($reservation->load('vehicle')),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return $this->apiErrorResponse($e, 'Impossible de créer la réservation.', 422, [
                'action' => 'reservation.store',
            ]);
        }
    }

    /**
     * Get reservation details
     */
    public function show($id)
    {
        $reservation = Reservation::with(['vehicle.agency', 'user', 'payments', 'vehicleReturn'])
            ->findOrFail($id);

        $this->authorize('view', $reservation);

        return response()->json([
            'success' => true,
            'data' => new ReservationResource($reservation),
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
                'data' => new ReservationResource($updated->load('vehicle')),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return $this->apiErrorResponse($e, 'Impossible de modifier la réservation.', 422, [
                'action' => 'reservation.update',
                'reservation_id' => $reservation->id,
            ]);
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
                'data' => new ReservationResource($cancelled),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return $this->apiErrorResponse($e, 'Impossible d\'annuler la réservation.', 422, [
                'action' => 'reservation.cancel',
                'reservation_id' => $reservation->id,
            ]);
        }
    }

    /**
     * Update reservation status (agency admin only)
     */
    public function updateStatus($id, UpdateReservationStatusRequest $request)
    {
        $reservation = Reservation::with(['vehicle', 'user'])->findOrFail($id);

        $this->authorize('updateStatus', $reservation);

        $validated = $request->validated();

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
            'data' => new ReservationResource($reservation->load(['vehicle', 'user', 'payments'])),
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
                'data' => new ReservationResource($updated->load(['vehicle', 'user', 'payments'])),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return $this->apiErrorResponse($e, 'Impossible de démarrer la réservation.', 422, [
                'action' => 'reservation.pickup',
                'reservation_id' => $reservation->id,
            ]);
        }
    }

    /**
     * Mark reservation as returned and complete
     */
    public function returnVehicle($id, ReturnVehicleRequest $request)
    {
        $reservation = Reservation::with(['vehicle', 'user'])->findOrFail($id);

        $this->authorize('return', $reservation);

        $validated = $request->validated();

        try {
            DB::beginTransaction();

            $updated = $this->reservationService->returnVehicle($reservation, $validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Véhicule retourné et réservation complétée.',
                'data' => new ReservationResource($updated->load(['vehicle', 'user', 'payments', 'vehicleReturn'])),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return $this->apiErrorResponse($e, 'Impossible de finaliser le retour du véhicule.', 422, [
                'action' => 'reservation.return',
                'reservation_id' => $reservation->id,
            ]);
        }
    }
}
