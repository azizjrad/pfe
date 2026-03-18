<?php

namespace App\Services;

use App\Models\Vehicle;

class VehicleService
{
    /**
     * Get all vehicles (authorization handled in controller/policy)
     */
    public function getAll(?int $agencyId = null)
    {
        $query = Vehicle::with(['agency']);

        if ($agencyId) {
            $query->where('agency_id', $agencyId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get single vehicle details
     */
    public function getById(int $id): Vehicle
    {
        return Vehicle::with('agency')->findOrFail($id);
    }

    /**
     * Create new vehicle
     */
    public function create(array $data, int $agencyId): Vehicle
    {
        $data['agency_id'] = $agencyId;
        $data['status'] = $data['status'] ?? 'available';

        return Vehicle::create($data)->load('agency');
    }

    /**
     * Update vehicle details
     */
    public function update(int $id, array $data): Vehicle
    {
        $vehicle = Vehicle::findOrFail($id);

        $vehicle->update($data);

        return $vehicle->load(['agency']);
    }

    /**
     * Delete vehicle with active reservation check
     */
    public function delete(int $id): void
    {
        $vehicle = Vehicle::findOrFail($id);

        // Check for active reservations
        $activeCount = $vehicle->reservations()
            ->whereIn('status', ['pending', 'confirmed', 'ongoing'])
            ->count();

        if ($activeCount > 0) {
            throw new \Exception('Cannot delete vehicle with active reservations', 400);
        }

        $vehicle->delete();
    }

    /**
     * Get available vehicles for given dates
     */
    public function getAvailableVehicles(\DateTimeInterface $startDate, \DateTimeInterface $endDate, array $filters = [])
    {
        $query = Vehicle::where('status', 'available')
            ->doesntHave('reservations', 'and', function ($q) use ($startDate, $endDate) {
                $q->where('status', '!=', 'cancelled')
                  ->where(function ($query) use ($startDate, $endDate) {
                      $query->whereBetween('start_date', [$startDate, $endDate])
                            ->orWhereBetween('end_date', [$startDate, $endDate])
                            ->orWhere(function ($q) use ($startDate, $endDate) {
                                $q->where('start_date', '<=', $startDate)
                                  ->where('end_date', '>=', $endDate);
                            });
                  });
            });

        if (isset($filters['agency_id'])) {
            $query->where('agency_id', $filters['agency_id']);
        }

        return $query->with('agency')->get();
    }
}
