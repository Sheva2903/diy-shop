const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Spring Security defaults to XOR-encoding the CSRF token, so the value that has
 * to travel in X-XSRF-TOKEN is the one this endpoint returns — not the raw UUID
 * sitting in the XSRF-TOKEN cookie. Reading the cookie always yields a 403.
 */
let cachedCsrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;

  const response = await fetch(`${API_BASE_URL}/api/seller/auth/csrf`, {
    credentials: "include",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new ApiError("Could not obtain a CSRF token", response.status);
  }

  const { token } = (await response.json()) as { token: string };
  cachedCsrfToken = token;
  return token;
}

type ApiFetchOptions = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit };

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { json, headers, method, body: rawBody, ...rest } = options;
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  let body = rawBody;

  if (json !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }

  const httpMethod = method ?? "GET";
  const needsCsrf = httpMethod !== "GET" && httpMethod !== "HEAD";

  const send = async () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      method: httpMethod,
      headers: finalHeaders,
      body,
      credentials: "include"
    });

  if (needsCsrf) finalHeaders.set("X-XSRF-TOKEN", await getCsrfToken());

  let response = await send();

  // Logging in and out rotates the token, so a cached one can go stale mid-session.
  if (needsCsrf && response.status === 403) {
    cachedCsrfToken = null;
    finalHeaders.set("X-XSRF-TOKEN", await getCsrfToken());
    response = await send();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : response.statusText || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function resolveAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}
