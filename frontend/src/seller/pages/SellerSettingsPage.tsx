import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  getShopSettings,
  updateShopSettings,
  type ShopSettings,
  type ShopSettingsInput
} from "../../api/settings";
import { Button } from "../../components/ui/Button";
import { ErrorState, Skeleton } from "../../components/ui/Feedback";
import { SelectField, TextAreaField, TextField } from "../../components/ui/Field";
import { useToast } from "../../components/ui/toast";
import { cn } from "../../lib/cn";
import { useSellerSession } from "../auth/useSellerSession";

type TabId = "shop" | "payment" | "shipping" | "account";

const tabs: { id: TabId; label: string }[] = [
  { id: "shop", label: "Shop information" },
  { id: "payment", label: "Payment" },
  { id: "shipping", label: "Shipping" },
  { id: "account", label: "Seller account" }
];

type Draft = ShopSettingsInput;

function toDraft(settings: ShopSettings): Draft {
  const { updated_at, ...rest } = settings;
  void updated_at;
  return rest;
}

export function SellerSettingsPage() {
  const settingsQuery = useQuery({ queryKey: ["shop-settings"], queryFn: getShopSettings });

  if (settingsQuery.isError) {
    return <ErrorState title="Could not load settings" description={settingsQuery.error.message} />;
  }

  if (!settingsQuery.data) {
    return <Skeleton className="h-96 max-w-3xl rounded-card" />;
  }

  return <SettingsForm settings={settingsQuery.data} />;
}

function SettingsForm({ settings }: { settings: ShopSettings }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { username } = useSellerSession();

  const [tab, setTab] = useState<TabId>("shop");
  const [draft, setDraft] = useState<Draft>(() => toDraft(settings));

  const saveMutation = useMutation({
    mutationFn: (next: Draft) => updateShopSettings(next),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shop-settings"] });
      toast.success("Settings saved");
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const saveButton = (
    <Button
      size="lg"
      className="mt-6"
      disabled={saveMutation.isPending}
      onClick={() => saveMutation.mutate(draft)}
    >
      {saveMutation.isPending ? "Saving..." : "Save changes"}
    </Button>
  );

  return (
    <div className="max-w-3xl">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "shrink-0 rounded-pill px-4 py-2 text-[14px] font-semibold transition-colors duration-[120ms]",
              tab === item.id ? "bg-action text-white" : "bg-ceramic text-text-muted hover:text-text"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-card bg-surface p-5 shadow-card lg:p-6">
        {tab === "shop" && (
          <>
            <h2 className="text-[16px] font-semibold text-text">Shop information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                label="Shop name"
                value={draft.shop_name}
                onChange={(event) => set("shop_name", event.target.value)}
              />
              <TextField
                label="Logo URL"
                value={draft.logo_url ?? ""}
                onChange={(event) => set("logo_url", event.target.value || null)}
              />
              <TextField
                label="Contact email"
                type="email"
                value={draft.contact_email}
                onChange={(event) => set("contact_email", event.target.value)}
              />
              <TextField
                label="Contact phone"
                value={draft.contact_phone}
                onChange={(event) => set("contact_phone", event.target.value)}
              />
              <TextAreaField
                label="Short description (VI)"
                rows={3}
                value={draft.description_vi}
                onChange={(event) => set("description_vi", event.target.value)}
              />
              <TextAreaField
                label="Short description (EN)"
                rows={3}
                value={draft.description_en}
                onChange={(event) => set("description_en", event.target.value)}
              />
            </div>
            {saveButton}
          </>
        )}

        {tab === "payment" && (
          <>
            <h2 className="text-[16px] font-semibold text-text">Bank transfer</h2>
            <p className="mt-1 text-[13px] text-text-muted">
              These details appear at checkout and drive the VietQR code on every unpaid order.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                label="Bank name"
                value={draft.bank_name}
                onChange={(event) => set("bank_name", event.target.value)}
              />
              <TextField
                label="Bank code (VietQR)"
                hint="e.g. vietcombank, techcombank"
                value={draft.bank_code}
                onChange={(event) => set("bank_code", event.target.value)}
              />
              <TextField
                label="Bank BIN"
                hint="e.g. 970436 for Vietcombank"
                value={draft.bank_bin}
                onChange={(event) => set("bank_bin", event.target.value)}
              />
              <TextField
                label="Account number"
                value={draft.account_number}
                onChange={(event) => set("account_number", event.target.value)}
              />
              <TextField
                label="Account holder"
                value={draft.account_name}
                onChange={(event) => set("account_name", event.target.value)}
              />
              <SelectField
                label="VietQR template"
                value={draft.vietqr_template}
                onChange={(event) =>
                  set("vietqr_template", event.target.value as Draft["vietqr_template"])
                }
              >
                <option value="compact">compact</option>
                <option value="compact2">compact2</option>
                <option value="qr_only">qr_only</option>
                <option value="print">print</option>
              </SelectField>
              <TextField
                label="Payment window (hours)"
                type="number"
                min={1}
                value={draft.payment_due_hours}
                onChange={(event) => set("payment_due_hours", Number(event.target.value))}
              />
            </div>
            {saveButton}
          </>
        )}

        {tab === "shipping" && (
          <>
            <h2 className="text-[16px] font-semibold text-text">Shipping</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                label="Flat shipping fee (VND)"
                type="number"
                min={0}
                step={1000}
                value={draft.shipping_flat_fee}
                onChange={(event) => set("shipping_flat_fee", Number(event.target.value))}
              />
              <TextField
                label="Free shipping from (VND)"
                type="number"
                min={0}
                step={1000}
                hint="Leave empty to always charge the flat fee"
                value={draft.free_shipping_threshold ?? ""}
                onChange={(event) =>
                  set(
                    "free_shipping_threshold",
                    event.target.value === "" ? null : Number(event.target.value)
                  )
                }
              />
              <TextAreaField
                label="Shipping note (VI)"
                rows={3}
                value={draft.shipping_note_vi}
                onChange={(event) => set("shipping_note_vi", event.target.value)}
              />
              <TextAreaField
                label="Shipping note (EN)"
                rows={3}
                value={draft.shipping_note_en}
                onChange={(event) => set("shipping_note_en", event.target.value)}
              />
            </div>
            {saveButton}
          </>
        )}

        {tab === "account" && (
          <div>
            <h2 className="text-[16px] font-semibold text-text">Seller account</h2>

            <div className="mt-5 max-w-sm space-y-4">
              <TextField label="Username" value={username ?? ""} disabled />
            </div>

            <p className="mt-5 max-w-sm text-[14px] text-text-muted">
              The seller credentials come from the DIY_SHOP_SELLER_USERNAME and
              DIY_SHOP_SELLER_PASSWORD_HASH environment variables. Change the password by
              replacing the BCrypt hash there and restarting the backend.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
