<?php

namespace App\Services;

use App\Models\Vehicle;

class VehicleService
{
    private const MIN_DEFAULT_CAUTION = 500.0;

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
     * Get publicly visible vehicles (available only) with pagination.
     */
    public function getPublicVehicles(int $perPage = 12)
    {
        return Vehicle::where('status', 'available')
            ->whereHas('agency', function ($query) {
                $query->where('status', 'active');
            })
            ->with(['agency'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get public vehicle details by id.
     */
    public function getPublicVehicleById(int $id): Vehicle
    {
        return Vehicle::where('status', 'available')
            ->whereHas('agency', function ($query) {
                $query->where('status', 'active');
            })
            ->with(['agency'])
            ->findOrFail($id);
    }

    /**
     * Get public vehicles for an agency.
     */
    public function getPublicVehiclesByAgency(int $agencyId)
    {
        return Vehicle::where('agency_id', $agencyId)
            ->where('status', 'available')
            ->whereHas('agency', function ($query) {
                $query->where('status', 'active');
            })
            ->with(['agency'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Create new vehicle
     */
    public function create(array $data, int $agencyId): Vehicle
    {
        $data['agency_id'] = $agencyId;
        $data['status'] = $data['status'] ?? 'available';
        $data['caution_amount'] = $this->resolveCautionAmount(
            $data['caution_amount'] ?? null,
            $data['daily_price'] ?? null
        );

        return Vehicle::create($data)->load('agency');
    }

    /**
     * Update vehicle details
     */
    public function update(int $id, array $data): Vehicle
    {
        $vehicle = Vehicle::findOrFail($id);

        $dailyPrice = $data['daily_price'] ?? $vehicle->daily_price;
        if (array_key_exists('caution_amount', $data)) {
            $data['caution_amount'] = $this->resolveCautionAmount($data['caution_amount'], $dailyPrice);
        } elseif ((float) ($vehicle->caution_amount ?? 0) <= 0) {
            $data['caution_amount'] = $this->resolveCautionAmount(null, $dailyPrice);
        }

        $vehicle->update($data);

        return $vehicle->load(['agency']);
    }

    private function resolveCautionAmount($cautionAmount, $dailyPrice): ?float
    {
        if (is_numeric($cautionAmount) && (float) $cautionAmount > 0) {
            return round((float) $cautionAmount, 2);
        }

        if (is_numeric($dailyPrice) && (float) $dailyPrice > 0) {
            return round(max((float) $dailyPrice * 10, self::MIN_DEFAULT_CAUTION), 2);
        }

        return null;
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
