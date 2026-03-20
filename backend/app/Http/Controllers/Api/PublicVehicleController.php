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
            $perPage = (int) $request->query('per_page', 12);
            $vehicles = $this->vehicleService->getPublicVehicles($perPage);

            return response()->json([
                'success' => true,
                'data' => VehicleResource::collection($vehicles),
                'pagination' => [
                    'current_page' => $vehicles->currentPage(),
                    'per_page' => $vehicles->perPage(),
                    'total' => $vehicles->total(),
                    'total_pages' => $vehicles->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vehicles',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vehicle details',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Search vehicles by agency
     *
     * @param int $agencyId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byAgency($agencyId)
    {
        try {
            $vehicles = $this->vehicleService->getPublicVehiclesByAgency((int) $agencyId);

            return response()->json([
                'success' => true,
                'data' => VehicleResource::collection($vehicles),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vehicles for agency',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
