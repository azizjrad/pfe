<?php

namespace App\Services;

use App\Models\ContactMessage;

class ContactService
{
    /**
     * Submit contact form (public)
     */
    public function submit(array $data): ContactMessage
    {
        return ContactMessage::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'],
            'message' => $data['message'],
            'is_read' => false,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Get all contact messages (admin only)
     */
    public function getAll(array $filters = [])
    {
        $query = ContactMessage::query();

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

        return $query->orderByRaw('is_read ASC, created_at DESC')->get();
    }

    /**
     * Mark message as read
     */
    public function markAsRead(int $id): ContactMessage
    {
        $message = ContactMessage::findOrFail($id);
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
}
