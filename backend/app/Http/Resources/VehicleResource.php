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
        $images = is_array($this->images ?? null) ? $this->images : [];

        // Helper to resolve image paths to a fully-qualified URL when needed.
        $frontendBase = rtrim(config('pfe.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');
        // Use the actual incoming request host for backend URLs so images resolve correctly
        $backendBase = rtrim($request->getSchemeAndHttpHost(), '/');

        $normalize = function ($path) use ($frontendBase, $backendBase) {
            if (! $path) {
                return null;
            }
            // If already absolute (http:// or https://) return as-is
            if (preg_match('#^https?://#i', $path)) {
                return $path;
            }
            // If path points to backend vehicles folder, prefix with backend base
            if (str_starts_with($path, '/vehicles')) {
                return $backendBase . $path;
            }
            // If path starts with a slash, prefix with frontend base
            if (str_starts_with($path, '/')) {
                return $frontendBase . $path;
            }
            // Otherwise treat as relative and prefix with frontend base
            return $frontendBase . '/' . ltrim($path, '/');
        };

        $resolvedMainImage = $this->image_url ?? $this->image ?? ($images[0] ?? null);
        $resolvedMainImage = $normalize($resolvedMainImage);

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
            'daily_rate' => (float) ($this->daily_rate ?? $this->currentPrice?->price ?? 0),
            'daily_price' => (float) ($this->currentPrice?->price ?? $this->daily_rate ?? 0),
            'caution_amount' => (float) ($this->caution_amount ?? 0),
            'price_history' => VehiclePriceResource::collection($this->whenLoaded('priceHistory')),
            'status' => $this->status,
            'year' => (int) $this->year,
            'mileage' => $this->mileage ?? 0,
            'agency_id' => $this->agency_id,
            'agency' => new AgencyResource($this->whenLoaded('agency')),
            // Prefer the first image from the `images` array (normalized) for compatibility
            // with the frontend which expects `image` / `image_url` fields.
            'images' => array_values(array_filter(array_map($normalize, $images))),
            'image' => $normalize($images[0] ?? $this->image ?? $this->image_url ?? null),
            'image_url' => $normalize($images[0] ?? $this->image ?? $this->image_url ?? null),
            'main_image' => $resolvedMainImage,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
