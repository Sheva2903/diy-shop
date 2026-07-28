/**
 * Hand-written schema types for the diy-shop Supabase project.
 *
 * Tables use snake_case (the schema was migrated straight from the Spring Boot
 * JPA entities). The RPCs return camelCase JSON so the order shapes read the
 * same on both sides of the wire.
 */

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED";
export type PaymentMethod = "COD" | "BANK_TRANSFER";

export type CategoryRow = {
  id: number;
  name_vi: string;
  name_en: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: number;
  category_id: number;
  name_vi: string;
  name_en: string;
  description_vi: string | null;
  description_en: string | null;
  price: number;
  inventory_quantity: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductImageRow = {
  id: number;
  product_id: number;
  image_url: string;
  primary_image: boolean;
  sort_order: number;
  storage_key: string | null;
  content_type: string | null;
  created_at: string;
};

export type OrderRow = {
  id: number;
  order_code: string;
  recipient_full_name: string;
  phone_number: string;
  email: string;
  province_city: string;
  district: string;
  ward: string;
  street_address: string;
  customer_note: string | null;
  payment_method: PaymentMethod;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  cancellation_reason: string | null;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: number;
  product_name_vi: string;
  product_name_en: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type ShopSettingsRow = {
  id: number;
  shop_name: string;
  description_vi: string;
  description_en: string;
  logo_url: string | null;
  contact_email: string;
  contact_phone: string;
  bank_name: string;
  bank_code: string;
  bank_bin: string;
  account_number: string;
  account_name: string;
  vietqr_template: "compact" | "compact2" | "qr_only" | "print";
  payment_due_hours: number;
  shipping_flat_fee: number;
  free_shipping_threshold: number | null;
  shipping_note_vi: string;
  shipping_note_en: string;
  updated_at: string;
};

/** Shape returned by the create_order / track_order RPCs. */
export type BankTransferInstructions = {
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferContent: string;
  qrImageUrl: string;
  paymentDueAt: string;
};

export type OrderItemView = {
  productId: number;
  productNameVi: string;
  productNameEn: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderView = {
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
  bankTransfer: BankTransferInstructions | null;
  items: OrderItemView[];
  createdAt: string;
};

export type CreateOrderPayload = {
  recipientFullName: string;
  phoneNumber: string;
  email: string;
  provinceCity: string;
  district: string;
  ward: string;
  streetAddress: string;
  customerNote?: string;
  paymentMethod: PaymentMethod;
  items: { productId: number; quantity: number }[];
};

export type DashboardStats = {
  ordersToday: number;
  ordersYesterday: number;
  revenue7Days: number;
  revenuePrevious7Days: number;
  activeProducts: number;
  pendingOrders: number;
  lowStock: {
    id: number;
    name_vi: string;
    name_en: string;
    inventory_quantity: number;
    image_url: string | null;
  }[];
};

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      categories: TableDef<CategoryRow>;
      products: TableDef<ProductRow>;
      product_images: TableDef<ProductImageRow>;
      orders: TableDef<OrderRow>;
      order_items: TableDef<OrderItemRow>;
      shop_settings: TableDef<ShopSettingsRow>;
    };
    Views: Record<never, never>;
    Functions: {
      create_order: { Args: { payload: CreateOrderPayload }; Returns: OrderView };
      track_order: {
        Args: { p_order_code: string; p_phone_number: string };
        Returns: OrderView;
      };
      seller_dashboard_stats: { Args: Record<never, never>; Returns: DashboardStats };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
