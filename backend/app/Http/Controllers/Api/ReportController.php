<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
            $reports = $this->reportService->getAll();

            return response()->json([
                'success' => true,
                'data' => ReportResource::collection($reports),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get reports for agency's vehicles (for agency_admin)
     */
    public function getAgencyReports(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->agency_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No agency associated with this account',
                ], 404);
            }

            $reports = $this->reportService->getAgencyReports($user->agency_id);

            return response()->json([
                'success' => true,
                'data' => ReportResource::collection($reports),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get trashed reports (soft deleted, for super_admin)
     */
    public function getTrashed(Request $request)
    {
        $this->authorize('viewAny', Report::class);

        try {
            $reports = $this->reportService->getTrashed();

            return response()->json([
                'success' => true,
                'data' => ReportResource::collection($reports),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new report
     */
    public function store(Request $request)
    {
        $this->authorize('create', Report::class);

        $validated = $request->validate([
            'report_type' => 'required|in:vehicle,agency,client',
            'target_id' => 'required|integer',
            'target_name' => 'required|string|max:255',
            'reason' => 'required|string|max:255',
            'description' => 'required|string',
            'reported_by_name' => 'required|string|max:255',
        ]);

        try {
            $report = $this->reportService->create($validated, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Report created successfully',
                'data' => new ReportResource($report),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update report status (resolve or dismiss)
     */
    public function updateStatus(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        $this->authorize('update', $report);

        $validated = $request->validate([
            'status' => 'required|in:open,investigating,resolved,dismissed',
            'admin_notes' => 'required_if:status,resolved,dismissed|string',
        ]);

        try {
            $report = $this->reportService->updateStatus($id, $validated['status'], $validated['admin_notes'] ?? null);

            return response()->json([
                'success' => true,
                'message' => 'Report status updated successfully',
                'data' => new ReportResource($report),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

