export type CartItem = {
  productId: number;
  nameVi: string;
  nameEn: string;
  price: number;
  primaryImageUrl: string | null;
  quantity: number;
  inventoryQuantity: number;
};

export type CartAction =
  | { type: "add"; item: CartItem }
  | { type: "updateQuantity"; productId: number; quantity: number }
  | { type: "remove"; productId: number }
  | { type: "clear" };
