import { useQuery } from "@tanstack/react-query";

import { getProduct } from "../api/productDetailApi";

export function useProductDetail(productId: number) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: ({ signal }) => getProduct(productId, signal),
    enabled: Number.isInteger(productId) && productId > 0
  });
}
