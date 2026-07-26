-- Seed data for DIY Shop local development

-- Categories
INSERT INTO categories (name_vi, name_en, visible, created_at) VALUES
('Nến thơm', 'Candles', true, NOW()),
('Móc khóa', 'Keychains', true, NOW()),
('Tranh tường', 'Wall Art', true, NOW()),
('Túi vải', 'Tote Bags', true, NOW()),
('Trang sức', 'Jewelry', true, NOW());

-- Products
INSERT INTO products (name_vi, name_en, description_vi, description_en, price, inventory_quantity, visible, category_id, created_at) VALUES
-- Candles
('Nến thơm Lavender', 'Lavender Scented Candle', 'Nến thơm handmade từ sáp ong, mùi hương lavender nhẹ nhàng', 'Handmade beeswax candle with gentle lavender scent', 150000, 15, true, 1, NOW()),
('Nến thơm Vanilla', 'Vanilla Scented Candle', 'Nến vanilla nguyên chất, mùi ấm áp dễ chịu', 'Pure vanilla candle with warm and cozy aroma', 150000, 20, true, 1, NOW()),
('Nến trang trí Rose', 'Rose Decorative Candle', 'Nến hình hoa hồng, quà tặng hoàn hảo', 'Rose-shaped decorative candle, perfect gift', 180000, 8, true, 1, NOW()),
('Nến cấu trúc', 'Textured Candle', 'Nến có họa tiết, ánh sáng đẹp khi thắp', 'Textured candle with beautiful light patterns', 160000, 12, true, 1, NOW()),

-- Keychains
('Móc khóa gỗ', 'Wooden Keychain', 'Móc khóa làm từ gỗ tự nhiên, bền và đẹp', 'Natural wood keychain, durable and beautiful', 45000, 30, true, 2, NOW()),
('Móc khóa polymer clay', 'Polymer Clay Keychain', 'Móc khóa trang trí handmade từ polymer', 'Handmade decorative polymer clay keychain', 50000, 25, true, 2, NOW()),
('Móc khóa charm', 'Charm Keychain', 'Móc khóa có charm đủ màu sắc', 'Colorful charm keychain', 55000, 18, true, 2, NOW()),

-- Wall Art
('Tranh vẽ Sắc màu', 'Colorful Abstract Painting', 'Tranh vẽ tay, sắc màu rực rỡ', 'Hand-painted abstract artwork', 350000, 5, true, 3, NOW()),
('Tranh Macramé', 'Macramé Wall Hanging', 'Tranh treo trang trí macramé handmade', 'Handmade macramé wall decoration', 280000, 7, true, 3, NOW()),
('Tranh bản đồ', 'Map Artwork', 'Tranh bản đồ thế giới theo phong cách minimalist', 'Minimalist world map artwork', 200000, 10, true, 3, NOW()),

-- Tote Bags
('Túi vải in hình', 'Printed Tote Bag', 'Túi vải cotton với in hình độc đáo', 'Cotton tote bag with unique design', 120000, 40, true, 4, NOW()),
('Túi vải thêu', 'Embroidered Tote Bag', 'Túi vải với đường thêu tinh xảo', 'Tote bag with delicate embroidery', 140000, 22, true, 4, NOW()),

-- Jewelry
('Vòng tay handmade', 'Handmade Bracelet', 'Vòng tay hạt gỗ tự nhiên', 'Natural wood bead bracelet', 85000, 35, true, 5, NOW()),
('Dây chuyền cao cấp', 'Premium Necklace', 'Dây chuyền kim loại, thiết kế đơn giản sang trọng', 'Metal necklace with elegant minimalist design', 250000, 12, true, 5, NOW()),
('Khuyên tai bông', 'Floral Earrings', 'Khuyên tai hình bông hoa', 'Flower-shaped earrings', 65000, 28, true, 5, NOW());

-- Get category IDs for product updates (if needed)
SELECT * FROM categories LIMIT 5;
SELECT COUNT(*) FROM products;
