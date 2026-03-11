<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VehicleController extends Controller
{
    /**
     * Get all vehicles for agency admin (their vehicles only)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Agency admins see only their vehicles
        if ($user->role === 'agency_admin') {
            $vehicles = Vehicle::with(['agency'])
                ->where('agency_id', $user->agency_id)
                ->orderBy('created_at', 'desc')
                ->get();
        }
        // Super admin sees all vehicles
        elseif ($user->role === 'super_admin') {
            $vehicles = Vehicle::with(['agency'])
                ->orderBy('created_at', 'desc')
                ->get();
        }
        // Clients/public see only available vehicles
        else {
            $vehicles = Vehicle::with(['agency'])
                ->where('status', 'available')
                ->orderBy('created_at', 'desc')
                ->get();
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
        $vehicle = Vehicle::with(['agency'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $vehicle,
        ]);
    }

    /**
     * Create a new vehicle (agency admins only)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Only agency admins can create vehicles for their agency
        if ($user->role !== 'agency_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

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
            'image' => 'nullable|string', // Base64 or URL
        ]);

        // Auto-assign agency_id from authenticated user
        $validated['agency_id'] = $user->agency_id;
        $validated['status'] = $validated['status'] ?? 'available';

        $vehicle = Vehicle::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle created successfully',
            'data' => $vehicle->load(['agency']),
        ], 201);
    }

    /**
     * Update vehicle (agency admins can only update their own vehicles)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $vehicle = Vehicle::findOrFail($id);

        // Authorization: agency admins can only update their own vehicles
        if ($user->role === 'agency_admin' && $vehicle->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You can only update your own vehicles',
            ], 403);
        }

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

        $vehicle->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle updated successfully',
            'data' => $vehicle->load(['agency']),
        ]);
    }

    /**
     * Delete vehicle (agency admins can only delete their own vehicles)
     * Cannot delete if vehicle has active/pending reservations
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $vehicle = Vehicle::findOrFail($id);

        // Authorization: agency admins can only delete their own vehicles
        if ($user->role === 'agency_admin' && $vehicle->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You can only delete your own vehicles',
            ], 403);
        }

        // Check for active or pending reservations
        $activeReservations = $vehicle->reservations()
            ->whereIn('status', ['pending', 'confirmed', 'ongoing'])
            ->count();

        if ($activeReservations > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete vehicle with active reservations',
            ], 400);
        }

        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle deleted successfully',
        ]);
    }
}
