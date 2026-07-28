import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getDashboardStats, getSellerOrders } from "../../api/seller";
import { OrderStatusBadge } from "../../components/ui/Badge";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/Feedback";
import { orderStatusLabels } from "../../features/seller/orderStatus";
import { CategoryRevenueChart } from "../components/CategoryRevenueChart";
import { formatVnd } from "../../lib/format";

function Trend({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) {
    return <span className="text-[13px] text-text-muted">No change</span>;
  }

  const delta = previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
  const up = delta >= 0;

  return (
    <span className={`text-[13px] font-semibold ${up ? "text-action" : "text-danger"}`}>
      {up ? "▲" : "▼"} {Math.abs(delta)}% vs previous
    </span>
  );
}

function StatCard({
  label,
  value,
  footer
}: {
  label: string;
  value: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-card bg-surface p-5 shadow-card">
      <p className="text-[13px] font-medium text-text-muted">{label}</p>
      <p className="mt-1.5 text-[28px] font-bold text-text">{value}</p>
      {footer && <div className="mt-1">{footer}</div>}
    </div>
  );
}

export function SellerOverviewPage() {
  const statsQuery = useQuery({ queryKey: ["seller", "stats"], queryFn: getDashboardStats });
  const ordersQuery = useQuery({ queryKey: ["seller", "orders"], queryFn: getSellerOrders });

  if (statsQuery.isError) {
    return <ErrorState title="Could not load dashboard" description={statsQuery.error.message} />;
  }

  const stats = statsQuery.data;
  const actionable = (ordersQuery.data ?? [])
    .filter((order) => order.order_status === "PENDING" || order.order_status === "CONFIRMED")
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* --------------------------------------------------- A. Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsQuery.isPending || !stats
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[104px] rounded-card" />
            ))
          : [
              {
                label: "New orders today",
                value: String(stats.ordersToday),
                footer: <Trend current={stats.ordersToday} previous={stats.ordersYesterday} />
              },
              {
                label: "Revenue (7 days)",
                value: formatVnd(stats.revenue7Days, "vi"),
                footer: <Trend current={stats.revenue7Days} previous={stats.revenuePrevious7Days} />
              },
              { label: "Active products", value: String(stats.activeProducts) },
              { label: "Orders to process", value: String(stats.pendingOrders) }
            ].map((card) => <StatCard key={card.label} {...card} />)}
      </section>

      {/* ------------------------------------ Revenue split across categories */}
      <CategoryRevenueChart />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr] xl:items-start">
        {/* ------------------------------------------- B. Orders to process */}
        <section className="rounded-card bg-surface shadow-card">
          <div className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4">
            <h2 className="text-[16px] font-semibold text-text">Orders to process</h2>
            <Link to="/seller/orders" className="text-[14px] font-semibold text-action hover:underline">
              View all orders
            </Link>
          </div>

          {ordersQuery.isPending ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-10" />
              ))}
            </div>
          ) : actionable.length === 0 ? (
            <EmptyState title="Nothing waiting" description="All orders have been handled." className="shadow-none" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="text-[12px] font-semibold tracking-wide text-text-muted uppercase">
                    <th className="px-5 py-3">Order code</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {actionable.map((order) => (
                    <tr key={order.order_code} className="text-[14px]">
                      <td className="px-5 py-3 font-mono font-semibold text-text">{order.order_code}</td>
                      <td className="px-5 py-3 text-text">{order.recipient_full_name}</td>
                      <td className="px-5 py-3 font-semibold text-text">
                        {formatVnd(order.total_amount, "vi")}
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge
                          status={order.order_status}
                          label={orderStatusLabels[order.order_status]}
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/seller/orders/${order.order_code}`}
                          className="text-[14px] font-semibold text-action hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* -------------------------------------------- C. Low stock alerts */}
        <section className="rounded-card bg-surface shadow-card">
          <div className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4">
            <h2 className="text-[16px] font-semibold text-text">Low stock</h2>
            <Link to="/seller/products" className="text-[14px] font-semibold text-action hover:underline">
              Update stock
            </Link>
          </div>

          {statsQuery.isPending ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12" />
              ))}
            </div>
          ) : !stats?.lowStock.length ? (
            <EmptyState title="Stock looks healthy" description="No product is at or below 5 units." className="shadow-none" />
          ) : (
            <ul className="divide-y divide-hairline">
              {stats.lowStock.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-ceramic">
                    {product.image_url && (
                      <img src={product.image_url} alt="" className="size-full object-cover" />
                    )}
                  </div>
                  <Link
                    to={`/seller/products/${product.id}`}
                    className="min-w-0 flex-1 truncate text-[14px] font-medium text-text hover:text-action"
                  >
                    {product.name_vi}
                  </Link>
                  <span className="text-[14px] font-bold text-danger">
                    {product.inventory_quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {ordersQuery.isError && (
        <p className="rounded-card bg-danger-soft px-4 py-3 text-[14px] text-danger">
          {ordersQuery.error.message}
        </p>
      )}
    </div>
  );
}
