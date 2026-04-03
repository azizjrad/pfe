<?php

namespace App\Services;

use App\Models\User;
use App\Models\ClientReliabilityScore;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Hash;

class ClientService
{
    /**
     * Get client dashboard statistics
     */
    public function getStats(User $user): array
    {
        $score = $this->recalculateReliabilityScore($user);

        $completedReservations = $user->reservations()
            ->where('status', 'completed')
            ->count();

        $activeReservations = $user->reservations()
            ->whereIn('status', ['pending', 'confirmed', 'ongoing'])
            ->count();

        $totalSpent = $user->reservations()
            ->where('status', 'completed')
            ->sum('total_price');

        $reliabilityScore = (int) ($score->reliability_score ?? 100);

        return [
            'user_id' => $user->id,
            'name' => $user->name,
            'active_reservations' => $activeReservations,
            'completed_reservations' => $completedReservations,
            'total_spent' => round($totalSpent, 2),
            'reliability_score' => $reliabilityScore,
            'can_book' => $reliabilityScore >= 40,
            'risk_level' => $this->calculateRiskLevel($reliabilityScore),
        ];
    }

    /**
     * Get persistent user notifications
     */
    public function getNotifications(User $user): array
    {
        return UserNotification::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(100)
            ->get()
            ->map(function (UserNotification $notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'is_read' => $notification->is_read,
                    'read_at' => $notification->read_at?->toISOString(),
                    'created_at' => $notification->created_at?->toISOString(),
                ];
            })
            ->toArray();
    }

    /**
     * Mark one notification as read for the given user.
     */
    public function markNotificationAsRead(User $user, int $notificationId): UserNotification
    {
        $notification = UserNotification::query()
            ->where('user_id', $user->id)
            ->findOrFail($notificationId);

        if (!$notification->is_read) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return $notification;
    }

    /**
     * Mark all notifications as read for the given user.
     */
    public function markAllNotificationsAsRead(User $user): int
    {
        return UserNotification::query()
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Calculate risk level based on reliability score
     */
    private function calculateRiskLevel(int $score): string
    {
        if ($score >= 80) {
            return 'low';
        } elseif ($score >= 60) {
            return 'medium';
        }
        return 'high';
    }

    /**
     * Update reliability score based on behavior
     */
    public function updateReliabilityScore(User $user, int $delta): void
    {
        $score = $this->ensureReliabilityScore($user);
        $current = (int) ($score->reliability_score ?? 100);

        $score->update([
            'reliability_score' => max(0, min(100, $current + $delta)),
            'last_calculated_at' => now(),
        ]);
    }

    /**
     * Ensure client has a reliability score row initialized at 100.
     */
    public function ensureReliabilityScore(User $user): ClientReliabilityScore
    {
        return ClientReliabilityScore::updateOrCreate(
            ['user_id' => $user->id],
            [
                'reliability_score' => 100,
                'risk_level' => 'low',
                'last_calculated_at' => now(),
            ]
        );
    }

    /**
     * Recalculate reliability score based on reservation/payment/return behavior.
     */
    public function recalculateReliabilityScore(User $user): ClientReliabilityScore
    {
        $score = $this->ensureReliabilityScore($user);

        $reservationsQuery = $user->reservations();
        $totalReservations = (clone $reservationsQuery)->count();
        $completedReservations = (clone $reservationsQuery)
            ->where('status', 'completed')
            ->count();
        $cancelledReservations = (clone $reservationsQuery)
            ->where('status', 'cancelled')
            ->count();
        $lateReturns = (clone $reservationsQuery)
            ->where('is_late_return', true)
            ->count();
        $paymentDelays = (clone $reservationsQuery)
            ->where('payment_status', 'overdue')
            ->count();
        $damageIncidents = (clone $reservationsQuery)
            ->whereHas('vehicleReturn', function ($query) {
                $query->whereIn('vehicle_condition', ['fair', 'damaged']);
            })
            ->count();
        $totalUnpaidAmount = round((float) (clone $reservationsQuery)
            ->where('remaining_amount', '>', 0)
            ->sum('remaining_amount'), 2);

        $score->fill([
            'total_reservations' => $totalReservations,
            'completed_reservations' => $completedReservations,
            'cancelled_reservations' => $cancelledReservations,
            'late_returns' => $lateReturns,
            'payment_delays' => $paymentDelays,
            'damage_incidents' => $damageIncidents,
            'total_unpaid_amount' => $totalUnpaidAmount,
        ]);

        $score->calculateScore();

        return $score->fresh();
    }

    /**
     * Create a new client user
     */
    public function create(array $data): User
    {
        if (isset($data['email']) && User::where('email', $data['email'])->exists()) {
            throw new \Exception('Email already in use', 400);
        }

        $password = $data['password'] ?? null;
        if (!$password) {
            $password = '';
        }

        $user = User::create([
            'name' => $data['name'] ?? 'Unnamed',
            'email' => $data['email'] ?? null,
            'password' => $password ? Hash::make($password) : null,
            'role' => 'client',
            'agency_id' => $data['agency_id'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'driver_license' => $data['driver_license'] ?? null,
        ]);

        return $user;
    }
}
