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
        $perPage = $this->resolvePerPage($request, 12, 100);
        $vehicles = $this->vehicleService->getPublicVehicles($perPage)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, VehicleResource::collection($vehicles->items()), 200, [
            'pagination' => $this->paginationMeta($vehicles),
        ]);
    }

    /**
     * Get vehicle details (public endpoint)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $vehicle = $this->vehicleService->getPublicVehicleById((int) $id);

        return $this->apiSuccessResponse(null, new VehicleResource($vehicle));
    }

    /**
     * Search vehicles by agency
     *
     * @param int $agencyId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byAgency(Request $request, $agencyId)
    {
        $perPage = $this->resolvePerPage($request, 12, 100);
        $vehicles = $this->vehicleService->getPublicVehiclesByAgency((int) $agencyId, $perPage)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, VehicleResource::collection($vehicles->items()), 200, [
            'pagination' => $this->paginationMeta($vehicles),
        ]);
    }
}
