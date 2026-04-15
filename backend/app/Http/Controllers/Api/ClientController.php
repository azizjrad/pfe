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
        try {
            $stats = $this->clientService->getStats($request->user());

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de recuperer les statistiques client.', 500, [
                'action' => 'client.stats',
                'user_id' => $request->user()?->id,
            ]);
        }
    }

    /**
     * Get notifications derived from recent reservation events
     */
    public function getNotifications(Request $request)
    {
        try {
            $perPage = $this->resolvePerPage($request, 20, 100);
            $notifications = $this->clientService->getNotifications($request->user(), $perPage);

            return response()->json([
                'success' => true,
                'data'    => $notifications->items(),
                'pagination' => $this->paginationMeta($notifications),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de recuperer les notifications.', 500, [
                'action' => 'client.notifications.index',
                'user_id' => $request->user()?->id,
            ]);
        }
    }

    /**
     * Mark one notification as read for current user.
     */
    public function markNotificationAsRead(Request $request, int $id)
    {
        try {
            $notification = $this->clientService->markNotificationAsRead($request->user(), $id);

            return response()->json([
                'success' => true,
                'message' => 'Notification marquée comme lue.',
                'data' => [
                    'id' => $notification->id,
                    'is_read' => $notification->is_read,
                    'read_at' => $notification->read_at?->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de marquer la notification comme lue.', 500, [
                'action' => 'client.notifications.mark_read',
                'user_id' => $request->user()?->id,
                'notification_id' => $id,
            ]);
        }
    }

    /**
     * Mark all notifications as read for current user.
     */
    public function markAllNotificationsAsRead(Request $request)
    {
        try {
            $updatedCount = $this->clientService->markAllNotificationsAsRead($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications ont été marquées comme lues.',
                'data' => [
                    'updated_count' => $updatedCount,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de marquer toutes les notifications comme lues.', 500, [
                'action' => 'client.notifications.mark_all_read',
                'user_id' => $request->user()?->id,
            ]);
        }
    }
}

