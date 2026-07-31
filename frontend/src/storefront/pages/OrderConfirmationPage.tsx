import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { ButtonLink } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { useToast } from "../../components/ui/toast";
import { formatVnd } from "../../lib/format";
import { localizeName } from "../../lib/localize";
import type { OrderView } from "../../types/database";
import { BankTransferPanel } from "../components/BankTransferPanel";

export function OrderConfirmationPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const order = (location.state as { order?: OrderView } | null)?.order;

  if (!order) {
    return (
      <div className="section shell">
        <EmptyState
          title={t("confirmation.noOrderTitle")}
          description={t("confirmation.noOrderDescription")}
          action={<ButtonLink to="/track">{t("confirmation.trackOrder")}</ButtonLink>}
        />
      </div>
    );
  }

  const copyOrderCode = async () => {
    try {
      await navigator.clipboard.writeText(order.orderCode);
      setCopied(true);
      toast.success(t("confirmation.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("state.errorTitle"));
    }
  };

  const address = [order.streetAddress, order.ward, order.district, order.provinceCity]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="section shell max-w-3xl">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-mint text-action">
          <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1 className="mt-5 text-[26px] font-bold text-text lg:text-[32px]">{t("confirmation.title")}</h1>
        <p className="mt-2 text-[15px] text-text-muted">{t("confirmation.subtitle")}</p>
      </div>

      {/* plan §1.6 — order code large, bold, with a copy button */}
      <div className="mt-8 rounded-card bg-surface p-6 text-center shadow-card">
        <p className="text-[13px] font-medium text-text-muted">{t("confirmation.orderCode")}</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="font-mono text-[24px] font-bold tracking-tight text-text lg:text-[28px]">
            {order.orderCode}
          </span>
          <button
            type="button"
            onClick={copyOrderCode}
            aria-label={t("confirmation.copy")}
            className="inline-flex size-11 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-ceramic hover:text-text"
          >
            {copied ? (
              <svg viewBox="0 0 24 24" className="size-5 text-action" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2 text-[13px] text-text-muted">{t("confirmation.saveCodeNote")}</p>
      </div>

      <section className="mt-6 rounded-card bg-surface p-5 shadow-card lg:p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[13px] text-text-muted">{t("confirmation.recipient")}</dt>
            <dd className="mt-0.5 text-[15px] font-semibold text-text">{order.recipientFullName}</dd>
            <dd className="text-[14px] text-text-muted">{order.phoneNumber}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-text-muted">{t("confirmation.paymentMethod")}</dt>
            <dd className="mt-0.5 text-[15px] font-semibold text-text">
              {t(`paymentMethod.${order.paymentMethod}`)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[13px] text-text-muted">{t("confirmation.address")}</dt>
            <dd className="mt-0.5 text-[15px] text-text">{address}</dd>
          </div>
        </dl>

        <h2 className="mt-6 text-[15px] font-semibold text-text">{t("confirmation.items")}</h2>
        <ul className="mt-3 divide-y divide-hairline">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between gap-4 py-2.5">
              <span className="min-w-0 text-[14px] text-text">
                {localizeName(
                  { nameVi: item.productNameVi, nameEn: item.productNameEn },
                  i18n.language
                )}
                <span className="text-text-muted"> × {item.quantity}</span>
              </span>
              <span className="text-[14px] font-semibold text-text">
                {formatVnd(item.lineTotal, i18n.language)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-text-muted">{t("cart.subtotal")}</dt>
            <dd className="text-text">{formatVnd(order.subtotal, i18n.language)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">{t("cart.shipping")}</dt>
            <dd className="text-text">{formatVnd(order.shippingFee, i18n.language)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-hairline pt-3">
            <dt className="text-[15px] font-semibold text-text">{t("confirmation.total")}</dt>
            <dd className="text-[20px] font-bold text-text">
              {formatVnd(order.totalAmount, i18n.language)}
            </dd>
          </div>
        </dl>
      </section>

      {order.bankTransfer && (
        <div className="mt-6">
          <BankTransferPanel instructions={order.bankTransfer} />
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/track" variant="secondary">
          {t("confirmation.trackOrder")}
        </ButtonLink>
        <ButtonLink to="/products">{t("confirmation.continueShopping")}</ButtonLink>
      </div>
    </div>
  );
}
