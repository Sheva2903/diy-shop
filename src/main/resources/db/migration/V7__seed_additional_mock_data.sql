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
    (1, 'Tranh phong cảnh', 'Landscape Painting', 'Tranh phong cảnh núi rừng vẽ tay.', 'A hand-painted mountain landscape artwork.', 350000, 2, true),
    (2, 'Vòng tay len', 'Crochet Bracelet', 'Vòng tay len thủ công đơn giản.', 'A simple handmade crochet bracelet.', 35000, 15, true),
    (3, 'Khung ảnh gỗ', 'Wooden Photo Frame', 'Khung ảnh gỗ thủ công trang trí.', 'A handmade wooden decorative photo frame.', 120000, 8, true),
    (1, 'Tranh chân dung mini', 'Mini Portrait Painting', 'Tranh chân dung mini vẽ tay.', 'A small hand-painted portrait artwork.', 250000, 0, true),
    (2, 'Bờm tóc handmade', 'Handmade Hairband', 'Bờm tóc len thủ công nhiều màu.', 'A colorful handmade crochet hairband.', 25000, 20, true),
    (3, 'Đèn ngủ trang trí', 'Decorative Night Light', 'Đèn ngủ trang trí thủ công.', 'A handmade decorative night light.', 150000, 4, false);

insert into product_images (product_id, image_url, primary_image, sort_order)
values
    (5, 'https://example.com/images/landscape-painting.jpg', true, 1),
    (6, 'https://example.com/images/crochet-bracelet.jpg', true, 1),
    (7, 'https://example.com/images/wooden-photo-frame.jpg', true, 1),
    (8, 'https://example.com/images/mini-portrait-painting.jpg', true, 1),
    (9, 'https://example.com/images/handmade-hairband.jpg', true, 1),
    (10, 'https://example.com/images/decorative-night-light.jpg', true, 1);

insert into orders (
    order_code, recipient_full_name, phone_number, email,
    province_city, district, ward, street_address, customer_note,
    payment_method, order_status, payment_status,
    subtotal, shipping_fee, total_amount
)
values
    ('DS20260715-A1B2C3', 'Nguyen Van A', '0901234567', 'nguyenvana@example.com', 'Ho Chi Minh', 'Quan 1', 'Phuong Ben Nghe', '12 Nguyen Hue', null, 'COD', 'DELIVERED', 'PAID', 180000, 30000, 210000),
    ('DS20260716-D4E5F6', 'Tran Thi B', '0912345678', 'tranthib@example.com', 'Ha Noi', 'Cau Giay', 'Phuong Dich Vong', '45 Xuan Thuy', 'Giao giờ hành chính', 'BANK_TRANSFER', 'PENDING', 'UNPAID', 90000, 30000, 120000),
    ('DS20260717-G7H8I9', 'Le Van C', '0923456789', 'levanc@example.com', 'Da Nang', 'Hai Chau', 'Phuong Thach Thang', '78 Bach Dang', null, 'COD', 'CONFIRMED', 'UNPAID', 350000, 30000, 380000),
    ('DS20260718-J1K2L3', 'Pham Thi D', '0934567890', 'phamthid@example.com', 'Ho Chi Minh', 'Quan 3', 'Phuong Vo Thi Sau', '23 Nam Ky Khoi Nghia', null, 'BANK_TRANSFER', 'SHIPPING', 'PAID', 155000, 30000, 185000),
    ('DS20260719-M4N5O6', 'Hoang Van E', '0945678901', 'hoangvane@example.com', 'Can Tho', 'Ninh Kieu', 'Phuong Tan An', '5 Hoa Binh', 'Khách huỷ do đổi ý', 'COD', 'CANCELLED', 'UNPAID', 120000, 30000, 150000),
    ('DS20260720-P7Q8R9', 'Vu Thi F', '0956789012', 'vuthif@example.com', 'Ho Chi Minh', 'Quan 7', 'Phuong Tan Phong', '101 Nguyen Thi Thap', null, 'BANK_TRANSFER', 'DELIVERED', 'PAID', 360000, 30000, 390000),
    ('DS20260721-S1T2U3', 'Dang Van G', '0967890123', 'dangvang@example.com', 'Hai Phong', 'Le Chan', 'Phuong An Bien', '9 To Hieu', null, 'COD', 'PENDING', 'UNPAID', 100000, 30000, 130000),
    ('DS20260722-V4W5X6', 'Bui Thi H', '0978901234', 'buithih@example.com', 'Ha Noi', 'Hai Ba Trung', 'Phuong Bach Khoa', '15 Tran Dai Nghia', 'Gọi trước khi giao', 'BANK_TRANSFER', 'CONFIRMED', 'PAID', 80000, 30000, 110000),
    ('DS20260723-Y7Z8A9', 'Ngo Van I', '0989012345', 'ngovani@example.com', 'Ho Chi Minh', 'Binh Thanh', 'Phuong 25', '33 Dien Bien Phu', null, 'COD', 'SHIPPING', 'UNPAID', 350000, 30000, 380000),
    ('DS20260724-B1C2D3', 'Dinh Thi K', '0990123456', 'dinhthik@example.com', 'Hue', 'Thanh phố Huế', 'Phuong Vy Da', '20 Le Loi', 'Thanh toán thất bại, đơn huỷ', 'BANK_TRANSFER', 'CANCELLED', 'FAILED', 240000, 30000, 270000);

with items(order_id, product_id, product_name_vi, product_name_en, unit_price, quantity, line_total) as (
    values
        (1, 1, 'Tranh hoa nhỏ', 'Small Flower Painting', 180000, 1, 180000),
        (2, 2, 'Móc khóa len', 'Crochet Keychain', 45000, 2, 90000),
        (3, 5, 'Tranh phong cảnh', 'Landscape Painting', 350000, 1, 350000),
        (4, 6, 'Vòng tay len', 'Crochet Bracelet', 35000, 3, 105000),
        (4, 9, 'Bờm tóc handmade', 'Handmade Hairband', 25000, 2, 50000),
        (5, 7, 'Khung ảnh gỗ', 'Wooden Photo Frame', 120000, 1, 120000),
        (6, 1, 'Tranh hoa nhỏ', 'Small Flower Painting', 180000, 2, 360000),
        (7, 9, 'Bờm tóc handmade', 'Handmade Hairband', 25000, 4, 100000),
        (8, 2, 'Móc khóa len', 'Crochet Keychain', 45000, 1, 45000),
        (8, 6, 'Vòng tay len', 'Crochet Bracelet', 35000, 1, 35000),
        (9, 5, 'Tranh phong cảnh', 'Landscape Painting', 350000, 1, 350000),
        (10, 7, 'Khung ảnh gỗ', 'Wooden Photo Frame', 120000, 2, 240000)
)
insert into order_items (order_id, product_id, product_name_vi, product_name_en, unit_price, quantity, line_total)
select order_id, product_id, product_name_vi, product_name_en, unit_price, quantity, line_total from items;
