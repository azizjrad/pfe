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
            'admin_count' => $agency->users()->count(),
            'avg_rating' => round($agency->reviews()->avg('rating') ?? 0, 2),
        ];
    }
}
