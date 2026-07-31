import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { getCategories, getProducts, type ProductSort } from "../../api/catalog";
import { Button } from "../../components/ui/Button";
import { EmptyState, ProductCardSkeleton } from "../../components/ui/Feedback";
import { SelectField, TextField } from "../../components/ui/Field";
import { cn } from "../../lib/cn";
import { localizeName } from "../../lib/localize";
import { Breadcrumb } from "../components/Breadcrumb";
import { ProductCard } from "../components/ProductCard";

const PAGE_SIZE = 12;

type Draft = {
  categoryId: string;
  keyword: string;
  minPrice: string;
  maxPrice: string;
  sort: ProductSort;
};

function readDraft(params: URLSearchParams): Draft {
  return {
    categoryId: params.get("category") ?? "",
    keyword: params.get("q") ?? "",
    minPrice: params.get("min") ?? "",
    maxPrice: params.get("max") ?? "",
    sort: (params.get("sort") as ProductSort) || "newest"
  };
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Keyed on the query string so the filter draft and page size reset with the
  // applied filters, rather than being synced back from an effect.
  return (
    <CatalogView
      key={searchParams.toString()}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
    />
  );
}

function CatalogView({
  searchParams,
  setSearchParams
}: {
  searchParams: URLSearchParams;
  setSearchParams: (next: URLSearchParams) => void;
}) {
  const { t, i18n } = useTranslation();
  const [draft, setDraft] = useState<Draft>(() => readDraft(searchParams));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const applied = readDraft(searchParams);

  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const productsQuery = useQuery({
    queryKey: ["products", applied],
    queryFn: () =>
      getProducts({
        categoryId: applied.categoryId ? Number(applied.categoryId) : undefined,
        keyword: applied.keyword || undefined,
        minPrice: applied.minPrice ? Number(applied.minPrice) : undefined,
        maxPrice: applied.maxPrice ? Number(applied.maxPrice) : undefined,
        sort: applied.sort
      })
  });

  const activeCategory = categoriesQuery.data?.find(
    (category) => String(category.id) === applied.categoryId
  );

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (draft.categoryId) next.set("category", draft.categoryId);
    if (draft.keyword.trim()) next.set("q", draft.keyword.trim());
    if (draft.minPrice) next.set("min", draft.minPrice);
    if (draft.maxPrice) next.set("max", draft.maxPrice);
    if (draft.sort !== "newest") next.set("sort", draft.sort);
    setSearchParams(next);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setFiltersOpen(false);
  };

  const products = productsQuery.data ?? [];
  const visibleProducts = products.slice(0, visibleCount);

  const filterPanel = (
    <div className="space-y-5 rounded-card bg-ceramic p-4">
      <TextField
        label={t("catalog.search")}
        placeholder={t("catalog.searchPlaceholder")}
        value={draft.keyword}
        onChange={(event) => setDraft((d) => ({ ...d, keyword: event.target.value }))}
        onKeyDown={(event) => {
          if (event.key === "Enter") applyFilters();
        }}
      />

      <SelectField
        label={t("catalog.category")}
        value={draft.categoryId}
        onChange={(event) => setDraft((d) => ({ ...d, categoryId: event.target.value }))}
      >
        <option value="">{t("catalog.allCategories")}</option>
        {categoriesQuery.data?.map((category) => (
          <option key={category.id} value={category.id}>
            {localizeName({ nameVi: category.name_vi, nameEn: category.name_en }, i18n.language)}
          </option>
        ))}
      </SelectField>

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium text-text-muted">
          {t("catalog.priceRange")}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <TextField
            label={t("catalog.minPrice")}
            type="number"
            min={0}
            value={draft.minPrice}
            onChange={(event) => setDraft((d) => ({ ...d, minPrice: event.target.value }))}
          />
          <TextField
            label={t("catalog.maxPrice")}
            type="number"
            min={0}
            value={draft.maxPrice}
            onChange={(event) => setDraft((d) => ({ ...d, maxPrice: event.target.value }))}
          />
        </div>
      </fieldset>

      <SelectField
        label={t("catalog.sort")}
        value={draft.sort}
        onChange={(event) => setDraft((d) => ({ ...d, sort: event.target.value as ProductSort }))}
      >
        <option value="newest">{t("catalog.sortNewest")}</option>
        <option value="priceAsc">{t("catalog.sortPriceAsc")}</option>
        <option value="priceDesc">{t("catalog.sortPriceDesc")}</option>
      </SelectField>

      <div className="flex gap-2">
        <Button onClick={applyFilters} fullWidth>
          {t("catalog.apply")}
        </Button>
        <Button variant="ghost" onClick={clearFilters}>
          {t("catalog.clear")}
        </Button>
      </div>
    </div>
  );

  const categoryLabel = activeCategory
    ? localizeName(
        { nameVi: activeCategory.name_vi, nameEn: activeCategory.name_en },
        i18n.language
      )
    : t("catalog.title");

  return (
    <div className="shell py-6 lg:py-10">
      <Breadcrumb
        items={[
          { label: t("nav.home"), to: "/" },
          ...(activeCategory
            ? [{ label: t("nav.catalog"), to: "/products" }, { label: categoryLabel }]
            : [{ label: t("nav.catalog") }])
        ]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-text lg:text-[32px]">{categoryLabel}</h1>
          {!productsQuery.isPending && (
            <p className="mt-1 text-[14px] text-text-muted">
              {t("catalog.resultCount", { count: products.length })}
            </p>
          )}
        </div>

        <Button variant="ghost" className="lg:hidden" onClick={() => setFiltersOpen((open) => !open)}>
          {t("catalog.filters")}
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
        {/* plan §1.2.C — 240px sidebar on desktop, collapsible panel on mobile */}
        <aside className={cn("lg:sticky lg:top-24 lg:block", filtersOpen ? "block" : "hidden")}>
          {filterPanel}
        </aside>

        <div>
          {productsQuery.isPending ? (
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title={t("catalog.emptyTitle")}
              description={t("catalog.emptyDescription")}
              action={
                <Button variant="ghost" onClick={clearFilters}>
                  {t("catalog.clear")}
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {visibleCount < products.length && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  >
                    {t("catalog.loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
