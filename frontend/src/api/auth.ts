import { apiFetch, ApiError } from "../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export type SellerSession = { username: string };

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

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
  // Primes the XSRF-TOKEN cookie: Spring Security's CsrfFilter only writes it
  // once something reads the deferred CsrfToken.
  await apiFetch("/api/seller/auth/csrf");

  const response = await fetch(`${API_BASE_URL}/api/seller/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-XSRF-TOKEN": readCookie("XSRF-TOKEN") ?? ""
    },
    body: new URLSearchParams({ username, password })
  });

  if (!response.ok) {
    throw new Error("Invalid seller credentials");
  }
}

export async function sellerLogout(): Promise<void> {
  await apiFetch("/api/seller/auth/logout", { method: "POST" });
}
