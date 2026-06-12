import { apiClient } from "@/lib/apiClient";

export type CurrencyRate = {
  id: string;
  currencyCode: string;
  currencyName: string;
  rateToNgn: number;
  ngnToCurrencyRate: number;
  source: string;
  sourcePayload?: Record<string, unknown> | null;
  lastFetchedAt?: string | null;
  isActive: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CurrencyRatePayload = {
  currencyCode: string;
  currencyName: string;
  rateToNgn: number | string;
  source?: string;
  notes?: string;
  isActive?: boolean;
};

export async function listCurrencyRates(params: {
  q?: string;
  page?: number;
  limit?: number | "all";
  isActive?: boolean | "";
} = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  });

  return apiClient(`/admin/currency-rates/list?${searchParams.toString()}`, {
    method: "GET",
  });
}

export async function createCurrencyRate(payload: CurrencyRatePayload) {
  return apiClient("/admin/currency-rates", {
    method: "POST",
    body: payload,
  });
}

export async function updateCurrencyRate(
  id: string,
  payload: CurrencyRatePayload
) {
  return apiClient(`/admin/currency-rates/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteCurrencyRate(id: string) {
  return apiClient(`/admin/currency-rates/${id}`, {
    method: "DELETE",
  });
}

export async function fetchLatestCurrencyRates() {
  return apiClient("/admin/currency-rates/fetch-latest", {
    method: "POST",
  });
}
