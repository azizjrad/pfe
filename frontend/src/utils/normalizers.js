export const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export const normalizeReport = (report = {}) => ({
  id: report.id,
  report_type: report.report_type || report.reportType,
  target_id: report.target_id || report.targetId,
  target_name: report.target_name || report.targetName,
  reason: report.reason,
  description: report.description,
  reported_by_name: report.reported_by_name || report.reportedBy,
  created_at: report.created_at || report.reportedAt,
  status: report.status,
  admin_notes: report.admin_notes || report.adminNotes,
  resolved_at: report.resolved_at || report.resolvedAt,
});

export const normalizeReports = (payload) =>
  normalizeArray(payload).map((report) => normalizeReport(report));
