import { apiClient } from "@/lib/apiClient";
import { CompanySubsidiary } from "@/lib/store/companySubsidiaryStore";

export async function fetchCompanySubsidiaries(params: {
  limit?: number;
  page?: number;
  q?: string;
  companyId?: string;
  isActive?: boolean;
  subsidiaryType?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.companyId) queryParams.append("companyId", params.companyId);
  if (params.isActive !== undefined)
    queryParams.append("isActive", String(params.isActive));
  if (params.subsidiaryType)
    queryParams.append("subsidiaryType", params.subsidiaryType);

  return apiClient(
    `/admin/company-subsidiaries/list?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );
}

export async function getCompanySubsidiary(id: string) {
  return apiClient(`/admin/company-subsidiaries/${id}`, {
    method: "GET",
  });
}

export async function createCompanySubsidiary(
  data: Omit<CompanySubsidiary, "id" | "createdAt" | "updatedAt">
) {
  return apiClient("/admin/company-subsidiaries", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateCompanySubsidiary(
  id: string,
  data: Partial<Omit<CompanySubsidiary, "id" | "createdAt" | "updatedAt">>
) {
  return apiClient(`/admin/company-subsidiaries/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteCompanySubsidiary(id: string) {
  return apiClient(`/admin/company-subsidiaries/${id}`, {
    method: "DELETE",
  });
}

export async function deleteAllSubsidiariesByCompany(companyId: string) {
  return apiClient(`/admin/company-subsidiaries/company/${companyId}`, {
    method: "DELETE",
  });
}
