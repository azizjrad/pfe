<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactMessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $replies = $this->relationLoaded('replies') ? $this->replies : collect();
        $latestReply = $replies->last();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'subject' => $this->subject,
            'message' => $this->message,
            'is_read' => (bool) $this->is_read,
            'admin_reply' => $this->admin_reply ?? $latestReply?->reply,
            'replied_by_email' => $this->replied_by_email ?? $latestReply?->replied_by_email,
            'replied_at' => ($this->replied_at ?? $latestReply?->replied_at)?->toIso8601String(),
            'read_at' => $this->read_at?->toIso8601String(),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'reply_count' => $replies->count(),
            'replies' => ContactMessageReplyResource::collection($replies),
        ];
    }
}
