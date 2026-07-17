alter table product_images
    add column storage_key varchar(500),
    add column content_type varchar(100);

alter table product_images
    alter column image_url drop not null;

alter table product_images
    add constraint chk_product_images_source
        check (storage_key is not null or image_url is not null);

create unique index ux_product_images_storage_key
    on product_images (storage_key)
    where storage_key is not null;
