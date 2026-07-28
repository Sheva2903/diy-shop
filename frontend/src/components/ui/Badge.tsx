import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import type { OrderStatus, PaymentStatus } from "../../types/database";

// plan §0.3 — mint background, forest text, pill, 4px 10px padding
export function Badge({
  children,
  className,
  tone = "mint"
}: {
  children: ReactNode;
  className?: string;
  tone?: "mint" | "neutral" | "danger" | "gold";
}) {
  const tones = {
    mint: "bg-mint text-forest",
    neutral: "bg-ceramic text-text-muted",
    danger: "bg-danger-soft text-danger",
    gold: "bg-gold/20 text-[#7a5c1f]"
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-[12px] font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// plan §1.7 — one colour per status
const orderStatusTone: Record<OrderStatus, string> = {
  PENDING: "bg-status-pending text-status-pending-ink",
  CONFIRMED: "bg-mint text-forest",
  SHIPPING: "bg-status-shipping text-status-shipping-ink",
  DELIVERED: "bg-action text-white",
  CANCELLED: "bg-danger-soft text-danger"
};

const paymentStatusTone: Record<PaymentStatus, string> = {
  UNPAID: "bg-status-unpaid text-status-unpaid-ink",
  PAID: "bg-mint text-forest",
  FAILED: "bg-danger-soft text-danger"
};

// Uniform width so a column of status pills reads as a straight edge.
const statusPill =
  "inline-flex min-w-[86px] items-center justify-center rounded-pill px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap";

export function OrderStatusBadge({ status, label }: { status: OrderStatus; label: string }) {
  return <span className={cn(statusPill, orderStatusTone[status])}>{label}</span>;
}

export function PaymentStatusBadge({ status, label }: { status: PaymentStatus; label: string }) {
  return <span className={cn(statusPill, paymentStatusTone[status])}>{label}</span>;
}
