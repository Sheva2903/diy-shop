import { useState, type ChangeEvent } from "react";

import { ApiError } from "../../../shared/api/client";
import { deleteProductImage, setPrimaryImage, uploadProductImage } from "../api/sellerImageApi";
import type { ProductImage } from "../types";

import styles from "../styles/seller.module.css";
import panelStyles from "./ProductImagesPanel.module.css";

type ProductImagesPanelProps = {
  productId: number;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
};

export function ProductImagesPanel({ productId, images, onImagesChange }: ProductImagesPanelProps) {
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<ProductImage[]>) {
    setError("");
    setIsBusy(true);

    try {
      onImagesChange(await action());
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not update images.");
    } finally {
      setIsBusy(false);
    }
  }

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await run(async () => {
      const uploaded = await uploadProductImage(productId, file);
      return uploaded.primaryImage
        ? [...images.map((image) => ({ ...image, primaryImage: false })), uploaded]
        : [...images, uploaded];
    });
  }

  function makePrimary(imageId: number) {
    return run(async () => {
      await setPrimaryImage(productId, imageId);
      return images.map((image) => ({ ...image, primaryImage: image.id === imageId }));
    });
  }

  function remove(imageId: number) {
    return run(async () => {
      await deleteProductImage(productId, imageId);
      return images.filter((image) => image.id !== imageId);
    });
  }

  const sorted = [...images].sort(
    (first, second) =>
      Number(second.primaryImage) - Number(first.primaryImage) || first.sortOrder - second.sortOrder
  );

  return (
    <section className={styles.card}>
      <h2>Images</h2>

      {error ? <p className={styles.error}>{error}</p> : null}

      <label className={panelStyles.uploadArea}>
        <input type="file" accept="image/*" disabled={isBusy} onChange={onUpload} />
        <span>{isBusy ? "Working..." : "Upload an image"}</span>
      </label>

      {sorted.length === 0 ? (
        <p className={styles.empty}>No images yet. A visible product needs at least one image.</p>
      ) : (
        <ul className={panelStyles.grid}>
          {sorted.map((image) => (
            <li className={panelStyles.imageCard} key={image.id}>
              <img src={image.imageUrl} alt="" />
              {image.primaryImage ? (
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Primary</span>
              ) : (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={isBusy}
                  onClick={() => void makePrimary(image.id)}
                >
                  Set primary
                </button>
              )}
              <button
                type="button"
                className={styles.dangerButton}
                disabled={isBusy}
                onClick={() => void remove(image.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
