<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    private static array $bonusCache = [];

    private function resolveBonusData(): array
    {
        $userId = (int) $this->id;

        if (isset(self::$bonusCache[$userId])) {
            return self::$bonusCache[$userId];
        }

        $cleanCompletedReservations = $this->reservations()
            ->where('status', \App\Domain\Enums\ReservationStatus::COMPLETED->value)
            ->where('is_late_return', false)
            ->whereDoesntHave('vehicleReturn', function ($query) {
                $query->whereIn('vehicle_condition', ['fair', 'damaged']);
            })
            ->count();

        $bonusPerCleanReservation = (int) config('pfe.reliability_scoring.clean_completed_bonus', 2);
        $bonusPoints = max(0, $cleanCompletedReservations * $bonusPerCleanReservation);

        self::$bonusCache[$userId] = [
            'clean_completed_reservations' => $cleanCompletedReservations,
            'bonus_points' => $bonusPoints,
        ];

        return self::$bonusCache[$userId];
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $score = $this->relationLoaded('reliabilityScore')
            ? $this->reliabilityScore
            : null;
        $reliabilityPayload = null;

        if ($this->role === 'client') {
            $bonusData = $this->resolveBonusData();
            $reliabilityPayload = [
                'score' => (int) ($score?->reliability_score ?? 100),
                'total_reservations' => (int) ($score?->total_reservations ?? 0),
                'completed_reservations' => (int) ($score?->completed_reservations ?? 0),
                'cancelled_reservations' => (int) ($score?->cancelled_reservations ?? 0),
                'late_returns' => (int) ($score?->late_returns ?? 0),
                'payment_delays' => (int) ($score?->payment_delays ?? 0),
                'damage_incidents' => (int) ($score?->damage_incidents ?? 0),
                'clean_completed_reservations' => (int) ($bonusData['clean_completed_reservations'] ?? 0),
                'bonus_points' => (int) ($bonusData['bonus_points'] ?? 0),
                'risk_level' => $score?->risk_level ?? 'low',
                'admin_notes' => $score?->admin_notes,
            ];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'agency_id' => $this->agency_id,
            'is_suspended' => (bool) $this->is_suspended,
            'reliability_score' => $reliabilityPayload,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
