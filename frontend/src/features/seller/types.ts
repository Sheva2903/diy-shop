export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED";
export type PaymentMethod = "COD" | "BANK_TRANSFER";

export type SellerCategory = {
  id: number;
  nameVi: string;
  nameEn: string;
  visible: boolean;
};

export type ProductImage = {
  id: number;
  imageUrl: string;
  primaryImage: boolean;
  sortOrder: number;
};

export type SellerProduct = {
  id: number;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  price: number;
  inventoryQuantity: number;
  visible: boolean;
  category: SellerCategory;
  images: ProductImage[];
};

export type SellerOrderListItem = {
  orderCode: string;
  recipientFullName: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
};

export type SellerOrderItem = {
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

export type SellerOrderDetail = {
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
  items: SellerOrderItem[];
  createdAt: string;
};
