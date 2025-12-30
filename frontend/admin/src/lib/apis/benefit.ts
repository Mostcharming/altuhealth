import { apiClient } from "@/lib/apiClient";

export interface Benefit {
  id: string;
  name: string;
  description?: string;
  limit?: string;
  amount?: number;
  isCovered: boolean;
  coverageType?: string;
  coverageValue?: string;
  benefitCategoryId: string;
}

export async function fetchBenefitsByCategory(benefitCategoryId: string) {
  return apiClient(
    `/admin/benefits/list?benefitCategoryId=${benefitCategoryId}&limit=all`,
    {
      method: "GET",
    }
  );
}

export async function addBenefitToCompanyPlan(
  companyPlanId: string,
  benefitId: string
) {
  return apiClient("/admin/company-plans/benefits/add", {
    method: "POST",
    body: { companyPlanId, benefitId },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function removeBenefitFromCompanyPlan(
  companyPlanId: string,
  benefitId: string
) {
  return apiClient(
    `/admin/company-plans/benefits/${companyPlanId}/${benefitId}`,
    {
      method: "DELETE",
    }
  );
}

export async function addBenefitToPlan(planId: string, benefitId: string) {
  return apiClient("/admin/plans/benefits/add", {
    method: "POST",
    body: { planId, benefitId },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function removeBenefitFromPlan(planId: string, benefitId: string) {
  return apiClient(`/admin/plans/benefits/${planId}/${benefitId}`, {
    method: "DELETE",
  });
}
