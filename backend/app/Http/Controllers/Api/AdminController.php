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
use App\Models\Agency;
use App\Models\Reservation;
use App\Models\Vehicle;
use App\Mail\InviteUserMail;
use App\Http\Resources\VehicleResource;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Auth\Passwords\PasswordBroker;

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
            return $this->apiErrorResponse($e, 'Impossible de récupérer les statistiques du tableau de bord.', 500, [
                'action' => 'admin.dashboard_stats',
            ]);
        }
    }

    /**
     * Get all users with their details
     */
    public function getUsers(Request $request)
    {
        try {
            $perPage = $this->resolvePerPage($request, 25, 100);
            $users = $this->adminService->getUsers([], $perPage);

            return response()->json([
                'success' => true,
                'data' => UserResource::collection($users->items()),
                'pagination' => $this->paginationMeta($users),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de récupérer les utilisateurs.', 500, [
                'action' => 'admin.users.index',
            ]);
        }
    }

    /**
     * Get agencies list
     */
    public function getAgencies(Request $request)
    {
        try {
            $perPage = $this->resolvePerPage($request, 25, 100);
            $agencies = $this->adminService->getAgencies($perPage);

            return response()->json([
                'success' => true,
                'data' => $agencies->items(),
                'pagination' => $this->paginationMeta($agencies),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de récupérer les agences.', 500, [
                'action' => 'admin.agencies.index',
            ]);
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
            return $this->apiErrorResponse($e, 'Impossible de récupérer les statistiques financières.', 500, [
                'action' => 'admin.financial_stats',
            ]);
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
            return $this->apiErrorResponse(
                $e,
                'Impossible de récupérer les détails utilisateur.',
                in_array($e->getCode(), [404]) ? 404 : 500,
                ['action' => 'admin.users.show', 'target_user_id' => $id]
            );
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
                    // DB password is required. Store a temporary hash until invite flow sets the real password.
                    'password' => Hash::make($data['password'] ?? Str::random(40)),
                    'role' => $data['role'],
                    'agency_id' => $data['agency_id'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'address' => $data['address'] ?? null,
                ]);
            }

            // Generate a password reset token and send invite email
            /** @var PasswordBroker $passwordBroker */
            $passwordBroker = Password::broker();
            $token = $passwordBroker->createToken($user);

            $frontend = config('app.frontend_url', env('FRONTEND_URL', config('app.url')));
            $link = rtrim($frontend, '/') . '/set-password?token=' . urlencode($token) . '&email=' . urlencode($user->email);

            Mail::to($user->email)->queue(new InviteUserMail($link, $user->name ?? null, $user->role ?? null));

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
            ], 201);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de créer l\'utilisateur.', 400, [
                'action' => 'admin.users.create',
            ]);
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
            return $this->apiErrorResponse($e, 'Impossible de suspendre cet utilisateur.', 400, [
                'action' => 'admin.users.suspend',
                'target_user_id' => $id,
            ]);
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
            return $this->apiErrorResponse($e, 'Impossible de réactiver cet utilisateur.', 404, [
                'action' => 'admin.users.unsuspend',
                'target_user_id' => $id,
            ]);
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
            return $this->apiErrorResponse(
                $e,
                'Impossible de supprimer cet utilisateur.',
                in_array($e->getCode(), [400, 404]) ? $e->getCode() : 500,
                ['action' => 'admin.users.delete', 'target_user_id' => $id]
            );
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
            return $this->apiErrorResponse(
                $e,
                'Impossible de mettre à jour cet utilisateur.',
                in_array($e->getCode(), [400,404]) ? $e->getCode() : 400,
                ['action' => 'admin.users.update', 'target_user_id' => $id]
            );
        }
    }

    /**
     * Update agency (e.g., status)
     */
    public function updateAgency(Request $request, $id)
    {
        $data = $request->only([
            'status',
            'name',
            'location',
            'address',
            'city',
            'phone',
            'email',
            'opening_time',
            'closing_time',
        ]);

        try {
            $agency = $this->adminService->updateAgency($id, $data);

            return response()->json([
                'success' => true,
                'data' => new AgencyResource($agency),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse(
                $e,
                'Impossible de mettre à jour cette agence.',
                in_array($e->getCode(), [400,404]) ? $e->getCode() : 400,
                ['action' => 'admin.agencies.update', 'agency_id' => $id]
            );
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
            return $this->apiErrorResponse($e, 'Impossible de créer l\'agence.', 400, [
                'action' => 'admin.agencies.create',
            ]);
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
            return $this->apiErrorResponse($e, 'Impossible de récupérer les détails de l\'agence.', 404, [
                'action' => 'admin.agencies.show',
                'agency_id' => $id,
            ]);
        }
    }

    /**
     * Get vehicles belonging to an agency (super admin)
     */
    public function getAgencyVehicles(Request $request, $id)
    {
        try {
            $agency = Agency::findOrFail($id);
            $perPage = $this->resolvePerPage($request, 20, 100);

            $vehicles = Vehicle::with('agency')
                ->where('agency_id', $agency->id)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage)
                ->appends($request->query());

            return response()->json([
                'success' => true,
                'data' => VehicleResource::collection($vehicles->items()),
                'pagination' => $this->paginationMeta($vehicles),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de récupérer les véhicules de l\'agence.', 404, [
                'action' => 'admin.agencies.vehicles',
                'agency_id' => $id,
            ]);
        }
    }

    /**
     * Delete agency (super admin)
     */
    public function deleteAgency($id)
    {
        try {
            $agency = Agency::findOrFail($id);

            $vehicleIds = Vehicle::where('agency_id', $agency->id)->pluck('id');
            $hasActiveReservations = Reservation::whereIn('vehicle_id', $vehicleIds)
                ->whereIn('status', ['pending', 'confirmed', 'ongoing'])
                ->exists();

            if ($hasActiveReservations) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete agency with active reservations',
                ], 400);
            }

            $agency->delete();

            return response()->json([
                'success' => true,
                'message' => 'Agency deleted successfully',
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de supprimer cette agence.', 404, [
                'action' => 'admin.agencies.delete',
                'agency_id' => $id,
            ]);
        }
    }
}

