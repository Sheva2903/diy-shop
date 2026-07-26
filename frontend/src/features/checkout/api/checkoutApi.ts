import { postJson } from "../../../shared/api/client";
import type { CreateOrderRequest, OrderResponse } from "../types";

export function createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
  return postJson<OrderResponse>("/api/orders", request);
}
