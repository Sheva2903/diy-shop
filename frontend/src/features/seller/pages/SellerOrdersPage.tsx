import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../../../shared/api/client";
import { getOrders } from "../api/sellerOrderApi";
import { orderStatusLabels, paymentStatusLabels } from "../orderStatus";
import type { OrderStatus, PaymentStatus, SellerOrderListItem } from "../types";

import styles from "../styles/seller.module.css";

const activeStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING"];
const filters = ["ACTIVE", "ALL", "PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"] as const;
type Filter = (typeof filters)[number];

const filterLabels: Record<Filter, string> = {
  ACTIVE: "Active",
  ALL: "All",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
};

function orderStatusTone(status: OrderStatus): string {
  if (status === "DELIVERED") return styles.badgeSuccess;
  if (status === "CANCELLED") return styles.badgeDanger;
  if (status === "PENDING") return styles.badgeNeutral;
  return styles.badgeProgress;
}

function paymentStatusTone(status: PaymentStatus): string {
  if (status === "PAID") return styles.badgeSuccess;
  if (status === "FAILED") return styles.badgeDanger;
  return styles.badgeNeutral;
}

export function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("ACTIVE");

  useEffect(() => {
    const controller = new AbortController();

    getOrders(controller.signal)
      .then(setOrders)
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof ApiError ? caught.message : "Could not load orders.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const visibleOrders = useMemo(() => {
    if (filter === "ALL") return orders;
    if (filter === "ACTIVE") return orders.filter((order) => activeStatuses.includes(order.orderStatus));
    return orders.filter((order) => order.orderStatus === filter);
  }, [orders, filter]);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Orders</h1>
          <p className={styles.subtitle}>
            {visibleOrders.length} of {orders.length} orders
          </p>
        </div>
      </header>

      <div className={styles.filters}>
        {filters.map((option) => (
          <button
            key={option}
            type="button"
            className={
              filter === option
                ? `${styles.filterButton} ${styles.filterButtonActive}`
                : styles.filterButton
            }
            onClick={() => setFilter(option)}
          >
            {filterLabels[option]}
          </button>
        ))}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <p className={styles.empty}>Loading...</p>
        ) : visibleOrders.length === 0 ? (
          <p className={styles.empty}>No orders in this view.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order code</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Payment</th>
                <th>Order status</th>
                <th>Payment status</th>
                <th className={styles.numeric}>Total</th>
                <th>Placed</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr key={order.orderCode}>
                  <td>{order.orderCode}</td>
                  <td>{order.recipientFullName}</td>
                  <td>{order.phoneNumber}</td>
                  <td>{order.paymentMethod === "COD" ? "COD" : "Bank transfer"}</td>
                  <td>
                    <span className={`${styles.badge} ${orderStatusTone(order.orderStatus)}`}>
                      {orderStatusLabels[order.orderStatus]}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${paymentStatusTone(order.paymentStatus)}`}>
                      {paymentStatusLabels[order.paymentStatus]}
                    </span>
                  </td>
                  <td className={styles.numeric}>
                    {new Intl.NumberFormat("vi-VN").format(order.totalAmount)} ₫
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <Link className={styles.linkButton} to={`/seller/orders/${order.orderCode}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
