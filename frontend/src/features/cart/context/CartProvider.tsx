import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";

import { cartReducer } from "../cartReducer";
import type { CartItem } from "../types";
import { CartContext, type CartContextValue } from "./cartContext";

const storageKey = "diy-shop-cart";

function readStoredCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, [], readStoredCart);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: CartItem) => dispatch({ type: "add", item }), []);
  const updateQuantity = useCallback(
    (productId: number, quantity: number) => dispatch({ type: "updateQuantity", productId, quantity }),
    []
  );
  const removeItem = useCallback((productId: number) => dispatch({ type: "remove", productId }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clear
    }),
    [items, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
