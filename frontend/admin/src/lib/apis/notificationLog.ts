import { apiClient } from "@/lib/apiClient";

export async function fetchNotificationLogs(params: {
  limit?: number;
  page?: number;
  q?: string;
  userId?: string;
  userType?: string;
  notificationType?: string;
  sentTo?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.userId) queryParams.append("userId", params.userId);
  if (params.userType) queryParams.append("userType", params.userType);
  if (params.notificationType)
    queryParams.append("notificationType", params.notificationType);
  if (params.sentTo) queryParams.append("sentTo", params.sentTo);

  return apiClient(`/admin/notification-logs/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getNotificationLogById(id: string) {
  return apiClient(`/admin/notification-logs/${id}`, {
    method: "GET",
  });
}
