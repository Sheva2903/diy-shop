create table products (
    id bigserial primary key,
    category_id bigint not null references categories (id),
    name_vi varchar(200) not null,
    name_en varchar(200) not null,
    description_vi text not null,
    description_en text not null,
    price numeric(12, 2) not null,
    inventory_quantity integer not null,
    visible boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_products_price_non_negative check (price >= 0),
    constraint chk_products_inventory_non_negative check (inventory_quantity >= 0)
);

create index idx_products_category_id on products (category_id);
create index idx_products_visible on products (visible);
create index idx_products_name_vi_lower on products (lower(name_vi));
create index idx_products_name_en_lower on products (lower(name_en));
