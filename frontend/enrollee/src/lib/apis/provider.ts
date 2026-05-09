import { apiClient } from "@/lib/apiClient";

export interface Provider {
  id: string;
  name: string;
  category: "primary" | "secondary" | "tertiary" | "specialized";
  email: string;
  phoneNumber: string;
  currentLocation: string;
  state: string;
  lga: string;
  address: string;
  website?: string;
  status: "active" | "inactive" | "suspended" | "pending_approval";
  picture?: string;
  providerSpecializationId?: string;
  providerSpecialization?: {
    id: string;
    name: string;
    description?: string;
  };
}

export async function fetchProviders(params: {
  limit?: number;
  page?: number;
  q?: string;
  state?: string;
  lga?: string;
  specialization?: string;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.state) queryParams.append("state", params.state);
  if (params.lga) queryParams.append("lga", params.lga);
  if (params.specialization)
    queryParams.append("specialization", params.specialization);
  if (params.status) queryParams.append("status", "active");

  return apiClient(`/admin/providers/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getProviderById(id: string) {
  return apiClient(`/admin/providers/${id}`, {
    method: "GET",
  });
}

export async function fetchProviderSpecializations() {
  return apiClient(`/admin/provider-specializations/list?limit=all`, {
    method: "GET",
  });
}
