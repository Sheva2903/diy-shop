import { getJson } from "../../../shared/api/client";

import type { Category, ProductSummary } from "../types";

export type ProductFilters = {
  categoryId?: number;
  keyword?: string;
};

export function getCategories(signal?: AbortSignal) {
  return getJson<Category[]>("/api/categories", signal);
}

export function getProducts(filters: ProductFilters, signal?: AbortSignal) {
  const searchParams = new URLSearchParams();

  if (filters.categoryId) {
    searchParams.set("categoryId", String(filters.categoryId));
  }

  if (filters.keyword) {
    searchParams.set("keyword", filters.keyword);
  }

  const suffix = searchParams.size ? `?${searchParams.toString()}` : "";
  return getJson<ProductSummary[]>(`/api/products${suffix}`, signal);
}
