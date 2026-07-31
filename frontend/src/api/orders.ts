import { apiFetch } from "../lib/api";
import type { CreateOrderPayload, OrderView } from "../types/database";

/**
 * Placing an order goes through POST /api/orders, never a direct table write:
 * prices, shipping fee, inventory and the order code are all decided on the
 * server so a tampered client payload cannot change what is charged.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<OrderView> {
  return apiFetch<OrderView>("/api/orders", { method: "POST", json: payload });
}

export async function trackOrder(orderCode: string, phoneNumber: string): Promise<OrderView> {
  const query = new URLSearchParams({
    orderCode: orderCode.trim(),
    phoneNumber: phoneNumber.trim()
  });

  return apiFetch<OrderView>(`/api/orders/track?${query.toString()}`);
}
