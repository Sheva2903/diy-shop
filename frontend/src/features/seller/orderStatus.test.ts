import { describe, expect, it } from "vitest";

import { allowedTransitions, canMarkPaid, canTransition } from "./orderStatus";

describe("order status transitions", () => {
  it("allows the documented forward transitions", () => {
    expect(canTransition("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransition("CONFIRMED", "SHIPPING")).toBe(true);
    expect(canTransition("SHIPPING", "DELIVERED")).toBe(true);
  });

  it("allows cancelling only before shipping", () => {
    expect(canTransition("PENDING", "CANCELLED")).toBe(true);
    expect(canTransition("CONFIRMED", "CANCELLED")).toBe(true);
    expect(canTransition("SHIPPING", "CANCELLED")).toBe(false);
  });

  it("rejects skipping a step or moving backwards", () => {
    expect(canTransition("PENDING", "SHIPPING")).toBe(false);
    expect(canTransition("SHIPPING", "CONFIRMED")).toBe(false);
  });

  it("treats delivered and cancelled as terminal", () => {
    expect(allowedTransitions.DELIVERED).toEqual([]);
    expect(allowedTransitions.CANCELLED).toEqual([]);
  });

  it("offers mark-paid only for unpaid, non-cancelled orders", () => {
    expect(canMarkPaid("PENDING", "UNPAID")).toBe(true);
    expect(canMarkPaid("PENDING", "PAID")).toBe(false);
    expect(canMarkPaid("CANCELLED", "UNPAID")).toBe(false);
  });
});
