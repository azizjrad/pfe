<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use App\Services\VehicleService;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    private VehicleService $vehicleService;

    public function __construct(VehicleService $vehicleService)
    {
        $this->vehicleService = $vehicleService;
    }

    /**
     * Get all vehicles (role-based filtering)
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Vehicle::class);

        $user = $request->user();
        $perPage = $this->resolvePerPage($request, 25, 100);

        // Determine which vehicles to fetch based on role
        $agencyId = $user->isAgencyAdmin() ? $user->agency_id : null;
        $status = $user->isClient() ? 'available' : null;
        $vehicles = $this->vehicleService->getAll($agencyId, $perPage, $status)
            ->appends($request->query());

        return response()->json([
            'success' => true,
            'data' => VehicleResource::collection($vehicles->items()),
            'pagination' => $this->paginationMeta($vehicles),
        ]);
    }

    /**
     * Get vehicle details
     */
    public function show($id)
    {
        try {
            $vehicle = $this->vehicleService->getById($id);
            $this->authorize('view', $vehicle);

            return response()->json([
                'success' => true,
                'data' => new VehicleResource($vehicle),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Vehicule introuvable.', 404, [
                'action' => 'vehicles.show',
                'vehicle_id' => $id,
            ]);
        }
    }

    /**
     * Create a new vehicle (agency admins only)
     */
    public function store(StoreVehicleRequest $request)
    {
        $user = $request->user();
        $this->authorize('create', Vehicle::class);

        $validated = $request->validated();

        try {
            $vehicle = $this->vehicleService->create($validated, $user->agency_id);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle created successfully',
                'data' => new VehicleResource($vehicle),
            ], 201);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de creer le vehicule.', 422, [
                'action' => 'vehicles.store',
                'agency_id' => $user->agency_id,
            ]);
        }
    }

    /**
     * Update vehicle (agency admins can only update their own vehicles)
     */
    public function update(UpdateVehicleRequest $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $this->authorize('update', $vehicle);

        $validated = $request->validated();

        try {
            $vehicle = $this->vehicleService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle updated successfully',
                'data' => new VehicleResource($vehicle),
            ]);
        } catch (\Exception $e) {
            $status = in_array((int) $e->getCode(), [403, 404], true) ? (int) $e->getCode() : 422;

            return $this->apiErrorResponse($e, 'Impossible de mettre a jour le vehicule.', $status, [
                'action' => 'vehicles.update',
                'vehicle_id' => $id,
            ]);
        }
    }

    /**
     * Delete vehicle (agency admins can only delete their own vehicles)
     */
    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $this->authorize('delete', $vehicle);

        try {
            $this->vehicleService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle deleted successfully',
            ]);
        } catch (\Exception $e) {
            $status = in_array((int) $e->getCode(), [403, 404, 400], true) ? (int) $e->getCode() : 422;

            return $this->apiErrorResponse($e, 'Impossible de supprimer le vehicule.', $status, [
                'action' => 'vehicles.destroy',
                'vehicle_id' => $id,
            ]);
        }
    }
}
