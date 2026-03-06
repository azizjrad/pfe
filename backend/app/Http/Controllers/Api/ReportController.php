<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Get all active reports (for super_admin)
     */
    public function index(Request $request)
    {
        try {
            $reports = Report::whereNull('deleted_at')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reports,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des signalements',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get trashed reports (soft deleted, for super_admin)
     */
    public function getTrashed(Request $request)
    {
        try {
            $reports = Report::onlyTrashed()
                ->orderBy('deleted_at', 'desc')
                ->get()
                ->map(function ($report) {
                    // Calculate auto-delete date (30 days after soft delete)
                    $autoDeleteAt = Carbon::parse($report->deleted_at)->addDays(30);
                    $report->auto_delete_at = $autoDeleteAt->toISOString();
                    return $report;
                });

            return response()->json([
                'success' => true,
                'data' => $reports,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la corbeille',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new report
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'report_type' => 'required|in:vehicle,agency,client',
            'target_id' => 'required|integer',
            'target_name' => 'required|string|max:255',
            'reason' => 'required|string|max:255',
            'description' => 'required|string',
            'reported_by_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $report = Report::create([
                'report_type' => $request->report_type,
                'target_id' => $request->target_id,
                'target_name' => $request->target_name,
                'reason' => $request->reason,
                'description' => $request->description,
                'reported_by_user_id' => auth()->id(),
                'reported_by_name' => $request->reported_by_name,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Signalement créé avec succès',
                'data' => $report,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du signalement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resolve a report (super_admin only)
     */
    public function resolve(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'admin_notes' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Les notes administratives sont requises',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $report = Report::findOrFail($id);

            $report->update([
                'status' => 'resolved',
                'admin_notes' => $request->admin_notes,
                'resolved_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Signalement résolu avec succès',
                'data' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la résolution du signalement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Dismiss a report (super_admin only)
     */
    public function dismiss(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'admin_notes' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Les notes administratives sont requises',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $report = Report::findOrFail($id);

            $report->update([
                'status' => 'dismissed',
                'admin_notes' => $request->admin_notes,
                'resolved_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Signalement rejeté avec succès',
                'data' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du rejet du signalement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Soft delete a report (move to trash)
     */
    public function destroy($id)
    {
        try {
            $report = Report::findOrFail($id);
            $report->delete(); // Soft delete

            return response()->json([
                'success' => true,
                'message' => 'Signalement déplacé vers la corbeille',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du signalement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restore a soft deleted report
     */
    public function restore($id)
    {
        try {
            $report = Report::onlyTrashed()->findOrFail($id);
            $report->restore();

            return response()->json([
                'success' => true,
                'message' => 'Signalement restauré avec succès',
                'data' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la restauration du signalement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Permanently delete a report (force delete)
     */
    public function forceDelete($id)
    {
        try {
            $report = Report::withTrashed()->findOrFail($id);
            $report->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Signalement supprimé définitivement',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression définitive',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clean up old trashed reports (30+ days old)
     * This can be called by a scheduled task
     */
    public function cleanOldTrash()
    {
        try {
            $thirtyDaysAgo = Carbon::now()->subDays(30);

            $deletedCount = Report::onlyTrashed()
                ->where('deleted_at', '<=', $thirtyDaysAgo)
                ->forceDelete();

            return response()->json([
                'success' => true,
                'message' => "Nettoyage terminé: {$deletedCount} signalement(s) supprimé(s)",
                'deleted_count' => $deletedCount,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du nettoyage',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
