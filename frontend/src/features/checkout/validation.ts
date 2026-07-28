export type CheckoutFormValues = {
  recipientFullName: string;
  phoneNumber: string;
  email: string;
  provinceCity: string;
  district: string;
  ward: string;
  streetAddress: string;
  customerNote: string;
};

export type CheckoutFieldError = { rule: "required" } | { rule: "maxLength"; max: number } | { rule: "invalidEmail" };

export type CheckoutErrors = Partial<Record<keyof CheckoutFormValues, CheckoutFieldError>>;

const maxLengths: Record<keyof CheckoutFormValues, number> = {
  recipientFullName: 150,
  phoneNumber: 30,
  email: 254,
  provinceCity: 100,
  district: 100,
  ward: 100,
  streetAddress: 255,
  customerNote: 2000
};

const requiredFields: (keyof CheckoutFormValues)[] = [
  "recipientFullName",
  "phoneNumber",
  "email",
  "provinceCity",
  "district",
  "ward",
  "streetAddress"
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckout(values: CheckoutFormValues): CheckoutErrors {
  const errors: CheckoutErrors = {};

  for (const field of Object.keys(maxLengths) as (keyof CheckoutFormValues)[]) {
    const value = values[field].trim();

    if (requiredFields.includes(field) && !value) {
      errors[field] = { rule: "required" };
      continue;
    }

    if (value.length > maxLengths[field]) {
      errors[field] = { rule: "maxLength", max: maxLengths[field] };
      continue;
    }

    if (field === "email" && value && !emailPattern.test(value)) {
      errors[field] = { rule: "invalidEmail" };
    }
  }

  return errors;
}
