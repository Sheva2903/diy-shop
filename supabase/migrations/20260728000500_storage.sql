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
