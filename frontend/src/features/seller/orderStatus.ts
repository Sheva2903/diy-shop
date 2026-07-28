import type { OrderStatus, PaymentStatus } from "../../types/database";

/**
 * Mirrors the enforce_order_transition trigger in the database.
 */
export const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: []
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function canMarkPaid(orderStatus: OrderStatus, paymentStatus: PaymentStatus): boolean {
  return paymentStatus === "UNPAID" && orderStatus !== "CANCELLED";
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  FAILED: "Failed"
};

export const transitionLabels: Record<OrderStatus, string> = {
  PENDING: "Move to pending",
  CONFIRMED: "Confirm order",
  SHIPPING: "Mark as shipping",
  DELIVERED: "Mark as delivered",
  CANCELLED: "Cancel order"
};
