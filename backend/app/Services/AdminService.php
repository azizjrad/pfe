<?php

namespace App\Services;

use App\Domain\Enums\AgencyStatus;
use App\Domain\Enums\ReservationStatus;
use App\Exceptions\Domain\BusinessRuleViolationException;
use App\Exceptions\Domain\ConflictException;
use App\Exceptions\Domain\NotFoundException;
use App\Models\User;
use App\Models\Agency;
use App\Models\Reservation;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;


class AdminService
{
    /**
     * Get super admin dashboard data
     */
    public function getDashboardStats(): array
    {
        $totalUsers = User::count();
        $totalAgencies = Agency::count();
        $totalVehicles = Vehicle::count();
        $totalReservations = Reservation::count();
        $completedReservations = Reservation::where('status', ReservationStatus::COMPLETED->value)->count();
        $totalRevenue = Reservation::where('status', ReservationStatus::COMPLETED->value)->sum('total_price');
        $totalPlatformCommission = Reservation::where('status', ReservationStatus::COMPLETED->value)->sum('platform_commission');
        $monthlyRevenue = Reservation::where('status', ReservationStatus::COMPLETED->value)
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total_price');
        $activeReservations = Reservation::whereIn('status', ReservationStatus::activeValues())->count();

        $clientCount = User::where('role', 'client')->count();
        $agencyAdminCount = User::where('role', 'agency_admin')->count();

        return [
            'total_users' => $totalUsers,
            'client_count' => $clientCount,
            'agency_admin_count' => $agencyAdminCount,
            'total_agencies' => $totalAgencies,
            'total_vehicles' => $totalVehicles,
            'total_reservations' => $totalReservations,
            'completed_reservations' => $completedReservations,
            'pending_reservations' => Reservation::where('status', ReservationStatus::PENDING->value)->count(),
            'total_revenue' => round($totalRevenue, 2),
            'monthly_revenue' => round((float) $monthlyRevenue, 2),
            'active_reservations' => $activeReservations,
            'total_platform_commission' => round($totalPlatformCommission, 2),
            'avg_order_value' => round($totalRevenue / max($completedReservations, 1), 2),
        ];
    }

    /**
     * Get all users with optional filtering
     */
    public function getUsers(array $filters = [], int $perPage = 25)
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

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get user activity details
     */
    public function getUserDetails(int $userId): array
    {
        $user = User::with('agency', 'reliabilityScore')->find($userId);

        if (!$user) {
            throw new NotFoundException('User not found', 'USER_NOT_FOUND');
        }

        $reservationCount = $user->reservations()->count();
        $completedReservations = $user->reservations()
            ->where('status', ReservationStatus::COMPLETED->value)
            ->count();

        $totalSpent = $user->reservations()
            ->where('status', ReservationStatus::COMPLETED->value)
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
            throw new NotFoundException('User not found', 'USER_NOT_FOUND');
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
            throw new NotFoundException('User not found', 'USER_NOT_FOUND');
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
            throw new NotFoundException('User not found', 'USER_NOT_FOUND');
        }

        if ($currentUserId !== null && $user->id === $currentUserId) {
            throw new BusinessRuleViolationException('You cannot delete your own account', 400, 'SELF_DELETE_FORBIDDEN');
        }

        $hasActiveReservations = $user->reservations()
            ->whereIn('status', ReservationStatus::activeValues())
            ->exists();

        if ($hasActiveReservations) {
            throw new ConflictException('Cannot delete user with active reservations', 'USER_HAS_ACTIVE_RESERVATIONS');
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
            throw new NotFoundException('Agency not found', 'AGENCY_NOT_FOUND');
        }

        $vehicleCount = $agency->vehicles()->count();
        $totalReservations = Reservation::whereHas('vehicle', function ($query) use ($agencyId) {
            $query->where('agency_id', $agencyId);
        })->count();

        $completedReservations = Reservation::whereHas('vehicle', function ($query) use ($agencyId) {
            $query->where('agency_id', $agencyId);
        })->where('status', ReservationStatus::COMPLETED->value)->count();

        $totalRevenue = Reservation::whereHas('vehicle', function ($query) use ($agencyId) {
            $query->where('agency_id', $agencyId);
        })->where('status', ReservationStatus::COMPLETED->value)->sum('total_price');

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
    public function getAgencies(int $perPage = 25)
    {
        $agencies = Agency::withCount('vehicles')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $revenueByAgency = $this->getCompletedRevenueByAgency(
            $agencies->getCollection()->pluck('id')->all()
        );

        $result = $agencies->getCollection()->map(function (Agency $agency) use ($revenueByAgency) {
            $revenue = $revenueByAgency[$agency->id] ?? 0;

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
                'created_at' => $agency->created_at?->toIso8601String(),
                'updated_at' => $agency->updated_at?->toIso8601String(),
            ];
        });

        return $agencies->setCollection($result);
    }

    /**
     * Update agency attributes (status, name, location)
     */
    public function updateAgency(int $agencyId, array $data)
    {
        $agency = Agency::find($agencyId);

        if (!$agency) {
            throw new NotFoundException('Agency not found', 'AGENCY_NOT_FOUND');
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
            DB::transaction(function () use ($agency, $allowed) {
                $agency->update($allowed);

                if (!array_key_exists('status', $allowed)) {
                    return;
                }

                $agencyAdmins = $agency->admins()->get();

                if ($allowed['status'] === AgencyStatus::INACTIVE->value) {
                    foreach ($agencyAdmins as $admin) {
                        $admin->update([
                            'is_suspended' => true,
                            'suspension_reason' => 'Agency suspended',
                            'suspended_at' => now(),
                        ]);

                        $admin->tokens()->delete();
                    }

                    return;
                }

                if ($allowed['status'] === AgencyStatus::ACTIVE->value) {
                    foreach ($agencyAdmins as $admin) {
                        $admin->update([
                            'is_suspended' => false,
                            'suspension_reason' => null,
                            'suspended_at' => null,
                        ]);
                    }
                }
            });
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
            throw new NotFoundException('User not found', 'USER_NOT_FOUND');
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
    public function getFinancialStats(array $filters = []): array
    {
        $platformCommissionRate = 0.05;

        $agencyId = isset($filters['agency_id']) ? (int) $filters['agency_id'] : null;
        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;

        $completedReservations = Reservation::query()
            ->where('status', ReservationStatus::COMPLETED->value)
            ->when($agencyId, function ($query) use ($agencyId) {
                $query->whereHas('vehicle', function ($vehicleQuery) use ($agencyId) {
                    $vehicleQuery->where('agency_id', $agencyId);
                });
            })
            ->when($startDate, fn ($query) => $query->whereDate('created_at', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('created_at', '<=', $endDate));

        // Monthly revenue (YYYY-MM)
        $monthly = (clone $completedReservations)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_price) as revenue")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($r) use ($platformCommissionRate) {
                $revenue = round((float) $r->revenue, 2);
                $commission = round($revenue * $platformCommissionRate, 2);

                return [
                    'month' => $r->month,
                    'revenue' => $revenue,
                    'commission' => $commission,
                    'profit' => round($revenue - $commission, 2),
                ];
            })
            ->toArray();

        $agencies = Agency::query()
            ->select('id', 'name')
            ->when($agencyId, fn ($query) => $query->where('id', $agencyId))
            ->orderBy('id')
            ->get();
        $revenueByAgency = $this->getCompletedRevenueByAgency(
            $agencies->pluck('id')->all(),
            $startDate,
            $endDate
        );

        // Revenue by agency
        $byAgency = $agencies->map(function ($agency) use ($revenueByAgency, $platformCommissionRate) {
            $revenue = round((float) ($revenueByAgency[$agency->id] ?? 0), 2);
            $commission = round($revenue * $platformCommissionRate, 2);

            return [
                'agency_id' => $agency->id,
                'agency_name' => $agency->name,
                'revenue' => $revenue,
                'commission' => $commission,
                'profit' => round($revenue - $commission, 2),
            ];
        })->toArray();

        $totals = [];
        $totals['revenue'] = round((float) (clone $completedReservations)->sum('total_price'), 2);
        $totals['commission'] = round($totals['revenue'] * $platformCommissionRate, 2);
        $totals['profit'] = round($totals['revenue'] - $totals['commission'], 2);
        $totals['avgMonthly'] = !empty($monthly) ? round(array_sum(array_column($monthly, 'revenue')) / count($monthly), 2) : 0;
        $totals['commissionRate'] = $platformCommissionRate;

        return [
            'monthly' => $monthly,
            'byAgency' => $byAgency,
            'totals' => $totals,
        ];
    }

    /**
     * Get completed reservation revenue grouped by agency in a single query.
     *
     * @param array<int> $agencyIds
     * @return array<int, float>
     */
    private function getCompletedRevenueByAgency(array $agencyIds, ?string $startDate = null, ?string $endDate = null): array
    {
        if (empty($agencyIds)) {
            return [];
        }

        return Reservation::query()
            ->join('vehicles', 'reservations.vehicle_id', '=', 'vehicles.id')
            ->where('reservations.status', ReservationStatus::COMPLETED->value)
            ->whereIn('vehicles.agency_id', $agencyIds)
            ->when($startDate, fn ($query) => $query->whereDate('reservations.created_at', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('reservations.created_at', '<=', $endDate))
            ->groupBy('vehicles.agency_id')
            ->select('vehicles.agency_id', DB::raw('SUM(reservations.total_price) as revenue'))
            ->get()
            ->mapWithKeys(fn ($row) => [
                (int) $row->agency_id => round((float) $row->revenue, 2),
            ])
            ->all();
    }
}
