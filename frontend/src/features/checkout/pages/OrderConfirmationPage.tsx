import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import {
  BankTransferPanel,
  CodPanel,
  OrderItemsPanel,
  RecipientPanel
} from "../components/OrderSummaryPanels";
import type { OrderResponse } from "../types";

import styles from "./OrderConfirmationPage.module.css";

export function OrderConfirmationPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const order = (location.state as { order?: OrderResponse } | null)?.order;

  if (!order) {
    return (
      <section className={styles.page}>
        <div className={styles.notFound}>
          <h1>{t("checkout.orderNotFound")}</h1>
          <p>{t("checkout.useTrackingPage")}</p>
          <Link className={styles.primaryButton} to="/track">
            {t("checkout.goToTracking")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <h1>{t("checkout.orderConfirmed")}</h1>
        <p>{t("checkout.confirmationSent")}</p>
        <div className={styles.orderCodeBlock}>
          <span className={styles.orderCodeLabel}>{t("checkout.orderCode")}</span>
          <strong className={styles.orderCode}>{order.orderCode}</strong>
          <span>{t("checkout.orderCodeHint")}</span>
        </div>
      </header>

      <div className={styles.panels}>
        <OrderItemsPanel order={order} />
        <RecipientPanel order={order} />
        {order.bankTransfer ? <BankTransferPanel bankTransfer={order.bankTransfer} /> : <CodPanel />}
      </div>

      <Link className={styles.secondaryLink} to="/">
        {t("cart.continueShopping")}
      </Link>
    </section>
  );
}
