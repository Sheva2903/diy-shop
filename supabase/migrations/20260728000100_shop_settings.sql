-- Shop settings: single-row table backing the Seller Dashboard "Settings" screens.
-- Replaces the environment-driven BankTransferProperties / shop.shipping.flat-fee
-- configuration from the Spring Boot backend.

create table if not exists public.shop_settings (
    id                      smallint primary key default 1 check (id = 1),

    -- Tab 1: shop information
    shop_name               varchar(150)  not null default 'DIY Shop',
    description_vi          text          not null default '',
    description_en          text          not null default '',
    logo_url                varchar(500),
    contact_email           varchar(254)  not null default '',
    contact_phone           varchar(30)   not null default '',

    -- Tab 2: bank transfer / VietQR
    bank_name               varchar(100)  not null default '',
    bank_code               varchar(50)   not null default '',
    bank_bin                varchar(20)   not null default '',
    account_number          varchar(50)   not null default '',
    account_name            varchar(150)  not null default '',
    vietqr_template         varchar(20)   not null default 'compact'
                              check (vietqr_template in ('compact', 'compact2', 'qr_only', 'print')),
    payment_due_hours       integer       not null default 24 check (payment_due_hours > 0),

    -- Tab 3: shipping
    shipping_flat_fee       numeric(12, 2) not null default 30000 check (shipping_flat_fee >= 0),
    free_shipping_threshold numeric(12, 2) check (free_shipping_threshold >= 0),
    shipping_note_vi        text          not null default '',
    shipping_note_en        text          not null default '',

    updated_at              timestamptz   not null default now()
);

-- Seed the single row with the values the Spring Boot deployment used.
insert into public.shop_settings (
    id, shop_name, contact_phone,
    bank_name, bank_code, bank_bin, account_number, account_name,
    shipping_flat_fee
)
values (
    1, 'DIY Shop', '0900 000 000',
    'Vietcombank', 'vietcombank', '970436', '0123456789', 'DIY SHOP',
    30000
)
on conflict (id) do nothing;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists shop_settings_touch_updated_at on public.shop_settings;
create trigger shop_settings_touch_updated_at
    before update on public.shop_settings
    for each row execute function public.touch_updated_at();

-- Orders gain a cancellation reason so the dashboard can require one when cancelling.
alter table public.orders
    add column if not exists cancellation_reason text;
