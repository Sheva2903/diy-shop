import { getJson, patchJson } from "../../../shared/api/client";
import type { OrderStatus, SellerOrderDetail, SellerOrderListItem } from "../types";

export function getOrders(signal?: AbortSignal): Promise<SellerOrderListItem[]> {
  return getJson<SellerOrderListItem[]>("/api/seller/orders", signal);
}

export function getOrder(orderCode: string, signal?: AbortSignal): Promise<SellerOrderDetail> {
  return getJson<SellerOrderDetail>(`/api/seller/orders/${orderCode}`, signal);
}

export function markOrderPaid(orderCode: string): Promise<SellerOrderDetail> {
  return patchJson<SellerOrderDetail>(`/api/seller/orders/${orderCode}/payment`, {});
}

export function updateOrderStatus(orderCode: string, orderStatus: OrderStatus): Promise<SellerOrderDetail> {
  return patchJson<SellerOrderDetail>(`/api/seller/orders/${orderCode}/status`, { orderStatus });
}
