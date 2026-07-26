import { useEffect, useState, type FormEvent } from "react";

import { ApiError } from "../../../shared/api/client";
import {
  createCategory,
  getCategories,
  updateCategory,
  updateCategoryVisibility
} from "../api/sellerCategoryApi";
import type { SellerCategory } from "../types";

import styles from "../styles/seller.module.css";

export function SellerCategoriesPage() {
  const [categories, setCategories] = useState<SellerCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getCategories(controller.signal)
      .then(setCategories)
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof ApiError ? caught.message : "Could not load categories.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  function resetForm() {
    setEditingId(null);
    setNameVi("");
    setNameEn("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!nameVi.trim() || !nameEn.trim()) {
      setError("Both names are required.");
      return;
    }

    setIsSaving(true);
    const request = { nameVi: nameVi.trim(), nameEn: nameEn.trim() };

    try {
      if (editingId === null) {
        const created = await createCategory(request);
        setCategories((current) => [...current, created]);
      } else {
        const updated = await updateCategory(editingId, request);
        setCategories((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }
      resetForm();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not save this category.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleVisibility(category: SellerCategory) {
    setError("");
    setPendingId(category.id);

    try {
      const updated = await updateCategoryVisibility(category.id, !category.visible);
      setCategories((current) => current.map((item) => (item.id === updated.id ? updated : item)));
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
          <h1>Categories</h1>
          <p className={styles.subtitle}>{categories.length} categories</p>
        </div>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <h2>{editingId === null ? "New category" : "Edit category"}</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Name (Vietnamese)</span>
            <input
              value={nameVi}
              maxLength={100}
              required
              onChange={(event) => setNameVi(event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Name (English)</span>
            <input
              value={nameEn}
              maxLength={100}
              required
              onChange={(event) => setNameEn(event.target.value)}
            />
          </label>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton} disabled={isSaving}>
            {isSaving ? "Saving..." : editingId === null ? "Create category" : "Save changes"}
          </button>
          {editingId === null ? null : (
            <button type="button" className={styles.secondaryButton} onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <p className={styles.empty}>Loading...</p>
        ) : categories.length === 0 ? (
          <p className={styles.empty}>No categories yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name (VI)</th>
                <th>Name (EN)</th>
                <th>Visible</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.nameVi}</td>
                  <td>{category.nameEn}</td>
                  <td>
                    <button
                      type="button"
                      className={
                        category.visible
                          ? `${styles.badge} ${styles.badgeSuccess}`
                          : `${styles.badge} ${styles.badgeNeutral}`
                      }
                      disabled={pendingId === category.id}
                      onClick={() => void toggleVisibility(category)}
                    >
                      {category.visible ? "Visible" : "Hidden"}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => {
                        setEditingId(category.id);
                        setNameVi(category.nameVi);
                        setNameEn(category.nameEn);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
