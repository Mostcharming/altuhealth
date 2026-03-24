import { useAuthStore } from "@/lib/authStore";
import { APP_CONFIG } from "@/lib/config";

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
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${baseUrl}${endpoint}`;

    const finalHeaders: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...headers,
    };

    // prefer explicit token param, otherwise read token from auth store (use getState to avoid React hook usage/SSR issues)
    const resolvedToken =
      token ??
      (typeof window !== "undefined"
        ? useAuthStore.getState().token
        : undefined);

    if (resolvedToken) {
      finalHeaders["Authorization"] = `Bearer ${resolvedToken}`;
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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    // If the error message mentions "token" (case-insensitive), clear auth token and redirect to /signin
    if (/token/i.test(err.message)) {
      try {
        // Cast the store to a narrow shape so TypeScript is happy
        const store = useAuthStore as unknown as {
          setState?: (s: Partial<{ token?: string | undefined }>) => void;
        };

        if (typeof store.setState === "function") {
          store.setState({ token: undefined });
        }
      } catch (e: unknown) {
        console.warn("[apiClient] failed clearing auth store:", e);
      }

      if (typeof window !== "undefined") {
        // Perform full navigation to the signin page
        window.location.assign("/signin");
      }
    }

    throw err;
  } finally {
    // always notify caller that loading finished
    try {
      onLoading?.(false);
    } catch (e) {
      // swallow any errors thrown by the callback
      console.warn("[apiClient] onLoading callback threw:", e);
    }
  }
}
