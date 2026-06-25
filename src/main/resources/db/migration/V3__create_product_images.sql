create table product_images (
    id bigserial primary key,
    product_id bigint not null references products (id) on delete cascade,
    image_url varchar(500) not null,
    primary_image boolean not null default false,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

create index idx_product_images_product_id on product_images (product_id);
create unique index ux_product_images_one_primary_per_product
    on product_images (product_id)
    where primary_image = true;
