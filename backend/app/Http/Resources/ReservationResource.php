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
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'vehicle_id' => $this->vehicle_id,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'status' => $this->status,
            'pickup_location' => $this->pickup_location,
            'return_location' => $this->return_location,
            'daily_rate' => (float) $this->daily_rate,
            'number_of_days' => (int) $this->number_of_days,
            'subtotal' => (float) $this->subtotal ?? 0,
            'discount_amount' => (float) $this->discount_amount ?? 0,
            'total_price' => (float) $this->total_price,
            'platform_commission' => (float) $this->platform_commission ?? 0,
            'cancellation_reason' => $this->cancellation_reason,
            'special_requests' => $this->special_requests,
            'user' => new UserResource($this->whenLoaded('user')),
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
