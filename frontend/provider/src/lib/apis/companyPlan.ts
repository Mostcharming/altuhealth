import { apiClient } from "@/lib/apiClient";
import { CompanyPlan } from "@/lib/store/companyPlanStore";

export async function fetchCompanyPlans(params: {
  limit?: number;
  page?: number;
  q?: string;
  companyId?: string;
  isActive?: boolean;
  planId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.companyId) queryParams.append("companyId", params.companyId);
  if (params.isActive !== undefined)
    queryParams.append("isActive", String(params.isActive));
  if (params.planId) queryParams.append("planId", params.planId);

  return apiClient(`/admin/company-plans/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getCompanyPlan(id: string) {
  return apiClient(`/admin/company-plans/${id}`, {
    method: "GET",
  });
}

export async function createCompanyPlan(
  data: Omit<CompanyPlan, "id" | "createdAt" | "updatedAt">
) {
  return apiClient("/admin/company-plans", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateCompanyPlan(
  id: string,
  data: Partial<Omit<CompanyPlan, "id" | "createdAt" | "updatedAt">>
) {
  return apiClient(`/admin/company-plans/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteCompanyPlan(id: string) {
  return apiClient(`/admin/company-plans/${id}`, {
    method: "DELETE",
  });
}

// Benefit categories
export async function addBenefitCategory(
  companyPlanId: string,
  benefitCategoryId: string
) {
  return apiClient("/admin/company-plans/benefit-categories/add", {
    method: "POST",
    body: { companyPlanId, benefitCategoryId },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function removeBenefitCategory(
  companyPlanId: string,
  benefitCategoryId: string
) {
  return apiClient(
    `/admin/company-plans/benefit-categories/${companyPlanId}/${benefitCategoryId}`,
    {
      method: "DELETE",
    }
  );
}

// Exclusions
export async function addExclusion(companyPlanId: string, exclusionId: string) {
  return apiClient("/admin/company-plans/exclusions/add", {
    method: "POST",
    body: { companyPlanId, exclusionId },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function removeExclusion(
  companyPlanId: string,
  exclusionId: string
) {
  return apiClient(
    `/admin/company-plans/exclusions/${companyPlanId}/${exclusionId}`,
    {
      method: "DELETE",
    }
  );
}

// Providers
export async function addProvider(companyPlanId: string, providerId: string) {
  return apiClient("/admin/company-plans/providers/add", {
    method: "POST",
    body: { companyPlanId, providerId },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function removeProvider(
  companyPlanId: string,
  providerId: string
) {
  return apiClient(
    `/admin/company-plans/providers/${companyPlanId}/${providerId}`,
    {
      method: "DELETE",
    }
  );
}
