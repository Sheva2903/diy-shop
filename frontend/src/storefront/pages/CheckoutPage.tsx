import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { createOrder } from "../../api/orders";
import { getShopSettings } from "../../api/settings";
import { Button, ButtonLink } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { TextAreaField, TextField } from "../../components/ui/Field";
import { useToast } from "../../components/ui/toast";
import { useCart } from "../../features/cart/CartProvider";
import {
  validateCheckout,
  type CheckoutErrors,
  type CheckoutFormValues
} from "../../features/checkout/validation";
import { cn } from "../../lib/cn";
import { formatVnd } from "../../lib/format";
import { localizeName } from "../../lib/localize";
import type { PaymentMethod } from "../../types/database";
import { AddressSelects, type AddressCodes } from "../components/AddressSelects";

const emptyValues: CheckoutFormValues = {
  recipientFullName: "",
  phoneNumber: "",
  email: "",
  provinceCity: "",
  district: "",
  ward: "",
  streetAddress: "",
  customerNote: ""
};

function PaymentOption({
  selected,
  onSelect,
  title,
  description,
  icon
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-card border-2 p-4 transition-colors duration-[120ms]",
        selected ? "border-action bg-mint/30" : "border-hairline bg-surface hover:border-action/40"
      )}
    >
      <input
        type="radio"
        name="paymentMethod"
        checked={selected}
        onChange={onSelect}
        className="mt-1 size-4 accent-action"
      />
      <span className="text-action">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-text">{title}</span>
        <span className="block text-[13px] text-text-muted">{description}</span>
      </span>
    </label>
  );
}

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { items, subtotal, clear } = useCart();

  const [values, setValues] = useState<CheckoutFormValues>(emptyValues);
  const [codes, setCodes] = useState<AddressCodes>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutFormValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  const settingsQuery = useQuery({ queryKey: ["shop-settings"], queryFn: getShopSettings });

  const allErrors: CheckoutErrors = validateCheckout(values);
  const errorMessage = (field: keyof CheckoutFormValues): string | undefined => {
    if (!submitted && !touched[field]) return undefined;
    const error = allErrors[field];
    if (!error) return undefined;
    if (error.rule === "maxLength") return t("validation.maxLength", { max: error.max });
    if (error.rule === "invalidEmail") return t("validation.invalidEmail");
    return t("validation.required");
  };

  const shippingFee = settingsQuery.data
    ? settingsQuery.data.free_shipping_threshold != null &&
      subtotal >= settingsQuery.data.free_shipping_threshold
      ? 0
      : Number(settingsQuery.data.shipping_flat_fee)
    : null;

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      clear();
      navigate("/checkout/success", { state: { order }, replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("checkout.submitError"));
    }
  });

  if (!items.length && !mutation.isPending) {
    return (
      <div className="section shell">
        <EmptyState
          title={t("checkout.emptyCart")}
          description={t("checkout.emptyCartDescription")}
          action={<ButtonLink to="/products">{t("cart.emptyCta")}</ButtonLink>}
        />
      </div>
    );
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(allErrors).length > 0) return;

    mutation.mutate({
      recipientFullName: values.recipientFullName.trim(),
      phoneNumber: values.phoneNumber.trim(),
      email: values.email.trim(),
      provinceCity: values.provinceCity.trim(),
      district: values.district.trim(),
      ward: values.ward.trim(),
      streetAddress: values.streetAddress.trim(),
      customerNote: values.customerNote.trim() || undefined,
      paymentMethod,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    });
  };

  const summary = (
    <aside className="rounded-card bg-surface p-5 shadow-card lg:sticky lg:top-24">
      <h2 className="text-[18px] font-semibold text-text">{t("checkout.summary")}</h2>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-ceramic">
              {item.primaryImageUrl && (
                <img src={item.primaryImageUrl} alt="" className="size-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-text">
                {localizeName({ nameVi: item.nameVi, nameEn: item.nameEn }, i18n.language)}
              </p>
              <p className="text-[13px] text-text-muted">× {item.quantity}</p>
            </div>
            <span className="text-[14px] font-semibold text-text">
              {formatVnd(item.price * item.quantity, i18n.language)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2.5 border-t border-hairline pt-4 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-text-muted">{t("cart.subtotal")}</dt>
          <dd className="font-medium text-text">{formatVnd(subtotal, i18n.language)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-muted">{t("cart.shipping")}</dt>
          <dd className="font-medium text-text">
            {shippingFee == null ? "—" : formatVnd(shippingFee, i18n.language)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-4">
        <span className="text-[15px] font-semibold text-text">{t("cart.total")}</span>
        <span className="text-[22px] font-bold text-text">
          {formatVnd(subtotal + (shippingFee ?? 0), i18n.language)}
        </span>
      </div>
    </aside>
  );

  return (
    <div className="section shell">
      <h1 className="text-[24px] font-bold text-text lg:text-[32px]">{t("checkout.title")}</h1>

      <form onSubmit={submit} noValidate className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-8">
          {/* ------------------------------------ Step 1: shipping details */}
          <section className="rounded-card bg-surface p-5 shadow-card lg:p-6">
            <h2 className="text-[18px] font-semibold text-text">{t("checkout.shippingSection")}</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                label={t("checkout.fullName")}
                required
                autoComplete="name"
                value={values.recipientFullName}
                error={errorMessage("recipientFullName")}
                onChange={(event) => setValues((v) => ({ ...v, recipientFullName: event.target.value }))}
                onBlur={() => setTouched((state) => ({ ...state, recipientFullName: true }))}
              />
              <TextField
                label={t("checkout.phone")}
                required
                type="tel"
                autoComplete="tel"
                value={values.phoneNumber}
                error={errorMessage("phoneNumber")}
                onChange={(event) => setValues((v) => ({ ...v, phoneNumber: event.target.value }))}
                onBlur={() => setTouched((state) => ({ ...state, phoneNumber: true }))}
              />
              <TextField
                label={t("checkout.email")}
                required
                type="email"
                autoComplete="email"
                className="sm:col-span-2"
                value={values.email}
                error={errorMessage("email")}
                onChange={(event) => setValues((v) => ({ ...v, email: event.target.value }))}
                onBlur={() => setTouched((state) => ({ ...state, email: true }))}
              />

              <AddressSelects
                value={values}
                codes={codes}
                errors={{
                  provinceCity: errorMessage("provinceCity"),
                  district: errorMessage("district"),
                  ward: errorMessage("ward")
                }}
                onChange={(patch, codePatch) => {
                  setValues((v) => ({ ...v, ...patch }));
                  if (codePatch) setCodes((c) => ({ ...c, ...codePatch }));
                }}
                onBlurField={(field) => setTouched((state) => ({ ...state, [field]: true }))}
              />

              <TextField
                label={t("checkout.street")}
                required
                autoComplete="street-address"
                className="sm:col-span-2"
                value={values.streetAddress}
                error={errorMessage("streetAddress")}
                onChange={(event) => setValues((v) => ({ ...v, streetAddress: event.target.value }))}
                onBlur={() => setTouched((state) => ({ ...state, streetAddress: true }))}
              />

              <TextAreaField
                label={t("checkout.note")}
                placeholder={t("checkout.notePlaceholder")}
                className="sm:col-span-2"
                rows={3}
                value={values.customerNote}
                error={errorMessage("customerNote")}
                onChange={(event) => setValues((v) => ({ ...v, customerNote: event.target.value }))}
                onBlur={() => setTouched((state) => ({ ...state, customerNote: true }))}
              />
            </div>
          </section>

          {/* ------------------------------------- Step 2: payment method */}
          <section className="rounded-card bg-surface p-5 shadow-card lg:p-6">
            <h2 className="text-[18px] font-semibold text-text">{t("checkout.paymentSection")}</h2>

            <div className="mt-5 grid gap-3">
              <PaymentOption
                selected={paymentMethod === "COD"}
                onSelect={() => setPaymentMethod("COD")}
                title={t("checkout.cod")}
                description={t("checkout.codDescription")}
                icon={
                  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <rect x="2.5" y="6" width="19" height="12" rx="2" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                }
              />
              <PaymentOption
                selected={paymentMethod === "BANK_TRANSFER"}
                onSelect={() => setPaymentMethod("BANK_TRANSFER")}
                title={t("checkout.bankTransfer")}
                description={t("checkout.bankTransferDescription")}
                icon={
                  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M3 9.5 12 4l9 5.5M5 10v8m4-8v8m6-8v8m4-8v8M3 20h18" strokeLinecap="round" />
                  </svg>
                }
              />
            </div>

            {/* plan §1.5 — show the shop's bank details as soon as transfer is picked */}
            {paymentMethod === "BANK_TRANSFER" && settingsQuery.data && (
              <div className="mt-4 rounded-card bg-ceramic p-4">
                <dl className="grid gap-2 text-[14px] sm:grid-cols-2">
                  <div>
                    <dt className="text-text-muted">{t("bank.bankName")}</dt>
                    <dd className="font-semibold text-text">{settingsQuery.data.bank_name}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">{t("bank.accountNumber")}</dt>
                    <dd className="font-semibold text-text">{settingsQuery.data.account_number}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">{t("bank.accountName")}</dt>
                    <dd className="font-semibold text-text">{settingsQuery.data.account_name}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[13px] text-text-muted">
                  {t("checkout.bankInstructions", { content: t("confirmation.orderCode") })}
                </p>
              </div>
            )}
          </section>

          <Button type="submit" size="lg" fullWidth className="lg:hidden" disabled={mutation.isPending}>
            {mutation.isPending ? t("checkout.submitting") : t("checkout.placeOrder")}
          </Button>
        </div>

        <div className="space-y-4 max-lg:order-first">
          {summary}
          <Button type="submit" size="lg" fullWidth className="max-lg:hidden" disabled={mutation.isPending}>
            {mutation.isPending ? t("checkout.submitting") : t("checkout.placeOrder")}
          </Button>
        </div>
      </form>
    </div>
  );
}
