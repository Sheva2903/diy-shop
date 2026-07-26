export type ApiErrorPayload = {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly path?: string;

  constructor(message: string, status: number, path?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

function getCsrfCookie(): string | null {
  const name = "XSRF-TOKEN";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

function buildHeaders(
  baseHeaders: Record<string, string>,
  path: string
): Record<string, string> {
  const headers = { ...baseHeaders };

  if (path.startsWith("/api/seller/")) {
    const csrfToken = getCsrfCookie();
    if (csrfToken) {
      headers["X-XSRF-TOKEN"] = csrfToken;
    }
  }

  return headers;
}

async function fetchWithHeaders(
  path: string,
  init: RequestInit,
  baseHeaders: Record<string, string>
): Promise<Response> {
  try {
    return await fetch(path, {
      ...init,
      credentials: "include",
      headers: buildHeaders(baseHeaders, path)
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError("Unable to reach the shop right now.", 0);
  }
}

async function readJson(response: Response): Promise<unknown> {
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === "object" && value !== null;
}

function handleErrorResponse(
  body: unknown,
  status: number,
  contentType: string
): never {
  if (status === 401 && contentType.includes("text/plain")) {
    throw new ApiError(body as string, status);
  }

  const payload = isApiErrorPayload(body) ? body : undefined;
  throw new ApiError(
    payload?.message ?? "The shop could not complete that request.",
    status,
    payload?.path
  );
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetchWithHeaders(
    path,
    { headers: { Accept: "application/json" }, signal },
    { Accept: "application/json" }
  );

  const body = await readJson(response);

  if (!response.ok) {
    handleErrorResponse(body, response.status, response.headers.get("content-type") ?? "");
  }

  return body as T;
}

export async function postJson<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetchWithHeaders(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal
    },
    { "Content-Type": "application/json", Accept: "application/json" }
  );

  const responseBody = await readJson(response);

  if (!response.ok) {
    handleErrorResponse(responseBody, response.status, response.headers.get("content-type") ?? "");
  }

  return responseBody as T;
}

export async function putJson<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetchWithHeaders(
    path,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal
    },
    { "Content-Type": "application/json", Accept: "application/json" }
  );

  const responseBody = await readJson(response);

  if (!response.ok) {
    handleErrorResponse(responseBody, response.status, response.headers.get("content-type") ?? "");
  }

  return responseBody as T;
}

export async function patchJson<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetchWithHeaders(
    path,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal
    },
    { "Content-Type": "application/json", Accept: "application/json" }
  );

  const responseBody = await readJson(response);

  if (!response.ok) {
    handleErrorResponse(responseBody, response.status, response.headers.get("content-type") ?? "");
  }

  return responseBody as T;
}

export async function deleteRequest<T>(
  path: string,
  signal?: AbortSignal
): Promise<T | null> {
  const response = await fetchWithHeaders(
    path,
    {
      method: "DELETE",
      headers: { Accept: "application/json" },
      signal
    },
    { Accept: "application/json" }
  );

  const body = await readJson(response);

  if (!response.ok) {
    handleErrorResponse(body, response.status, response.headers.get("content-type") ?? "");
  }

  return body as T | null;
}

export async function postForm<T>(
  path: string,
  formData: FormData,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetchWithHeaders(
    path,
    {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
      signal
    },
    { Accept: "application/json" }
  );

  const body = await readJson(response);

  if (!response.ok) {
    handleErrorResponse(body, response.status, response.headers.get("content-type") ?? "");
  }

  return body as T;
}

export async function loginWithForm(
  path: string,
  username: string,
  password: string,
  signal?: AbortSignal
): Promise<void> {
  const formData = new URLSearchParams();
  formData.set("username", username);
  formData.set("password", password);

  try {
    const response = await fetchWithHeaders(
      path,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: formData.toString(),
        signal
      },
      { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }
    );

    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      const body = await response.text();
      if (response.status === 401 && contentType.includes("text/plain")) {
        throw new ApiError(body || "Invalid seller credentials", response.status);
      }
      let jsonBody;
      try {
        jsonBody = JSON.parse(body);
      } catch {
        jsonBody = null;
      }
      handleErrorResponse(jsonBody, response.status, contentType);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Unable to reach the shop right now.", 0);
  }
}
