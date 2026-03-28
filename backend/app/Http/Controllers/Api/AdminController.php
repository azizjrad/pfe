<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuspendUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\AgencyResource;
use App\Services\AdminService;
use App\Services\AuthService;
use App\Services\AgencyService;
use App\Services\ClientService;
use App\Models\User;
use App\Mail\InviteUserMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private AdminService $adminService;
    private AuthService $authService;
    private AgencyService $agencyService;
    private ClientService $clientService;

    public function __construct(
        AdminService $adminService,
        AuthService $authService,
        AgencyService $agencyService,
        ClientService $clientService
    ) {
        $this->adminService = $adminService;
        $this->authService = $authService;
        $this->agencyService = $agencyService;
        $this->clientService = $clientService;
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
     * Create a new user (super admin)
     */
    public function createUser(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:client,agency_admin,super_admin',
            'agency_id' => 'nullable|integer|exists:agencies,id',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        try {
            // Create user without immediate password; send invite link to set password
            if ($data['role'] === 'client') {
                $user = $this->clientService->create($data);
            } else {
                // agency_admin or super_admin
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => null,
                    'role' => $data['role'],
                    'agency_id' => $data['agency_id'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'address' => $data['address'] ?? null,
                ]);
            }

            // Generate a password reset token and send invite email
            $token = Password::broker()->createToken($user);

            $frontend = config('app.frontend_url', env('FRONTEND_URL', config('app.url')));
            $link = rtrim($frontend, '/') . '/set-password?token=' . urlencode($token) . '&email=' . urlencode($user->email);

            Mail::to($user->email)->queue(new InviteUserMail($link, $user->name ?? null, $user->role ?? null));

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
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
     * Update user (suspend toggle or profile fields)
     */
    public function updateUser(Request $request, $id)
    {
        $data = $request->only(['is_suspended', 'suspension_reason', 'name', 'email', 'phone', 'role']);

        try {
            $user = $this->adminService->updateUser($id, $data);

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], in_array($e->getCode(), [400,404]) ? $e->getCode() : 400);
        }
    }

    /**
     * Update agency (e.g., status)
     */
    public function updateAgency(Request $request, $id)
    {
        $data = $request->only(['status', 'name', 'location']);

        try {
            $agency = $this->adminService->updateAgency($id, $data);

            return response()->json([
                'success' => true,
                'data' => new AgencyResource($agency),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], in_array($e->getCode(), [400,404]) ? $e->getCode() : 400);
        }
    }

    /**
     * Create a new agency
     */
    public function createAgency(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
            'status' => 'nullable|in:active,inactive',
        ]);

        try {
            $agency = $this->agencyService->create($data);

            return response()->json([
                'success' => true,
                'data' => new AgencyResource($agency),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
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

