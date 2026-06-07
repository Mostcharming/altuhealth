import { apiClient } from "@/lib/apiClient";

type TariffParams = {
  limit?: number;
  page?: number;
  q?: string;
  status?: string;
};

function toQuery(params: TariffParams) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.status) queryParams.append("status", params.status);
  return queryParams.toString();
}

export async function fetchProviderDrugs(params: TariffParams) {
  return apiClient(`/provider/tariffs/drugs/list?${toQuery(params)}`, {
    method: "GET",
  });
}

export async function fetchProviderServices(params: TariffParams) {
  return apiClient(`/provider/tariffs/services/list?${toQuery(params)}`, {
    method: "GET",
  });
}
