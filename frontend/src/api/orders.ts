import { supabase } from "../lib/supabase";
import type { CreateOrderPayload, OrderView } from "../types/database";

/**
 * Placing an order goes through the create_order RPC, never a direct insert:
 * prices, shipping fee, inventory and the order code are all decided in the
 * database so a tampered client payload cannot change what is charged.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<OrderView> {
  const { data, error } = await supabase.rpc("create_order", { payload });

  if (error) throw error;
  return data as OrderView;
}

export async function trackOrder(orderCode: string, phoneNumber: string): Promise<OrderView> {
  const { data, error } = await supabase.rpc("track_order", {
    p_order_code: orderCode.trim(),
    p_phone_number: phoneNumber.trim()
  });

  if (error) throw error;
  return data as OrderView;
}
