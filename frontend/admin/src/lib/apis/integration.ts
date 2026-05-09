import { apiClient } from "@/lib/apiClient";

export interface Integration {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  base_url?: string;
  secret_key?: string;
  public_key?: string;
  api_key?: string;
  api_secret?: string;
  webhook_url?: string;
  webhook_secret?: string;
  additional_config?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export async function fetchIntegrations(params: {
  limit?: number;
  page?: number;
  q?: string;
  is_active?: boolean;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.is_active !== undefined)
    queryParams.append("is_active", String(params.is_active));

  return apiClient(`/admin/integrations/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getIntegration(id: string) {
  return apiClient(`/admin/integrations/${id}`, {
    method: "GET",
  });
}

export async function createIntegration(data: {
  name: string;
  description?: string;
  base_url?: string;
  secret_key?: string;
  public_key?: string;
  api_key?: string;
  api_secret?: string;
  webhook_url?: string;
  webhook_secret?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additional_config?: Record<string, any>;
}) {
  return apiClient("/admin/integrations", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateIntegration(
  id: string,
  data: Partial<Omit<Integration, "id" | "created_at" | "updated_at">>
) {
  return apiClient(`/admin/integrations/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteIntegration(id: string) {
  return apiClient(`/admin/integrations/${id}`, {
    method: "DELETE",
  });
}

export async function toggleIntegrationStatus(id: string, isActive: boolean) {
  return apiClient(`/admin/integrations/${id}/toggle-status`, {
    method: "PATCH",
    body: { is_active: isActive },
    headers: {
      "Content-Type": "application/json",
    },
  });
}
