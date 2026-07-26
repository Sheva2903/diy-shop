export type PaymentMethod = "COD" | "BANK_TRANSFER";
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED";

export type CreateOrderItemRequest = {
  productId: number;
  quantity: number;
};

export type CreateOrderRequest = {
  recipientFullName: string;
  phoneNumber: string;
  email: string;
  provinceCity: string;
  district: string;
  ward: string;
  streetAddress: string;
  customerNote?: string;
  paymentMethod: PaymentMethod;
  items: CreateOrderItemRequest[];
};

export type OrderItemResponse = {
  productId: number;
  productNameVi: string;
  productNameEn: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

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

export type OrderResponse = {
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
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  bankTransfer: BankTransferInstructions | null;
  items: OrderItemResponse[];
  createdAt: string;
};
