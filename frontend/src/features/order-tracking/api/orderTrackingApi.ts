import { getJson } from "../../../shared/api/client";
import type { OrderResponse } from "../../checkout/types";

export function trackOrder(
  orderCode: string,
  phoneNumber: string,
  signal?: AbortSignal
): Promise<OrderResponse> {
  const params = new URLSearchParams({ orderCode, phoneNumber });
  return getJson<OrderResponse>(`/api/orders/track?${params.toString()}`, signal);
}
