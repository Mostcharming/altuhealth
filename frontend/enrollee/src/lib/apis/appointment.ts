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

  return apiClient(`/enrollee/appointments/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getAppointmentById(id: string) {
  return apiClient(`/enrollee/appointments/${id}`, {
    method: "GET",
  });
}

export async function createAppointment(data: {
  providerId: string;
  companyId?: string;
  subsidiaryId?: string;
  complaint?: string;
  appointmentDateTime: string;
  notes?: string;
}) {
  return apiClient("/enrollee/appointments", {
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
  return apiClient(`/enrollee/appointments/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function cancelAppointment(id: string) {
  return apiClient(`/enrollee/appointments/${id}/cancel`, {
    method: "PATCH",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchProviders(params: { limit?: any; page?: number }) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  return apiClient(`/admin/providers/list?${queryParams.toString()}`, {
    method: "GET",
  });
}
