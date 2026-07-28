-- DIY Shop: full Supabase setup. Paste into the Supabase SQL Editor and Run.
-- Generated from supabase/migrations/*.sql


-- ============================================================
-- 20260728000100_shop_settings.sql
-- ============================================================
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

-- ============================================================
-- 20260728000200_rls_policies.sql
-- ============================================================
-- Row Level Security. Replaces Spring Security's SecurityConfig:
--   * /api/**            -> public read of visible catalog data
--   * /api/seller/**     -> hasRole('SELLER')
--
-- The seller is identified by app_metadata.role = 'seller' on the auth user.
-- app_metadata is only writable with the service key, so a customer cannot
-- grant themselves the role by editing their own profile.

-- SECURITY DEFINER on purpose: this runs inside RLS policies evaluated as the
-- anon / authenticated roles, which are not guaranteed USAGE on the auth
-- schema. Running as the owner keeps the policies working regardless, and the
-- empty search_path stops any object being resolved from a caller-controlled
-- schema. It reads only from the caller's own JWT, so it grants nothing extra.
create or replace function public.is_seller()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'seller';
$$;

grant execute on function public.is_seller() to anon, authenticated;

alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.shop_settings  enable row level security;

-- ---------------------------------------------------------------- categories
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
    for select using (visible = true);

drop policy if exists categories_seller_all on public.categories;
create policy categories_seller_all on public.categories
    for all using (public.is_seller()) with check (public.is_seller());

-- ------------------------------------------------------------------ products
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
    for select using (visible = true);

drop policy if exists products_seller_all on public.products;
create policy products_seller_all on public.products
    for all using (public.is_seller()) with check (public.is_seller());

-- ------------------------------------------------------------ product_images
drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images
    for select using (
        exists (
            select 1 from public.products p
            where p.id = product_images.product_id and p.visible = true
        )
    );

drop policy if exists product_images_seller_all on public.product_images;
create policy product_images_seller_all on public.product_images
    for all using (public.is_seller()) with check (public.is_seller());

-- -------------------------------------------------------- orders/order_items
-- Customers never touch these tables directly: placing and tracking an order
-- both go through SECURITY DEFINER functions. Only the seller has table access.
drop policy if exists orders_seller_all on public.orders;
create policy orders_seller_all on public.orders
    for all using (public.is_seller()) with check (public.is_seller());

drop policy if exists order_items_seller_all on public.order_items;
create policy order_items_seller_all on public.order_items
    for all using (public.is_seller()) with check (public.is_seller());

-- ------------------------------------------------------------- shop_settings
-- Everything here is shop-public (bank details are shown at checkout by design).
drop policy if exists shop_settings_public_read on public.shop_settings;
create policy shop_settings_public_read on public.shop_settings
    for select using (true);

drop policy if exists shop_settings_seller_write on public.shop_settings;
create policy shop_settings_seller_write on public.shop_settings
    for update using (public.is_seller()) with check (public.is_seller());

-- ============================================================
-- 20260728000300_order_functions.sql
-- ============================================================
-- Customer-facing order logic, ported from OrderService and
-- BankTransferInstructionService. These run SECURITY DEFINER because customers
-- have no direct RLS access to orders/order_items: prices, inventory and the
-- order code are all decided server-side, never trusted from the client.

-- Percent-encoding helper for building the VietQR quick-link.
create or replace function public.url_encode(p_text text)
returns text
language plpgsql
immutable
as $$
declare
    v_bytes  bytea;
    v_result text := '';
    v_byte   int;
    v_char   text;
    i        int;
begin
    if p_text is null then
        return '';
    end if;

    v_bytes := convert_to(p_text, 'UTF8');

    for i in 0 .. octet_length(v_bytes) - 1 loop
        v_byte := get_byte(v_bytes, i);
        v_char := chr(v_byte);

        if v_char ~ '^[A-Za-z0-9_.~-]$' then
            v_result := v_result || v_char;
        else
            v_result := v_result || '%' || upper(lpad(to_hex(v_byte), 2, '0'));
        end if;
    end loop;

    return v_result;
end;
$$;

-- Builds the OrderResponse shape the frontend consumes (camelCase, so the
-- existing TypeScript types carry over unchanged).
create or replace function public.order_json(p_order public.orders)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_settings public.shop_settings;
    v_items    jsonb;
    v_bank     jsonb := null;
    v_content  text;
begin
    select coalesce(
               jsonb_agg(
                   jsonb_build_object(
                       'productId',     oi.product_id,
                       'productNameVi', oi.product_name_vi,
                       'productNameEn', oi.product_name_en,
                       'unitPrice',     oi.unit_price,
                       'quantity',      oi.quantity,
                       'lineTotal',     oi.line_total
                   ) order by oi.id
               ),
               '[]'::jsonb
           )
      into v_items
      from public.order_items oi
     where oi.order_id = p_order.id;

    if p_order.payment_method = 'BANK_TRANSFER' then
        select * into v_settings from public.shop_settings where id = 1;

        -- Mirrors BankTransferInstructionService.createTransferContent:
        -- strip non-alphanumerics, uppercase, cap at 25 characters.
        v_content := left(upper(regexp_replace(p_order.order_code, '[^A-Za-z0-9]', '', 'g')), 25);

        v_bank := jsonb_build_object(
            'bankName',        v_settings.bank_name,
            'bankBin',         v_settings.bank_bin,
            'accountNumber',   v_settings.account_number,
            'accountName',     v_settings.account_name,
            'amount',          p_order.total_amount,
            'transferContent', v_content,
            'qrImageUrl',
                'https://img.vietqr.io/image/'
                || v_settings.bank_code || '-'
                || v_settings.account_number || '-'
                || v_settings.vietqr_template || '.jpg'
                || '?amount=' || trunc(p_order.total_amount)::text
                || '&addInfo=' || public.url_encode(v_content)
                || '&accountName=' || public.url_encode(v_settings.account_name),
            'paymentDueAt',
                to_jsonb(p_order.created_at + make_interval(hours => v_settings.payment_due_hours))
        );
    end if;

    return jsonb_build_object(
        'orderCode',          p_order.order_code,
        'recipientFullName',  p_order.recipient_full_name,
        'phoneNumber',        p_order.phone_number,
        'email',              p_order.email,
        'provinceCity',       p_order.province_city,
        'district',           p_order.district,
        'ward',               p_order.ward,
        'streetAddress',      p_order.street_address,
        'customerNote',       p_order.customer_note,
        'paymentMethod',      p_order.payment_method,
        'orderStatus',        p_order.order_status,
        'paymentStatus',      p_order.payment_status,
        'cancellationReason', p_order.cancellation_reason,
        'subtotal',           p_order.subtotal,
        'shippingFee',        p_order.shipping_fee,
        'totalAmount',        p_order.total_amount,
        'bankTransfer',       v_bank,
        'items',              v_items,
        'createdAt',          to_jsonb(p_order.created_at)
    );
end;
$$;

-- ---------------------------------------------------------------------------
-- create_order: the checkout entry point.
-- ---------------------------------------------------------------------------
create or replace function public.create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    v_settings public.shop_settings;
    v_order    public.orders;
    v_product  public.products;
    v_row      record;
    v_field    text;
    v_code     text := null;
    v_suffix   text;
    v_method   text;
    v_note     text;
    v_subtotal numeric(12, 2) := 0;
    v_shipping numeric(12, 2);
    v_line     numeric(12, 2);
    v_attempt  int;
    i          int;
begin
    -- ------------------------------------------------------------- validation
    foreach v_field in array array[
        'recipientFullName', 'phoneNumber', 'email',
        'provinceCity', 'district', 'ward', 'streetAddress'
    ] loop
        if coalesce(btrim(payload ->> v_field), '') = '' then
            raise exception 'Missing required field: %', v_field using errcode = '22023';
        end if;
    end loop;

    v_method := upper(coalesce(payload ->> 'paymentMethod', ''));
    if v_method not in ('COD', 'BANK_TRANSFER') then
        raise exception 'Unsupported payment method: %', v_method using errcode = '22023';
    end if;

    if jsonb_typeof(payload -> 'items') is distinct from 'array'
       or jsonb_array_length(payload -> 'items') = 0 then
        raise exception 'Order must contain at least one item' using errcode = '22023';
    end if;

    -- ------------------------------------------------------- unique order code
    for v_attempt in 1 .. 5 loop
        v_suffix := '';
        for i in 1 .. 6 loop
            v_suffix := v_suffix
                || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
        end loop;

        v_code := 'DS'
            || to_char((now() at time zone 'Asia/Ho_Chi_Minh')::date, 'YYYYMMDD')
            || '-' || v_suffix;

        exit when not exists (select 1 from public.orders o where o.order_code = v_code);
        v_code := null;
    end loop;

    if v_code is null then
        raise exception 'Could not generate unique order code' using errcode = '55000';
    end if;

    v_note := nullif(btrim(coalesce(payload ->> 'customerNote', '')), '');

    insert into public.orders (
        order_code, recipient_full_name, phone_number, email,
        province_city, district, ward, street_address, customer_note,
        payment_method, order_status, payment_status,
        subtotal, shipping_fee, total_amount
    )
    values (
        v_code,
        btrim(payload ->> 'recipientFullName'),
        btrim(payload ->> 'phoneNumber'),
        btrim(payload ->> 'email'),
        btrim(payload ->> 'provinceCity'),
        btrim(payload ->> 'district'),
        btrim(payload ->> 'ward'),
        btrim(payload ->> 'streetAddress'),
        v_note,
        v_method, 'PENDING', 'UNPAID',
        0, 0, 0
    )
    returning * into v_order;

    -- ------------------------------------------------------------------ items
    -- Duplicate product ids in the payload are merged, matching
    -- OrderService.mergeRequestedItems.
    for v_row in
        select (item ->> 'productId')::bigint as product_id,
               sum((item ->> 'quantity')::int) as quantity
          from jsonb_array_elements(payload -> 'items') as item
         group by 1
         order by 1
    loop
        if v_row.product_id is null or coalesce(v_row.quantity, 0) <= 0 then
            raise exception 'Invalid quantity for product %', v_row.product_id using errcode = '22023';
        end if;

        select * into v_product
          from public.products p
         where p.id = v_row.product_id
           and p.visible = true
           for update;

        if not found then
            raise exception 'Product not found: %', v_row.product_id using errcode = 'P0002';
        end if;

        if v_product.inventory_quantity < v_row.quantity then
            raise exception 'Insufficient stock for product: %', v_product.name_en using errcode = '22023';
        end if;

        update public.products
           set inventory_quantity = inventory_quantity - v_row.quantity,
               updated_at = now()
         where id = v_product.id;

        v_line := v_product.price * v_row.quantity;
        v_subtotal := v_subtotal + v_line;

        insert into public.order_items (
            order_id, product_id, product_name_vi, product_name_en,
            unit_price, quantity, line_total
        )
        values (
            v_order.id, v_product.id, v_product.name_vi, v_product.name_en,
            v_product.price, v_row.quantity, v_line
        );
    end loop;

    -- ----------------------------------------------------------------- totals
    select * into v_settings from public.shop_settings where id = 1;

    v_shipping := coalesce(v_settings.shipping_flat_fee, 0);
    if v_settings.free_shipping_threshold is not null
       and v_subtotal >= v_settings.free_shipping_threshold then
        v_shipping := 0;
    end if;

    update public.orders
       set subtotal     = v_subtotal,
           shipping_fee = v_shipping,
           total_amount = v_subtotal + v_shipping,
           updated_at   = now()
     where id = v_order.id
    returning * into v_order;

    return public.order_json(v_order);
end;
$$;

-- ---------------------------------------------------------------------------
-- track_order: guest order lookup by order code + phone number.
-- ---------------------------------------------------------------------------
create or replace function public.track_order(p_order_code text, p_phone_number text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_order public.orders;
begin
    if coalesce(btrim(p_order_code), '') = '' or coalesce(btrim(p_phone_number), '') = '' then
        raise exception 'Order code and phone number are required' using errcode = '22023';
    end if;

    select * into v_order
      from public.orders o
     where o.order_code = btrim(p_order_code)
       and o.phone_number = btrim(p_phone_number);

    if not found then
        raise exception 'Order not found' using errcode = 'P0002';
    end if;

    return public.order_json(v_order);
end;
$$;

-- order_json takes a composite row and bypasses RLS, so it must not be callable
-- directly over PostgREST. Only the wrapper functions above may use it.
revoke all on function public.order_json(public.orders) from public, anon, authenticated;
revoke all on function public.url_encode(text) from public, anon, authenticated;

grant execute on function public.create_order(jsonb) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- ============================================================
-- 20260728000400_seller_rules.sql
-- ============================================================
-- Seller-side invariants, ported from SellerOrderService. The seller updates
-- orders directly through PostgREST, so the state machine is enforced by a
-- trigger rather than by a service layer.

create or replace function public.enforce_order_transition()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_allowed text[];
    v_item    record;
begin
    if new.order_status is distinct from old.order_status then
        v_allowed := case old.order_status
            when 'PENDING'   then array['CONFIRMED', 'CANCELLED']
            when 'CONFIRMED' then array['SHIPPING', 'CANCELLED']
            when 'SHIPPING'  then array['DELIVERED']
            else array[]::text[]
        end;

        if not (new.order_status = any (v_allowed)) then
            raise exception 'Invalid order status transition: % -> %',
                old.order_status, new.order_status using errcode = '22023';
        end if;

        -- Cancelling releases the reserved inventory back to the catalog.
        if new.order_status = 'CANCELLED' then
            for v_item in
                select product_id, quantity from public.order_items where order_id = old.id
            loop
                update public.products
                   set inventory_quantity = inventory_quantity + v_item.quantity,
                       updated_at = now()
                 where id = v_item.product_id;
            end loop;
        end if;
    end if;

    if new.payment_status is distinct from old.payment_status
       and new.payment_status = 'PAID' then
        if old.order_status = 'CANCELLED' then
            raise exception 'Cancelled orders cannot be marked paid' using errcode = '22023';
        end if;
        if old.payment_status = 'FAILED' then
            raise exception 'Failed payments cannot be marked paid' using errcode = '22023';
        end if;
    end if;

    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists orders_enforce_transition on public.orders;
create trigger orders_enforce_transition
    before update on public.orders
    for each row execute function public.enforce_order_transition();

-- ---------------------------------------------------------------------------
-- Delete guards. The Spring backend had no delete endpoints; the dashboard
-- design calls for them, so the referential rules live here.
-- ---------------------------------------------------------------------------

create or replace function public.guard_category_delete()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_count int;
begin
    select count(*) into v_count from public.products where category_id = old.id;

    if v_count > 0 then
        raise exception
            'Category still has % product(s). Move them to another category first.', v_count
            using errcode = '23503';
    end if;

    return old;
end;
$$;

drop trigger if exists categories_guard_delete on public.categories;
create trigger categories_guard_delete
    before delete on public.categories
    for each row execute function public.guard_category_delete();

create or replace function public.guard_product_delete()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_count int;
begin
    select count(*) into v_count from public.order_items where product_id = old.id;

    if v_count > 0 then
        raise exception
            'Product appears in % order(s) and cannot be deleted. Hide it instead.', v_count
            using errcode = '23503';
    end if;

    delete from public.product_images where product_id = old.id;
    return old;
end;
$$;

drop trigger if exists products_guard_delete on public.products;
create trigger products_guard_delete
    before delete on public.products
    for each row execute function public.guard_product_delete();

-- ---------------------------------------------------------------------------
-- Dashboard overview metrics (plan 2.2).
-- ---------------------------------------------------------------------------
create or replace function public.seller_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
    if not public.is_seller() then
        raise exception 'Seller role required' using errcode = '42501';
    end if;

    return jsonb_build_object(
        'ordersToday', (
            select count(*) from public.orders
             where (created_at at time zone 'Asia/Ho_Chi_Minh')::date = v_today
        ),
        'ordersYesterday', (
            select count(*) from public.orders
             where (created_at at time zone 'Asia/Ho_Chi_Minh')::date = v_today - 1
        ),
        'revenue7Days', (
            select coalesce(sum(total_amount), 0) from public.orders
             where order_status <> 'CANCELLED'
               and created_at >= now() - interval '7 days'
        ),
        'revenuePrevious7Days', (
            select coalesce(sum(total_amount), 0) from public.orders
             where order_status <> 'CANCELLED'
               and created_at >= now() - interval '14 days'
               and created_at <  now() - interval '7 days'
        ),
        'activeProducts', (
            select count(*) from public.products where visible = true
        ),
        'pendingOrders', (
            select count(*) from public.orders
             where order_status in ('PENDING', 'CONFIRMED')
        ),
        'lowStock', (
            select coalesce(
                jsonb_agg(row_to_json(t) order by t.inventory_quantity, t.id),
                '[]'::jsonb
            )
            from (
                select p.id, p.name_vi, p.name_en, p.inventory_quantity,
                       (select pi.image_url
                          from public.product_images pi
                         where pi.product_id = p.id
                         order by pi.primary_image desc, pi.sort_order
                         limit 1) as image_url
                  from public.products p
                 where p.visible = true and p.inventory_quantity <= 5
                 order by p.inventory_quantity, p.id
                 limit 10
            ) t
        )
    );
end;
$$;

grant execute on function public.seller_dashboard_stats() to authenticated;
revoke all on function public.seller_dashboard_stats() from anon;

-- ============================================================
-- 20260728000500_storage.sql
-- ============================================================
-- Product image storage, replacing LocalProductImageStorage / S3ProductImageStorage.
-- Public read so the storefront can render images straight from the CDN URL;
-- writes are restricted to the seller.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB, matches shop.image-storage.max-file-size
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
   set public             = excluded.public,
       file_size_limit    = excluded.file_size_limit,
       allowed_mime_types = excluded.allowed_mime_types;

-- Named distinctly from the public.product_images table policies.
drop policy if exists storage_product_images_public_read on storage.objects;
create policy storage_product_images_public_read on storage.objects
    for select using (bucket_id = 'product-images');

drop policy if exists storage_product_images_seller_insert on storage.objects;
create policy storage_product_images_seller_insert on storage.objects
    for insert with check (bucket_id = 'product-images' and public.is_seller());

drop policy if exists storage_product_images_seller_update on storage.objects;
create policy storage_product_images_seller_update on storage.objects
    for update using (bucket_id = 'product-images' and public.is_seller());

drop policy if exists storage_product_images_seller_delete on storage.objects;
create policy storage_product_images_seller_delete on storage.objects
    for delete using (bucket_id = 'product-images' and public.is_seller());
