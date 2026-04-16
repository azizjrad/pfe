<?php

namespace App\Http\Controllers\Api;

use App\Domain\Enums\VehicleStatus;
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
        $status = $user->isClient() ? VehicleStatus::AVAILABLE->value : null;
        $vehicles = $this->vehicleService->getAll($agencyId, $perPage, $status)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, VehicleResource::collection($vehicles->items()), 200, [
            'pagination' => $this->paginationMeta($vehicles),
        ]);
    }

    /**
     * Get vehicle details
     */
    public function show($id)
    {
        $vehicle = $this->vehicleService->getById($id);
        $this->authorize('view', $vehicle);

        return $this->apiSuccessResponse(null, new VehicleResource($vehicle));
    }

    /**
     * Create a new vehicle (agency admins only)
     */
    public function store(StoreVehicleRequest $request)
    {
        $user = $request->user();
        $this->authorize('create', Vehicle::class);

        $validated = $request->validated();

        $vehicle = $this->vehicleService->create($validated, $user->agency_id);

        return $this->apiSuccessResponse('Vehicle created successfully', new VehicleResource($vehicle), 201);
    }

    /**
     * Update vehicle (agency admins can only update their own vehicles)
     */
    public function update(UpdateVehicleRequest $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $this->authorize('update', $vehicle);

        $validated = $request->validated();

        $vehicle = $this->vehicleService->update($id, $validated);

        return $this->apiSuccessResponse('Vehicle updated successfully', new VehicleResource($vehicle));
    }

    /**
     * Delete vehicle (agency admins can only delete their own vehicles)
     */
    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $this->authorize('delete', $vehicle);

        $this->vehicleService->delete($id);

        return $this->apiSuccessResponse('Vehicle deleted successfully');
    }
}
