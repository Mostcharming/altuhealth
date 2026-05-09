import { apiClient } from "@/lib/apiClient";
import { Payment } from "@/lib/store/paymentStore";

export async function fetchPayments(params: {
  limit?: number;
  page?: number;
  q?: string;
  paymentMethod?: string;
  status?: string;
  verificationStatus?: string;
  invoiceId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.paymentMethod)
    queryParams.append("paymentMethod", params.paymentMethod);
  if (params.status) queryParams.append("status", params.status);
  if (params.verificationStatus)
    queryParams.append("verificationStatus", params.verificationStatus);
  if (params.invoiceId) queryParams.append("invoiceId", params.invoiceId);

  return apiClient(`/admin/payments/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getPaymentById(id: string) {
  return apiClient(`/admin/payments/${id}`, {
    method: "GET",
  });
}

export async function createPayment(data: {
  invoiceId: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: "bank_transfer" | "cheque" | "cash" | "card" | "gateway";
  currency?: string;
  transactionReference?: string;
  bankName?: string;
  accountName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  paymentGatewayProvider?: string;
  paymentGatewayTransactionId?: string;
  description?: string;
  receiptUrl?: string;
  verificationStatus?: string;
}) {
  return apiClient("/admin/payments", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updatePayment(id: string, data: Partial<Payment>) {
  return apiClient(`/admin/payments/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deletePayment(id: string) {
  return apiClient(`/admin/payments/${id}`, {
    method: "DELETE",
  });
}

export async function verifyPayment(id: string) {
  return apiClient(`/admin/payments/${id}/verify`, {
    method: "PATCH",
  });
}

export async function refundPayment(
  id: string,
  data?: {
    refundAmount?: number;
    reason?: string;
  }
) {
  return apiClient(`/admin/payments/${id}/refund`, {
    method: "PATCH",
    body: data || {},
    headers: {
      "Content-Type": "application/json",
    },
  });
}
