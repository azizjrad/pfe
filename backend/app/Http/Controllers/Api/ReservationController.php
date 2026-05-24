<?php

namespace App\Http\Controllers\Api;

use App\Domain\Enums\ReservationStatus;
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

        $reservations = Reservation::with(['vehicle.agency', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, ReservationResource::collection($reservations->items()), 200, [
            'pagination' => $this->paginationMeta($reservations),
        ]);
    }

    /**
     * Get all reservations for a client
     */
    public function clientIndex(Request $request)
    {
        $perPage = $this->resolvePerPage($request, 20, 100);

        $reservations = Reservation::with(['vehicle.agency'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, ReservationResource::collection($reservations->items()), 200, [
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
        $reservations = Reservation::with(['vehicle.agency', 'user'])
            ->whereHas('vehicle', function ($query) use ($user) {
                $query->where('agency_id', $user->agency_id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, ReservationResource::collection($reservations->items()), 200, [
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

            return $this->apiSuccessResponse('Réservation confirmée! Vous recevrez un email de confirmation ou un appel de l\'agence bientôt.', new ReservationResource($reservation->load('vehicle')), 201);

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
        $reservation = Reservation::with(['vehicle.agency', 'user', 'vehicleReturn'])
            ->findOrFail($id);

        $this->authorize('view', $reservation);

        return $this->apiSuccessResponse(null, new ReservationResource($reservation));
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

            return $this->apiSuccessResponse('Réservation modifiée avec succès.', new ReservationResource($updated->load('vehicle')));

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

            return $this->apiSuccessResponse('Réservation annulée avec succès.', new ReservationResource($cancelled));

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
        if (in_array($reservation->status, ReservationStatus::immutableValues(), true)) {
            return $this->apiErrorMessageResponse('Impossible de modifier le statut d\'une réservation annulée ou terminée.', 422);
        }

        $reservation = $this->reservationService->updateStatus(
            $reservation,
            $validated['status']
        );

        return $this->apiSuccessResponse('Statut de la réservation mis à jour avec succès.', new ReservationResource($reservation->load(['vehicle', 'user'])));
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

            return $this->apiSuccessResponse('Véhicule marqué comme retiré. La réservation est maintenant en cours.', new ReservationResource($updated->load(['vehicle', 'user'])));

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

            return $this->apiSuccessResponse('Véhicule retourné et réservation complétée.', new ReservationResource($updated->load(['vehicle', 'user', 'vehicleReturn'])));

        } catch (\Exception $e) {
            DB::rollBack();

            return $this->apiErrorResponse($e, 'Impossible de finaliser le retour du véhicule.', 422, [
                'action' => 'reservation.return',
                'reservation_id' => $reservation->id,
            ]);
        }
    }

    /**
     * Record inspection notes for a returned reservation (agency admin).
     */
    public function recordInspection($id, Request $request)
    {
        $reservation = Reservation::with(['vehicleReturn', 'user'])->findOrFail($id);

        $this->authorize('return', $reservation);

        // Only allow inspection recording for completed reservations
        if ($reservation->status !== ReservationStatus::COMPLETED->value) {
            return $this->apiErrorMessageResponse('L\'inspection ne peut être enregistrée que pour les réservations terminées.', 422);
        }

        $validated = $request->validate([
            'inspection_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        // Ensure a return record exists
        $vehicleReturn = $reservation->vehicleReturn;
        if (! $vehicleReturn) {
            $vehicleReturn = $reservation->vehicleReturn()->create([
                'reservation_id' => $reservation->id,
                'return_date' => now(),
                'return_mileage' => 0,
                'vehicle_condition' => 'good',
            ]);
        }

        $vehicleReturn->inspection_notes = $validated['inspection_notes'] ?? 'inspection_recorded';
        $vehicleReturn->save();

        // Recalculate client reliability score after inspection
        if ($reservation->user && $reservation->user->role === 'client') {
            app(\App\Services\ClientService::class)->recalculateReliabilityScore($reservation->user);
        }

        return $this->apiSuccessResponse('Inspection enregistrée avec succès.', new ReservationResource($reservation->fresh()->load(['vehicle', 'user', 'vehicleReturn'])));
    }
}
