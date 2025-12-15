import { apiClient } from "@/lib/apiClient";

export async function fetchEnrolleeBenefits(params: {
  enrolleeId: string;
  limit?: number;
  page?: number;
  categoryId?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.categoryId) queryParams.append("categoryId", params.categoryId);
  if (params.search) queryParams.append("search", params.search);

  return apiClient(
    `/admin/enrollees/${params.enrolleeId}/benefits?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );
}

export async function getEnrolleeBenefit(
  enrolleeId: string,
  benefitId: string
) {
  return apiClient(`/admin/enrollees/${enrolleeId}/benefits/${benefitId}`, {
    method: "GET",
  });
}
