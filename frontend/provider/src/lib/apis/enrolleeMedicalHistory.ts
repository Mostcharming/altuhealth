import { apiClient } from "@/lib/apiClient";
import { EnrolleeMedicalHistory } from "@/lib/store/enrolleeMedicalHistoryStore";

export async function fetchEnrolleeMedicalHistories(params: {
  enrolleeId: string;
  limit?: number;
  page?: number;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.status) queryParams.append("status", params.status);

  return apiClient(
    `/admin/enrollees/${
      params.enrolleeId
    }/medical-histories?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );
}

export async function getEnrolleeMedicalHistory(
  enrolleeId: string,
  medicalHistoryId: string
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/medical-histories/${medicalHistoryId}`,
    {
      method: "GET",
    }
  );
}

export async function updateEnrolleeMedicalHistory(
  enrolleeId: string,
  medicalHistoryId: string,
  data: Partial<Omit<EnrolleeMedicalHistory, "id" | "createdAt" | "updatedAt">>
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/medical-histories/${medicalHistoryId}`,
    {
      method: "PUT",
      body: data,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function deleteEnrolleeMedicalHistory(
  enrolleeId: string,
  medicalHistoryId: string
) {
  return apiClient(
    `/admin/enrollees/${enrolleeId}/medical-histories/${medicalHistoryId}`,
    {
      method: "DELETE",
    }
  );
}
