import type { CartAction, CartItem } from "./types";

export function clampQuantity(quantity: number, inventoryQuantity: number): number {
  if (inventoryQuantity <= 0) {
    return 0;
  }

  return Math.min(Math.max(quantity, 1), inventoryQuantity);
}

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      const existing = state.find((item) => item.productId === action.item.productId);

      if (!existing) {
        const quantity = clampQuantity(action.item.quantity, action.item.inventoryQuantity);
        return quantity > 0 ? [...state, { ...action.item, quantity }] : state;
      }

      return state.map((item) =>
        item.productId === action.item.productId
          ? {
              ...item,
              inventoryQuantity: action.item.inventoryQuantity,
              price: action.item.price,
              quantity: clampQuantity(item.quantity + action.item.quantity, action.item.inventoryQuantity)
            }
          : item
      );
    }

    case "updateQuantity": {
      return state.map((item) =>
        item.productId === action.productId
          ? { ...item, quantity: clampQuantity(action.quantity, item.inventoryQuantity) }
          : item
      );
    }

    case "remove":
      return state.filter((item) => item.productId !== action.productId);

    case "clear":
      return [];

    default:
      return state;
  }
}
