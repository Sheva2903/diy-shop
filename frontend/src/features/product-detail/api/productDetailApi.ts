import { getJson } from "../../../shared/api/client";
import type { ProductDetail } from "../../catalog/types";

export function getProduct(productId: number, signal?: AbortSignal) {
  return getJson<ProductDetail>(`/api/products/${productId}`, signal);
}
