import { apiFetch } from "../lib/api";

export type ShopSettings = {
  shop_name: string;
  description_vi: string;
  description_en: string;
  logo_url: string | null;
  contact_email: string;
  contact_phone: string;
  bank_name: string;
  bank_code: string;
  bank_bin: string;
  account_number: string;
  account_name: string;
  vietqr_template: "compact" | "compact2" | "qr_only" | "print";
  payment_due_hours: number;
  shipping_flat_fee: number;
  free_shipping_threshold: number | null;
  shipping_note_vi: string;
  shipping_note_en: string;
  updated_at: string;
};

type ShopSettingsResponseDto = {
  shopName: string;
  descriptionVi: string;
  descriptionEn: string;
  logoUrl: string | null;
  contactEmail: string;
  contactPhone: string;
  bankName: string;
  bankCode: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  vietqrTemplate: ShopSettings["vietqr_template"];
  paymentDueHours: number;
  shippingFlatFee: number;
  freeShippingThreshold: number | null;
  shippingNoteVi: string;
  shippingNoteEn: string;
  updatedAt: string;
};

function toShopSettings(dto: ShopSettingsResponseDto): ShopSettings {
  return {
    shop_name: dto.shopName,
    description_vi: dto.descriptionVi,
    description_en: dto.descriptionEn,
    logo_url: dto.logoUrl,
    contact_email: dto.contactEmail,
    contact_phone: dto.contactPhone,
    bank_name: dto.bankName,
    bank_code: dto.bankCode,
    bank_bin: dto.bankBin,
    account_number: dto.accountNumber,
    account_name: dto.accountName,
    vietqr_template: dto.vietqrTemplate,
    payment_due_hours: dto.paymentDueHours,
    shipping_flat_fee: Number(dto.shippingFlatFee),
    free_shipping_threshold:
      dto.freeShippingThreshold === null ? null : Number(dto.freeShippingThreshold),
    shipping_note_vi: dto.shippingNoteVi,
    shipping_note_en: dto.shippingNoteEn,
    updated_at: dto.updatedAt
  };
}

export async function getShopSettings(): Promise<ShopSettings> {
  return toShopSettings(await apiFetch<ShopSettingsResponseDto>("/api/settings"));
}

export type ShopSettingsInput = Omit<ShopSettings, "updated_at">;

export async function updateShopSettings(input: ShopSettingsInput): Promise<ShopSettings> {
  const dto = await apiFetch<ShopSettingsResponseDto>("/api/seller/settings", {
    method: "PUT",
    json: {
      shopName: input.shop_name,
      descriptionVi: input.description_vi,
      descriptionEn: input.description_en,
      logoUrl: input.logo_url,
      contactEmail: input.contact_email,
      contactPhone: input.contact_phone,
      bankName: input.bank_name,
      bankCode: input.bank_code,
      bankBin: input.bank_bin,
      accountNumber: input.account_number,
      accountName: input.account_name,
      vietqrTemplate: input.vietqr_template,
      paymentDueHours: input.payment_due_hours,
      shippingFlatFee: input.shipping_flat_fee,
      freeShippingThreshold: input.free_shipping_threshold,
      shippingNoteVi: input.shipping_note_vi,
      shippingNoteEn: input.shipping_note_en
    }
  });

  return toShopSettings(dto);
}
