import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "../../../shared/api/client";
import { getOrder, markOrderPaid, updateOrderStatus } from "../api/sellerOrderApi";
import {
  allowedTransitions,
  canMarkPaid,
  orderStatusLabels,
  paymentStatusLabels,
  transitionLabels
} from "../orderStatus";
import type { OrderStatus, SellerOrderDetail } from "../types";

import styles from "../styles/seller.module.css";
import detailStyles from "./SellerOrderDetailPage.module.css";

function formatVnd(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
}

export function SellerOrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<SellerOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!orderCode) {
      return;
    }

    const controller = new AbortController();

    getOrder(orderCode, controller.signal)
      .then(setOrder)
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof ApiError ? caught.message : "Could not load this order.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [orderCode]);

  async function run(action: () => Promise<SellerOrderDetail>) {
    setError("");
    setIsSaving(true);

    try {
      setOrder(await action());
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not update this order.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className={styles.empty}>Loading...</p>;
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{error || "Order not found."}</p>
        <Link className={styles.secondaryButton} to="/seller/orders">
          Back to orders
        </Link>
      </div>
    );
  }

  const nextStatuses = allowedTransitions[order.orderStatus];

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>{order.orderCode}</h1>
          <p className={styles.subtitle}>Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <Link className={styles.secondaryButton} to="/seller/orders">
          Back to orders
        </Link>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.card}>
        <h2>Status</h2>
        <div className={detailStyles.statusRow}>
          <span className={`${styles.badge} ${styles.badgeProgress}`}>
            {orderStatusLabels[order.orderStatus]}
          </span>
          <span
            className={
              order.paymentStatus === "PAID"
                ? `${styles.badge} ${styles.badgeSuccess}`
                : `${styles.badge} ${styles.badgeNeutral}`
            }
          >
            {paymentStatusLabels[order.paymentStatus]}
          </span>
          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
            {order.paymentMethod === "COD" ? "COD" : "Bank transfer"}
          </span>
        </div>

        <div className={styles.formActions}>
          {nextStatuses.map((status: OrderStatus) => (
            <button
              key={status}
              type="button"
              className={status === "CANCELLED" ? styles.dangerButton : styles.primaryButton}
              disabled={isSaving}
              onClick={() => void run(() => updateOrderStatus(order.orderCode, status))}
            >
              {transitionLabels[status]}
            </button>
          ))}
          {canMarkPaid(order.orderStatus, order.paymentStatus) ? (
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={isSaving}
              onClick={() => void run(() => markOrderPaid(order.orderCode))}
            >
              Mark as paid
            </button>
          ) : null}
          {nextStatuses.length === 0 && !canMarkPaid(order.orderStatus, order.paymentStatus) ? (
            <p className={styles.subtitle}>This order has no further actions.</p>
          ) : null}
        </div>
      </section>

      <div className={detailStyles.columns}>
        <section className={styles.card}>
          <h2>Customer</h2>
          <address className={detailStyles.address}>
            <strong>{order.recipientFullName}</strong>
            <br />
            {order.phoneNumber}
            <br />
            {order.email}
            <br />
            {order.streetAddress}, {order.ward}, {order.district}, {order.provinceCity}
          </address>
          {order.customerNote ? (
            <p className={detailStyles.note}>
              <strong>Note:</strong> {order.customerNote}
            </p>
          ) : null}
        </section>

        {order.bankTransfer ? (
          <section className={styles.card}>
            <h2>Bank transfer</h2>
            <dl className={detailStyles.definitionList}>
              <div>
                <dt>Bank</dt>
                <dd>{order.bankTransfer.bankName}</dd>
              </div>
              <div>
                <dt>Account</dt>
                <dd>
                  {order.bankTransfer.accountNumber} — {order.bankTransfer.accountName}
                </dd>
              </div>
              <div>
                <dt>Transfer content</dt>
                <dd>{order.bankTransfer.transferContent}</dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>{formatDateTime(order.bankTransfer.paymentDueAt)}</dd>
              </div>
            </dl>
          </section>
        ) : null}
      </div>

      <section className={styles.card}>
        <h2>Items</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th className={styles.numeric}>Unit price</th>
                <th className={styles.numeric}>Qty</th>
                <th className={styles.numeric}>Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <td>{item.productNameVi}</td>
                  <td className={styles.numeric}>{formatVnd(item.unitPrice)}</td>
                  <td className={styles.numeric}>{item.quantity}</td>
                  <td className={styles.numeric}>{formatVnd(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Subtotal</td>
                <td className={styles.numeric}>{formatVnd(order.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3}>Shipping</td>
                <td className={styles.numeric}>{formatVnd(order.shippingFee)}</td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <strong>Total</strong>
                </td>
                <td className={styles.numeric}>
                  <strong>{formatVnd(order.totalAmount)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
