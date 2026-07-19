import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { ErrorState } from "../../../shared/components/ContentState";
import { localizeName } from "../../../shared/i18n/localize";
import { ProductCard } from "../components/ProductCard";
import { useCategories, useProducts } from "../hooks/useCatalog";

import styles from "./CatalogPage.module.css";

export function CatalogPage() {
  const { i18n, t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("q") ?? "";
  const categoryId = readCategoryId(searchParams.get("category"));
  const categoriesQuery = useCategories();
  const productsQuery = useProducts({ categoryId, keyword });
  const language = i18n.resolvedLanguage ?? i18n.language;

  const categoryOptions = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data]
  );

  function updateSearchParams(nextKeyword: string, nextCategoryId: number | undefined) {
    const nextParams = new URLSearchParams();

    if (nextKeyword.trim()) {
      nextParams.set("q", nextKeyword.trim());
    }

    if (nextCategoryId) {
      nextParams.set("category", String(nextCategoryId));
    }

    setSearchParams(nextParams, { replace: true });
  }

  if (categoriesQuery.isError || productsQuery.isError) {
    return <CatalogError onRetry={() => void Promise.all([categoriesQuery.refetch(), productsQuery.refetch()])} />;
  }

  return (
    <section className={styles.page}>
      <header className={styles.introduction}>
        <p className={styles.kicker}>DIY Shop</p>
        <h1>{t("catalog.title")}</h1>
        <p>{t("catalog.description")}</p>
      </header>

      <CatalogFilters
        key={keyword}
        categories={categoryOptions}
        categoryId={categoryId}
        categoryLoading={categoriesQuery.isPending}
        keyword={keyword}
        language={language}
        onFilterChange={updateSearchParams}
      />

      {productsQuery.isPending ? (
        <CatalogSkeleton />
      ) : productsQuery.data?.length ? (
        <>
          <p className={styles.results}>{t("catalog.results", { count: productsQuery.data.length })}</p>
          <div className={styles.grid}>
            {productsQuery.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <section className={styles.empty}>
          <h2>{t("catalog.noProductsTitle")}</h2>
          <p>{t("catalog.noProductsDescription")}</p>
        </section>
      )}
    </section>
  );
}

type CatalogFiltersProps = {
  categories: NonNullable<ReturnType<typeof useCategories>["data"]>;
  categoryId: number | undefined;
  categoryLoading: boolean;
  keyword: string;
  language: string;
  onFilterChange: (keyword: string, categoryId: number | undefined) => void;
};

function CatalogFilters({
  categories,
  categoryId,
  categoryLoading,
  keyword,
  language,
  onFilterChange
}: CatalogFiltersProps) {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState(keyword);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onFilterChange(searchInput, categoryId);
  }

  return (
    <form className={styles.filters} onSubmit={onSearch}>
      <label className={styles.searchField}>
        <span>{t("catalog.searchLabel")}</span>
        <input
          type="search"
          value={searchInput}
          placeholder={t("catalog.searchPlaceholder")}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </label>
      <label className={styles.categoryField}>
        <span>{t("catalog.categoryLabel")}</span>
        <select
          value={categoryId ?? ""}
          disabled={categoryLoading}
          onChange={(event) => {
            const value = event.target.value;
            onFilterChange(keyword, value ? Number(value) : undefined);
          }}
        >
          <option value="">{t("catalog.allCategories")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {localizeName(category, language)}
            </option>
          ))}
        </select>
      </label>
      <button className={styles.searchButton} type="submit">
        {t("catalog.searchAction")}
      </button>
    </form>
  );
}

function CatalogError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className={styles.page}>
      <ErrorState onRetry={onRetry} />
    </section>
  );
}

function CatalogSkeleton() {
  return (
    <div className={styles.skeletonGrid} aria-label="Loading products">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={styles.skeletonCard} />
      ))}
    </div>
  );
}

function readCategoryId(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
