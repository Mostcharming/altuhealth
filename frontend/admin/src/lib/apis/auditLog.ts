import { apiClient } from "@/lib/apiClient";

export async function fetchAuditLogs(params: {
  limit?: number;
  page?: number;
  q?: string;
  userId?: string;
  userType?: string;
  action?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.userId) queryParams.append("userId", params.userId);
  if (params.userType) queryParams.append("userType", params.userType);
  if (params.action) queryParams.append("action", params.action);

  return apiClient(`/admin/audit-logs/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getAuditLogById(id: string) {
  return apiClient(`/admin/audit-logs/${id}`, {
    method: "GET",
  });
}
