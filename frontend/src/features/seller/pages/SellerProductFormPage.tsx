import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ApiError } from "../../../shared/api/client";
import { getCategories } from "../api/sellerCategoryApi";
import { createProduct, getProduct, updateProduct } from "../api/sellerProductApi";
import { ProductImagesPanel } from "../components/ProductImagesPanel";
import type { ProductImage, SellerCategory } from "../types";

import styles from "../styles/seller.module.css";

type FormValues = {
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  price: string;
  inventoryQuantity: string;
  categoryId: string;
  visible: boolean;
};

const emptyValues: FormValues = {
  nameVi: "",
  nameEn: "",
  descriptionVi: "",
  descriptionEn: "",
  price: "",
  inventoryQuantity: "",
  categoryId: "",
  visible: false
};

export function SellerProductFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isEditing = productId !== undefined && productId !== "new";
  const numericId = isEditing ? Number(productId) : null;

  const [values, setValues] = useState<FormValues>(emptyValues);
  const [categories, setCategories] = useState<SellerCategory[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    getCategories(controller.signal)
      .then(setCategories)
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("Could not load categories.");
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (numericId === null || !Number.isInteger(numericId)) {
      return;
    }

    const controller = new AbortController();

    getProduct(numericId, controller.signal)
      .then((product) => {
        setValues({
          nameVi: product.nameVi,
          nameEn: product.nameEn,
          descriptionVi: product.descriptionVi,
          descriptionEn: product.descriptionEn,
          price: String(product.price),
          inventoryQuantity: String(product.inventoryQuantity),
          categoryId: String(product.category.id),
          visible: product.visible
        });
        setImages(product.images);
      })
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof ApiError ? caught.message : "Could not load this product.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [numericId]);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const price = Number(values.price);
    const inventoryQuantity = Number(values.inventoryQuantity);
    const categoryId = Number(values.categoryId);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }

    if (!Number.isInteger(inventoryQuantity) || inventoryQuantity < 0) {
      setError("Enter a valid inventory quantity.");
      return;
    }

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      setError("Select a category.");
      return;
    }

    setIsSaving(true);

    const request = {
      nameVi: values.nameVi.trim(),
      nameEn: values.nameEn.trim(),
      descriptionVi: values.descriptionVi.trim(),
      descriptionEn: values.descriptionEn.trim(),
      price,
      inventoryQuantity,
      categoryId,
      visible: values.visible
    };

    try {
      if (numericId === null) {
        const created = await createProduct(request);
        navigate(`/seller/products/${created.id}`, { replace: true });
      } else {
        const updated = await updateProduct(numericId, request);
        setImages(updated.images);
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not save this product.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className={styles.empty}>Loading...</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>{numericId === null ? "New product" : "Edit product"}</h1>
          <p className={styles.subtitle}>
            A product needs at least one image and a visible category before it can go live.
          </p>
        </div>
        <Link className={styles.secondaryButton} to="/seller/products">
          Back to products
        </Link>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Name (Vietnamese)</span>
            <input
              value={values.nameVi}
              maxLength={200}
              required
              onChange={(event) => updateField("nameVi", event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Name (English)</span>
            <input
              value={values.nameEn}
              maxLength={200}
              required
              onChange={(event) => updateField("nameEn", event.target.value)}
            />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Description (Vietnamese)</span>
            <textarea
              value={values.descriptionVi}
              maxLength={20000}
              required
              onChange={(event) => updateField("descriptionVi", event.target.value)}
            />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Description (English)</span>
            <textarea
              value={values.descriptionEn}
              maxLength={20000}
              required
              onChange={(event) => updateField("descriptionEn", event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Price (VND)</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={values.price}
              required
              onChange={(event) => updateField("price", event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Inventory quantity</span>
            <input
              type="number"
              min={0}
              step={1}
              value={values.inventoryQuantity}
              required
              onChange={(event) => updateField("inventoryQuantity", event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Category</span>
            <select
              value={values.categoryId}
              required
              onChange={(event) => updateField("categoryId", event.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nameEn} — {category.nameVi}
                  {category.visible ? "" : " (hidden)"}
                </option>
              ))}
            </select>
          </label>
          <label className={`${styles.checkboxField} ${styles.fullWidth}`}>
            <input
              type="checkbox"
              checked={values.visible}
              onChange={(event) => updateField("visible", event.target.checked)}
            />
            Visible on the storefront
          </label>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton} disabled={isSaving}>
            {isSaving ? "Saving..." : numericId === null ? "Create product" : "Save changes"}
          </button>
        </div>
      </form>

      {numericId === null ? (
        <p className={styles.subtitle}>Save the product first, then add images.</p>
      ) : (
        <ProductImagesPanel productId={numericId} images={images} onImagesChange={setImages} />
      )}
    </div>
  );
}
