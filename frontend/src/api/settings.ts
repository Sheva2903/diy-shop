import { supabase } from "../lib/supabase";
import type { ShopSettingsRow } from "../types/database";

export type ShopSettings = ShopSettingsRow;

export async function getShopSettings(): Promise<ShopSettings> {
  const { data, error } = await supabase.from("shop_settings").select("*").eq("id", 1).single();

  if (error) throw error;
  return data;
}

export async function updateShopSettings(
  patch: Partial<Omit<ShopSettings, "id" | "updated_at">>
): Promise<ShopSettings> {
  const { data, error } = await supabase
    .from("shop_settings")
    .update(patch)
    .eq("id", 1)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
