<?php

namespace App\Http\Controllers\Api;

use App\Domain\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateAgencyRequest;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\SuspendUserRequest;
use App\Http\Requests\UpdateAgencyRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\AgencyResource;
use App\Services\AdminService;
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
    private AgencyService $agencyService;
    private ClientService $clientService;

    public function __construct(
        AdminService $adminService,
        AgencyService $agencyService,
        ClientService $clientService
    ) {
        $this->adminService = $adminService;
        $this->agencyService = $agencyService;
        $this->clientService = $clientService;
    }

    /**
     * Get platform-wide statistics for admin dashboard
     */
    public function getDashboardStats()
    {
        $stats = $this->adminService->getDashboardStats();

        return $this->apiSuccessResponse(null, $stats);
    }

    /**
     * Get all users with their details
     */
    public function getUsers(Request $request)
    {
        $perPage = $this->resolvePerPage($request, 25, 100);
        $users = $this->adminService->getUsers([], $perPage);

        return $this->apiSuccessResponse(null, UserResource::collection($users->items()), 200, [
            'pagination' => $this->paginationMeta($users),
        ]);
    }

    /**
     * Get agencies list
     */
    public function getAgencies(Request $request)
    {
        $perPage = $this->resolvePerPage($request, 25, 100);
        $agencies = $this->adminService->getAgencies($perPage);

        return $this->apiSuccessResponse(null, $agencies->items(), 200, [
            'pagination' => $this->paginationMeta($agencies),
        ]);
    }

    /**
     * Get financial statistics for platform
     */
    public function getFinancialStats()
    {
        $stats = $this->adminService->getFinancialStats();

        return $this->apiSuccessResponse(null, $stats);
    }

    /**
     * Get user details
     */
    public function getUserDetails($id)
    {
        $user = $this->adminService->getUserDetails($id);

        return $this->apiSuccessResponse(null, new UserResource($user));
    }

    /**
     * Create a new user (super admin)
     */
    public function createUser(CreateUserRequest $request)
    {
        $data = $request->validated();

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

        return $this->apiSuccessResponse(null, new UserResource($user), 201);
    }

    /**
     * Suspend user
     */
    public function suspendUser(SuspendUserRequest $request, $id)
    {
        $validated = $request->validated();

        $this->adminService->suspendUser($id, $validated['reason']);

        return $this->apiSuccessResponse('User suspended successfully');
    }

    /**
     * Unsuspend user
     */
    public function unsuspendUser($id)
    {
        $this->adminService->unsuspendUser($id);

        return $this->apiSuccessResponse('User unsuspended successfully');
    }

    /**
     * Delete user
     */
    public function deleteUser($id)
    {
        $this->adminService->deleteUser($id, auth()->id());

        return $this->apiSuccessResponse('User deleted successfully');
    }

    /**
     * Update user (suspend toggle or profile fields)
     */
    public function updateUser(UpdateUserRequest $request, $id)
    {
        $data = $request->validated();

        $user = $this->adminService->updateUser($id, $data);

        return $this->apiSuccessResponse(null, new UserResource($user));
    }

    /**
     * Update agency (e.g., status)
     */
    public function updateAgency(UpdateAgencyRequest $request, $id)
    {
        $data = $request->validated();

        $agency = $this->adminService->updateAgency($id, $data);

        return $this->apiSuccessResponse(null, new AgencyResource($agency));
    }

    /**
     * Create a new agency
     */
    public function createAgency(CreateAgencyRequest $request)
    {
        $data = $request->validated();

        $agency = $this->agencyService->create($data);

        return $this->apiSuccessResponse(null, new AgencyResource($agency), 201);
    }

    /**
     * Get agency details
     */
    public function getAgencyDetails($id)
    {
        $agency = $this->adminService->getAgencyDetails($id);

        return $this->apiSuccessResponse(null, new AgencyResource($agency));
    }

    /**
     * Get vehicles belonging to an agency (super admin)
     */
    public function getAgencyVehicles(Request $request, $id)
    {
        $agency = Agency::findOrFail($id);
        $perPage = $this->resolvePerPage($request, 20, 100);

        $vehicles = Vehicle::with('agency')
            ->where('agency_id', $agency->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, VehicleResource::collection($vehicles->items()), 200, [
            'pagination' => $this->paginationMeta($vehicles),
        ]);
    }

    /**
     * Delete agency (super admin)
     */
    public function deleteAgency($id)
    {
        $agency = Agency::findOrFail($id);

        $vehicleIds = Vehicle::where('agency_id', $agency->id)->pluck('id');
        $hasActiveReservations = Reservation::whereIn('vehicle_id', $vehicleIds)
            ->whereIn('status', ReservationStatus::activeValues())
            ->exists();

        if ($hasActiveReservations) {
            return $this->apiErrorMessageResponse('Cannot delete agency with active reservations', 400);
        }

        $agency->delete();

        return $this->apiSuccessResponse('Agency deleted successfully');
    }
}

