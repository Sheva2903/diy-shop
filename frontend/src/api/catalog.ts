import { supabase } from "../lib/supabase";
import type { CategoryRow, ProductImageRow, ProductRow } from "../types/database";

export type Category = Pick<CategoryRow, "id" | "name_vi" | "name_en">;

export type ProductSummary = Pick<
  ProductRow,
  "id" | "name_vi" | "name_en" | "price" | "inventory_quantity"
> & {
  category: Category | null;
  primaryImageUrl: string | null;
};

export type ProductDetail = ProductSummary &
  Pick<ProductRow, "description_vi" | "description_en"> & {
    images: Pick<ProductImageRow, "id" | "image_url" | "primary_image" | "sort_order">[];
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

const productSelect = `
  id, name_vi, name_en, price, inventory_quantity,
  category:categories!inner ( id, name_vi, name_en ),
  product_images ( image_url, primary_image, sort_order )
`;

type ProductQueryRow = Omit<ProductSummary, "category" | "primaryImageUrl"> & {
  category: Category | Category[] | null;
  product_images: Pick<ProductImageRow, "image_url" | "primary_image" | "sort_order">[] | null;
};

function firstOrNull<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function pickPrimaryImage(
  images: Pick<ProductImageRow, "image_url" | "primary_image" | "sort_order">[] | null
): string | null {
  if (!images?.length) return null;

  const ordered = [...images].sort(
    (a, b) => Number(b.primary_image) - Number(a.primary_image) || a.sort_order - b.sort_order
  );

  return ordered[0]?.image_url ?? null;
}

function toSummary(row: ProductQueryRow): ProductSummary {
  return {
    id: row.id,
    name_vi: row.name_vi,
    name_en: row.name_en,
    price: Number(row.price),
    inventory_quantity: row.inventory_quantity,
    category: firstOrNull(row.category),
    primaryImageUrl: pickPrimaryImage(row.product_images)
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_vi, name_en")
    .order("id");

  if (error) throw error;
  return data ?? [];
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductSummary[]> {
  let query = supabase.from("products").select(productSelect);

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.keyword?.trim()) {
    const term = `%${filters.keyword.trim()}%`;
    query = query.or(`name_vi.ilike.${term},name_en.ilike.${term}`);
  }

  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);

  switch (filters.sort) {
    case "priceAsc":
      query = query.order("price", { ascending: true });
      break;
    case "priceDesc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query.returns<ProductQueryRow[]>();
  if (error) throw error;

  return (data ?? []).map(toSummary);
}

export async function getProduct(productId: number): Promise<ProductDetail> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name_vi, name_en, price, inventory_quantity, description_vi, description_en,
      category:categories ( id, name_vi, name_en ),
      product_images ( id, image_url, primary_image, sort_order )
    `
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("PRODUCT_NOT_FOUND");

  const row = data as unknown as ProductQueryRow &
    Pick<ProductRow, "description_vi" | "description_en"> & {
      product_images: Pick<ProductImageRow, "id" | "image_url" | "primary_image" | "sort_order">[];
    };

  const images = [...(row.product_images ?? [])].sort(
    (a, b) => Number(b.primary_image) - Number(a.primary_image) || a.sort_order - b.sort_order
  );

  return {
    ...toSummary(row),
    description_vi: row.description_vi,
    description_en: row.description_en,
    images
  };
}

export async function getRelatedProducts(
  categoryId: number,
  excludeProductId: number
): Promise<ProductSummary[]> {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(4)
    .returns<ProductQueryRow[]>();

  if (error) throw error;
  return (data ?? []).map(toSummary);
}
