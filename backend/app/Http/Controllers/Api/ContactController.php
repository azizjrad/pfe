<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * Store a contact form submission (public).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'phone'   => 'nullable|string|max:50',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $contactMessage = ContactMessage::create($validated);

        return response()->json([
            'message' => 'Votre message a été envoyé avec succès.',
            'data'    => $contactMessage,
        ], 201);
    }

    /**
     * List all contact messages (super_admin only).
     */
    public function index()
    {
        $messages = ContactMessage::orderByRaw('is_read ASC, created_at DESC')->get();

        return response()->json(['data' => $messages]);
    }

    /**
     * Mark a contact message as read (super_admin only).
     */
    public function markAsRead(ContactMessage $contactMessage)
    {
        $contactMessage->update(['is_read' => true]);

        return response()->json(['message' => 'Message marqué comme lu.', 'data' => $contactMessage]);
    }

    /**
     * Delete a contact message (super_admin only).
     */
    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();

        return response()->json(['message' => 'Message supprimé.']);
    }
}
