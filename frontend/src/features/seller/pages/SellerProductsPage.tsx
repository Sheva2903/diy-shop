import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../../../shared/api/client";
import { getProducts, updateProductVisibility } from "../api/sellerProductApi";
import type { SellerProduct } from "../types";

import styles from "../styles/seller.module.css";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getProducts(controller.signal)
      .then(setProducts)
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof ApiError ? caught.message : "Could not load products.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  async function toggleVisibility(product: SellerProduct) {
    setError("");
    setPendingId(product.id);

    try {
      const updated = await updateProductVisibility(product.id, !product.visible);
      setProducts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not update visibility.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Products</h1>
          <p className={styles.subtitle}>{products.length} products</p>
        </div>
        <Link className={styles.primaryButton} to="/seller/products/new">
          New product
        </Link>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <p className={styles.empty}>Loading...</p>
        ) : products.length === 0 ? (
          <p className={styles.empty}>No products yet. Create your first product.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name (VI)</th>
                <th>Name (EN)</th>
                <th>Category</th>
                <th className={styles.numeric}>Price</th>
                <th className={styles.numeric}>Stock</th>
                <th>Visible</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const primaryImage =
                  product.images.find((image) => image.primaryImage) ?? product.images[0];

                return (
                  <tr key={product.id}>
                    <td>
                      {primaryImage ? (
                        <img className={styles.thumbnail} src={primaryImage.imageUrl} alt="" />
                      ) : (
                        <span className={styles.thumbnailFallback}>No image</span>
                      )}
                    </td>
                    <td>{product.nameVi}</td>
                    <td>{product.nameEn}</td>
                    <td>{product.category.nameEn}</td>
                    <td className={styles.numeric}>{formatPrice(product.price)} ₫</td>
                    <td className={styles.numeric}>{product.inventoryQuantity}</td>
                    <td>
                      <button
                        type="button"
                        className={
                          product.visible
                            ? `${styles.badge} ${styles.badgeSuccess}`
                            : `${styles.badge} ${styles.badgeNeutral}`
                        }
                        disabled={pendingId === product.id}
                        onClick={() => toggleVisibility(product)}
                      >
                        {product.visible ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td>
                      <Link className={styles.linkButton} to={`/seller/products/${product.id}`}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
