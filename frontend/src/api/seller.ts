import { apiFetch, resolveAssetUrl } from "../lib/api";
import type {
  CategoryRow,
  DashboardStats,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductImageRow,
  ProductRow
} from "../types/database";

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

type DashboardStatsResponseDto = {
  ordersToday: number;
  ordersYesterday: number;
  revenue7Days: number;
  revenuePrevious7Days: number;
  activeProducts: number;
  pendingOrders: number;
  lowStock: {
    id: number;
    nameVi: string;
    nameEn: string;
    inventoryQuantity: number;
    imageUrl: string | null;
  }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const stats = await apiFetch<DashboardStatsResponseDto>("/api/seller/dashboard/stats");

  return {
    ordersToday: stats.ordersToday,
    ordersYesterday: stats.ordersYesterday,
    revenue7Days: Number(stats.revenue7Days),
    revenuePrevious7Days: Number(stats.revenuePrevious7Days),
    activeProducts: stats.activeProducts,
    pendingOrders: stats.pendingOrders,
    lowStock: stats.lowStock.map((product) => ({
      id: product.id,
      name_vi: product.nameVi,
      name_en: product.nameEn,
      inventory_quantity: product.inventoryQuantity,
      image_url: resolveAssetUrl(product.imageUrl)
    }))
  };
}

// -------------------------------------------------------- category analytics

export type CategorySeries = {
  /** Category display names, in the order the chart should stack them. */
  categories: { key: string; nameVi: string; nameEn: string }[];
  /** One row per day: { date: "2026-07-28", [categoryKey]: revenue }. */
  rows: Record<string, string | number>[];
};

/** One (day, category) total; days without orders are simply absent. */
type CategoryRevenuePointDto = {
  date: string;
  categoryId: number;
  categoryNameVi: string;
  categoryNameEn: string;
  revenue: number;
};

/** Revenue per category per day for the last `days` days. */
export async function getCategoryRevenueSeries(days: number): Promise<CategorySeries> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const points = await apiFetch<CategoryRevenuePointDto[]>(
    `/api/seller/dashboard/revenue?days=${days}`
  );

  const categories = new Map<string, { key: string; nameVi: string; nameEn: string }>();
  const byDate = new Map<string, Record<string, number>>();

  for (const point of points) {
    const key = `c${point.categoryId}`;
    categories.set(key, { key, nameVi: point.categoryNameVi, nameEn: point.categoryNameEn });

    const bucket = byDate.get(point.date) ?? {};
    bucket[key] = (bucket[key] ?? 0) + Number(point.revenue);
    byDate.set(point.date, bucket);
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

type SellerCategoryResponseDto = {
  id: number;
  nameVi: string;
  nameEn: string;
  visible: boolean;
  productCount: number;
};

function mapSellerCategory(category: SellerCategoryResponseDto): SellerCategory {
  return {
    id: category.id,
    name_vi: category.nameVi,
    name_en: category.nameEn,
    visible: category.visible,
    productCount: category.productCount,
    created_at: "",
    updated_at: ""
  };
}

function toCategoryRow(category: SellerCategory): CategoryRow {
  return {
    id: category.id,
    name_vi: category.name_vi,
    name_en: category.name_en,
    visible: category.visible,
    created_at: category.created_at,
    updated_at: category.updated_at
  };
}

export async function getSellerCategories(): Promise<SellerCategory[]> {
  const categories = await apiFetch<SellerCategoryResponseDto[]>("/api/seller/categories");
  return categories.map(mapSellerCategory);
}

export async function createCategory(input: {
  name_vi: string;
  name_en: string;
  visible: boolean;
}): Promise<CategoryRow> {
  const category = await apiFetch<SellerCategoryResponseDto>("/api/seller/categories", {
    method: "POST",
    json: { nameVi: input.name_vi, nameEn: input.name_en }
  });
  return toCategoryRow(mapSellerCategory(category));
}

export async function updateCategory(
  id: number,
  patch: Partial<Pick<CategoryRow, "name_vi" | "name_en" | "visible">>
): Promise<CategoryRow> {
  let category: SellerCategoryResponseDto | undefined;

  if (patch.name_vi !== undefined || patch.name_en !== undefined) {
    category = await apiFetch<SellerCategoryResponseDto>(`/api/seller/categories/${id}`, {
      method: "PUT",
      json: { nameVi: patch.name_vi, nameEn: patch.name_en }
    });
  }

  if (patch.visible !== undefined) {
    category = await apiFetch<SellerCategoryResponseDto>(`/api/seller/categories/${id}/visibility`, {
      method: "PATCH",
      json: { visible: patch.visible }
    });
  }

  category ??= await apiFetch<SellerCategoryResponseDto>(`/api/seller/categories/${id}`);

  return toCategoryRow(mapSellerCategory(category));
}

/** Blocked when products still reference the category. */
export async function deleteCategory(id: number): Promise<void> {
  await apiFetch(`/api/seller/categories/${id}`, { method: "DELETE" });
}

// ------------------------------------------------------------------- products

type SellerProductImageResponseDto = {
  id: number;
  imageUrl: string;
  primaryImage: boolean;
  sortOrder: number;
};

type SellerProductResponseDto = {
  id: number;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  price: number;
  inventoryQuantity: number;
  visible: boolean;
  category: { id: number; nameVi: string; nameEn: string } | null;
  images: SellerProductImageResponseDto[];
};

function mapProductImage(productId: number, image: SellerProductImageResponseDto): ProductImageRow {
  return {
    id: image.id,
    product_id: productId,
    image_url: resolveAssetUrl(image.imageUrl) ?? "",
    primary_image: image.primaryImage,
    sort_order: image.sortOrder,
    storage_key: null,
    content_type: null,
    created_at: ""
  };
}

function sortImages(images: ProductImageRow[]): ProductImageRow[] {
  return [...images].sort(
    (a, b) => Number(b.primary_image) - Number(a.primary_image) || a.sort_order - b.sort_order
  );
}

function mapSellerProduct(product: SellerProductResponseDto): SellerProduct {
  return {
    id: product.id,
    category_id: product.category?.id ?? 0,
    name_vi: product.nameVi,
    name_en: product.nameEn,
    description_vi: product.descriptionVi,
    description_en: product.descriptionEn,
    price: Number(product.price),
    inventory_quantity: product.inventoryQuantity,
    visible: product.visible,
    created_at: "",
    updated_at: "",
    category: product.category
      ? { id: product.category.id, name_vi: product.category.nameVi, name_en: product.category.nameEn }
      : null,
    images: sortImages(product.images.map((image) => mapProductImage(product.id, image)))
  };
}

function toProductRow(product: SellerProduct): ProductRow {
  return {
    id: product.id,
    category_id: product.category_id,
    name_vi: product.name_vi,
    name_en: product.name_en,
    description_vi: product.description_vi,
    description_en: product.description_en,
    price: product.price,
    inventory_quantity: product.inventory_quantity,
    visible: product.visible,
    created_at: product.created_at,
    updated_at: product.updated_at
  };
}

export async function getSellerProducts(): Promise<SellerProduct[]> {
  const products = await apiFetch<SellerProductResponseDto[]>("/api/seller/products");
  return products.map(mapSellerProduct);
}

export async function getSellerProduct(id: number): Promise<SellerProduct> {
  const product = await apiFetch<SellerProductResponseDto>(`/api/seller/products/${id}`);
  return mapSellerProduct(product);
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

function toUpsertProductRequest(input: ProductInput) {
  return {
    nameVi: input.name_vi,
    nameEn: input.name_en,
    descriptionVi: input.description_vi,
    descriptionEn: input.description_en,
    price: input.price,
    inventoryQuantity: input.inventory_quantity,
    categoryId: input.category_id,
    visible: input.visible
  };
}

export async function createProduct(input: ProductInput): Promise<ProductRow> {
  const product = await apiFetch<SellerProductResponseDto>("/api/seller/products", {
    method: "POST",
    json: toUpsertProductRequest(input)
  });
  return toProductRow(mapSellerProduct(product));
}

export async function updateProduct(
  id: number,
  patch: Partial<ProductInput>
): Promise<ProductRow> {
  const visibilityOnly = Object.keys(patch).length === 1 && patch.visible !== undefined;

  const product = visibilityOnly
    ? await apiFetch<SellerProductResponseDto>(`/api/seller/products/${id}/visibility`, {
        method: "PATCH",
        json: { visible: patch.visible }
      })
    : await apiFetch<SellerProductResponseDto>(`/api/seller/products/${id}`, {
        method: "PUT",
        json: toUpsertProductRequest(patch as ProductInput)
      });

  return toProductRow(mapSellerProduct(product));
}

/** Blocked when the product appears in any order. */
export async function deleteProduct(id: number): Promise<void> {
  await apiFetch(`/api/seller/products/${id}`, { method: "DELETE" });
}

// --------------------------------------------------------------------- images

export async function uploadProductImage(
  productId: number,
  file: File,
  sortOrder: number,
  makePrimary: boolean
): Promise<ProductImageRow> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("sortOrder", String(sortOrder));
  if (makePrimary) formData.append("primaryImage", "true");

  const image = await apiFetch<SellerProductImageResponseDto>(
    `/api/seller/products/${productId}/images`,
    { method: "POST", body: formData }
  );

  return mapProductImage(productId, image);
}

export async function setPrimaryImage(productId: number, imageId: number): Promise<void> {
  await apiFetch(`/api/seller/products/${productId}/images/${imageId}/primary`, { method: "PATCH" });
}

export async function deleteProductImage(image: ProductImageRow): Promise<void> {
  await apiFetch(`/api/seller/products/${image.product_id}/images/${image.id}`, { method: "DELETE" });
}

export async function reorderProductImages(productId: number, orderedIds: number[]): Promise<void> {
  await apiFetch(`/api/seller/products/${productId}/images/reorder`, {
    method: "PUT",
    json: orderedIds
  });
}

// --------------------------------------------------------------------- orders

type SellerOrderListResponseDto = {
  orderCode: string;
  recipientFullName: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
};

function mapSellerOrderListItem(order: SellerOrderListResponseDto): SellerOrderListItem {
  return {
    id: 0,
    order_code: order.orderCode,
    recipient_full_name: order.recipientFullName,
    phone_number: order.phoneNumber,
    payment_method: order.paymentMethod,
    order_status: order.orderStatus,
    payment_status: order.paymentStatus,
    total_amount: Number(order.totalAmount),
    created_at: order.createdAt
  };
}

export async function getSellerOrders(): Promise<SellerOrderListItem[]> {
  const orders = await apiFetch<SellerOrderListResponseDto[]>("/api/seller/orders");
  return orders.map(mapSellerOrderListItem);
}

type OrderItemResponseDto = {
  productId: number;
  productNameVi: string;
  productNameEn: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type OrderResponseDto = {
  orderCode: string;
  recipientFullName: string;
  phoneNumber: string;
  email: string;
  provinceCity: string;
  district: string;
  ward: string;
  streetAddress: string;
  customerNote: string | null;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  cancellationReason: string | null;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  items: OrderItemResponseDto[];
  createdAt: string;
};

function mapSellerOrderDetail(order: OrderResponseDto): SellerOrderDetail {
  return {
    id: 0,
    order_code: order.orderCode,
    recipient_full_name: order.recipientFullName,
    phone_number: order.phoneNumber,
    email: order.email,
    province_city: order.provinceCity,
    district: order.district,
    ward: order.ward,
    street_address: order.streetAddress,
    customer_note: order.customerNote,
    payment_method: order.paymentMethod,
    order_status: order.orderStatus,
    payment_status: order.paymentStatus,
    cancellation_reason: order.cancellationReason,
    subtotal: Number(order.subtotal),
    shipping_fee: Number(order.shippingFee),
    total_amount: Number(order.totalAmount),
    created_at: order.createdAt,
    updated_at: "",
    items: order.items.map((item, index) => ({
      id: index,
      order_id: 0,
      product_id: item.productId,
      product_name_vi: item.productNameVi,
      product_name_en: item.productNameEn,
      unit_price: Number(item.unitPrice),
      quantity: item.quantity,
      line_total: Number(item.lineTotal)
    }))
  };
}

export async function getSellerOrder(orderCode: string): Promise<SellerOrderDetail> {
  const order = await apiFetch<OrderResponseDto>(`/api/seller/orders/${orderCode}`);
  return mapSellerOrderDetail(order);
}

/** The backend rejects illegal status transitions and restores inventory when an order is cancelled. */
export async function updateOrderStatus(
  orderCode: string,
  orderStatus: OrderStatus,
  cancellationReason?: string
): Promise<void> {
  await apiFetch(`/api/seller/orders/${orderCode}/status`, {
    method: "PATCH",
    json: { orderStatus, cancellationReason: cancellationReason ?? null }
  });
}

export async function updatePaymentStatus(orderCode: string, paymentStatus: PaymentStatus): Promise<void> {
  await apiFetch(`/api/seller/orders/${orderCode}/payment`, {
    method: "PATCH",
    json: { paymentStatus }
  });
}
