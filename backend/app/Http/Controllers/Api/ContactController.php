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

        $message = $this->contactService->submit($validated);

        return $this->apiSuccessResponse('Message sent successfully.', new ContactMessageResource($message), 201);
    }

    /**
     * List all contact messages (super_admin only).
     */
    public function index(Request $request)
    {
        $perPage = $this->resolvePerPage($request, 25, 100);
        $messages = $this->contactService->getAll([], $perPage);

        return $this->apiSuccessResponse(null, ContactMessageResource::collection($messages->items()), 200, [
            'pagination' => $this->paginationMeta($messages),
        ]);
    }

    /**
     * Mark a contact message as read (super_admin only).
     */
    public function markAsRead($id)
    {
        $message = $this->contactService->markAsRead($id);

        return $this->apiSuccessResponse('Message marked as read.', new ContactMessageResource($message));
    }

    /**
     * Delete a contact message (super_admin only).
     */
    public function destroy($id)
    {
        $this->contactService->delete($id);

        return $this->apiSuccessResponse('Message deleted.');
    }
}
