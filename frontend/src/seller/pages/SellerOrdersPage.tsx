import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getSellerOrders } from "../../api/seller";
import { OrderStatusBadge, PaymentStatusBadge } from "../../components/ui/Badge";
import { EmptyState, ErrorState, TableRowSkeleton } from "../../components/ui/Feedback";
import { SelectField, TextField } from "../../components/ui/Field";
import { orderStatusLabels, paymentStatusLabels } from "../../features/seller/orderStatus";
import { cn } from "../../lib/cn";
import { formatDateTime, formatVnd, maskPhone } from "../../lib/format";
import type { OrderStatus, PaymentStatus } from "../../types/database";

const statusTabs: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" }
];

export function SellerOrdersPage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [statusTab, setStatusTab] = useState<OrderStatus | "ALL">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const ordersQuery = useQuery({ queryKey: ["seller", "orders"], queryFn: getSellerOrders });

  const orders = useMemo(() => {
    const term = keyword.trim().toLowerCase();

    return (ordersQuery.data ?? []).filter((order) => {
      if (term && !`${order.order_code} ${order.recipient_full_name}`.toLowerCase().includes(term)) {
        return false;
      }
      if (statusTab !== "ALL" && order.order_status !== statusTab) return false;
      if (paymentFilter !== "ALL" && order.payment_status !== paymentFilter) return false;

      const created = order.created_at.slice(0, 10);
      if (fromDate && created < fromDate) return false;
      if (toDate && created > toDate) return false;

      return true;
    });
  }, [ordersQuery.data, keyword, statusTab, paymentFilter, fromDate, toDate]);

  const hasFilters =
    !!keyword || statusTab !== "ALL" || paymentFilter !== "ALL" || !!fromDate || !!toDate;

  const clearFilters = () => {
    setKeyword("");
    setStatusTab("ALL");
    setPaymentFilter("ALL");
    setFromDate("");
    setToDate("");
  };

  if (ordersQuery.isError) {
    return <ErrorState title="Could not load orders" description={ordersQuery.error.message} />;
  }

  return (
    <div className="space-y-5">
      {/* -------------------------------------------------------- A. Toolbar */}
      <div className="rounded-card bg-surface p-4 shadow-card lg:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <TextField
            label="Search"
            placeholder="Order code or customer..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <SelectField
            label="Payment status"
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value as PaymentStatus | "ALL")}
          >
            <option value="ALL">All payments</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
          </SelectField>
          <TextField
            label="From"
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
          <TextField
            label="To"
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusTab(tab.value)}
              className={cn(
                "shrink-0 rounded-pill px-4 py-2 text-[14px] font-semibold transition-colors duration-[120ms]",
                statusTab === tab.value
                  ? "bg-action text-white"
                  : "bg-ceramic text-text-muted hover:text-text"
              )}
            >
              {tab.label}
            </button>
          ))}

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-[14px] font-semibold text-action hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------- B. Order table */}
      <div className="overflow-hidden rounded-card bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-hairline bg-canvas/60 text-[12px] font-semibold tracking-wide text-text-muted uppercase">
                <th className="px-4 py-3 font-semibold">Order code</th>
                <th className="px-4 py-3 font-semibold">Placed</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {ordersQuery.isPending ? (
                Array.from({ length: 6 }).map((_, index) => <TableRowSkeleton key={index} columns={8} />)
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="No matching orders"
                      description="No order matches the current filters."
                      className="shadow-none"
                    />
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.order_code}
                    className="cursor-pointer align-middle text-[14px] transition-colors hover:bg-canvas"
                    onClick={() => navigate(`/seller/orders/${order.order_code}`)}
                  >
                    <td className="px-4 py-3.5 font-mono text-[13px] font-semibold whitespace-nowrap text-text tabular-nums">
                      {order.order_code}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-text-muted tabular-nums">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-text">{order.recipient_full_name}</p>
                      <p className="text-[13px] text-text-muted tabular-nums">
                        {maskPhone(order.phone_number)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold whitespace-nowrap text-text tabular-nums">
                      {formatVnd(order.total_amount, "vi")}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-text-muted">
                      {order.payment_method === "COD" ? "COD" : "Bank transfer"}
                    </td>
                    <td className="px-4 py-3.5">
                      <OrderStatusBadge
                        status={order.order_status}
                        label={orderStatusLabels[order.order_status]}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <PaymentStatusBadge
                        status={order.payment_status}
                        label={paymentStatusLabels[order.payment_status]}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/seller/orders/${order.order_code}`}
                        onClick={(event) => event.stopPropagation()}
                        className="text-[14px] font-semibold text-action hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!ordersQuery.isPending && (
        <p className="text-[13px] text-text-muted tabular-nums">
          Showing {orders.length} of {ordersQuery.data?.length ?? 0} orders
        </p>
      )}
    </div>
  );
}
