insert into categories (name_vi, name_en, visible)
values
    ('Tranh thủ công', 'Handmade Paintings', true),
    ('Phụ kiện', 'Accessories', true),
    ('Đồ trang trí', 'Decorations', true);

insert into products (
    category_id,
    name_vi,
    name_en,
    description_vi,
    description_en,
    price,
    inventory_quantity,
    visible
)
values
    (1, 'Tranh hoa nhỏ', 'Small Flower Painting', 'Tranh hoa vẽ tay kích thước nhỏ.', 'A small hand-painted flower artwork.', 180000, 3, true),
    (2, 'Móc khóa len', 'Crochet Keychain', 'Móc khóa len thủ công nhiều màu.', 'A colorful handmade crochet keychain.', 45000, 10, true),
    (3, 'Nến trang trí', 'Decorative Candle', 'Nến trang trí làm thủ công.', 'A handmade decorative candle.', 90000, 0, true),
    (3, 'Sản phẩm nháp', 'Draft Product', 'Sản phẩm đang ẩn.', 'A hidden draft product.', 100000, 5, false);

insert into product_images (product_id, image_url, primary_image, sort_order)
values
    (1, 'https://example.com/images/small-flower-painting.jpg', true, 1),
    (2, 'https://example.com/images/crochet-keychain.jpg', true, 1),
    (3, 'https://example.com/images/decorative-candle.jpg', true, 1),
    (4, 'https://example.com/images/draft-product.jpg', true, 1);
