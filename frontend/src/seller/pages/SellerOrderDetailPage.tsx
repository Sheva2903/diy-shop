import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getSellerOrder, updateOrderStatus, updatePaymentStatus } from "../../api/seller";
import { OrderStatusBadge, PaymentStatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ErrorState, Skeleton } from "../../components/ui/Feedback";
import { TextAreaField } from "../../components/ui/Field";
import { ConfirmDialog } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/toast";
import {
  allowedTransitions,
  canMarkPaid,
  orderStatusLabels,
  paymentStatusLabels,
  transitionLabels
} from "../../features/seller/orderStatus";
import { cn } from "../../lib/cn";
import { formatDateTime, formatVnd } from "../../lib/format";
import type { OrderStatus } from "../../types/database";

const timeline: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED"];

function StatusTimeline({ current }: { current: OrderStatus }) {
  if (current === "CANCELLED") {
    return (
      <div className="rounded-card bg-danger-soft px-4 py-3 text-[14px] font-semibold text-danger">
        This order was cancelled.
      </div>
    );
  }

  const activeIndex = timeline.indexOf(current);

  return (
    <ol className="flex items-center">
      {timeline.map((status, index) => {
        const reached = index <= activeIndex;

        return (
          <li key={status} className={cn("flex items-center", index < timeline.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-[13px] font-bold",
                  reached ? "bg-action text-white" : "bg-ceramic text-text-faint"
                )}
              >
                {reached ? "✓" : index + 1}
              </span>
              <span className={cn("text-[12px] font-medium", reached ? "text-text" : "text-text-faint")}>
                {orderStatusLabels[status]}
              </span>
            </div>

            {index < timeline.length - 1 && (
              <span
                className={cn("mx-2 mb-5 h-0.5 flex-1", index < activeIndex ? "bg-action" : "bg-hairline")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function SellerOrderDetailPage() {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [reasonError, setReasonError] = useState<string | undefined>();

  const orderQuery = useQuery({
    queryKey: ["seller", "order", orderCode],
    queryFn: () => getSellerOrder(orderCode!),
    enabled: !!orderCode
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["seller"] });

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: OrderStatus; reason?: string }) =>
      updateOrderStatus(orderCode!, status, reason),
    onSuccess: (_, variables) => {
      void refresh();
      setCancelOpen(false);
      setCancelReason("");
      toast.success(`Order marked ${orderStatusLabels[variables.status].toLowerCase()}`);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const paymentMutation = useMutation({
    mutationFn: (status: "PAID" | "FAILED") => updatePaymentStatus(orderCode!, status),
    onSuccess: () => {
      void refresh();
      toast.success("Payment status updated");
    },
    onError: (error: Error) => toast.error(error.message)
  });

  if (orderQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-card" />
        <Skeleton className="h-64 rounded-card" />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <ErrorState
        title="Order not found"
        description={orderQuery.error?.message}
        action={<Button onClick={() => navigate("/seller/orders")}>Back to orders</Button>}
      />
    );
  }

  const order = orderQuery.data;
  const nextStatuses = allowedTransitions[order.order_status].filter((status) => status !== "CANCELLED");
  const canCancel = allowedTransitions[order.order_status].includes("CANCELLED");

  const confirmCancel = () => {
    if (!cancelReason.trim()) {
      setReasonError("A cancellation reason is required");
      return;
    }
    setReasonError(undefined);
    statusMutation.mutate({ status: "CANCELLED", reason: cancelReason.trim() });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <section className="rounded-card bg-surface p-5 shadow-card lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[22px] font-bold text-text">{order.order_code}</p>
            <p className="mt-1 text-[13px] text-text-muted">{formatDateTime(order.created_at)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge
              status={order.order_status}
              label={orderStatusLabels[order.order_status]}
            />
            <PaymentStatusBadge
              status={order.payment_status}
              label={paymentStatusLabels[order.payment_status]}
            />
          </div>
        </div>

        <div className="mt-6">
          <StatusTimeline current={order.order_status} />
        </div>

        {order.order_status === "CANCELLED" && order.cancellation_reason && (
          <p className="mt-4 text-[14px] text-text-muted">
            <span className="font-semibold text-text">Reason:</span> {order.cancellation_reason}
          </p>
        )}

        {/* plan §2.5.C — status actions follow the allowed transitions exactly */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-hairline pt-5">
          {nextStatuses.map((status) => (
            <Button
              key={status}
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate({ status })}
            >
              {transitionLabels[status]}
            </Button>
          ))}

          {canMarkPaid(order.order_status, order.payment_status) && (
            <Button
              variant="secondary"
              disabled={paymentMutation.isPending}
              onClick={() => paymentMutation.mutate("PAID")}
            >
              Mark as paid
            </Button>
          )}

          {order.payment_status === "UNPAID" && (
            <Button
              variant="ghost"
              disabled={paymentMutation.isPending}
              onClick={() => paymentMutation.mutate("FAILED")}
            >
              Mark payment failed
            </Button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="ml-auto text-[14px] font-semibold text-danger hover:underline"
            >
              Cancel order
            </button>
          )}
        </div>
      </section>

      <section className="rounded-card bg-surface p-5 shadow-card lg:p-6">
        <h2 className="text-[16px] font-semibold text-text">Customer</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[13px] text-text-muted">Name</dt>
            <dd className="text-[15px] font-medium text-text">{order.recipient_full_name}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-text-muted">Phone</dt>
            <dd className="text-[15px] font-medium text-text">{order.phone_number}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-text-muted">Email</dt>
            <dd className="text-[15px] text-text">{order.email}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-text-muted">Payment method</dt>
            <dd className="text-[15px] text-text">
              {order.payment_method === "COD" ? "Cash on delivery" : "Bank transfer"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[13px] text-text-muted">Shipping address</dt>
            <dd className="text-[15px] text-text">
              {[order.street_address, order.ward, order.district, order.province_city]
                .filter(Boolean)
                .join(", ")}
            </dd>
          </div>
          {order.customer_note && (
            <div className="sm:col-span-2">
              <dt className="text-[13px] text-text-muted">Customer note</dt>
              <dd className="text-[15px] text-text">{order.customer_note}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-card bg-surface p-5 shadow-card lg:p-6">
        <h2 className="text-[16px] font-semibold text-text">Items</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-hairline text-[12px] font-semibold tracking-wide text-text-muted uppercase">
                <th className="py-2.5 pr-4">Product</th>
                <th className="py-2.5 pr-4">Unit price</th>
                <th className="py-2.5 pr-4">Qty</th>
                <th className="py-2.5 text-right">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-text">{item.product_name_vi}</p>
                    {item.product_name_en && (
                      <p className="text-[13px] text-text-muted">{item.product_name_en}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-text">{formatVnd(item.unit_price, "vi")}</td>
                  <td className="py-3 pr-4 text-text">{item.quantity}</td>
                  <td className="py-3 text-right font-semibold text-text">
                    {formatVnd(item.line_total, "vi")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 space-y-2 border-t border-hairline pt-4 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-text-muted">Subtotal</dt>
            <dd className="text-text">{formatVnd(order.subtotal, "vi")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Shipping</dt>
            <dd className="text-text">{formatVnd(order.shipping_fee, "vi")}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-hairline pt-3">
            <dt className="text-[15px] font-semibold text-text">Total</dt>
            <dd className="text-[20px] font-bold text-text">{formatVnd(order.total_amount, "vi")}</dd>
          </div>
        </dl>
      </section>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={confirmCancel}
        title="Cancel this order?"
        description="Reserved inventory is returned to the catalog. This cannot be undone."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        tone="danger"
        busy={statusMutation.isPending}
      >
        <TextAreaField
          label="Reason"
          required
          rows={3}
          value={cancelReason}
          error={reasonError}
          onChange={(event) => setCancelReason(event.target.value)}
        />
      </ConfirmDialog>
    </div>
  );
}
