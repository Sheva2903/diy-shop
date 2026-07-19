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

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      headers: { Accept: "application/json" },
      signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError("Unable to reach the shop right now.", 0);
  }

  const body = await readJson(response);

  if (!response.ok) {
    const payload = isApiErrorPayload(body) ? body : undefined;
    throw new ApiError(
      payload?.message ?? "The shop could not complete that request.",
      response.status,
      payload?.path
    );
  }

  return body as T;
}

async function readJson(response: Response): Promise<unknown> {
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === "object" && value !== null;
}
