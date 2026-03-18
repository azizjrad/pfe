<?php

namespace App\Services;

use App\Models\User;
use App\Models\ClientReliabilityScore;

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
     * Get client notifications (upcoming reservations, expiring status, etc.)
     */
    public function getNotifications(User $user): array
    {
        $upcoming = $user->reservations()
            ->where('status', 'confirmed')
            ->where('start_date', '>=', now())
            ->where('start_date', '<=', now()->addDays(7))
            ->count();

        $pending = $user->reservations()
            ->where('status', 'pending')
            ->count();

        $needsRating = $user->reservations()
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(7))
            ->doesntHave('reviews')
            ->count();

        $lowScore = $user->reliabilityScore?->score ?? 100;

        $notifications = [];

        if ($upcoming > 0) {
            $notifications[] = [
                'type' => 'upcoming',
                'title' => 'Upcoming Reservations',
                'message' => "You have {$upcoming} reservation(s) starting within the next week.",
                'count' => $upcoming,
            ];
        }

        if ($pending > 0) {
            $notifications[] = [
                'type' => 'pending',
                'title' => 'Pending Confirmation',
                'message' => "You have {$pending} reservation(s) awaiting agency confirmation.",
                'count' => $pending,
            ];
        }

        if ($needsRating > 0) {
            $notifications[] = [
                'type' => 'review',
                'title' => 'Rate Your Rentals',
                'message' => "Rate {$needsRating} completed rental(s) to help us improve.",
                'count' => $needsRating,
            ];
        }

        if ($lowScore < 60) {
            $notifications[] = [
                'type' => 'warning',
                'title' => 'Reliability Score Warning',
                'message' => "Your reliability score is {$lowScore}. Maintain good behavior to keep booking eligibility.",
                'count' => 1,
            ];
        }

        return $notifications;
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
