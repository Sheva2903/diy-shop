create table categories (
    id bigserial primary key,
    name_vi varchar(100) not null,
    name_en varchar(100) not null,
    visible boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_categories_visible on categories (visible);
