import { apiFetch, resolveAssetUrl } from "../lib/api";

export type Category = {
  id: number;
  name_vi: string;
  name_en: string;
};

export type ProductSummary = {
  id: number;
  name_vi: string;
  name_en: string;
  price: number;
  inventory_quantity: number;
  category: Category | null;
  primaryImageUrl: string | null;
};

export type ProductDetail = ProductSummary & {
  description_vi: string;
  description_en: string;
  images: { id: number; image_url: string; primary_image: boolean; sort_order: number }[];
};

export type ProductSort = "newest" | "priceAsc" | "priceDesc";

export type ProductFilters = {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  limit?: number;
};

type CategoryResponse = { id: number; nameVi: string; nameEn: string };

type ProductListResponse = {
  id: number;
  nameVi: string;
  nameEn: string;
  price: number;
  inventoryQuantity: number;
  category: CategoryResponse | null;
  primaryImageUrl: string | null;
};

type ProductImageResponse = { id: number; imageUrl: string; primaryImage: boolean; sortOrder: number };

type ProductDetailResponse = ProductListResponse & {
  descriptionVi: string;
  descriptionEn: string;
  images: ProductImageResponse[];
};

function mapCategory(category: CategoryResponse): Category {
  return { id: category.id, name_vi: category.nameVi, name_en: category.nameEn };
}

function mapProductSummary(product: ProductListResponse): ProductSummary {
  return {
    id: product.id,
    name_vi: product.nameVi,
    name_en: product.nameEn,
    price: Number(product.price),
    inventory_quantity: product.inventoryQuantity,
    category: product.category ? mapCategory(product.category) : null,
    primaryImageUrl: resolveAssetUrl(product.primaryImageUrl)
  };
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getCategories(): Promise<Category[]> {
  const categories = await apiFetch<CategoryResponse[]>("/api/categories");
  return categories.map(mapCategory);
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductSummary[]> {
  const query = buildQuery({
    categoryId: filters.categoryId,
    keyword: filters.keyword?.trim(),
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
    limit: filters.limit
  });

  const products = await apiFetch<ProductListResponse[]>(`/api/products${query}`);
  return products.map(mapProductSummary);
}

export async function getProduct(productId: number): Promise<ProductDetail> {
  let product: ProductDetailResponse;
  try {
    product = await apiFetch<ProductDetailResponse>(`/api/products/${productId}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      throw new Error("PRODUCT_NOT_FOUND", { cause: error });
    }
    throw error;
  }

  const images = [...product.images]
    .sort((a, b) => Number(b.primaryImage) - Number(a.primaryImage) || a.sortOrder - b.sortOrder)
    .map((image) => ({
      id: image.id,
      image_url: resolveAssetUrl(image.imageUrl) ?? "",
      primary_image: image.primaryImage,
      sort_order: image.sortOrder
    }));

  return {
    ...mapProductSummary(product),
    description_vi: product.descriptionVi,
    description_en: product.descriptionEn,
    images
  };
}

export async function getRelatedProducts(
  categoryId: number,
  excludeProductId: number
): Promise<ProductSummary[]> {
  const query = buildQuery({ categoryId, limit: 4 });
  const products = await apiFetch<ProductListResponse[]>(`/api/products/${excludeProductId}/related${query}`);
  return products.map(mapProductSummary);
}
