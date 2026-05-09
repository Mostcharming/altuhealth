import { apiClient } from "@/lib/apiClient";

export async function fetchJobs(params: {
  limit?: number;
  page?: number;
  q?: string;
  isActive?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.isActive) queryParams.append("isActive", params.isActive);

  return apiClient(`/admin/jobs/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getJobById(id: string) {
  return apiClient(`/admin/jobs/${id}`, {
    method: "GET",
  });
}

export async function runJob(id: string) {
  return apiClient(`/admin/jobs/${id}/run`, {
    method: "POST",
  });
}

export async function updateJob(
  id: string,
  data: {
    isActive?: boolean;
    cronExpression?: string;
    metadata?: Record<string, unknown>;
  }
) {
  return apiClient(`/admin/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
