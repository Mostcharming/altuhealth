import { apiClient } from "@/lib/apiClient";

export type PharmacyRequestStatus =
  "pending" | "approved" | "rejected" | "paid";

export type PharmacyMemberType = "corporate" | "retail";

export interface PharmacyMember {
  id: string;
  firstName: string;
  lastName: string;
  policyNumber: string;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface PharmacyRequestItem {
  id?: string;
  drugName: string;
  quantity: number;
  unitPrice: number | string;
  lineTotal?: number | string;
  notes?: string | null;
}

export interface AdminSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PharmacyPayment {
  id: string;
  pharmacyRequestId: string;
  paymentNumber: string;
  amount: number | string;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  transactionReference?: string | null;
  beneficiaryName: string;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  proofUrl?: string | null;
  notes?: string | null;
  recordedByAdmin?: AdminSummary | null;
  request?: PharmacyRequest;
  createdAt?: string;
}

export interface PharmacyRequest {
  id: string;
  requestNumber: string;
  memberType: PharmacyMemberType;
  enrolleeId?: string | null;
  retailEnrolleeId?: string | null;
  enrollee?: PharmacyMember | null;
  retailEnrollee?: PharmacyMember | null;
  pharmacyName: string;
  pharmacyPhone?: string | null;
  pharmacyAddress?: string | null;
  purchaseDate: string;
  amountClaimed: number | string;
  approvedAmount?: number | string | null;
  currency: string;
  receiptUrl?: string | null;
  callReference?: string | null;
  notes?: string | null;
  status: PharmacyRequestStatus;
  reviewNotes?: string | null;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  paidAt?: string | null;
  items: PharmacyRequestItem[];
  payment?: PharmacyPayment | null;
  creator?: AdminSummary | null;
  reviewer?: AdminSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacySummary {
  counts: Record<PharmacyRequestStatus, number>;
  totalRequests: number;
  totalClaimed: number;
  totalApproved: number;
  totalPaid: number;
}

export interface CreatePharmacyRequestPayload {
  memberType: PharmacyMemberType;
  enrolleeId?: string;
  retailEnrolleeId?: string;
  pharmacyName: string;
  pharmacyPhone?: string;
  pharmacyAddress?: string;
  purchaseDate: string;
  currency: string;
  receiptUrl?: string;
  callReference?: string;
  notes?: string;
  items: Array<{
    drugName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
}

export async function createPharmacyRequest(
  payload: CreatePharmacyRequestPayload,
) {
  return apiClient("/admin/pharmacy-requests", {
    method: "POST",
    body: payload,
  });
}

export async function fetchPharmacyRequests(params: {
  limit?: number;
  page?: number;
  q?: string;
  status?: PharmacyRequestStatus | "";
  memberType?: PharmacyMemberType | "";
}) {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.page) query.set("page", String(params.page));
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  if (params.memberType) query.set("memberType", params.memberType);
  return apiClient(`/admin/pharmacy-requests/list?${query.toString()}`);
}

export async function fetchPharmacyRequest(id: string) {
  return apiClient(`/admin/pharmacy-requests/${id}`);
}

export async function fetchPharmacySummary() {
  return apiClient("/admin/pharmacy-requests/summary");
}

export async function approvePharmacyRequest(
  id: string,
  payload: { approvedAmount: number; reviewNotes?: string },
) {
  return apiClient(`/admin/pharmacy-requests/${id}/approve`, {
    method: "PATCH",
    body: payload,
  });
}

export async function rejectPharmacyRequest(
  id: string,
  payload: { rejectionReason: string; reviewNotes?: string },
) {
  return apiClient(`/admin/pharmacy-requests/${id}/reject`, {
    method: "PATCH",
    body: payload,
  });
}

export async function recordPharmacyPayment(
  id: string,
  payload: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    transactionReference?: string;
    beneficiaryName: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    proofUrl?: string;
    notes?: string;
  },
) {
  return apiClient(`/admin/pharmacy-requests/${id}/payment`, {
    method: "POST",
    body: payload,
  });
}

export async function fetchPharmacyPayments(params: {
  limit?: number;
  page?: number;
  q?: string;
  paymentMethod?: string;
}) {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.page) query.set("page", String(params.page));
  if (params.q) query.set("q", params.q);
  if (params.paymentMethod) query.set("paymentMethod", params.paymentMethod);
  return apiClient(
    `/admin/pharmacy-requests/payments/list?${query.toString()}`,
  );
}

export function getPharmacyMember(request: PharmacyRequest) {
  return request.memberType === "retail"
    ? request.retailEnrollee
    : request.enrollee;
}
