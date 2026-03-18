<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactMessageResource;
use App\Services\ContactService;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    private ContactService $contactService;

    public function __construct(ContactService $contactService)
    {
        $this->contactService = $contactService;
    }

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

        try {
            $message = $this->contactService->submit($validated);

            return response()->json([
                'message' => 'Message sent successfully.',
                'data'    => new ContactMessageResource($message),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List all contact messages (super_admin only).
     */
    public function index()
    {
        try {
            $messages = $this->contactService->getAll();

            return response()->json(['success' => true, 'data' => ContactMessageResource::collection($messages)]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark a contact message as read (super_admin only).
     */
    public function markAsRead($id)
    {
        try {
            $message = $this->contactService->markAsRead($id);

            return response()->json([
                'message' => 'Message marked as read.',
                'data' => new ContactMessageResource($message)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Delete a contact message (super_admin only).
     */
    public function destroy($id)
    {
        try {
            $this->contactService->delete($id);

            return response()->json(['message' => 'Message deleted.']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
