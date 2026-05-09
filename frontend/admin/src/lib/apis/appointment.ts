import { apiClient } from "@/lib/apiClient";
import { Appointment } from "@/lib/store/appointmentStore";

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

  return apiClient(`/admin/appointments/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getAppointmentById(id: string) {
  return apiClient(`/admin/appointments/${id}`, {
    method: "GET",
  });
}

export async function createAppointment(data: {
  enrolleeId: string;
  providerId: string;
  companyId: string;
  subsidiaryId?: string;
  complaint?: string;
  appointmentDateTime: string;
  notes?: string;
}) {
  return apiClient("/admin/appointments", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateAppointment(
  id: string,
  data: Partial<Appointment>
) {
  return apiClient(`/admin/appointments/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteAppointment(id: string) {
  return apiClient(`/admin/appointments/${id}`, {
    method: "DELETE",
  });
}

export async function approveAppointment(id: string) {
  return apiClient(`/admin/appointments/${id}/approve`, {
    method: "PATCH",
  });
}

export async function rejectAppointment(id: string, rejectionReason?: string) {
  return apiClient(`/admin/appointments/${id}/reject`, {
    method: "PATCH",
    body: rejectionReason ? { rejectionReason } : {},
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function markAppointmentAttended(id: string) {
  return apiClient(`/admin/appointments/${id}/attended`, {
    method: "PATCH",
  });
}

export async function markAppointmentMissed(id: string) {
  return apiClient(`/admin/appointments/${id}/missed`, {
    method: "PATCH",
  });
}

export async function cancelAppointment(id: string) {
  return apiClient(`/admin/appointments/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function rescheduleAppointment(
  id: string,
  appointmentDateTime: string
) {
  return apiClient(`/admin/appointments/${id}/reschedule`, {
    method: "PATCH",
    body: { appointmentDateTime },
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
