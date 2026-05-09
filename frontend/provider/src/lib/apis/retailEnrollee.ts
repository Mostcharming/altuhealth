import { apiClient } from "@/lib/apiClient";
import { RetailEnrollee } from "@/lib/store/retailEnrolleeStore";

export async function fetchRetailEnrollees(params: {
  limit?: number;
  page?: number;
  q?: string;
  isActive?: boolean;
  planId?: string;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("search", params.q);
  if (params.isActive !== undefined)
    queryParams.append("isActive", String(params.isActive));
  if (params.planId) queryParams.append("planId", params.planId);
  if (params.status) queryParams.append("status", params.status);

  return apiClient(`/admin/retail-enrollees?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getRetailEnrollee(id: string) {
  return apiClient(`/admin/retail-enrollees/${id}`, {
    method: "GET",
  });
}

export async function createRetailEnrollee(data: Partial<RetailEnrollee>) {
  return apiClient(`/admin/retail-enrollees`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateRetailEnrollee(
  id: string,
  data: Partial<RetailEnrollee>
) {
  return apiClient(`/admin/retail-enrollees/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteRetailEnrollee(id: string) {
  return apiClient(`/admin/retail-enrollees/${id}`, {
    method: "DELETE",
  });
}
