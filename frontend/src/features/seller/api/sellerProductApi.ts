import { getJson, patchJson, postJson, putJson } from "../../../shared/api/client";
import type { SellerProduct } from "../types";

export type UpsertProductRequest = {
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  price: number;
  inventoryQuantity: number;
  categoryId: number;
  visible: boolean;
};

export function getProducts(signal?: AbortSignal): Promise<SellerProduct[]> {
  return getJson<SellerProduct[]>("/api/seller/products", signal);
}

export function getProduct(id: number, signal?: AbortSignal): Promise<SellerProduct> {
  return getJson<SellerProduct>(`/api/seller/products/${id}`, signal);
}

export function createProduct(request: UpsertProductRequest): Promise<SellerProduct> {
  return postJson<SellerProduct>("/api/seller/products", request);
}

export function updateProduct(id: number, request: UpsertProductRequest): Promise<SellerProduct> {
  return putJson<SellerProduct>(`/api/seller/products/${id}`, request);
}

export function updateProductVisibility(id: number, visible: boolean): Promise<SellerProduct> {
  return patchJson<SellerProduct>(`/api/seller/products/${id}/visibility`, { visible });
}

export function updateInventory(id: number, inventoryQuantity: number): Promise<SellerProduct> {
  return patchJson<SellerProduct>(`/api/seller/products/${id}/inventory`, { inventoryQuantity });
}
