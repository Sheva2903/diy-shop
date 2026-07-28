import { describe, expect, it } from "vitest";

import { cartReducer } from "./cartReducer";
import type { CartItem } from "./types";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 1,
    nameVi: "Nến thơm",
    nameEn: "Scented candle",
    price: 150000,
    primaryImageUrl: null,
    quantity: 1,
    inventoryQuantity: 5,
    ...overrides
  };
}

describe("cartReducer", () => {
  it("adds a new item", () => {
    const state = cartReducer([], { type: "add", item: makeItem({ quantity: 2 }) });

    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(2);
  });

  it("merges quantity when the product is already in the cart", () => {
    const initial = [makeItem({ quantity: 2 })];
    const state = cartReducer(initial, { type: "add", item: makeItem({ quantity: 1 }) });

    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(3);
  });

  it("clamps quantity to the inventory quantity", () => {
    const initial = [makeItem({ quantity: 4, inventoryQuantity: 5 })];
    const state = cartReducer(initial, { type: "add", item: makeItem({ quantity: 10 }) });

    expect(state[0].quantity).toBe(5);
  });

  it("does not add an out-of-stock product", () => {
    const state = cartReducer([], { type: "add", item: makeItem({ inventoryQuantity: 0 }) });

    expect(state).toHaveLength(0);
  });

  it("keeps quantity at least one when updating", () => {
    const state = cartReducer([makeItem({ quantity: 3 })], {
      type: "updateQuantity",
      productId: 1,
      quantity: 0
    });

    expect(state[0].quantity).toBe(1);
  });

  it("removes and clears items", () => {
    const initial = [makeItem(), makeItem({ productId: 2 })];

    expect(cartReducer(initial, { type: "remove", productId: 1 })).toHaveLength(1);
    expect(cartReducer(initial, { type: "clear" })).toHaveLength(0);
  });
});
