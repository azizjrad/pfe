<?php

namespace App\Http\Controllers\Api;

use App\Domain\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateAgencyRequest;
use App\Http\Requests\UpdateAgencyRequest;
use App\Http\Resources\AgencyResource;
use App\Services\AdminService;
use App\Services\AgencyService;
use App\Models\Agency;
use App\Models\Vehicle;
use App\Http\Resources\VehicleResource;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private AdminService $adminService;
    private AgencyService $agencyService;

    public function __construct(
        AdminService $adminService,
        AgencyService $agencyService
    ) {
        $this->adminService = $adminService;
        $this->agencyService = $agencyService;
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
     * Get clients list with reliability scores
     */
    public function getClients(Request $request)
    {
        $perPage = $this->resolvePerPage($request, 25, 100);
        $clients = $this->adminService->getClients($perPage);

        return $this->apiSuccessResponse(null, $clients->items(), 200, [
            'pagination' => $this->paginationMeta($clients),
        ]);
    }

    /**
     * Get financial statistics for platform
     */
    public function getFinancialStats(Request $request)
    {
        $filters = $request->validate([
            'agency_id' => ['nullable', 'integer', 'exists:agencies,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $stats = $this->adminService->getFinancialStats($filters);

        return $this->apiSuccessResponse(null, $stats);
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

}

