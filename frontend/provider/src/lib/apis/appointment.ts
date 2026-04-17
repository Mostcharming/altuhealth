import { apiClient } from "@/lib/apiClient";

export async function fetchAppointments(params: {
  limit?: number;
  page?: number;
  q?: string;
  status?: string;
  providerId?: string;
  enrolleeId?: string;
  companyId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.status) queryParams.append("status", params.status);
  if (params.providerId) queryParams.append("providerId", params.providerId);
  if (params.enrolleeId) queryParams.append("enrolleeId", params.enrolleeId);
  if (params.companyId) queryParams.append("companyId", params.companyId);

  return apiClient(`/provider/appointments/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getAppointmentById(id: string) {
  return apiClient(`/provider/appointments/${id}`, {
    method: "GET",
  });
}

export async function approveAppointment(id: string) {
  return apiClient(`/provider/appointments/${id}/status`, {
    method: "PATCH",
    body: { status: "approved" },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function rejectAppointment(id: string, rejectionReason: string) {
  return apiClient(`/provider/appointments/${id}/status`, {
    method: "PATCH",
    body: { status: "rejected", rejectionReason },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function fetchProviders(params: {
  limit?: number;
  page?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));

  return apiClient(`/admin/providers/list?${queryParams.toString()}`, {
    method: "GET",
  });
}
