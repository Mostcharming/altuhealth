import { apiClient } from "@/lib/apiClient";
import { AdmissionTracker } from "@/lib/store/admissionTrackerStore";

export async function fetchAdmissions(params: {
  limit?: number;
  page?: number;
  q?: string;
  status?: string;
  providerId?: string;
  enrolleeId?: string;
  companyId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.status) queryParams.append("status", params.status);
  if (params.providerId) queryParams.append("providerId", params.providerId);
  if (params.enrolleeId) queryParams.append("enrolleeId", params.enrolleeId);
  if (params.companyId) queryParams.append("companyId", params.companyId);

  return apiClient(`/admin/admission-trackers/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getAdmissionById(id: string) {
  return apiClient(`/admin/admission-trackers/${id}`, {
    method: "GET",
  });
}

export async function createAdmission(data: {
  enrolleeId: string;
  providerId: string;
  companyId: string;
  subsidiaryId?: string;
  admissionDate: string;
  diagnosis?: string;
  diagnosisCode?: string;
  roomType?: string;
  bedNumber?: string;
  ward?: string;
  reasonForAdmission?: string;
  admittingPhysician?: string;
  notes?: string;
}) {
  return apiClient("/admin/admission-trackers", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateAdmission(
  id: string,
  data: Partial<AdmissionTracker>
) {
  return apiClient(`/admin/admission-trackers/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteAdmission(id: string) {
  return apiClient(`/admin/admission-trackers/${id}`, {
    method: "DELETE",
  });
}

export async function dischargePatient(
  id: string,
  data?: {
    dischargeDate?: string;
    dischargeNotes?: string;
    dischargingPhysician?: string;
  }
) {
  return apiClient(`/admin/admission-trackers/${id}/discharge`, {
    method: "PATCH",
    body: data || {},
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function transferPatient(
  id: string,
  data?: {
    notes?: string;
  }
) {
  return apiClient(`/admin/admission-trackers/${id}/transfer`, {
    method: "PATCH",
    body: data || {},
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function markPatientExpired(id: string) {
  return apiClient(`/admin/admission-trackers/${id}/mark-expired`, {
    method: "PATCH",
  });
}

export async function markPatientAbsconded(id: string) {
  return apiClient(`/admin/admission-trackers/${id}/mark-absconded`, {
    method: "PATCH",
  });
}

export async function approveBillAmount(
  id: string,
  data: {
    approvedAmount: number;
  }
) {
  return apiClient(`/admin/admission-trackers/${id}/approve-bill`, {
    method: "PATCH",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function fetchProviders(params: {
  limit?: number;
  page?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));

  return apiClient(`/admin/providers/list?${queryParams.toString()}`, {
    method: "GET",
  });
}
