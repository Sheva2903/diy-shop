import { useTranslation } from "react-i18next";

import { formatVnd } from "../../../shared/format/money";
import type { BankTransferInstructions, OrderResponse } from "../types";

import styles from "./OrderSummaryPanels.module.css";

function formatDateTime(value: string, language: string): string {
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function OrderItemsPanel({ order }: { order: OrderResponse }) {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

  return (
    <section className={styles.card}>
      <h2>{t("checkout.items")}</h2>
      <ul className={styles.itemList}>
        {order.items.map((item) => (
          <li className={styles.item} key={item.productId}>
            <span>
              {(language === "en" ? item.productNameEn : item.productNameVi) || item.productNameVi} ×{" "}
              {item.quantity}
            </span>
            <span>{formatVnd(item.lineTotal, language)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span>{t("cart.subtotal")}</span>
          <span>{formatVnd(order.subtotal, language)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>{t("checkout.shippingFee")}</span>
          <span>{formatVnd(order.shippingFee, language)}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <span>{t("checkout.total")}</span>
          <span>{formatVnd(order.totalAmount, language)}</span>
        </div>
      </div>
    </section>
  );
}

export function RecipientPanel({ order }: { order: OrderResponse }) {
  const { t } = useTranslation();

  return (
    <section className={styles.card}>
      <h2>{t("checkout.recipientInfo")}</h2>
      <address className={styles.address}>
        <strong>{order.recipientFullName}</strong>
        <br />
        {order.phoneNumber}
        <br />
        {order.email}
        <br />
        {order.streetAddress}, {order.ward}, {order.district}, {order.provinceCity}
      </address>
    </section>
  );
}

export function BankTransferPanel({ bankTransfer }: { bankTransfer: BankTransferInstructions }) {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

  return (
    <section className={styles.card}>
      <h2>{t("checkout.bankTransferInstructions")}</h2>
      <dl className={styles.definitionList}>
        <div className={styles.definitionRow}>
          <dt>{t("checkout.bankName")}</dt>
          <dd>{bankTransfer.bankName}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>{t("checkout.accountNumber")}</dt>
          <dd>{bankTransfer.accountNumber}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>{t("checkout.accountName")}</dt>
          <dd>{bankTransfer.accountName}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>{t("checkout.amount")}</dt>
          <dd>{formatVnd(bankTransfer.amount, language)}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>{t("checkout.transferContent")}</dt>
          <dd>{bankTransfer.transferContent}</dd>
        </div>
        <div className={styles.definitionRow}>
          <dt>{t("checkout.paymentDueAt")}</dt>
          <dd>{formatDateTime(bankTransfer.paymentDueAt, language)}</dd>
        </div>
      </dl>
      {bankTransfer.qrImageUrl ? (
        <div className={styles.qrFrame}>
          <img src={bankTransfer.qrImageUrl} alt="VietQR" />
        </div>
      ) : null}
    </section>
  );
}

export function CodPanel() {
  const { t } = useTranslation();

  return (
    <section className={styles.card}>
      <h2>{t("checkout.codNote")}</h2>
      <p className={styles.muted}>{t("checkout.codDescription")}</p>
    </section>
  );
}
