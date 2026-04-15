<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
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
    public function store(StoreContactMessageRequest $request)
    {
        $validated = $request->validated();

        try {
            $message = $this->contactService->submit($validated);

            return response()->json([
                'message' => 'Message sent successfully.',
                'data'    => new ContactMessageResource($message),
            ], 201);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible d\'envoyer le message de contact.', 500, [
                'action' => 'contact.store',
            ]);
        }
    }

    /**
     * List all contact messages (super_admin only).
     */
    public function index(Request $request)
    {
        try {
            $perPage = $this->resolvePerPage($request, 25, 100);
            $messages = $this->contactService->getAll([], $perPage);

            return response()->json([
                'success' => true,
                'data' => ContactMessageResource::collection($messages->items()),
                'pagination' => $this->paginationMeta($messages),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de récupérer les messages de contact.', 500, [
                'action' => 'contact.index',
            ]);
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
            return $this->apiErrorResponse($e, 'Message de contact introuvable.', 404, [
                'action' => 'contact.mark_as_read',
                'contact_message_id' => $id,
            ]);
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
            return $this->apiErrorResponse($e, 'Message de contact introuvable.', 404, [
                'action' => 'contact.destroy',
                'contact_message_id' => $id,
            ]);
        }
    }
}
