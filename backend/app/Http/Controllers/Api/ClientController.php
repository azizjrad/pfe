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
            $stats = $this->clientService->getStats($request->user()->id);

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
}

