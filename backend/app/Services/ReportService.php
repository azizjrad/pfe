<?php

namespace App\Services;

use App\Models\Report;
use App\Models\UserNotification;

class ReportService
{
    /**
     * Get all reports (active)
     */
    public function getAll(array $filters = [], int $perPage = 25)
    {
        $query = Report::whereNull('deleted_at');

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['report_type'])) {
            $query->where('report_type', $filters['report_type']);
        }

        return $query->with('reportedBy')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get reports for a specific agency
     */
    public function getAgencyReports(int $agencyId, int $perPage = 25)
    {
        return Report::whereNull('deleted_at')
            ->where('report_type', 'agency')
            ->where('target_id', $agencyId)
            ->with('reportedBy')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get soft-deleted (trashed) reports
     */
    public function getTrashed(int $perPage = 25)
    {
        return Report::whereNotNull('deleted_at')
            ->with('reportedBy')
            ->orderBy('deleted_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Create new report
     */
    public function create(array $data, int $reportedByUserId): Report
    {
        return Report::create([
            'reported_by_user_id' => $reportedByUserId,
            'reported_by_name' => $data['reported_by_name'] ?? null,
            'report_type' => $data['report_type'],
            'target_id' => $data['target_id'],
            'target_name' => $data['target_name'] ?? null,
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
            'status' => 'open',
        ]);
    }

    /**
     * Update report status
     */
    public function updateStatus(int $reportId, string $status, ?string $adminNotes = null): Report
    {
        $report = Report::findOrFail($reportId);
        $previousStatus = $report->status;

        $validStatuses = ['open', 'investigating', 'resolved', 'dismissed'];

        if (!in_array($status, $validStatuses)) {
            throw new \Exception("Invalid status: {$status}");
        }

        $payload = ['status' => $status];

        if ($adminNotes !== null) {
            $payload['admin_notes'] = $adminNotes;
        }

        if (in_array($status, ['resolved', 'dismissed'])) {
            $payload['resolved_at'] = now();
        }

        $report->update($payload);

        // Notify the reporting user when the report receives a response from admin.
        if (
            $report->reported_by_user_id &&
            $previousStatus !== $status &&
            in_array($status, ['investigating', 'resolved', 'dismissed'])
        ) {
            $statusText = [
                'investigating' => 'en cours d\'investigation',
                'resolved' => 'résolu',
                'dismissed' => 'rejeté',
            ][$status] ?? $status;

            UserNotification::create([
                'user_id' => $report->reported_by_user_id,
                'type' => 'report_response',
                'title' => 'Réponse à votre signalement',
                'message' => "Votre signalement concernant {$report->target_name} a été {$statusText}.",
                'data' => [
                    'report_id' => $report->id,
                    'status' => $status,
                    'admin_notes' => $adminNotes,
                ],
            ]);
        }

        return $report;
    }

    /**
     * Soft delete a report
     */
    public function destroy(int $reportId): void
    {
        $report = Report::findOrFail($reportId);
        $report->delete();
    }

    /**
     * Restore soft-deleted report
     */
    public function restore(int $reportId): Report
    {
        $report = Report::onlyTrashed()->findOrFail($reportId);
        $report->restore();
        return $report;
    }

    /**
     * Permanently delete report
     */
    public function permanentDelete(int $reportId): void
    {
        $report = Report::onlyTrashed()->findOrFail($reportId);
        $report->forceDelete();
    }

    /**
     * Auto-purge reports older than 30 days
     */
    public function autoPurgeOldReports(): int
    {
        $cutoffDate = now()->subDays(30);
        return Report::whereNotNull('deleted_at')
            ->where('deleted_at', '<', $cutoffDate)
            ->forceDelete();
    }
}
