<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        // Determine which vehicles to fetch based on role
        $agencyId = $user->isAgencyAdmin() ? $user->agency_id : null;
        $vehicles = $this->vehicleService->getAll($agencyId);

        // Filter for clients - only available vehicles
        if ($user->isClient()) {
            $vehicles = $vehicles->filter(fn($v) => $v->status === 'available')->values();
        }

        return response()->json([
            'success' => true,
            'data' => $vehicles,
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
                'data' => $vehicle,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Create a new vehicle (agency admins only)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $this->authorize('create', Vehicle::class);

        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'mileage' => 'required|integer|min:0',
            'daily_price' => 'required|numeric|min:0',
            'license_plate' => 'required|string|max:50|unique:vehicles',
            'color' => 'required|string|max:50',
            'seats' => 'required|integer|min:2|max:9',
            'transmission' => 'required|in:manual,automatic',
            'fuel_type' => 'required|in:petrol,diesel,electric,hybrid',
            'status' => 'sometimes|in:available,rented,maintenance',
            'image' => 'nullable|string',
        ]);

        try {
            $vehicle = $this->vehicleService->create($validated, $user->agency_id);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle created successfully',
                'data' => $vehicle,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Update vehicle (agency admins can only update their own vehicles)
     */
    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $this->authorize('update', $vehicle);

        $validated = $request->validate([
            'brand' => 'sometimes|string|max:255',
            'model' => 'sometimes|string|max:255',
            'year' => 'sometimes|integer|min:2000|max:' . (date('Y') + 1),
            'mileage' => 'sometimes|integer|min:0',
            'daily_price' => 'sometimes|numeric|min:0',
            'license_plate' => 'sometimes|string|max:50|unique:vehicles,license_plate,' . $id,
            'color' => 'sometimes|string|max:50',
            'seats' => 'sometimes|integer|min:2|max:9',
            'transmission' => 'sometimes|in:manual,automatic',
            'fuel_type' => 'sometimes|in:petrol,diesel,electric,hybrid',
            'status' => 'sometimes|in:available,rented,maintenance',
            'image' => 'nullable|string',
        ]);

        try {
            $vehicle = $this->vehicleService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle updated successfully',
                'data' => $vehicle,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], in_array($e->getCode(), [403, 404]) ? $e->getCode() : 422);
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
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], in_array($e->getCode(), [403, 404, 400]) ? $e->getCode() : 422);
        }
    }
}
