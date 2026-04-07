<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $days = 1;
        if ($this->start_date && $this->end_date) {
            $days = max(1, $this->start_date->diffInDays($this->end_date));
        }

        $dailyRate = $days > 0 ? ((float) $this->base_price / $days) : (float) $this->base_price;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'vehicle_id' => $this->vehicle_id,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'status' => $this->status,
            'pickup_location' => $this->pickup_location,
            'dropoff_location' => $this->dropoff_location,
            'client_birth_date' => $this->client_birth_date?->toDateString(),
            'deposit_amount' => (float) ($this->deposit_amount ?? 0),
            'driver_first_name' => $this->driver_first_name,
            'driver_last_name' => $this->driver_last_name,
            'driver_birth_date' => $this->driver_birth_date?->toDateString(),
            'driver_license_number' => $this->driver_license_number,
            'driver_license_date' => $this->driver_license_date?->toDateString(),
            // Keep alias for legacy frontend keys.
            'return_location' => $this->dropoff_location,
            'daily_rate' => (float) $dailyRate,
            'number_of_days' => (int) $days,
            'subtotal' => (float) $this->base_price,
            'base_price' => (float) $this->base_price,
            'discount_amount' => (float) $this->discount_amount ?? 0,
            'additional_charges' => (float) $this->additional_charges ?? 0,
            'total_price' => (float) $this->total_price,
            'paid_amount' => (float) $this->paid_amount ?? 0,
            'remaining_amount' => (float) $this->remaining_amount ?? 0,
            'payment_status' => $this->payment_status,
            'platform_commission' => (float) $this->platform_commission ?? 0,
            'cancellation_reason' => $this->cancellation_reason,
            'notes' => $this->notes,
            // Keep alias for legacy frontend keys.
            'special_requests' => $this->notes,
            'pricing_details' => $this->pricing_details,
            'user' => new UserResource($this->whenLoaded('user')),
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
