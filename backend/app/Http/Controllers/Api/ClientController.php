<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ClientService;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    private ClientService $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    /**
     * Get statistics for the authenticated client
     */
    public function getStats(Request $request)
    {
        $stats = $this->clientService->getStats($request->user());

        return $this->apiSuccessResponse(null, $stats);
    }

    /**
     * Get notifications derived from recent reservation events
     */
    public function getNotifications(Request $request)
    {
        $perPage = $this->resolvePerPage($request, 20, 100);
        $notifications = $this->clientService->getNotifications($request->user(), $perPage);

        return $this->apiSuccessResponse(null, $notifications->items(), 200, [
            'pagination' => $this->paginationMeta($notifications),
        ]);
    }

    /**
     * Mark one notification as read for current user.
     */
    public function markNotificationAsRead(Request $request, int $id)
    {
        $notification = $this->clientService->markNotificationAsRead($request->user(), $id);

        return $this->apiSuccessResponse('Notification marquée comme lue.', [
            'id' => $notification->id,
            'is_read' => $notification->is_read,
            'read_at' => $notification->read_at?->toISOString(),
        ]);
    }

    /**
     * Mark all notifications as read for current user.
     */
    public function markAllNotificationsAsRead(Request $request)
    {
        $updatedCount = $this->clientService->markAllNotificationsAsRead($request->user());

        return $this->apiSuccessResponse('Toutes les notifications ont été marquées comme lues.', [
            'updated_count' => $updatedCount,
        ]);
    }
}

