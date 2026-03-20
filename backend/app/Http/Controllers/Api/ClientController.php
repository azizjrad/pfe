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
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get notifications derived from recent reservation events
     */
    public function getNotifications(Request $request)
    {
        try {
            $notifications = $this->clientService->getNotifications($request->user());

            return response()->json([
                'success' => true,
                'data'    => $notifications,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

