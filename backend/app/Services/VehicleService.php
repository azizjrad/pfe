<?php

namespace App\Services;

use App\Domain\Enums\AgencyStatus;
use App\Domain\Enums\ReservationStatus;
use App\Domain\Enums\VehicleStatus;
use App\Models\Vehicle;
use App\Models\VehiclePrice;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VehicleService
{
    /**
     * Get all vehicles (authorization handled in controller/policy)
     */
    public function getAll(?int $agencyId = null, int $perPage = 25, ?string $status = null)
    {
        $query = Vehicle::with(['agency', 'priceHistory']);

        if ($agencyId) {
            $query->where('agency_id', $agencyId);
        }

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get single vehicle details
     */
    public function getById(int $id): Vehicle
    {
        return Vehicle::with(['agency', 'priceHistory'])->findOrFail($id);
    }

    /**
     * Get publicly visible vehicles (available only) with pagination.
     */
    public function getPublicVehicles(int $perPage = 12)
    {
        return Vehicle::where('status', VehicleStatus::AVAILABLE->value)
            ->whereHas('agency', function ($query) {
                $query->where('status', AgencyStatus::ACTIVE->value);
            })
            ->with(['agency', 'priceHistory'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get public vehicle details by id.
     */
    public function getPublicVehicleById(int $id): Vehicle
    {
        return Vehicle::where('status', VehicleStatus::AVAILABLE->value)
            ->whereHas('agency', function ($query) {
                $query->where('status', AgencyStatus::ACTIVE->value);
            })
            ->with(['agency', 'priceHistory'])
            ->findOrFail($id);
    }

    /**
     * Get public vehicles for an agency.
     */
    public function getPublicVehiclesByAgency(int $agencyId, int $perPage = 12)
    {
        return Vehicle::where('agency_id', $agencyId)
            ->where('status', VehicleStatus::AVAILABLE->value)
            ->whereHas('agency', function ($query) {
                $query->where('status', AgencyStatus::ACTIVE->value);
            })
            ->with(['agency', 'priceHistory'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Create new vehicle
     */
    public function create(array $data, int $agencyId): Vehicle
    {
        return DB::transaction(function () use ($data, $agencyId): Vehicle {
            $data['agency_id'] = $agencyId;
            $data['status'] = $data['status'] ?? VehicleStatus::AVAILABLE->value;
            $data['caution_amount'] = $this->normalizeCautionAmount($data['caution_amount'] ?? null);

            // Extract provided price (if any) and record it into price history
            $providedPrice = null;
            if (array_key_exists('daily_price', $data)) {
                $providedPrice = $this->normalizePrice($data['daily_price']);
                unset($data['daily_price']);
            } elseif (array_key_exists('daily_rate', $data)) {
                $providedPrice = $this->normalizePrice($data['daily_rate']);
                unset($data['daily_rate']);
            }

            $vehicle = Vehicle::create($data);

            // Backfill price history using provided price or default if none provided
            $priceToRecord = $providedPrice ?? config('pfe.default_daily_price');
            $this->recordPriceHistory($vehicle, (float) $priceToRecord, $vehicle->created_at?->toDateString() ?? now()->toDateString());

            return $vehicle->load(['agency', 'priceHistory']);
        });
    }

    /**
     * Update vehicle details
     */
    public function update(int $id, array $data): Vehicle
    {
        return DB::transaction(function () use ($id, $data): Vehicle {
            $vehicle = Vehicle::with('priceHistory')->findOrFail($id);
            $priceChanged = false;

            if (array_key_exists('caution_amount', $data)) {
                $data['caution_amount'] = $this->normalizeCautionAmount($data['caution_amount']);
            }

            $newPrice = null;
            if (array_key_exists('daily_price', $data) || array_key_exists('daily_rate', $data)) {
                $newPrice = $this->normalizePrice($data['daily_price'] ?? $data['daily_rate']);
                unset($data['daily_price'], $data['daily_rate']);
                $currentPriceRecord = $vehicle->currentPrice();
                $currentPrice = $currentPriceRecord?->price ?? null;
                $priceChanged = $newPrice !== $currentPrice;
            }

            $vehicle->update($data);

            if ($priceChanged && $newPrice !== null) {
                $today = now()->toDateString();
                $this->closeActivePriceHistory($vehicle, $today);
                $this->recordPriceHistory($vehicle, (float) $newPrice, $today);
            } elseif ($vehicle->priceHistory->isEmpty()) {
                $this->recordPriceHistory($vehicle, (float) (config('pfe.default_daily_price') ?? 0), $vehicle->created_at?->toDateString() ?? now()->toDateString());
            }

            return $vehicle->load(['agency', 'priceHistory']);
        });
    }

    private function normalizeCautionAmount($cautionAmount): ?float
    {
        if (is_numeric($cautionAmount) && (float) $cautionAmount > 0) {
            return round((float) $cautionAmount, 2);
        }

        return null;
    }

    private function normalizePrice($price): float
    {
        return round((float) ($price ?? 0), 2);
    }

    private function closeActivePriceHistory(Vehicle $vehicle, string $effectiveTo): void
    {
        VehiclePrice::query()
            ->where('vehicle_id', $vehicle->id)
            ->whereNull('effective_to')
            ->update(['effective_to' => Carbon::parse($effectiveTo)->subDay()->toDateString()]);
    }

    private function recordPriceHistory(Vehicle $vehicle, float $price, string $effectiveFrom): void
    {
        VehiclePrice::create([
            'vehicle_id' => $vehicle->id,
            'price' => $price,
            'effective_from' => Carbon::parse($effectiveFrom)->toDateString(),
            'effective_to' => null,
        ]);
    }

    /**
     * Archive vehicle from public listing by setting it unavailable.
     * We keep the row for history/stats integrity.
     */
    public function delete(int $id): void
    {
        $vehicle = Vehicle::findOrFail($id);

        $vehicle->update([
            'status' => VehicleStatus::UNAVAILABLE->value,
        ]);
    }

    /**
     * Get available vehicles for given dates
     */
    public function getAvailableVehicles(\DateTimeInterface $startDate, \DateTimeInterface $endDate, array $filters = [], int $perPage = 20)
    {
        $query = Vehicle::where('status', VehicleStatus::AVAILABLE->value)
            ->doesntHave('reservations', 'and', function ($q) use ($startDate, $endDate) {
                $q->where('status', '!=', ReservationStatus::CANCELLED->value)
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

        return $query->with('agency')->paginate($perPage);
    }
}
