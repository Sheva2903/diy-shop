import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { trackOrder } from "../../api/orders";
import { OrderStatusBadge, PaymentStatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/Field";
import { formatDateTime, formatVnd, maskPhone } from "../../lib/format";
import { localizeName } from "../../lib/localize";
import type { OrderView } from "../../types/database";
import { BankTransferPanel } from "../components/BankTransferPanel";

export function OrderLookupPage() {
  const { t, i18n } = useTranslation();
  const [orderCode, setOrderCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation<OrderView, Error, { code: string; phone: string }>({
    mutationFn: ({ code, phone }) => trackOrder(code, phone)
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!orderCode.trim() || !phoneNumber.trim()) {
      setFormError(t("tracking.required"));
      return;
    }

    setFormError(null);
    mutation.mutate({ code: orderCode, phone: phoneNumber });
  };

  const order = mutation.data;

  return (
    <div className="section shell max-w-3xl">
      <h1 className="text-[24px] font-bold text-text lg:text-[32px]">{t("tracking.title")}</h1>
      <p className="mt-2 text-[15px] text-text-muted">{t("tracking.description")}</p>

      <form onSubmit={submit} noValidate className="mt-6 rounded-card bg-surface p-5 shadow-card lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t("tracking.orderCode")}
            placeholder={t("tracking.orderCodePlaceholder")}
            value={orderCode}
            onChange={(event) => setOrderCode(event.target.value)}
            inputClassName="font-mono"
          />
          <TextField
            label={t("tracking.phone")}
            placeholder={t("tracking.phonePlaceholder")}
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </div>

        {formError && <p className="mt-3 text-[13px] text-danger">{formError}</p>}

        <Button type="submit" className="mt-5" disabled={mutation.isPending}>
          {mutation.isPending ? t("tracking.searching") : t("tracking.submit")}
        </Button>
      </form>

      {mutation.isError && (
        <p className="mt-6 rounded-card bg-danger-soft px-5 py-4 text-[15px] text-danger">
          {t("tracking.notFound")}
        </p>
      )}

      {order && (
        <div className="mt-6 space-y-6">
          <section className="rounded-card bg-surface p-5 shadow-card lg:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[20px] font-bold text-text">{order.orderCode}</p>
                <p className="mt-1 text-[13px] text-text-muted">
                  {t("tracking.orderDate")}: {formatDateTime(order.createdAt, i18n.language)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <OrderStatusBadge
                  status={order.orderStatus}
                  label={t(`orderStatus.${order.orderStatus}`)}
                />
                <PaymentStatusBadge
                  status={order.paymentStatus}
                  label={t(`paymentStatus.${order.paymentStatus}`)}
                />
              </div>
            </div>

            {order.orderStatus === "CANCELLED" && order.cancellationReason && (
              <p className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-[14px] text-danger">
                {t("tracking.cancelledReason")}: {order.cancellationReason}
              </p>
            )}

            <h2 className="mt-6 text-[15px] font-semibold text-text">{t("tracking.items")}</h2>
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

            <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-4">
              <span className="text-[15px] font-semibold text-text">{t("tracking.total")}</span>
              <span className="text-[20px] font-bold text-text">
                {formatVnd(order.totalAmount, i18n.language)}
              </span>
            </div>

            {/* plan §1.7 — shipping details with the phone number partly masked */}
            <div className="mt-6 border-t border-hairline pt-4">
              <h2 className="text-[15px] font-semibold text-text">{t("tracking.shippingTo")}</h2>
              <p className="mt-1.5 text-[14px] text-text">
                {order.recipientFullName} · {maskPhone(order.phoneNumber)}
              </p>
              <p className="text-[14px] text-text-muted">
                {[order.streetAddress, order.ward, order.district, order.provinceCity]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </section>

          {order.paymentStatus === "UNPAID" && order.bankTransfer && (
            <BankTransferPanel instructions={order.bankTransfer} />
          )}
        </div>
      )}
    </div>
  );
}
