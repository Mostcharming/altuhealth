import { apiClient } from "@/lib/apiClient";
import { Invoice } from "@/lib/store/invoiceStore";

export async function fetchInvoices(params: {
  limit?: number;
  page?: number;
  q?: string;
  status?: string;
  paymentStatus?: string;
  providerId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.status) queryParams.append("status", params.status);
  if (params.paymentStatus)
    queryParams.append("paymentStatus", params.paymentStatus);
  if (params.providerId) queryParams.append("providerId", params.providerId);

  return apiClient(`/admin/invoices/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getInvoiceById(id: string) {
  return apiClient(`/admin/invoices/${id}`, {
    method: "GET",
  });
}

export async function createInvoice(data: {
  providerId: string;
  enrolleeId?: string;
  retailEnrolleeId?: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
  description?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }>;
}) {
  return apiClient("/admin/invoices", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateInvoice(id: string, data: Partial<Invoice>) {
  return apiClient(`/admin/invoices/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteInvoice(id: string) {
  return apiClient(`/admin/invoices/${id}`, {
    method: "DELETE",
  });
}

export async function cancelInvoice(id: string) {
  return apiClient(`/admin/invoices/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function addLineItem(
  invoiceId: string,
  data: {
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }
) {
  return apiClient(`/admin/invoices/${invoiceId}/line-items`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateLineItem(
  invoiceId: string,
  lineItemId: string,
  data: {
    description?: string;
    quantity?: number;
    unitPrice?: number;
    discount?: number;
    tax?: number;
  }
) {
  return apiClient(`/admin/invoices/${invoiceId}/line-items/${lineItemId}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteLineItem(invoiceId: string, lineItemId: string) {
  return apiClient(`/admin/invoices/${invoiceId}/line-items/${lineItemId}`, {
    method: "DELETE",
  });
}
