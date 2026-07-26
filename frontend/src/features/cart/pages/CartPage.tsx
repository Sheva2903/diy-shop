import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { formatVnd } from "../../../shared/format/money";
import { localizeName } from "../../../shared/i18n/localize";
import { useCart } from "../hooks/useCart";

import styles from "./CartPage.module.css";

export function CartPage() {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <section className={styles.page}>
        <h1>{t("cart.title")}</h1>
        <div className={styles.empty}>
          <p>{t("cart.empty")}</p>
          <Link className={styles.primaryButton} to="/">
            {t("cart.continueShopping")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <h1>{t("cart.title")}</h1>
      <div className={styles.layout}>
        <ul className={styles.items}>
          {items.map((item) => {
            const name = localizeName(item, language);

            return (
              <li className={styles.item} key={item.productId}>
                {item.primaryImageUrl ? (
                  <img className={styles.thumbnail} src={item.primaryImageUrl} alt="" />
                ) : (
                  <span className={styles.thumbnailFallback} aria-hidden="true">
                    {name.slice(0, 1)}
                  </span>
                )}
                <div className={styles.itemBody}>
                  <Link className={styles.itemName} to={`/products/${item.productId}`}>
                    {name}
                  </Link>
                  <p className={styles.itemPrice}>{formatVnd(item.price, language)}</p>
                  <div className={styles.itemControls}>
                    <div className={styles.quantityControl}>
                      <button
                        type="button"
                        aria-label="-"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className={styles.quantityValue}>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="+"
                        disabled={item.quantity >= item.inventoryQuantity}
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className={styles.lineTotal}>
                      {formatVnd(item.price * item.quantity, language)}
                    </span>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeItem(item.productId)}
                    >
                      {t("cart.remove")}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className={styles.summary}>
          <h2>{t("cart.orderSummary")}</h2>
          <div className={styles.summaryRow}>
            <span>{t("cart.subtotal")}</span>
            <span>{formatVnd(subtotal, language)}</span>
          </div>
          <p className={styles.summaryNote}>{t("cart.shippingNote")}</p>
          <Link className={styles.primaryButton} to="/checkout">
            {t("cart.proceedToCheckout")}
          </Link>
          <Link className={styles.secondaryLink} to="/">
            {t("cart.continueShopping")}
          </Link>
        </aside>
      </div>
    </section>
  );
}
