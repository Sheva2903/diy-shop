import { deleteRequest, getJson, patchJson, postForm } from "../../../shared/api/client";
import type { ProductImage } from "../types";

export function getProductImages(productId: number, signal?: AbortSignal): Promise<ProductImage[]> {
  return getJson<ProductImage[]>(`/api/seller/products/${productId}/images`, signal);
}

export function uploadProductImage(productId: number, file: File): Promise<ProductImage> {
  const formData = new FormData();
  formData.append("image", file);
  return postForm<ProductImage>(`/api/seller/products/${productId}/images`, formData);
}

export function setPrimaryImage(productId: number, imageId: number): Promise<ProductImage> {
  return patchJson<ProductImage>(`/api/seller/products/${productId}/images/${imageId}/primary`, {});
}

export function deleteProductImage(productId: number, imageId: number): Promise<void> {
  return deleteRequest(`/api/seller/products/${productId}/images/${imageId}`).then(() => undefined);
}
