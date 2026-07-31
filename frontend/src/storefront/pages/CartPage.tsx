import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { Button, ButtonLink, IconButton } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { QuantityStepper } from "../../components/ui/QuantityStepper";
import { useCart } from "../../features/cart/CartProvider";
import { formatVnd } from "../../lib/format";
import { localizeName } from "../../lib/localize";

export function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, hasOutOfStock, updateQuantity, removeItem } = useCart();

  if (!items.length) {
    return (
      <div className="section shell">
        <h1 className="mb-6 text-[24px] font-bold text-text lg:text-[32px]">{t("cart.title")}</h1>
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
            </svg>
          }
          title={t("cart.emptyTitle")}
          description={t("cart.emptyDescription")}
          action={<ButtonLink to="/products">{t("cart.emptyCta")}</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="section shell">
      <h1 className="text-[24px] font-bold text-text lg:text-[32px]">{t("cart.title")}</h1>

      {hasOutOfStock && (
        <p className="mt-4 rounded-card bg-danger-soft px-4 py-3 text-[14px] font-medium text-danger">
          {t("cart.outOfStockWarning")}
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* ------------------------------------------------- A. Line items */}
        <ul className="divide-y divide-hairline rounded-card bg-surface shadow-card">
          {items.map((item) => {
            const name = localizeName({ nameVi: item.nameVi, nameEn: item.nameEn }, i18n.language);
            const soldOut = item.inventoryQuantity <= 0;

            return (
              <li key={item.productId} className="flex gap-4 p-4">
                <Link to={`/products/${item.productId}`} className="shrink-0">
                  <div className="size-[60px] overflow-hidden rounded-[10px] bg-ceramic">
                    {item.primaryImageUrl && (
                      <img src={item.primaryImageUrl} alt="" className="size-full object-cover" />
                    )}
                  </div>
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/products/${item.productId}`}
                        className="line-clamp-2 text-[15px] font-semibold text-text hover:text-action"
                      >
                        {name}
                      </Link>
                      {soldOut ? (
                        <p className="mt-0.5 text-[13px] font-semibold text-danger">
                          {t("product.outOfStock")}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[13px] text-text-muted">
                          {formatVnd(item.price, i18n.language)}
                        </p>
                      )}
                    </div>

                    <IconButton
                      aria-label={`${t("cart.remove")}: ${name}`}
                      tone="danger"
                      onClick={() => removeItem(item.productId)}
                    >
                      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </IconButton>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <QuantityStepper
                      size="sm"
                      value={item.quantity}
                      max={Math.max(item.inventoryQuantity, 1)}
                      onChange={(next) => updateQuantity(item.productId, next)}
                    />
                    <span className="text-[16px] font-bold text-text">
                      {formatVnd(item.price * item.quantity, i18n.language)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* ---------------------------------------------- B. Order summary */}
        <aside className="rounded-card bg-surface p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="text-[18px] font-semibold text-text">{t("cart.summary")}</h2>

          <dl className="mt-4 space-y-3 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-text-muted">{t("cart.subtotal")}</dt>
              <dd className="font-semibold text-text">{formatVnd(subtotal, i18n.language)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">{t("cart.shipping")}</dt>
              <dd className="text-right text-[13px] text-text-muted">{t("cart.shippingAtCheckout")}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-4">
            <span className="text-[15px] font-semibold text-text">{t("cart.total")}</span>
            <span className="text-[22px] font-bold text-text">
              {formatVnd(subtotal, i18n.language)}
            </span>
          </div>

          <Button
            fullWidth
            size="lg"
            className="mt-5"
            disabled={hasOutOfStock}
            onClick={() => navigate("/checkout")}
          >
            {t("cart.checkout")}
          </Button>

          <ButtonLink to="/products" variant="ghost" fullWidth className="mt-2">
            {t("cart.continueShopping")}
          </ButtonLink>
        </aside>
      </div>
    </div>
  );
}
