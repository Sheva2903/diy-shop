import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useCart } from "../../cart/hooks/useCart";
import { ApiError } from "../../../shared/api/client";
import { formatVnd } from "../../../shared/format/money";
import { localizeName } from "../../../shared/i18n/localize";
import { createOrder } from "../api/checkoutApi";
import type { PaymentMethod } from "../types";
import { validateCheckout, type CheckoutErrors, type CheckoutFormValues } from "../validation";

import styles from "./CheckoutPage.module.css";

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

export function CheckoutPage() {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();

  const [values, setValues] = useState<CheckoutFormValues>(emptyValues);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function updateField(field: keyof CheckoutFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function describeError(field: keyof CheckoutFormValues): string | null {
    const error = errors[field];
    if (!error) {
      return null;
    }

    if (error.rule === "maxLength") {
      return t("checkout.maxLength", { max: error.max });
    }

    return t(`checkout.${error.rule}`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createOrder({
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

      clear();
      navigate("/checkout/success", { state: { order }, replace: true });
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : t("checkout.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderField(
    field: keyof CheckoutFormValues,
    label: string,
    options: { placeholder?: string; type?: string; multiline?: boolean } = {}
  ) {
    const error = describeError(field);

    return (
      <label className={error ? `${styles.field} ${styles.fieldError}` : styles.field}>
        <span>{label}</span>
        {options.multiline ? (
          <textarea
            value={values[field]}
            placeholder={options.placeholder}
            onChange={(event) => updateField(field, event.target.value)}
          />
        ) : (
          <input
            type={options.type ?? "text"}
            value={values[field]}
            placeholder={options.placeholder}
            onChange={(event) => updateField(field, event.target.value)}
          />
        )}
        {error ? <span className={styles.errorText}>{error}</span> : null}
      </label>
    );
  }

  return (
    <section className={styles.page}>
      <h1>{t("checkout.title")}</h1>
      <div className={styles.layout}>
        <form id="checkout-form" className={styles.form} onSubmit={onSubmit} noValidate>
          <fieldset className={styles.fieldset}>
            <legend>{t("checkout.recipientInfo")}</legend>
            {renderField("recipientFullName", t("checkout.fullName"))}
            {renderField("phoneNumber", t("checkout.phoneNumber"), { type: "tel" })}
            {renderField("email", t("checkout.email"), { type: "email" })}
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>{t("checkout.shippingAddress")}</legend>
            <div className={styles.fieldRow}>
              {renderField("provinceCity", t("checkout.provinceCity"), {
                placeholder: t("checkout.provinceCityPlaceholder")
              })}
              {renderField("district", t("checkout.district"), {
                placeholder: t("checkout.districtPlaceholder")
              })}
              {renderField("ward", t("checkout.ward"), { placeholder: t("checkout.wardPlaceholder") })}
            </div>
            {renderField("streetAddress", t("checkout.streetAddress"), {
              placeholder: t("checkout.streetAddressPlaceholder")
            })}
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>{t("checkout.additionalInfo")}</legend>
            {renderField("customerNote", t("checkout.note"), {
              placeholder: t("checkout.notePlaceholder"),
              multiline: true
            })}
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>{t("checkout.paymentMethod")}</legend>
            <div className={styles.paymentOptions}>
              {(["COD", "BANK_TRANSFER"] as PaymentMethod[]).map((method) => (
                <label
                  key={method}
                  className={
                    paymentMethod === method
                      ? `${styles.paymentOption} ${styles.paymentOptionSelected}`
                      : styles.paymentOption
                  }
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                  />
                  {method === "COD" ? t("checkout.cod") : t("checkout.bankTransfer")}
                </label>
              ))}
            </div>
          </fieldset>
        </form>

        <aside className={styles.summary}>
          <h2>{t("checkout.orderSummary")}</h2>
          <ul className={styles.summaryItems}>
            {items.map((item) => (
              <li className={styles.summaryItem} key={item.productId}>
                <span>
                  {localizeName(item, language)} × {item.quantity}
                </span>
                <span>{formatVnd(item.price * item.quantity, language)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.summaryRow}>
            <span>{t("cart.subtotal")}</span>
            <span>{formatVnd(subtotal, language)}</span>
          </div>
          <p className={styles.summaryNote}>{t("cart.shippingNote")}</p>
          {submitError ? <p className={styles.submitError}>{submitError}</p> : null}
          <button type="submit" form="checkout-form" className={styles.primaryButton} disabled={isSubmitting}>
            {isSubmitting ? t("checkout.submitting") : t("checkout.placeOrder")}
          </button>
          <Link className={styles.secondaryLink} to="/cart">
            {t("checkout.backToCart")}
          </Link>
        </aside>
      </div>
    </section>
  );
}
