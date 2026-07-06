import { apiClient } from "@/lib/apiClient";
import { Company } from "@/lib/store/companyStore";

export async function fetchCompanies(params: {
  limit?: number;
  page?: number;
  q?: string;
  isActive?: boolean;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.isActive !== undefined)
    queryParams.append("isActive", String(params.isActive));

  return apiClient(`/admin/companies/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getCompany(id: string) {
  return apiClient(`/admin/companies/${id}`, {
    method: "GET",
  });
}

export async function createCompany(data: {
  name: string;
  email: string;
  phoneNumber?: string;
}) {
  return apiClient("/admin/companies", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateCompany(
  id: string,
  data: Partial<Pick<Company, "name" | "email" | "phoneNumber" | "isActive">>
) {
  return apiClient(`/admin/companies/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteCompany(id: string) {
  return apiClient(`/admin/companies/${id}`, {
    method: "DELETE",
  });
}
