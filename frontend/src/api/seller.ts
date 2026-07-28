import { supabase } from "../lib/supabase";
import type {
  CategoryRow,
  DashboardStats,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  ProductImageRow,
  ProductRow
} from "../types/database";

const IMAGE_BUCKET = "product-images";

export type SellerCategory = CategoryRow & { productCount: number };

export type SellerProduct = ProductRow & {
  category: Pick<CategoryRow, "id" | "name_vi" | "name_en"> | null;
  images: ProductImageRow[];
};

export type SellerOrderListItem = Pick<
  OrderRow,
  | "id"
  | "order_code"
  | "recipient_full_name"
  | "phone_number"
  | "payment_method"
  | "order_status"
  | "payment_status"
  | "total_amount"
  | "created_at"
>;

export type SellerOrderDetail = OrderRow & { items: OrderItemRow[] };

// ------------------------------------------------------------------ dashboard

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase.rpc("seller_dashboard_stats");
  if (error) throw error;
  return data as DashboardStats;
}

// -------------------------------------------------------- category analytics

export type CategorySeries = {
  /** Category display names, in the order the chart should stack them. */
  categories: { key: string; nameVi: string; nameEn: string }[];
  /** One row per day: { date: "2026-07-28", [categoryKey]: revenue }. */
  rows: Record<string, string | number>[];
};

type RevenueJoinRow = {
  quantity: number;
  line_total: number;
  orders: { created_at: string; order_status: OrderStatus } | null;
  products: {
    category_id: number;
    categories: { id: number; name_vi: string; name_en: string } | null;
  } | null;
};

/**
 * Revenue per category per day for the last `days` days.
 *
 * Aggregated in the client from a single joined read rather than a dedicated
 * RPC: a single-seller shop has few enough order items that this stays cheap,
 * and it avoids another database migration.
 */
export async function getCategoryRevenueSeries(days: number): Promise<CategorySeries> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      quantity, line_total,
      orders!inner ( created_at, order_status ),
      products!inner ( category_id, categories ( id, name_vi, name_en ) )
    `
    )
    .gte("orders.created_at", since.toISOString())
    .neq("orders.order_status", "CANCELLED")
    .returns<RevenueJoinRow[]>();

  if (error) throw error;

  const categories = new Map<string, { key: string; nameVi: string; nameEn: string }>();
  const byDate = new Map<string, Record<string, number>>();

  for (const row of data ?? []) {
    const category = row.products?.categories;
    const createdAt = row.orders?.created_at;
    if (!category || !createdAt) continue;

    const key = `c${category.id}`;
    categories.set(key, { key, nameVi: category.name_vi, nameEn: category.name_en });

    const date = createdAt.slice(0, 10);
    const bucket = byDate.get(date) ?? {};
    bucket[key] = (bucket[key] ?? 0) + Number(row.line_total);
    byDate.set(date, bucket);
  }

  const orderedCategories = [...categories.values()].sort((a, b) => a.key.localeCompare(b.key));

  // Emit every day in the window so the axis has no gaps.
  const rows: Record<string, string | number>[] = [];
  for (let offset = 0; offset < days; offset++) {
    const day = new Date(since);
    day.setDate(day.getDate() + offset);
    const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

    const bucket = byDate.get(date) ?? {};
    const row: Record<string, string | number> = { date };
    for (const category of orderedCategories) row[category.key] = bucket[category.key] ?? 0;
    rows.push(row);
  }

  return { categories: orderedCategories, rows };
}

// ----------------------------------------------------------------- categories

export async function getSellerCategories(): Promise<SellerCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("id")
    .returns<(CategoryRow & { products: { count: number }[] })[]>();

  if (error) throw error;

  return (data ?? []).map(({ products, ...category }) => ({
    ...category,
    productCount: products?.[0]?.count ?? 0
  }));
}

export async function createCategory(input: {
  name_vi: string;
  name_en: string;
  visible: boolean;
}): Promise<CategoryRow> {
  const { data, error } = await supabase.from("categories").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: number,
  patch: Partial<Pick<CategoryRow, "name_vi" | "name_en" | "visible">>
): Promise<CategoryRow> {
  const { data, error } = await supabase
    .from("categories")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/** Blocked by the guard_category_delete trigger when products still reference it. */
export async function deleteCategory(id: number): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ------------------------------------------------------------------- products

const sellerProductSelect = `
  *,
  category:categories ( id, name_vi, name_en ),
  images:product_images ( * )
`;

export async function getSellerProducts(): Promise<SellerProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(sellerProductSelect)
    .order("created_at", { ascending: false })
    .returns<SellerProduct[]>();

  if (error) throw error;
  return sortImages(data ?? []);
}

export async function getSellerProduct(id: number): Promise<SellerProduct> {
  const { data, error } = await supabase
    .from("products")
    .select(sellerProductSelect)
    .eq("id", id)
    .single<SellerProduct>();

  if (error) throw error;
  return sortImages([data])[0];
}

function sortImages(products: SellerProduct[]): SellerProduct[] {
  return products.map((product) => ({
    ...product,
    images: [...(product.images ?? [])].sort(
      (a, b) => Number(b.primary_image) - Number(a.primary_image) || a.sort_order - b.sort_order
    )
  }));
}

export type ProductInput = {
  name_vi: string;
  name_en: string;
  description_vi: string;
  description_en: string;
  price: number;
  inventory_quantity: number;
  category_id: number;
  visible: boolean;
};

export async function createProduct(input: ProductInput): Promise<ProductRow> {
  const { data, error } = await supabase.from("products").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: number,
  patch: Partial<ProductInput>
): Promise<ProductRow> {
  const { data, error } = await supabase
    .from("products")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/** Blocked by guard_product_delete when the product appears in any order. */
export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// --------------------------------------------------------------------- images

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return file.type === "image/png" ? "png" : "jpg";
}

export async function uploadProductImage(
  productId: number,
  file: File,
  sortOrder: number,
  makePrimary: boolean
): Promise<ProductImageRow> {
  const storageKey = `${productId}/${crypto.randomUUID()}.${extensionFor(file)}`;

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(storageKey, file, { contentType: file.type, upsert: false });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl }
  } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(storageKey);

  // ux_product_images_one_primary_per_product allows only one primary row per
  // product, so always insert as non-primary and promote afterwards.
  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: publicUrl,
      storage_key: storageKey,
      content_type: file.type,
      primary_image: false,
      sort_order: sortOrder
    })
    .select("*")
    .single();

  if (error) {
    // Do not leave an orphaned object behind if the row insert fails.
    await supabase.storage.from(IMAGE_BUCKET).remove([storageKey]);
    throw error;
  }

  if (makePrimary) {
    await setPrimaryImage(productId, data.id);
    return { ...data, primary_image: true };
  }

  return data;
}

export async function setPrimaryImage(productId: number, imageId: number): Promise<void> {
  const { error: clearError } = await supabase
    .from("product_images")
    .update({ primary_image: false })
    .eq("product_id", productId)
    .neq("id", imageId);

  if (clearError) throw clearError;

  const { error } = await supabase
    .from("product_images")
    .update({ primary_image: true })
    .eq("id", imageId);

  if (error) throw error;
}

export async function deleteProductImage(image: ProductImageRow): Promise<void> {
  const { error } = await supabase.from("product_images").delete().eq("id", image.id);
  if (error) throw error;

  if (image.storage_key) {
    await supabase.storage.from(IMAGE_BUCKET).remove([image.storage_key]);
  }
}

export async function reorderProductImages(orderedIds: number[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("product_images").update({ sort_order: index }).eq("id", id)
    )
  );
}

// --------------------------------------------------------------------- orders

export async function getSellerOrders(): Promise<SellerOrderListItem[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_code, recipient_full_name, phone_number, payment_method, order_status, payment_status, total_amount, created_at"
    )
    .order("created_at", { ascending: false })
    .returns<SellerOrderListItem[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getSellerOrder(orderCode: string): Promise<SellerOrderDetail> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items ( * )")
    .eq("order_code", orderCode)
    .single<SellerOrderDetail>();

  if (error) throw error;
  return data;
}

/** The enforce_order_transition trigger rejects illegal moves and restores
 *  inventory when an order is cancelled. */
export async function updateOrderStatus(
  orderCode: string,
  orderStatus: OrderStatus,
  cancellationReason?: string
): Promise<void> {
  const patch: Partial<OrderRow> = { order_status: orderStatus };
  if (orderStatus === "CANCELLED") patch.cancellation_reason = cancellationReason ?? null;

  const { error } = await supabase.from("orders").update(patch).eq("order_code", orderCode);
  if (error) throw error;
}

export async function updatePaymentStatus(
  orderCode: string,
  paymentStatus: OrderRow["payment_status"]
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("order_code", orderCode);

  if (error) throw error;
}
