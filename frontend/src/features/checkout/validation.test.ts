import { describe, expect, it } from "vitest";

import { validateCheckout, type CheckoutFormValues } from "./validation";

function makeValues(overrides: Partial<CheckoutFormValues> = {}): CheckoutFormValues {
  return {
    recipientFullName: "Nguyễn Văn A",
    phoneNumber: "0900000000",
    email: "a@example.com",
    provinceCity: "Hà Nội",
    district: "Hoàn Kiếm",
    ward: "Cửa Đông",
    streetAddress: "123 Ngõ Tứ Mạ",
    customerNote: "",
    ...overrides
  };
}

describe("validateCheckout", () => {
  it("accepts a complete form", () => {
    expect(validateCheckout(makeValues())).toEqual({});
  });

  it("flags missing required fields", () => {
    const errors = validateCheckout(makeValues({ recipientFullName: "   " }));

    expect(errors.recipientFullName).toEqual({ rule: "required" });
  });

  it("allows an empty note", () => {
    expect(validateCheckout(makeValues({ customerNote: "" })).customerNote).toBeUndefined();
  });

  it("flags an invalid email", () => {
    expect(validateCheckout(makeValues({ email: "not-an-email" })).email).toEqual({
      rule: "invalidEmail"
    });
  });

  it("flags a value over the backend max length", () => {
    const errors = validateCheckout(makeValues({ phoneNumber: "0".repeat(31) }));

    expect(errors.phoneNumber).toEqual({ rule: "maxLength", max: 30 });
  });
});
