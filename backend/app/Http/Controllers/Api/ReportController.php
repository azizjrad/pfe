<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Http\Requests\UpdateReportStatusRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    private ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Get all active reports (for super_admin)
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Report::class);

        $perPage = $this->resolvePerPage($request, 25, 100);
        $reports = $this->reportService->getAll([], $perPage);

        return $this->apiSuccessResponse(null, ReportResource::collection($reports->items()), 200, [
            'pagination' => $this->paginationMeta($reports),
        ]);
    }

    /**
     * Get reports for agency's vehicles (for agency_admin)
     */
    public function getAgencyReports(Request $request)
    {
        $user = $request->user();
        $perPage = $this->resolvePerPage($request, 25, 100);

        if (!$user->agency_id) {
            return $this->apiErrorMessageResponse('No agency associated with this account', 404);
        }

        $reports = $this->reportService->getAgencyReports($user->agency_id, $perPage);

        return $this->apiSuccessResponse(null, ReportResource::collection($reports->items()), 200, [
            'pagination' => $this->paginationMeta($reports),
        ]);
    }

    /**
     * Get trashed reports (soft deleted, for super_admin)
     */
    public function getTrashed(Request $request)
    {
        $this->authorize('viewAny', Report::class);

        $perPage = $this->resolvePerPage($request, 25, 100);
        $reports = $this->reportService->getTrashed($perPage);

        return $this->apiSuccessResponse(null, ReportResource::collection($reports->items()), 200, [
            'pagination' => $this->paginationMeta($reports),
        ]);
    }

    /**
     * Create a new report
     */
    public function store(StoreReportRequest $request)
    {
        $this->authorize('create', Report::class);

        $validated = $request->validated();

        $report = $this->reportService->create($validated, auth()->id());

        return $this->apiSuccessResponse('Report created successfully', new ReportResource($report), 201);
    }

    /**
     * Update report status (resolve or dismiss)
     */
    public function updateStatus(UpdateReportStatusRequest $request, $id)
    {
        $report = Report::findOrFail($id);
        $this->authorize('update', $report);

        $validated = $request->validated();

        $report = $this->reportService->updateStatus($id, $validated['status'], $validated['admin_notes'] ?? null);

        return $this->apiSuccessResponse('Report status updated successfully', new ReportResource($report));
    }

    /**
     * Soft delete a report (move to trash)
     */
    public function destroy($id)
    {
        $report = Report::findOrFail($id);
        $this->authorize('delete', $report);

        $this->reportService->destroy($id);

        return $this->apiSuccessResponse('Report moved to trash');
    }

    /**
     * Restore a soft deleted report
     */
    public function restore($id)
    {
        $report = Report::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $report);

        $report = $this->reportService->restore($id);

        return $this->apiSuccessResponse('Report restored successfully', new ReportResource($report));
    }

    /**
     * Permanently delete a report (force delete)
     */
    public function forceDelete($id)
    {
        $report = Report::onlyTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $report);

        $this->reportService->permanentDelete($id);

        return $this->apiSuccessResponse('Report permanently deleted');
    }

    /**
     * Get reports submitted by a user (super_admin)
     */
    public function getUserReportsSubmitted(Request $request, $userId)
    {
        $this->authorize('viewAny', Report::class);

        $perPage = $this->resolvePerPage($request, 20, 100);

        $reports = Report::where('reported_by_user_id', $userId)
            ->whereNull('deleted_at')
            ->with('reportedBy')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, ReportResource::collection($reports->items()), 200, [
            'pagination' => $this->paginationMeta($reports),
        ]);
    }

    /**
     * Get reports against a user (super_admin)
     */
    public function getUserReportsAgainst(Request $request, $userId)
    {
        $this->authorize('viewAny', Report::class);

        $perPage = $this->resolvePerPage($request, 20, 100);

        $reports = Report::where('report_type', 'client')
            ->where('target_id', $userId)
            ->whereNull('deleted_at')
            ->with('reportedBy')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, ReportResource::collection($reports->items()), 200, [
            'pagination' => $this->paginationMeta($reports),
        ]);
    }

    /**
     * Get reports against an agency (super_admin)
     */
    public function getAgencyReportsAgainst(Request $request, $agencyId)
    {
        $this->authorize('viewAny', Report::class);

        $perPage = $this->resolvePerPage($request, 20, 100);

        $reports = Report::where('report_type', 'agency')
            ->where('target_id', $agencyId)
            ->whereNull('deleted_at')
            ->with('reportedBy')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, ReportResource::collection($reports->items()), 200, [
            'pagination' => $this->paginationMeta($reports),
        ]);
    }
}

