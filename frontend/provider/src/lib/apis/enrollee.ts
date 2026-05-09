import { apiClient } from "@/lib/apiClient";
import { Enrollee } from "@/lib/store/enrolleeStore";

export async function fetchEnrollees(params: {
  limit?: number;
  page?: number;
  q?: string;
  isActive?: boolean;
  companyId?: string;
  companyPlanId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("search", params.q);
  if (params.isActive !== undefined)
    queryParams.append("isActive", String(params.isActive));
  if (params.companyId) queryParams.append("companyId", params.companyId);
  if (params.companyPlanId)
    queryParams.append("companyPlanId", params.companyPlanId);

  return apiClient(`/admin/enrollees?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getEnrollee(id: string) {
  return apiClient(`/admin/enrollees/${id}`, {
    method: "GET",
  });
}

export async function updateEnrollee(id: string, data: Partial<Enrollee>) {
  return apiClient(`/admin/enrollees/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteEnrollee(id: string) {
  return apiClient(`/admin/enrollees/${id}`, {
    method: "DELETE",
  });
}
