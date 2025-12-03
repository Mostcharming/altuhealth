import { apiClient } from "@/lib/apiClient";
import { EnrolleeAuthorizationCode } from "@/lib/store/enrolleeAuthorizationCodeStore";

export async function fetchEnrolleeAuthorizationCodes(params: {
  enrolleeId: string;
  limit?: number;
  page?: number;
  status?: string;
  isUsed?: boolean;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.status) queryParams.append("status", params.status);
  if (params.isUsed !== undefined)
    queryParams.append("isUsed", String(params.isUsed));

  return apiClient(
    `/admin/enrollees/${
      params.enrolleeId
    }/authorization-codes?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );
}

export async function getEnrolleeAuthorizationCode(
  enrolleeId: string,
  authorizationCodeId: string
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/authorization-codes/${authorizationCodeId}`,
    {
      method: "GET",
    }
  );
}

export async function updateEnrolleeAuthorizationCode(
  enrolleeId: string,
  authorizationCodeId: string,
  data: Partial<
    Omit<EnrolleeAuthorizationCode, "id" | "createdAt" | "updatedAt">
  >
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/authorization-codes/${authorizationCodeId}`,
    {
      method: "PUT",
      body: data,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function deleteEnrolleeAuthorizationCode(
  enrolleeId: string,
  authorizationCodeId: string
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/authorization-codes/${authorizationCodeId}`,
    {
      method: "DELETE",
    }
  );
}

export async function useEnrolleeAuthorizationCode(
  enrolleeId: string,
  authorizationCodeId: string,
  data: { usedAmount?: number }
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/authorization-codes/${authorizationCodeId}/use`,
    {
      method: "PUT",
      body: data,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function cancelEnrolleeAuthorizationCode(
  enrolleeId: string,
  authorizationCodeId: string
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/authorization-codes/${authorizationCodeId}/cancel`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
