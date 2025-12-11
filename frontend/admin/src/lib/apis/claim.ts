import { apiClient } from "@/lib/apiClient";
import { Claim } from "@/lib/store/claimStore";

export async function fetchClaims(params: {
  limit?: number;
  page?: number;
  q?: string;
  status?: string;
  providerId?: string;
  year?: number;
  month?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("search", params.q);
  if (params.status) queryParams.append("status", params.status);
  if (params.providerId) queryParams.append("providerId", params.providerId);
  if (params.year) queryParams.append("year", String(params.year));
  if (params.month) queryParams.append("month", String(params.month));

  return apiClient(`/admin/claims/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getClaimById(id: string) {
  return apiClient(`/admin/claims/${id}`, {
    method: "GET",
  });
}

export async function createClaim(data: {
  providerId: string;
  numberOfEncounters: number;
  amountSubmitted: number;
  year: number;
  month: number;
  bankUsedForPayment?: string;
  bankAccountNumber?: string;
  accountName?: string;
  description?: string;
  attachmentUrl?: string;
}) {
  return apiClient("/admin/claims", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateClaim(id: string, data: Partial<Claim>) {
  return apiClient(`/admin/claims/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteClaim(id: string) {
  return apiClient(`/admin/claims/${id}`, {
    method: "DELETE",
  });
}

export async function submitClaim(id: string) {
  return apiClient(`/admin/claims/${id}/submit`, {
    method: "POST",
  });
}

export async function vetClaim(id: string, vetterNotes?: string) {
  return apiClient(`/admin/claims/${id}/vet`, {
    method: "POST",
    body: vetterNotes ? { vetterNotes } : {},
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function approveClaim(id: string) {
  return apiClient(`/admin/claims/${id}/approve`, {
    method: "POST",
  });
}

export async function rejectClaim(id: string, rejectionReason: string) {
  return apiClient(`/admin/claims/${id}/reject`, {
    method: "POST",
    body: { rejectionReason },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function queryClaim(id: string) {
  return apiClient(`/admin/claims/${id}/query`, {
    method: "POST",
  });
}

export async function markClaimAsPaid(id: string, datePaid: string) {
  return apiClient(`/admin/claims/${id}/mark-paid`, {
    method: "POST",
    body: { datePaid },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function markClaimAsPartiallyPaid(id: string, amountPaid: number) {
  return apiClient(`/admin/claims/${id}/mark-partially-paid`, {
    method: "POST",
    body: { amountPaid },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function fetchProviders(params: {
  limit?: number;
  page?: number;
  q?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("search", params.q);

  return apiClient(`/admin/providers/list?${queryParams.toString()}`, {
    method: "GET",
  });
}
