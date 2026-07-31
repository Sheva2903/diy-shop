/**
 * Row shapes the UI works in. They stay snake_case to match the database
 * columns; the api/ modules map the camelCase JSON the API speaks onto them.
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

/** Included in an order response when the payment method is BANK_TRANSFER. */
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
