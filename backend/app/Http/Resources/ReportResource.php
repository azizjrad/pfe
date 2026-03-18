<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
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
            'report_type' => $this->report_type,
            'target_id' => $this->target_id,
            'reported_by_user_id' => $this->reported_by_user_id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status ?? 'pending',
            'admin_notes' => $this->admin_notes,
            'reported_by' => new UserResource($this->whenLoaded('reportedBy')),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
