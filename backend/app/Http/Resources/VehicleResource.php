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
            'name' => $this->name ?? trim("{$this->brand} {$this->model}"),
            'brand' => $this->brand,
            'model' => $this->model,
            'description' => $this->description,
            'registration_number' => $this->registration_number ?? $this->license_plate,
            'license_plate' => $this->license_plate,
            'type' => $this->type,
            'transmission' => $this->transmission,
            'fuel_type' => $this->fuel_type,
            'seating_capacity' => $this->seating_capacity ?? $this->seats,
            'seats' => (int) ($this->seats ?? $this->seating_capacity ?? 0),
            'daily_rate' => (float) ($this->daily_rate ?? $this->daily_price ?? 0),
            'daily_price' => (float) ($this->daily_price ?? $this->daily_rate ?? 0),
            'status' => $this->status,
            'year' => (int) $this->year,
            'mileage' => $this->mileage ?? 0,
            'agency_id' => $this->agency_id,
            'agency' => new AgencyResource($this->whenLoaded('agency')),
            'image' => $this->image,
            'image_url' => $this->image_url ?? $this->image,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
