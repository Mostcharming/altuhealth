import { apiClient } from "@/lib/apiClient";

export interface EnrolleeBenefit {
  id: string;
  benefitName: string;
  benefitType: string;
  description?: string;
  isCovered?: boolean;
  coverageType?: string;
  coverageValue?: string;
  currency?: string;
  status: "active" | "inactive" | "pending" | "expired";
  amountUtilized?: number;
  remainingBalance?: number;
  limitPerAnnum?: number;
  startDate?: string;
  endDate?: string;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
  coverageAmount?: number;
}

export async function fetchEnrolleeBenefits(params: {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);

  return apiClient(
    `/enrollee/benefits/list?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );
}

export async function getEnrolleeBenefitById(benefitId: string) {
  return apiClient(`/enrollee/benefits/${benefitId}`, {
    method: "GET",
  });
}
