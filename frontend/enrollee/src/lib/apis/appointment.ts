import { apiClient } from "@/lib/apiClient";
import { Appointment } from "@/lib/store/appointmentStore";

export async function fetchAppointments(params: {
  limit?: number;
  page?: number;
  q?: string;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.status) queryParams.append("status", params.status);

  return apiClient(`/appointments/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getAppointmentById(id: string) {
  return apiClient(`/appointments/${id}`, {
    method: "GET",
  });
}

export async function createAppointment(data: {
  providerId: string;
  companyId: string;
  subsidiaryId?: string;
  complaint?: string;
  appointmentDateTime: string;
  notes?: string;
}) {
  return apiClient("/appointments", {
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
  return apiClient(`/appointments/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function cancelAppointment(id: string) {
  return apiClient(`/appointments/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function fetchProviders(params: {
  limit?: number;
  page?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));

  return apiClient(`/providers/list?${queryParams.toString()}`, {
    method: "GET",
  });
}
