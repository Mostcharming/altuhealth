/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/apiClient";

export async function fetchAuthorizationCodes(
  enrolleeId: string,
  params: {
    limit?: number;
    page?: number;
    status?: string;
    isUsed?: boolean;
  }
) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.status) queryParams.append("status", params.status);
  if (params.isUsed !== undefined)
    queryParams.append("isUsed", String(params.isUsed));

  return apiClient(
    `/admin/enrollees/${enrolleeId}/authorization-codes?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );
}

export async function getAuthorizationCode(
  enrolleeId: string,
  authCodeId: string
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/authorization-codes/${authCodeId}`,
    {
      method: "GET",
    }
  );
}

export async function updateAuthorizationCode(
  enrolleeId: string,
  authCodeId: string,
  data: any
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/authorization-codes/${authCodeId}`,
    {
      method: "PUT",
      body: data,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function cancelAuthorizationCode(
  enrolleeId: string,
  authCodeId: string
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/authorization-codes/${authCodeId}/cancel`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function deleteAuthorizationCode(
  enrolleeId: string,
  authCodeId: string
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/authorization-codes/${authCodeId}`,
    {
      method: "DELETE",
    }
  );
}
