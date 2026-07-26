import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import {
  BankTransferPanel,
  CodPanel,
  OrderItemsPanel,
  RecipientPanel
} from "../../checkout/components/OrderSummaryPanels";
import type { OrderResponse, OrderStatus, PaymentStatus } from "../../checkout/types";
import { ApiError } from "../../../shared/api/client";
import { trackOrder } from "../api/orderTrackingApi";

import styles from "./OrderTrackingPage.module.css";

const orderStatusTone: Record<OrderStatus, string> = {
  PENDING: styles.badgeNeutral,
  CONFIRMED: styles.badgeProgress,
  SHIPPING: styles.badgeProgress,
  DELIVERED: styles.badgeSuccess,
  CANCELLED: styles.badgeDanger
};

const paymentStatusTone: Record<PaymentStatus, string> = {
  UNPAID: styles.badgeNeutral,
  PAID: styles.badgeSuccess,
  FAILED: styles.badgeDanger
};

export function OrderTrackingPage() {
  const { t } = useTranslation();
  const [orderCode, setOrderCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setOrder(null);

    if (!orderCode.trim() || !phoneNumber.trim()) {
      setError(t("orderTracking.required"));
      return;
    }

    setIsLoading(true);

    try {
      setOrder(await trackOrder(orderCode.trim(), phoneNumber.trim()));
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 404
          ? t("orderTracking.notFound")
          : t("orderTracking.error")
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.intro}>
        <h1>{t("orderTracking.title")}</h1>
        <p>{t("orderTracking.description")}</p>
      </header>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <label className={styles.field}>
          <span>{t("orderTracking.orderCode")}</span>
          <input
            value={orderCode}
            placeholder={t("orderTracking.orderCodePlaceholder")}
            onChange={(event) => setOrderCode(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>{t("orderTracking.phoneNumber")}</span>
          <input
            type="tel"
            value={phoneNumber}
            placeholder={t("orderTracking.phoneNumberPlaceholder")}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </label>
        <button type="submit" className={styles.primaryButton} disabled={isLoading}>
          {isLoading ? t("orderTracking.searching") : t("orderTracking.search")}
        </button>
      </form>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {order ? (
        <>
          <div className={styles.statusHeader}>
            <p className={styles.orderCode}>{order.orderCode}</p>
            <div className={styles.badges}>
              <span className={`${styles.badge} ${orderStatusTone[order.orderStatus]}`}>
                {t(`orderTracking.status.${order.orderStatus}`)}
              </span>
              <span className={`${styles.badge} ${paymentStatusTone[order.paymentStatus]}`}>
                {t(`orderTracking.paymentStatus.${order.paymentStatus}`)}
              </span>
            </div>
          </div>

          <div className={styles.panels}>
            <OrderItemsPanel order={order} />
            <RecipientPanel order={order} />
            {order.bankTransfer ? (
              <BankTransferPanel bankTransfer={order.bankTransfer} />
            ) : (
              <CodPanel />
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
