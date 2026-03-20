<?php

namespace App\Services;

use App\Models\User;
use App\Models\ClientReliabilityScore;
use App\Models\UserNotification;

class ClientService
{
    /**
     * Get client dashboard statistics
     */
    public function getStats(User $user): array
    {
        $completedReservations = $user->reservations()
            ->where('status', 'completed')
            ->count();

        $activeReservations = $user->reservations()
            ->whereIn('status', ['pending', 'confirmed', 'ongoing'])
            ->count();

        $totalSpent = $user->reservations()
            ->where('status', 'completed')
            ->sum('total_price');

        $reliabilityScore = $user->reliabilityScore?->score ?? 100;

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
        $score = $user->reliabilityScore;
        if (!$score) {
            $score = ClientReliabilityScore::create([
                'user_id' => $user->id,
                'score' => 100,
            ]);
        }

        $score->update([
            'score' => max(0, min(100, $score->score + $delta)),
            'last_calculated_at' => now(),
        ]);
    }
}
