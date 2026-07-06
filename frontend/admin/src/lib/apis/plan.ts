import { apiClient } from "@/lib/apiClient";

export interface Plan {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt?: string;
  updatedAt?: string;
  benefitCategories?: BenefitCategory[];
  exclusions?: Exclusion[];
  providers?: Provider[];
}

export interface BenefitCategory {
  id: string;
  name: string;
}

export interface Exclusion {
  id: string;
  description: string;
}

export interface Provider {
  id: string;
  name: string;
}

export async function fetchPlans(
  params: {
    limit?: unknown;
    page?: number;
    q?: string;
    isActive?: boolean;
  } = {}
) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.isActive !== undefined)
    queryParams.append("isActive", String(params.isActive));

  return apiClient(`/admin/plans/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getPlan(id: string) {
  return apiClient(`/admin/plans/${id}`, {
    method: "GET",
  });
}

export async function createPlan(
  data: Omit<Plan, "id" | "createdAt" | "updatedAt">
) {
  return apiClient("/admin/plans", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updatePlan(
  id: string,
  data: Partial<Omit<Plan, "id" | "createdAt" | "updatedAt">>
) {
  return apiClient(`/admin/plans/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deletePlan(id: string) {
  return apiClient(`/admin/plans/${id}`, {
    method: "DELETE",
  });
}

// Benefit categories
export async function addBenefitCategory(
  planId: string,
  benefitCategoryId: string
) {
  return apiClient("/admin/plans/benefit-categories/add", {
    method: "POST",
    body: { planId, benefitCategoryId },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function removeBenefitCategory(
  planId: string,
  benefitCategoryId: string
) {
  return apiClient(
    `/admin/plans/benefit-categories/${planId}/${benefitCategoryId}`,
    {
      method: "DELETE",
    }
  );
}

// Exclusions
export async function addExclusion(planId: string, exclusionId: string) {
  return apiClient("/admin/plans/exclusions/add", {
    method: "POST",
    body: { planId, exclusionId },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function removeExclusion(planId: string, exclusionId: string) {
  return apiClient(`/admin/plans/exclusions/${planId}/${exclusionId}`, {
    method: "DELETE",
  });
}

// Providers
export async function addProvider(planId: string, providerId: string) {
  return apiClient("/admin/plans/providers/add", {
    method: "POST",
    body: { planId, providerId },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function removeProvider(planId: string, providerId: string) {
  return apiClient(`/admin/plans/providers/${planId}/${providerId}`, {
    method: "DELETE",
  });
}
