<?php

namespace App\Services;

use App\Models\User;
use App\Models\Agency;
use App\Models\Reservation;


class AdminService
{
    /**
     * Get super admin dashboard data
     */
    public function getDashboardStats(): array
    {
        $totalUsers = User::count();
        $totalAgencies = Agency::count();
        $totalReservations = Reservation::count();
        $completedReservations = Reservation::where('status', 'completed')->count();
        $totalRevenue = Reservation::where('status', 'completed')->sum('total_price');
        $totalPlatformCommission = Reservation::where('status', 'completed')->sum('platform_commission');

        $clientCount = User::where('role', 'client')->count();
        $agencyAdminCount = User::where('role', 'agency_admin')->count();

        return [
            'total_users' => $totalUsers,
            'client_count' => $clientCount,
            'agency_admin_count' => $agencyAdminCount,
            'total_agencies' => $totalAgencies,
            'total_reservations' => $totalReservations,
            'completed_reservations' => $completedReservations,
            'pending_reservations' => Reservation::where('status', 'pending')->count(),
            'total_revenue' => round($totalRevenue, 2),
            'total_platform_commission' => round($totalPlatformCommission, 2),
            'avg_order_value' => round($totalRevenue / max($completedReservations, 1), 2),
        ];
    }

    /**
     * Get all users with optional filtering
     */
    public function getUsers(array $filters = [])
    {
        $query = User::with('agency', 'reliabilityScore');

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get user activity details
     */
    public function getUserDetails(int $userId): array
    {
        $user = User::with('agency', 'reliabilityScore')->find($userId);

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        $reservationCount = $user->reservations()->count();
        $completedReservations = $user->reservations()
            ->where('status', 'completed')
            ->count();

        $totalSpent = $user->reservations()
            ->where('status', 'completed')
            ->sum('total_price');

        return [
            'user' => $user,
            'total_reservations' => $reservationCount,
            'completed_reservations' => $completedReservations,
            'total_spent' => round($totalSpent, 2),
            'join_date' => $user->created_at->format('Y-m-d'),
            'last_reservation' => $user->reservations()
                ->orderBy('created_at', 'desc')
                ->first()?->created_at,
        ];
    }

    /**
     * Suspend user account (prevent logins, bookings)
     */
    public function suspendUser(int $userId, ?string $reason = null): User
    {
        $user = User::find($userId);

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        $user->update([
            'is_suspended' => true,
            'suspension_reason' => $reason,
            'suspended_at' => now(),
        ]);

        // Revoke all tokens
        $user->tokens()->delete();

        return $user;
    }

    /**
     * Unsuspend user account
     */
    public function unsuspendUser(int $userId): User
    {
        $user = User::find($userId);

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        $user->update([
            'is_suspended' => false,
            'suspension_reason' => null,
            'suspended_at' => null,
        ]);

        return $user;
    }

    /**
     * Delete user and associated data
     */
    public function deleteUser(int $userId, ?int $currentUserId = null): void
    {
        $user = User::find($userId);

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        if ($currentUserId !== null && $user->id === $currentUserId) {
            throw new \Exception('You cannot delete your own account', 400);
        }

        $hasActiveReservations = $user->reservations()
            ->whereIn('status', ['pending', 'confirmed', 'ongoing'])
            ->exists();

        if ($hasActiveReservations) {
            throw new \Exception('Cannot delete user with active reservations', 400);
        }

        // Revoke tokens
        $user->tokens()->delete();

        // Delete user
        $user->delete();
    }

    /**
     * Get agency details for admin
     */
    public function getAgencyDetails(int $agencyId): array
    {
        $agency = Agency::find($agencyId);

        if (!$agency) {
            throw new \Exception('Agency not found', 404);
        }

        $vehicleCount = $agency->vehicles()->count();
        $totalReservations = $agency->vehicles()
            ->with('reservations')
            ->get()
            ->flatMap->reservations
            ->count();

        $completedReservations = $agency->vehicles()
            ->with('reservations')
            ->get()
            ->flatMap->reservations
            ->where('status', 'completed')
            ->count();

        $totalRevenue = $agency->vehicles()
            ->with('reservations')
            ->get()
            ->flatMap->reservations
            ->where('status', 'completed')
            ->sum('total_price');

        return [
            'agency' => $agency,
            'vehicle_count' => $vehicleCount,
            'total_reservations' => $totalReservations,
            'completed_reservations' => $completedReservations,
            'total_revenue' => round($totalRevenue, 2),
            'admin_count' => $agency->admins()->count(),
            'avg_rating' => 0,
        ];
    }

    /**
     * Get list of agencies with basic stats for admin listing
     */
    public function getAgencies()
    {
        $agencies = Agency::withCount('vehicles')->get();

        $result = $agencies->map(function (Agency $agency) {
            // Compute revenue for this agency (sum of completed reservations for agency vehicles)
            $vehicleIds = $agency->vehicles()->pluck('id')->toArray();
            $revenue = 0;
            if (!empty($vehicleIds)) {
                $revenue = Reservation::whereIn('vehicle_id', $vehicleIds)
                    ->where('status', 'completed')
                    ->sum('total_price');
            }

            return [
                'id' => $agency->id,
                'name' => $agency->name,
                'status' => $agency->status,
                'address' => $agency->address,
                'city' => $agency->city,
                'phone' => $agency->phone,
                'email' => $agency->email,
                'location' => $agency->city ?? $agency->address,
                'vehicles' => $agency->vehicles_count ?? 0,
                'revenue' => round($revenue, 2),
            ];
        });

        return $result;
    }

    /**
     * Update agency attributes (status, name, location)
     */
    public function updateAgency(int $agencyId, array $data)
    {
        $agency = Agency::find($agencyId);

        if (!$agency) {
            throw new \Exception('Agency not found', 404);
        }

        if (isset($data['location']) && !isset($data['city'])) {
            $data['city'] = $data['location'];
        }

        $allowed = array_intersect_key($data, array_flip([
            'status',
            'name',
            'address',
            'city',
            'phone',
            'email',
            'opening_time',
            'closing_time',
        ]));

        if (!empty($allowed)) {
            $agency->update($allowed);
        }

        return $agency;
    }

    /**
     * Create a new agency
     */
    // Agency/user creation moved to AuthService (users) and AgencyService (agencies)

    /**
     * Update user attributes or toggle suspension
     */
    public function updateUser(int $userId, array $data)
    {
        $user = User::find($userId);

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        // Handle suspension toggle
        if (array_key_exists('is_suspended', $data)) {
            $suspend = (bool) $data['is_suspended'];
            if ($suspend) {
                $this->suspendUser($userId, $data['suspension_reason'] ?? null);
                // reload
                $user = User::find($userId);
                return $user;
            } else {
                $this->unsuspendUser($userId);
                $user = User::find($userId);
                return $user;
            }
        }

        // Update allowed profile fields
        $allowed = array_intersect_key($data, array_flip(['name','email','phone','role']));
        if (!empty($allowed)) {
            $user->update($allowed);
        }

        return $user;
    }

    /**
     * Get financial statistics for admin dashboard
     */
    public function getFinancialStats(): array
    {
        // Monthly revenue (YYYY-MM)
        $monthly = Reservation::where('status', 'completed')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_price) as revenue")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($r) => ['month' => $r->month, 'revenue' => round($r->revenue, 2)])
            ->toArray();

        // Revenue by agency
        $byAgency = Agency::all()->map(function ($agency) {
            $vehicleIds = $agency->vehicles()->pluck('id')->toArray();
            $revenue = 0;
            if (!empty($vehicleIds)) {
                $revenue = Reservation::whereIn('vehicle_id', $vehicleIds)
                    ->where('status', 'completed')
                    ->sum('total_price');
            }
            return ['agency_id' => $agency->id, 'agency_name' => $agency->name, 'revenue' => round($revenue, 2)];
        })->toArray();

        $totals = [];
        $totals['revenue'] = Reservation::where('status', 'completed')->sum('total_price');
        $totals['commission'] = Reservation::where('status', 'completed')->sum('platform_commission');
        $totals['profit'] = $totals['revenue'] - $totals['commission'];
        $totals['avgMonthly'] = !empty($monthly) ? round(array_sum(array_column($monthly, 'revenue')) / count($monthly), 2) : 0;

        return [
            'monthly' => $monthly,
            'byAgency' => $byAgency,
            'totals' => $totals,
        ];
    }
}
