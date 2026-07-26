import { getJson, patchJson, postJson, putJson } from "../../../shared/api/client";
import type { SellerCategory } from "../types";

export type UpsertCategoryRequest = {
  nameVi: string;
  nameEn: string;
};

export function getCategories(signal?: AbortSignal): Promise<SellerCategory[]> {
  return getJson<SellerCategory[]>("/api/seller/categories", signal);
}

export function createCategory(request: UpsertCategoryRequest): Promise<SellerCategory> {
  return postJson<SellerCategory>("/api/seller/categories", request);
}

export function updateCategory(id: number, request: UpsertCategoryRequest): Promise<SellerCategory> {
  return putJson<SellerCategory>(`/api/seller/categories/${id}`, request);
}

export function updateCategoryVisibility(id: number, visible: boolean): Promise<SellerCategory> {
  return patchJson<SellerCategory>(`/api/seller/categories/${id}/visibility`, { visible });
}
