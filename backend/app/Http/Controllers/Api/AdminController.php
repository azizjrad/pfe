<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuspendUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\AgencyResource;
use App\Services\AdminService;

class AdminController extends Controller
{
    private AdminService $adminService;

    public function __construct(AdminService $adminService)
    {
        $this->adminService = $adminService;
    }

    /**
     * Get platform-wide statistics for admin dashboard
     */
    public function getDashboardStats()
    {
        try {
            $stats = $this->adminService->getDashboardStats();

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
     * Get all users with their details
     */
    public function getUsers()
    {
        try {
            $users = $this->adminService->getUsers();

            return response()->json([
                'success' => true,
                'data' => UserResource::collection($users),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get agencies list
     */
    public function getAgencies()
    {
        try {
            $agencies = $this->adminService->getAgencies();

            return response()->json([
                'success' => true,
                'data' => $agencies,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get financial statistics for platform
     */
    public function getFinancialStats()
    {
        try {
            $stats = $this->adminService->getFinancialStats();

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
     * Get user details
     */
    public function getUserDetails($id)
    {
        try {
            $user = $this->adminService->getUserDetails($id);

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], in_array($e->getCode(), [404]) ? 404 : 500);
        }
    }

    /**
     * Suspend user
     */
    public function suspendUser(SuspendUserRequest $request, $id)
    {
        $validated = $request->validated();

        try {
            $this->adminService->suspendUser($id, $validated['reason']);

            return response()->json([
                'success' => true,
                'message' => 'User suspended successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Unsuspend user
     */
    public function unsuspendUser($id)
    {
        try {
            $this->adminService->unsuspendUser($id);

            return response()->json([
                'success' => true,
                'message' => 'User unsuspended successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Delete user
     */
    public function deleteUser($id)
    {
        try {
            $this->adminService->deleteUser($id, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], in_array($e->getCode(), [400, 404]) ? $e->getCode() : 500);
        }
    }

    /**
     * Get agency details
     */
    public function getAgencyDetails($id)
    {
        try {
            $agency = $this->adminService->getAgencyDetails($id);

            return response()->json([
                'success' => true,
                'data' => new AgencyResource($agency),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}

