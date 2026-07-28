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
