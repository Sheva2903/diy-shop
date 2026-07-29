import { apiFetch, ApiError } from "../lib/api";

export type SellerSession = { username: string };

/** Returns null when there is no authenticated seller session (401), rather than throwing. */
export async function getSellerSession(): Promise<SellerSession | null> {
  try {
    return await apiFetch<SellerSession>("/api/seller/auth/session");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function sellerLogin(username: string, password: string): Promise<void> {
  try {
    await apiFetch("/api/seller/auth/login", {
      method: "POST",
      body: new URLSearchParams({ username, password })
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new Error("Invalid seller credentials", { cause: error });
    }
    throw error;
  }
}

export async function sellerLogout(): Promise<void> {
  await apiFetch("/api/seller/auth/logout", { method: "POST" });
}
