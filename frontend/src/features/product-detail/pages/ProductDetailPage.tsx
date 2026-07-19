import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "../../../shared/api/client";
import { ErrorState, LoadingState } from "../../../shared/components/ContentState";
import { formatVnd } from "../../../shared/format/money";
import { localizeDescription, localizeName } from "../../../shared/i18n/localize";
import { useProductDetail } from "../hooks/useProductDetail";

import styles from "./ProductDetailPage.module.css";

export function ProductDetailPage() {
  const { productId } = useParams();
  const numericId = Number(productId);
  const productQuery = useProductDetail(numericId);

  if (!Number.isInteger(numericId) || numericId < 1) {
    return <ProductNotFound />;
  }

  if (productQuery.isPending) {
    return (
      <section className={styles.page}>
        <LoadingState />
      </section>
    );
  }

  if (productQuery.isError) {
    if (productQuery.error instanceof ApiError && productQuery.error.status === 404) {
      return <ProductNotFound />;
    }

    return (
      <section className={styles.page}>
        <ErrorState onRetry={() => void productQuery.refetch()} />
      </section>
    );
  }

  return <ProductDetail product={productQuery.data} />;
}

function ProductDetail({ product }: { product: NonNullable<ReturnType<typeof useProductDetail>["data"]> }) {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const productName = localizeName(product, language);
  const description = localizeDescription(product, language);
  const categoryName = localizeName(product.category, language);
  const images = useMemo(
    () => [...product.images].sort((first, second) => Number(second.primaryImage) - Number(first.primaryImage) || first.sortOrder - second.sortOrder),
    [product.images]
  );
  const primaryImage = images[0];

  return (
    <article className={styles.page}>
      <Link className={styles.backLink} to="/">
        {t("product.backToShop")}
      </Link>
      <div className={styles.layout}>
        <section className={styles.gallery}>
          <div className={styles.mainImageFrame}>
            {primaryImage ? (
              <img
                className={styles.mainImage}
                src={primaryImage.imageUrl}
                alt={t("product.imageAlt", { name: productName })}
                onError={(event) => event.currentTarget.classList.add(styles.imageFailed)}
              />
            ) : null}
            <span className={styles.imageFallback} aria-hidden="true">
              {productName.slice(0, 1)}
            </span>
          </div>
          {images.length > 1 ? (
            <div className={styles.thumbnailGrid}>
              {images.slice(1).map((image) => (
                <img
                  key={image.id}
                  className={styles.thumbnail}
                  src={image.imageUrl}
                  alt=""
                  onError={(event) => event.currentTarget.classList.add(styles.imageFailed)}
                />
              ))}
            </div>
          ) : null}
        </section>
        <section className={styles.details}>
          <p className={styles.category}>{categoryName}</p>
          <h1>{productName}</h1>
          <p className={styles.price}>{formatVnd(product.price, language)}</p>
          {description ? <p className={styles.description}>{description}</p> : null}
          <section className={product.inStock ? styles.stockAvailable : styles.stockUnavailable}>
            <h2>{product.inStock ? t("product.inStock") : t("product.outOfStock")}</h2>
            <p>
              {product.inStock
                ? t("product.stockDescription", { count: product.inventoryQuantity })
                : t("product.outOfStockDescription")}
            </p>
          </section>
        </section>
      </div>
    </article>
  );
}

function ProductNotFound() {
  const { t } = useTranslation();

  return (
    <section className={styles.page}>
      <section className={styles.notFound}>
        <h1>{t("state.notFoundTitle")}</h1>
        <p>{t("state.notFoundDescription")}</p>
        <Link className={styles.backLink} to="/">
          {t("state.returnToShop")}
        </Link>
      </section>
    </section>
  );
}
