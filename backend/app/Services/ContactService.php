<?php

namespace App\Services;

use App\Mail\ContactReplyMail;
use App\Models\ContactMessage;
use App\Models\ContactMessageReply;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ContactService
{
    /**
     * Submit contact form (public)
     */
    public function submit(array $data): ContactMessage
    {
        $message = ContactMessage::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'],
            'message' => $data['message'],
            'is_read' => false,
            'submitted_at' => now(),
        ]);

        // Notify platform super admins about the new contact message so it appears
        // in the admin dashboard notifications dropdown.
        try {
            $admins = User::where('role', 'super_admin')->get();
            foreach ($admins as $admin) {
                UserNotification::create([
                    'user_id' => $admin->id,
                    'type' => 'contact_message',
                    'title' => 'Nouveau message de contact',
                    'message' => "Nouveau message de {$message->name}: {$message->subject}",
                    'data' => [
                        'contact_message_id' => $message->id,
                    ],
                    'is_read' => false,
                ]);
            }
        } catch (\Throwable $e) {
            logger()->error('ContactService: failed to create admin notifications: ' . $e->getMessage());
        }

        return $message;
    }

    /**
     * Get all contact messages (admin only)
     */
    public function getAll(array $filters = [], int $perPage = 25)
    {
        $query = ContactMessage::query()->with([
            'replies' => function ($replyQuery) {
                $replyQuery->orderBy('replied_at')->orderBy('id');
            },
        ]);

        if (isset($filters['is_read'])) {
            $query->where('is_read', $filters['is_read']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        return $query->orderByRaw('is_read ASC, created_at DESC')->paginate($perPage);
    }

    /**
     * Mark message as read
     */
    public function markAsRead(int $id): ContactMessage
    {
        $message = ContactMessage::with(['replies' => function ($replyQuery) {
            $replyQuery->orderBy('replied_at')->orderBy('id');
        }])->findOrFail($id);
        $message->update(['is_read' => true, 'read_at' => now()]);
        return $message;
    }

    /**
     * Delete contact message
     */
    public function delete(int $id): void
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();
    }

    /**
     * Reply to a contact message by email and persist reply metadata.
     */
    public function reply(int $id, string $replyText, string $adminEmail): ContactMessage
    {
        $message = ContactMessage::findOrFail($id);
        $replyAt = now();

        DB::transaction(function () use ($message, $replyText, $adminEmail, $replyAt): void {
            ContactMessageReply::create([
                'contact_message_id' => $message->id,
                'reply' => $replyText,
                'replied_by_email' => $adminEmail,
                'replied_at' => $replyAt,
            ]);

            $message->update([
                'admin_reply' => $replyText,
                'replied_by_email' => $adminEmail,
                'replied_at' => $replyAt,
                'is_read' => true,
                'read_at' => $message->read_at ?? $replyAt,
            ]);
        });

        Mail::to($message->email)->send(new ContactReplyMail($message->fresh(), $replyText));

        return ContactMessage::with([
            'replies' => function ($replyQuery) {
                $replyQuery->orderBy('replied_at')->orderBy('id');
            },
        ])->findOrFail($message->id);
    }
}
