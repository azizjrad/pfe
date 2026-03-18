<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'registration_number' => $this->registration_number,
            'license_plate' => $this->license_plate,
            'type' => $this->type,
            'transmission' => $this->transmission,
            'fuel_type' => $this->fuel_type,
            'seating_capacity' => $this->seating_capacity,
            'daily_rate' => (float) $this->daily_rate,
            'status' => $this->status,
            'year' => (int) $this->year,
            'mileage' => $this->mileage ?? 0,
            'agency_id' => $this->agency_id,
            'agency' => new AgencyResource($this->whenLoaded('agency')),
            'image_url' => $this->image_url,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
