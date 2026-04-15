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

        try {
            $perPage = $this->resolvePerPage($request, 25, 100);
            $reports = $this->reportService->getAll([], $perPage);

            return response()->json([
                'success' => true,
                'data' => ReportResource::collection($reports->items()),
                'pagination' => $this->paginationMeta($reports),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de récupérer les signalements.', 500, [
                'action' => 'reports.index',
            ]);
        }
    }

    /**
     * Get reports for agency's vehicles (for agency_admin)
     */
    public function getAgencyReports(Request $request)
    {
        try {
            $user = $request->user();
            $perPage = $this->resolvePerPage($request, 25, 100);

            if (!$user->agency_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No agency associated with this account',
                ], 404);
            }

            $reports = $this->reportService->getAgencyReports($user->agency_id, $perPage);

            return response()->json([
                'success' => true,
                'data' => ReportResource::collection($reports->items()),
                'pagination' => $this->paginationMeta($reports),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de récupérer les signalements de l\'agence.', 500, [
                'action' => 'reports.agency',
            ]);
        }
    }

    /**
     * Get trashed reports (soft deleted, for super_admin)
     */
    public function getTrashed(Request $request)
    {
        $this->authorize('viewAny', Report::class);

        try {
            $perPage = $this->resolvePerPage($request, 25, 100);
            $reports = $this->reportService->getTrashed($perPage);

            return response()->json([
                'success' => true,
                'data' => ReportResource::collection($reports->items()),
                'pagination' => $this->paginationMeta($reports),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de récupérer la corbeille des signalements.', 500, [
                'action' => 'reports.trashed',
            ]);
        }
    }

    /**
     * Create a new report
     */
    public function store(StoreReportRequest $request)
    {
        $this->authorize('create', Report::class);

        $validated = $request->validated();

        try {
            $report = $this->reportService->create($validated, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Report created successfully',
                'data' => new ReportResource($report),
            ], 201);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de creer le signalement.', 500, [
                'action' => 'reports.store',
                'user_id' => auth()->id(),
            ]);
        }
    }

    /**
     * Update report status (resolve or dismiss)
     */
    public function updateStatus(UpdateReportStatusRequest $request, $id)
    {
        $report = Report::findOrFail($id);
        $this->authorize('update', $report);

        $validated = $request->validated();

        try {
            $report = $this->reportService->updateStatus($id, $validated['status'], $validated['admin_notes'] ?? null);

            return response()->json([
                'success' => true,
                'message' => 'Report status updated successfully',
                'data' => new ReportResource($report),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de mettre a jour le statut du signalement.', 500, [
                'action' => 'reports.update_status',
                'report_id' => $id,
            ]);
        }
    }

    /**
     * Soft delete a report (move to trash)
     */
    public function destroy($id)
    {
        $report = Report::findOrFail($id);
        $this->authorize('delete', $report);

        try {
            $this->reportService->destroy($id);

            return response()->json([
                'success' => true,
                'message' => 'Report moved to trash',
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de supprimer le signalement.', 500, [
                'action' => 'reports.destroy',
                'report_id' => $id,
            ]);
        }
    }

    /**
     * Restore a soft deleted report
     */
    public function restore($id)
    {
        $report = Report::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $report);

        try {
            $report = $this->reportService->restore($id);

            return response()->json([
                'success' => true,
                'message' => 'Report restored successfully',
                'data' => new ReportResource($report),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de restaurer le signalement.', 500, [
                'action' => 'reports.restore',
                'report_id' => $id,
            ]);
        }
    }

    /**
     * Permanently delete a report (force delete)
     */
    public function forceDelete($id)
    {
        $report = Report::onlyTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $report);

        try {
            $this->reportService->permanentDelete($id);

            return response()->json([
                'success' => true,
                'message' => 'Report permanently deleted',
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de supprimer definitivement le signalement.', 500, [
                'action' => 'reports.force_delete',
                'report_id' => $id,
            ]);
        }
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

        return response()->json([
            'success' => true,
            'data' => ReportResource::collection($reports->items()),
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

        return response()->json([
            'success' => true,
            'data' => ReportResource::collection($reports->items()),
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

        return response()->json([
            'success' => true,
            'data' => ReportResource::collection($reports->items()),
            'pagination' => $this->paginationMeta($reports),
        ]);
    }
}

