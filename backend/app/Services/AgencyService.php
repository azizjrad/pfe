<?php

namespace App\Services;

use App\Models\Agency;
use Carbon\Carbon;

class AgencyService
{
    /**
     * Get all agencies with optional filtering
     */
    public function getAll(array $filters = [])
    {
        $query = Agency::with('vehicles', 'users');

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get single agency
     */
    public function getById(int $id): Agency
    {
        return Agency::with('vehicles', 'users', 'reservations')->findOrFail($id);
    }

    /**
     * Get public agency catalog list with pagination.
     */
    public function getPublicAgencies(int $perPage = 12)
    {
        return Agency::with(['reviews', 'vehicles'])
            ->withCount('reviews')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get public agency details by id.
     */
    public function getPublicAgencyById(int $id): Agency
    {
        return Agency::withCount('reviews')
            ->with([
                'reviews',
                'vehicles' => function ($query) {
                    $query->where('status', 'available');
                },
            ])
            ->findOrFail($id);
    }

    /**
     * Get public agency details by slug.
     */
    public function getPublicAgencyBySlug(string $slug): Agency
    {
        return Agency::where('slug', $slug)
            ->withCount('reviews')
            ->with([
                'reviews',
                'vehicles' => function ($query) {
                    $query->where('status', 'available');
                },
            ])
            ->firstOrFail();
    }

    /**
     * Get agency dashboard stats
     * Returns: vehicle count, active reservations, revenue, ratings
     */
    public function getStats(int $agencyId): array
    {
        $agency = Agency::findOrFail($agencyId);

        $vehicles = $agency->vehicles()->count();
        $activeReservations = $agency->vehicles()
            ->with('reservations')
            ->get()
            ->flatMap->reservations
            ->where('status', 'ongoing')
            ->count();

        $totalRevenue = $agency->vehicles()
            ->with('reservations')
            ->get()
            ->flatMap->reservations
            ->where('status', 'completed')
            ->sum('total_price');

        $avgRating = $agency->reviews()->avg('rating');

        return [
            'agency_id' => $agency->id,
            'name' => $agency->name,
            'vehicles_count' => $vehicles,
            'active_reservations' => $activeReservations,
            'total_revenue' => round($totalRevenue, 2),
            'avg_rating' => round($avgRating ?? 0, 2),
            'total_reviews' => $agency->reviews()->count(),
        ];
    }

    /**
     * Get 6-month financial breakdown
     */
    public function getFinancialStats(int $agencyId): array
    {
        $agency = Agency::findOrFail($agencyId);
        $breakdown = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthKey = $month->format('Y-m');

            $revenue = $agency->vehicles()
                ->with('reservations')
                ->get()
                ->flatMap->reservations
                ->where('status', 'completed')
                ->filter(function ($res) use ($month) {
                    return $res->created_at->format('Y-m') === $month->format('Y-m');
                })
                ->sum('total_price');

            $breakdown[$monthKey] = [
                'month' => $month->format('F Y'),
                'revenue' => round($revenue, 2),
            ];
        }

        return $breakdown;
    }

    /**
     * Update agency profile
     */
    public function update(Agency $agency, array $data): Agency
    {
        $agency->update($data);
        return $agency;
    }

    /**
     * Create a new agency
     */
    public function create(array $data): Agency
    {
        $allowed = array_intersect_key($data, array_flip(['name','address','city','phone','email','opening_time','closing_time','status','location']));
        return Agency::create($allowed);
    }

    /**
     * Suspend/unsuspend agency
     */
    public function updateStatus(Agency $agency, string $status): Agency
    {
        if (!in_array($status, ['active', 'suspended', 'inactive'])) {
            throw new \Exception("Invalid status: {$status}");
        }

        $agency->update(['status' => $status]);
        return $agency;
    }
}
