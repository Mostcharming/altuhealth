import { useAuthStore } from "@/lib/authStore";
import { APP_CONFIG } from "@/lib/config";
import { router } from "expo-router";

export type ApiRequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  formData?: FormData;
  token?: string;
  baseUrl?: string;
  nextOptions?: RequestInit;
  onLoading?: (loading: boolean) => void;
};

const DEFAULT_HEADERS = {
  Accept: "application/json",
};

const SENSITIVE_FIELD_PATTERN = /(authorization|password|secret|token)/i;

function sanitizeForLog(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeForLog);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.entries(value as Record<string, unknown>).reduce<
    Record<string, unknown>
  >((acc, [key, item]) => {
    acc[key] = SENSITIVE_FIELD_PATTERN.test(key)
      ? "[redacted]"
      : sanitizeForLog(item);
    return acc;
  }, {});
}

function getRequestBodyForLog(body: unknown, formData?: FormData) {
  if (formData) {
    return "[FormData]";
  }

  return sanitizeForLog(body);
}

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
    onLoading,
  }: ApiRequestOptions = {}
) {
  try {
    onLoading?.(true);
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

    const finalHeaders: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...headers,
    };

    const resolvedToken = token ?? useAuthStore.getState().token;

    if (resolvedToken) {
      finalHeaders.Authorization = `Bearer ${resolvedToken}`;
    }

    let payload: BodyInit | undefined;
    if (formData) {
      payload = formData;
      delete finalHeaders["Content-Type"];
    } else if (body && typeof body === "object") {
      finalHeaders["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    } else {
      payload = body as BodyInit;
    }

    const startedAt = Date.now();

    console.log("[apiClient] request", {
      method,
      url,
      headers: sanitizeForLog(finalHeaders),
      body: getRequestBodyForLog(body, formData),
    });

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

    console.log("[apiClient] response", {
      method,
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      durationMs: Date.now() - startedAt,
      data: sanitizeForLog(data),
    });

    if (!response.ok) {
      throw new Error(
        data?.message || `API error: ${response.status} ${response.statusText}`
      );
    }

    return data;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    console.log("[apiClient] error", {
      endpoint,
      message: err.message,
    });

    if (/token/i.test(err.message)) {
      try {
        useAuthStore.getState().clearAuth();
      } catch (e: unknown) {
        console.warn("[apiClient] failed clearing auth store:", e);
      }

      if (typeof window !== "undefined" && window.location) {
        window.location.assign("/signin");
      } else {
        router.replace("/signin");
      }
    }

    throw err;
  } finally {
    try {
      onLoading?.(false);
    } catch (e) {
      console.warn("[apiClient] onLoading callback threw:", e);
    }
  }
}
