import { createContext } from "react";

import type { CartItem } from "../types";

export type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);
