import { useQuery } from "@tanstack/react-query";

import { getCategories, getProducts, type ProductFilters } from "../api/catalogApi";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => getCategories(signal)
  });
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: ({ signal }) => getProducts(filters, signal)
  });
}
