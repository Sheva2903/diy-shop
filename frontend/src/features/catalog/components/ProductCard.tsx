import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useCart } from "../../cart/hooks/useCart";
import { formatVnd } from "../../../shared/format/money";
import { localizeName } from "../../../shared/i18n/localize";
import type { ProductSummary } from "../types";

import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: ProductSummary;
};

export function ProductCard({ product }: ProductCardProps) {
  const { i18n, t } = useTranslation();
  const { addItem } = useCart();
  const productName = localizeName(product, i18n.resolvedLanguage ?? i18n.language);
  const categoryName = localizeName(product.category, i18n.resolvedLanguage ?? i18n.language);

  function addToCart() {
    addItem({
      productId: product.id,
      nameVi: product.nameVi,
      nameEn: product.nameEn,
      price: product.price,
      primaryImageUrl: product.primaryImageUrl,
      quantity: 1,
      inventoryQuantity: product.inventoryQuantity
    });
  }

  return (
    <article className={styles.card}>
      <Link className={styles.imageLink} to={`/products/${product.id}`} aria-label={productName}>
        <div className={styles.imageFrame}>
          {product.primaryImageUrl ? (
            <img
              className={styles.image}
              src={product.primaryImageUrl}
              alt={t("product.imageAlt", { name: productName })}
              onError={(event) => event.currentTarget.classList.add(styles.imageFailed)}
            />
          ) : null}
          <span className={styles.imageFallback} aria-hidden="true">
            {productName.slice(0, 1)}
          </span>
        </div>
      </Link>
      <div className={styles.content}>
        <p className={styles.category}>{categoryName}</p>
        <h2 className={styles.name}>
          <Link to={`/products/${product.id}`}>{productName}</Link>
        </h2>
        <div className={styles.meta}>
          <strong>{formatVnd(product.price, i18n.resolvedLanguage ?? i18n.language)}</strong>
          <span className={product.inStock ? styles.available : styles.unavailable}>
            {product.inStock
              ? t("catalog.available", { count: product.inventoryQuantity })
              : t("catalog.unavailable")}
          </span>
        </div>
        <div className={styles.actions}>
          <Link className={styles.productLink} to={`/products/${product.id}`}>
            {t("catalog.viewProduct")}
          </Link>
          <button
            type="button"
            className={styles.addButton}
            disabled={!product.inStock}
            onClick={addToCart}
          >
            {t("cart.add")}
          </button>
        </div>
      </div>
    </article>
  );
}
