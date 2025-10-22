import { APP_CONFIG } from "./config";

export type ApiRequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  formData?: FormData;
  token?: string;
  baseUrl?: string;
  nextOptions?: RequestInit;
};

const DEFAULT_HEADERS = {
  Accept: "application/json",
};

export async function apiClient(
  endpoint: string,
  {
    method = "GET",
    headers = {},
    body,
    formData,
    token,
    baseUrl = APP_CONFIG.API_BASE_URL,
    nextOptions = {},
  }: ApiRequestOptions = {}
) {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${baseUrl}${endpoint}`;

    const finalHeaders: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...headers,
    };

    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }

    let payload: BodyInit | undefined;
    if (formData) {
      payload = formData;
      delete finalHeaders["Content-Type"];
    } else if (body && typeof body === "object") {
      finalHeaders["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    } else {
      payload = body;
    }

    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: payload,
      ...nextOptions,
    });

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(
        data?.message || `API error: ${response.status} ${response.statusText}`
      );
    }

    return data;
  } catch (error: any) {
    console.error(`[API ERROR]: ${error.message}`);
    throw error;
  }
}
