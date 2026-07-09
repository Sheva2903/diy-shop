create table orders (
    id bigserial primary key,
    order_code varchar(32) not null unique,
    recipient_full_name varchar(150) not null,
    phone_number varchar(30) not null,
    email varchar(254) not null,
    province_city varchar(100) not null,
    district varchar(100) not null,
    ward varchar(100) not null,
    street_address varchar(255) not null,
    customer_note text,
    payment_method varchar(30) not null,
    order_status varchar(30) not null,
    payment_status varchar(30) not null,
    subtotal numeric(12, 2) not null,
    shipping_fee numeric(12, 2) not null,
    total_amount numeric(12, 2) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_orders_subtotal_non_negative check (subtotal >= 0),
    constraint chk_orders_shipping_fee_non_negative check (shipping_fee >= 0),
    constraint chk_orders_total_amount_non_negative check (total_amount >= 0)
);

create index idx_orders_order_code on orders (order_code);
create index idx_orders_phone_number on orders (phone_number);
create index idx_orders_order_status on orders (order_status);
create index idx_orders_payment_status on orders (payment_status);

create table order_items (
    id bigserial primary key,
    order_id bigint not null references orders (id) on delete cascade,
    product_id bigint not null references products (id),
    product_name_vi varchar(200) not null,
    product_name_en varchar(200) not null,
    unit_price numeric(12, 2) not null,
    quantity integer not null,
    line_total numeric(12, 2) not null,
    constraint chk_order_items_unit_price_non_negative check (unit_price >= 0),
    constraint chk_order_items_quantity_positive check (quantity > 0),
    constraint chk_order_items_line_total_non_negative check (line_total >= 0)
);

create index idx_order_items_order_id on order_items (order_id);
create index idx_order_items_product_id on order_items (product_id);
