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
