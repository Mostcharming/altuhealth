import { apiClient } from "@/lib/apiClient";
import { EnrolleeDependent } from "@/lib/store/enrolleeDependentStore";

export async function fetchEnrolleeDependents(params: {
  enrolleeId: string;
  limit?: number;
  page?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));

  return apiClient(
    `/admin/enrollees/${
      params.enrolleeId
    }/dependents?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );
}

export async function getEnrolleeDependent(
  enrolleeId: string,
  dependentId: string
) {
  return apiClient(`/admin/enrollees/${enrolleeId}/dependents/${dependentId}`, {
    method: "GET",
  });
}

export async function updateEnrolleeDependent(
  enrolleeId: string,
  dependentId: string,
  data: Partial<EnrolleeDependent>
) {
  return apiClient(`/admin/enrollees/${enrolleeId}/dependents/${dependentId}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteEnrolleeDependent(
  enrolleeId: string,
  dependentId: string
) {
  return apiClient(`/admin/enrollees/${enrolleeId}/dependents/${dependentId}`, {
    method: "DELETE",
  });
}
