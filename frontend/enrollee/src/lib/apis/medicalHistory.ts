import { apiClient } from "@/lib/apiClient";

export async function fetchMedicalHistories(params: {
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

  return apiClient(`/enrollee/medical-history/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getMedicalHistoryById(id: string) {
  return apiClient(`/enrollee/medical-history/${id}`, {
    method: "GET",
  });
}
