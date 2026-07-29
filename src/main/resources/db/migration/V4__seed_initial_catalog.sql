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
    (1, 'https://i.pinimg.com/736x/c1/f4/ae/c1f4ae54f36d72e880c22bbcbef25992.jpg', true, 1),
    (2, 'https://i.pinimg.com/1200x/26/92/6f/26926fe06aef485719b48fda830f4a4d.jpg', true, 1),
    (3, 'https://i.pinimg.com/736x/16/13/d3/1613d38259cf8241c77e34cdb73bfd90.jpg', true, 1),
    (4, 'https://i.pinimg.com/1200x/2c/96/79/2c9679a36e4cf90117a915e2a957c359.jpg', true, 1);
