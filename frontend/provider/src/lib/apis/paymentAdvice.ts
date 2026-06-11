import { apiClient } from "@/lib/apiClient";

export async function fetchPaymentAdvices(params: {
  limit?: number;
  page?: number;
  q?: string;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.status) queryParams.append("status", params.status);

  return apiClient(`/provider/payment-advices/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function getPaymentAdviceById(id: string) {
  return apiClient(`/provider/payment-advices/${id}`, {
    method: "GET",
  });
}
