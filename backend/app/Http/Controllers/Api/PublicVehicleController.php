<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VehicleResource;
use App\Services\VehicleService;
use Illuminate\Http\Request;

class PublicVehicleController extends Controller
{
    private VehicleService $vehicleService;

    public function __construct(VehicleService $vehicleService)
    {
        $this->vehicleService = $vehicleService;
    }

    /**
     * Get all available vehicles (public endpoint)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $perPage = $this->resolvePerPage($request, 12, 100);
            $vehicles = $this->vehicleService->getPublicVehicles($perPage)
                ->appends($request->query());

            return response()->json([
                'success' => true,
                'data' => VehicleResource::collection($vehicles->items()),
                'pagination' => $this->paginationMeta($vehicles),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de recuperer les vehicules publics.', 500, [
                'action' => 'public_vehicles.index',
            ]);
        }
    }

    /**
     * Get vehicle details (public endpoint)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $vehicle = $this->vehicleService->getPublicVehicleById((int) $id);

            return response()->json([
                'success' => true,
                'data' => new VehicleResource($vehicle),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Vehicle not found',
            ], 404);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de recuperer les details du vehicule.', 500, [
                'action' => 'public_vehicles.show',
                'vehicle_id' => (int) $id,
            ]);
        }
    }

    /**
     * Search vehicles by agency
     *
     * @param int $agencyId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byAgency(Request $request, $agencyId)
    {
        try {
            $perPage = $this->resolvePerPage($request, 12, 100);
            $vehicles = $this->vehicleService->getPublicVehiclesByAgency((int) $agencyId, $perPage)
                ->appends($request->query());

            return response()->json([
                'success' => true,
                'data' => VehicleResource::collection($vehicles->items()),
                'pagination' => $this->paginationMeta($vehicles),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de recuperer les vehicules de l\'agence.', 500, [
                'action' => 'public_vehicles.by_agency',
                'agency_id' => (int) $agencyId,
            ]);
        }
    }
}
