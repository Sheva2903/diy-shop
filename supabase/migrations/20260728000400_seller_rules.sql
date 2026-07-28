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
