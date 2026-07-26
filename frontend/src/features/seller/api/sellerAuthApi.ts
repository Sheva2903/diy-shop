import { getJson, loginWithForm, postJson } from "../../../shared/api/client";

export type SellerSessionResponse = {
  username: string;
};

export function login(username: string, password: string): Promise<void> {
  return loginWithForm("/api/seller/auth/login", username, password);
}

export function getSession(signal?: AbortSignal): Promise<SellerSessionResponse> {
  return getJson<SellerSessionResponse>("/api/seller/auth/session", signal);
}

export function logout(): Promise<void> {
  return postJson<void>("/api/seller/auth/logout", {});
}
