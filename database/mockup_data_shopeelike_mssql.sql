-- ============================================
-- MOCKUP DATA FOR SHOPEELIKE (MSSQL VERSION)
-- ============================================
USE shopeelike;
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;

-- 1. Shipping services
IF NOT EXISTS (SELECT 1 FROM dbo.shipping_service WHERE carrier = 'DefaultCarrier')
BEGIN
    INSERT INTO dbo.shipping_service (carrier, service_name, est_days_min, est_days_max, base_fee, per_kg_fee)
    VALUES 
      ('DefaultCarrier', 'Standard', 2, 5, 0, 0),
      ('VNPost', 'Express', 1, 3, 25000, 5000),
      ('GiaoHangNhanh', 'Fast', 1, 2, 30000, 7000),
      ('J&T Express', 'Economy', 3, 7, 15000, 3000),
      ('Grab Express', 'Same Day', 0, 1, 50000, 10000);
END;
GO

-- 2. Categories
IF NOT EXISTS (SELECT 1 FROM dbo.category WHERE name = 'Electronics')
BEGIN
    INSERT INTO dbo.category (name, description)
    VALUES 
      ('Electronics', 'Devices and gadgets'),
      ('Fashion', 'Clothing and accessories'),
      ('Home & Living', 'Furniture and decor'),
      ('Books & Stationery', 'Books, notebooks, and office supplies'),
      ('Sports & Outdoors', 'Sports equipment and outdoor gear'),
      ('Beauty & Health', 'Cosmetics and health products'),
      ('Toys & Games', 'Toys, games, and hobbies'),
      ('Food & Beverages', 'Fresh food, snacks, and drinks'),
      ('Automotive', 'Car accessories and parts'),
      ('Pet Supplies', 'Pet food and accessories');
END;
GO

-- 3. Sellers (User Accounts + Seller Profiles)
-- Helper variable to store user_id
DECLARE @uid BIGINT;

-- Seller 1
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'seller1@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('seller1@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Tech Store', 'techstore', '+84901111111', '1990-01-01');
    
    SET @uid = SCOPE_IDENTITY();
    
    INSERT INTO dbo.seller (seller_id, user_id, shop_name, tax_id)
    VALUES (NULL, @uid, 'Tech Store', 'TAX123456');
END;

-- Seller 2
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'seller2@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('seller2@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Fashion Hub', 'fashionhub', '+84902222222', '1988-05-15');
    
    SET @uid = SCOPE_IDENTITY();
    
    INSERT INTO dbo.seller (seller_id, user_id, shop_name, tax_id)
    VALUES (NULL, @uid, 'Fashion Hub', 'TAX234567');
END;

-- Seller 3
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'seller3@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('seller3@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Home Decor Plus', 'homedecor', '+84903333333', '1985-08-20');
    
    SET @uid = SCOPE_IDENTITY();
    
    INSERT INTO dbo.seller (seller_id, user_id, shop_name, tax_id)
    VALUES (NULL, @uid, 'Home Decor Plus', 'TAX345678');
END;

-- Seller 4
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'seller4@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('seller4@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Book World', 'bookworld', '+84904444444', '1992-11-10');
    
    SET @uid = SCOPE_IDENTITY();
    
    INSERT INTO dbo.seller (seller_id, user_id, shop_name, tax_id)
    VALUES (NULL, @uid, 'Book World', 'TAX456789');
END;

-- Seller 5
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'seller5@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('seller5@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Sports Pro', 'sportspro', '+84905555555', '1987-03-25');
    
    SET @uid = SCOPE_IDENTITY();
    
    INSERT INTO dbo.seller (seller_id, user_id, shop_name, tax_id)
    VALUES (NULL, @uid, 'Sports Pro', 'TAX567890');
END;
GO

-- Điền thông tin liên hệ seller từ user (nếu đang NULL)
UPDATE s
SET business_email = COALESCE(s.business_email, ua.email),
    business_phone = COALESCE(s.business_phone, ua.phone_number)
FROM dbo.seller s
JOIN dbo.user_account ua ON ua.user_id = s.user_id;
GO

-- 4. Products (100 items)
IF NOT EXISTS (SELECT 1 FROM dbo.product)
BEGIN
    -- Get Seller IDs
    DECLARE @s1 CHAR(6), @s2 CHAR(6), @s3 CHAR(6), @s4 CHAR(6), @s5 CHAR(6);
    SELECT @s1 = seller_id FROM dbo.seller WHERE shop_name = 'Tech Store';
    SELECT @s2 = seller_id FROM dbo.seller WHERE shop_name = 'Fashion Hub';
    SELECT @s3 = seller_id FROM dbo.seller WHERE shop_name = 'Home Decor Plus';
    SELECT @s4 = seller_id FROM dbo.seller WHERE shop_name = 'Book World';
    SELECT @s5 = seller_id FROM dbo.seller WHERE shop_name = 'Sports Pro';

    INSERT INTO dbo.product (seller_id, title, description, status) VALUES
    -- Electronics
    (@s1, 'iPhone 15 Pro Max', 'Latest Apple flagship smartphone', 'Active'),
    (@s1, 'Samsung Galaxy S24 Ultra', 'Premium Android smartphone', 'Active'),
    (@s1, 'MacBook Pro M3 14"', 'Professional laptop for creators', 'Active'),
    (@s1, 'Dell XPS 15', 'High-performance Windows laptop', 'Active'),
    (@s1, 'iPad Air 11"', 'Versatile tablet for work and play', 'Active'),
    (@s1, 'Sony WH-1000XM5', 'Premium noise-canceling headphones', 'Active'),
    (@s1, 'AirPods Pro 2', 'Wireless earbuds with ANC', 'Active'),
    (@s1, 'Apple Watch Series 9', 'Advanced smartwatch', 'Active'),
    (@s1, 'Samsung Galaxy Watch 6', 'Android smartwatch', 'Active'),
    (@s1, 'Canon EOS R6', 'Full-frame mirrorless camera', 'Active'),
    (@s1, 'Sony A7 IV', 'Professional camera body', 'Active'),
    (@s1, 'GoPro Hero 12', 'Action camera 5K60', 'Active'),
    (@s1, 'DJI Mini 4 Pro', 'Compact foldable drone', 'Active'),
    (@s1, 'PS5 Console', 'Next-gen gaming console', 'Active'),
    (@s1, 'Xbox Series X', 'Microsoft gaming console', 'Active'),
    (@s1, 'Nintendo Switch OLED', 'Hybrid gaming console', 'Active'),
    (@s1, 'LG 55" OLED TV', '4K OLED Smart TV', 'Active'),
    (@s1, 'Samsung 65" QLED TV', 'Quantum dot display', 'Active'),
    (@s1, 'Bose SoundLink', 'Portable Bluetooth speaker', 'Active'),
    (@s1, 'Logitech MX Master 3S', 'Wireless productivity mouse', 'Active'),

    -- Automotive (Tech Store)
    (@s1, N'Camera hành trình Full HD',        N'Camera hành trình ghi lại hành trình lái xe, góc rộng, cảm biến ánh sáng tốt',                          'Active'),
    (@s1, N'Bộ thảm lót sàn ô tô 5D',          N'Bộ thảm lót sàn 5D chống bẩn, chống nước, vừa khít khoang xe',                                           'Active'),
    (@s1, N'Bọc vô lăng da cao cấp',           N'Bọc vô lăng da may chắc chắn, cầm êm tay, chống trơn trượt',                                             'Active'),
    (@s1, N'Sạc nhanh ô tô 2 cổng USB-C',      N'Cục sạc nhanh cho ô tô hỗ trợ sạc nhanh điện thoại, 2 cổng USB-C/USB-A',                                'Active'),
    (@s1, N'Giá đỡ điện thoại trên ô tô',      N'Giá kẹp điện thoại gắn cửa gió điều hòa, xoay 360°',                                                     'Active'),
    (@s1, N'Máy lọc không khí trong xe hơi',   N'Máy lọc không khí mini loại bỏ bụi mịn và mùi khó chịu trong khoang xe',                                'Active'),
    (@s1, N'Nước hoa treo xe hương gỗ',        N'Nước hoa treo xe mùi gỗ thơm dịu, khử mùi trong xe',                                                     'Active'),
    (@s1, N'Bơm lốp ô tô mini 12V',            N'Máy bơm lốp cầm tay cắm tẩu 12V, có đồng hồ đo áp suất',                                                 'Active'),
    (@s1, N'Bạt phủ ô tô chống nắng',          N'Bạt phủ thân xe chống nắng, chống bụi, phù hợp xe 4–7 chỗ',                                              'Active'),
    (@s1, N'Bộ dung dịch vệ sinh nội thất',    N'Combo dung dịch vệ sinh taplo, ghế da và kính lái chuyên dụng',                                         'Active'),
    
    -- Fashion
    (@s2, 'Nike Air Max 270', 'Comfortable running shoes', 'Active'),
    (@s2, 'Adidas Ultraboost 23', 'Performance running shoes', 'Active'),
    (@s2, 'Levi''s 501 Jeans', 'Classic straight fit jeans', 'Active'),
    (@s2, 'Uniqlo Cotton T-Shirt', 'Basic comfort tee', 'Active'),
    (@s2, 'Zara Wool Coat', 'Winter long coat', 'Active'),
    (@s2, 'H&M Dress', 'Summer floral dress', 'Active'),
    (@s2, 'Ralph Lauren Polo', 'Classic polo shirt', 'Active'),
    (@s2, 'Tommy Hilfiger Jacket', 'Denim jacket', 'Active'),
    (@s2, 'Converse Chuck Taylor', 'Classic canvas sneakers', 'Active'),
    (@s2, 'Vans Old Skool', 'Skate shoes', 'Active'),
    (@s2, 'Ray-Ban Aviator', 'Classic sunglasses', 'Active'),
    (@s2, 'Casio G-Shock', 'Digital sports watch', 'Active'),
    (@s2, 'Michael Kors Bag', 'Leather handbag', 'Active'),
    (@s2, 'Gucci Belt', 'Luxury leather belt', 'Active'),
    (@s2, 'Nike Dri-FIT Shirt', 'Athletic performance tee', 'Active'),
    (@s2, 'Adidas Track Pants', 'Comfortable joggers', 'Active'),
    (@s2, 'Puma Hoodie', 'Warm pullover hoodie', 'Active'),
    (@s2, 'The North Face Jacket', 'Outdoor winter jacket', 'Active'),
    (@s2, 'Columbia Fleece', 'Soft fleece jacket', 'Active'),
    (@s2, 'Timberland Boots', 'Waterproof work boots', 'Active'),

    -- Home & Living
    (@s3, 'IKEA Sofa Bed', 'Convertible 3-seater sofa', 'Active'),
    (@s3, 'Dining Table Set', 'Wood table with 6 chairs', 'Active'),
    (@s3, 'Queen Mattress', 'Memory foam mattress', 'Active'),
    (@s3, 'Office Chair', 'Ergonomic mesh chair', 'Active'),
    (@s3, 'Bookshelf', '5-tier wooden bookshelf', 'Active'),
    (@s3, 'Table Lamp', 'Modern LED desk lamp', 'Active'),
    (@s3, 'Floor Lamp', 'Tall standing lamp', 'Active'),
    (@s3, 'Area Rug 5x7', 'Soft living room rug', 'Active'),
    (@s3, 'Curtains Set', 'Blackout window curtains', 'Active'),
    (@s3, 'Wall Mirror', 'Large decorative mirror', 'Active'),
    (@s3, 'Plant Pot Set', 'Ceramic planters pack of 3', 'Active'),
    (@s3, 'Throw Pillows', 'Decorative cushions set', 'Active'),
    (@s3, 'Coffee Table', 'Glass top coffee table', 'Active'),
    (@s3, 'TV Stand', 'Modern media console', 'Active'),
    (@s3, 'Kitchen Cart', 'Rolling kitchen island', 'Active'),
    (@s3, 'Bar Stools Set', 'Counter height stools', 'Active'),
    (@s3, 'Nightstand', 'Bedside table with drawer', 'Active'),
    (@s3, 'Wardrobe', 'Sliding door closet', 'Active'),
    (@s3, 'Shoe Rack', 'Entryway shoe organizer', 'Active'),
    (@s3, 'Coat Rack', 'Standing coat hanger', 'Active'),

    -- Books & Stationery
    (@s4, 'Harry Potter Set', 'Complete 7-book series', 'Active'),
    (@s4, 'Atomic Habits', 'James Clear bestseller', 'Active'),
    (@s4, 'The Alchemist', 'Paulo Coelho classic', 'Active'),
    (@s4, '1984', 'George Orwell dystopian novel', 'Active'),
    (@s4, 'Sapiens', 'Yuval Noah Harari', 'Active'),
    (@s4, 'Educated', 'Tara Westover memoir', 'Active'),
    (@s4, 'The Hobbit', 'J.R.R. Tolkien fantasy', 'Active'),
    (@s4, 'Pride and Prejudice', 'Jane Austen romance', 'Active'),
    (@s4, 'To Kill a Mockingbird', 'Harper Lee classic', 'Active'),
    (@s4, 'Think and Grow Rich', 'Napoleon Hill', 'Active'),
    (@s4, 'Notebook Set', 'Moleskine pack of 3', 'Active'),
    (@s4, 'Fountain Pen', 'Parker premium pen', 'Active'),
    (@s4, 'Pencil Case', 'Oxford pencil pouch', 'Active'),
    (@s4, 'Highlighter Set', 'Stabilo pastel colors', 'Active'),
    (@s4, 'Sticky Notes', 'Post-it assorted pack', 'Active'),
    (@s4, 'Planner 2025', 'Daily productivity planner', 'Active'),
    (@s4, 'Desk Organizer', 'Wooden pen holder', 'Active'),
    (@s4, 'Stapler', 'Heavy duty stapler', 'Active'),
    (@s4, 'Paper Clips', 'Assorted sizes box', 'Active'),
    (@s4, 'Binder Set', '3-ring binders pack', 'Active'),

    -- Sports & Outdoors
    (@s5, 'Yoga Mat', 'Non-slip exercise mat', 'Active'),
    (@s5, 'Dumbbell Set', 'Adjustable weights 20kg', 'Active'),
    (@s5, 'Resistance Bands', 'Exercise bands set of 5', 'Active'),
    (@s5, 'Treadmill', 'Foldable running machine', 'Active'),
    (@s5, 'Exercise Bike', 'Indoor cycling bike', 'Active'),
    (@s5, 'Pull-up Bar', 'Doorway chin-up bar', 'Active'),
    (@s5, 'Jump Rope', 'Speed jump rope', 'Active'),
    (@s5, 'Gym Bag', 'Large sports duffel bag', 'Active'),
    (@s5, 'Water Bottle', '1L insulated bottle', 'Active'),
    (@s5, 'Tennis Racket', 'Wilson pro racket', 'Active'),
    (@s5, 'Basketball', 'Spalding official size', 'Active'),
    (@s5, 'Soccer Ball', 'Adidas match ball', 'Active'),
    (@s5, 'Badminton Set', 'Rackets and shuttlecocks', 'Active'),
    (@s5, 'Golf Clubs', 'Complete set with bag', 'Active'),
    (@s5, 'Camping Tent', '4-person waterproof tent', 'Active'),
    (@s5, 'Sleeping Bag', 'All-season sleeping bag', 'Active'),
    (@s5, 'Hiking Backpack', '50L outdoor backpack', 'Active'),
    (@s5, 'Cycling Helmet', 'Safety bike helmet', 'Active'),
    (@s5, 'Swimming Goggles', 'Anti-fog swim goggles', 'Active'),
    (@s5, 'Fitness Tracker', 'Smart activity band', 'Active'),

    -- Pet Supplies (demo, re-use Sports Pro seller)
    (@s5, N'Thức ăn hạt cho chó lớn',          N'Hạt khô dinh dưỡng cho chó trưởng thành giống lớn',          'Active'),
    (@s5, N'Thức ăn hạt cho mèo trưởng thành', N'Hạt khô cân bằng dinh dưỡng cho mèo nhỏ',                    'Active'),
    (@s5, N'Pate mèo vị cá ngừ',               N'Pate ướt cho mèo vị cá ngừ, giàu omega 3',                   'Active'),
    (@s5, N'Bánh thưởng huấn luyện cho chó',   N'Bánh thưởng mềm dùng để huấn luyện cho chó',                 'Active'),
    (@s5, N'Dây dắt chó bằng da',              N'Dây dắt chó bằng da thật, có tay cầm êm',                    'Active'),
    (@s5, N'Balo phi hành gia cho mèo',        N'Balo trong suốt mang mèo, có lỗ thông khí',                  'Active'),
    (@s5, N'Nhà vệ sinh mèo kín',              N'Nhà vệ sinh có nắp, giảm vương vãi cát',                     'Active'),
    (@s5, N'Cát vệ sinh cho mèo không bụi',    N'Cát vệ sinh vón cục, ít bụi, khử mùi tốt',                   'Active'),
    (@s5, N'Lồng vận chuyển thú cưng',         N'Lồng nhựa cứng, phù hợp chó mèo dưới 10kg',                  'Active'),
    (@s5, N'Đồ chơi chuột vải cho chó mèo',    N'Chuột vải có kèm catnip, kích thích vận động',               'Active');
END;
GO

-- 5. Product Categories
IF NOT EXISTS (SELECT 1 FROM dbo.product_category)
BEGIN
    -- Electronics (1-20)
    INSERT INTO dbo.product_category (product_id, category_id)
    SELECT p.product_id, c.category_id 
    FROM dbo.product p 
    CROSS JOIN dbo.category c 
    WHERE p.title IN (
        'iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra', 'MacBook Pro M3 14"', 'Dell XPS 15', 'iPad Air 11"',
        'Sony WH-1000XM5', 'AirPods Pro 2', 'Apple Watch Series 9', 'Samsung Galaxy Watch 6', 'Canon EOS R6',
        'Sony A7 IV', 'GoPro Hero 12', 'DJI Mini 4 Pro', 'PS5 Console', 'Xbox Series X',
        'Nintendo Switch OLED', 'LG 55" OLED TV', 'Samsung 65" QLED TV', 'Bose SoundLink', 'Logitech MX Master 3S'
    ) AND c.name = 'Electronics';

    -- Fashion (21-40)
    INSERT INTO dbo.product_category (product_id, category_id)
    SELECT p.product_id, c.category_id 
    FROM dbo.product p 
    CROSS JOIN dbo.category c 
    WHERE p.title IN (
        'Nike Air Max 270', 'Adidas Ultraboost 23', 'Levi''s 501 Jeans', 'Uniqlo Cotton T-Shirt', 'Zara Wool Coat',
        'H&M Dress', 'Ralph Lauren Polo', 'Tommy Hilfiger Jacket', 'Converse Chuck Taylor', 'Vans Old Skool',
        'Ray-Ban Aviator', 'Casio G-Shock', 'Michael Kors Bag', 'Gucci Belt', 'Nike Dri-FIT Shirt',
        'Adidas Track Pants', 'Puma Hoodie', 'The North Face Jacket', 'Columbia Fleece', 'Timberland Boots'
    ) AND c.name = 'Fashion';

    -- Home & Living (41-60)
    INSERT INTO dbo.product_category (product_id, category_id)
    SELECT p.product_id, c.category_id 
    FROM dbo.product p 
    CROSS JOIN dbo.category c 
    WHERE p.title IN (
        'IKEA Sofa Bed', 'Dining Table Set', 'Queen Mattress', 'Office Chair', 'Bookshelf',
        'Table Lamp', 'Floor Lamp', 'Area Rug 5x7', 'Curtains Set', 'Wall Mirror',
        'Plant Pot Set', 'Throw Pillows', 'Coffee Table', 'TV Stand', 'Kitchen Cart',
        'Bar Stools Set', 'Nightstand', 'Wardrobe', 'Shoe Rack', 'Coat Rack'
    ) AND c.name = 'Home & Living';

    -- Books & Stationery (61-80)
    INSERT INTO dbo.product_category (product_id, category_id)
    SELECT p.product_id, c.category_id 
    FROM dbo.product p 
    CROSS JOIN dbo.category c 
    WHERE p.title IN (
        'Harry Potter Set', 'Atomic Habits', 'The Alchemist', '1984', 'Sapiens',
        'Educated', 'The Hobbit', 'Pride and Prejudice', 'To Kill a Mockingbird', 'Think and Grow Rich',
        'Notebook Set', 'Fountain Pen', 'Pencil Case', 'Highlighter Set', 'Sticky Notes',
        'Planner 2025', 'Desk Organizer', 'Stapler', 'Paper Clips', 'Binder Set'
    ) AND c.name = 'Books & Stationery';

    -- Sports & Outdoors (81-100)
    INSERT INTO dbo.product_category (product_id, category_id)
    SELECT p.product_id, c.category_id 
    FROM dbo.product p 
    CROSS JOIN dbo.category c 
    WHERE p.title IN (
        'Yoga Mat', 'Dumbbell Set', 'Resistance Bands', 'Treadmill', 'Exercise Bike',
        'Pull-up Bar', 'Jump Rope', 'Gym Bag', 'Water Bottle', 'Tennis Racket',
        'Basketball', 'Soccer Ball', 'Badminton Set', 'Golf Clubs', 'Camping Tent',
        'Sleeping Bag', 'Hiking Backpack', 'Cycling Helmet', 'Swimming Goggles', 'Fitness Tracker'
    ) AND c.name = 'Sports & Outdoors';

    -- Automotive (demo products)
    INSERT INTO dbo.product_category (product_id, category_id)
    SELECT p.product_id, c.category_id
    FROM dbo.product p
    CROSS JOIN dbo.category c
    WHERE p.title IN (
        N'Camera hành trình Full HD',
        N'Bộ thảm lót sàn ô tô 5D',
        N'Bọc vô lăng da cao cấp',
        N'Sạc nhanh ô tô 2 cổng USB-C',
        N'Giá đỡ điện thoại trên ô tô',
        N'Máy lọc không khí trong xe hơi',
        N'Nước hoa treo xe hương gỗ',
        N'Bơm lốp ô tô mini 12V',
        N'Bạt phủ ô tô chống nắng',
        N'Bộ dung dịch vệ sinh nội thất'
    ) AND c.name = 'Automotive';

    -- Pet Supplies (demo products)
    INSERT INTO dbo.product_category (product_id, category_id)
    SELECT p.product_id, c.category_id
    FROM dbo.product p
    CROSS JOIN dbo.category c
    WHERE p.title IN (
        N'Thức ăn hạt cho chó lớn',
        N'Thức ăn hạt cho mèo trưởng thành',
        N'Pate mèo vị cá ngừ',
        N'Bánh thưởng huấn luyện cho chó',
        N'Dây dắt chó bằng da',
        N'Balo phi hành gia cho mèo',
        N'Nhà vệ sinh mèo kín',
        N'Cát vệ sinh cho mèo không bụi',
        N'Lồng vận chuyển thú cưng',
        N'Đồ chơi chuột vải cho chó mèo'
    ) AND c.name = 'Pet Supplies';
END;
GO

-- 6. Product Variants
-- First, create DEFAULT variants for all products
IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE variant_code = 'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    SELECT 
        p.product_id,
        'DEFAULT' AS variant_code,
        CONCAT('SKU', RIGHT('0000' + CAST(p.product_id AS VARCHAR(10)), 4), 'D') AS sku,
        CASE 
            -- Electronics (higher prices)
            WHEN p.title LIKE '%iPhone%' OR p.title LIKE '%MacBook%' OR p.title LIKE '%iPad%' THEN 25000000
            WHEN p.title LIKE '%Samsung Galaxy S%' OR p.title LIKE '%Sony A7%' THEN 22000000
            WHEN p.title LIKE '%Dell XPS%' OR p.title LIKE '%Canon EOS%' THEN 18000000
            WHEN p.title LIKE '%PS5%' OR p.title LIKE '%Xbox%' THEN 12000000
            WHEN p.title LIKE '%Watch%' OR p.title LIKE '%AirPods%' THEN 6000000
            WHEN p.title LIKE '%Headphone%' OR p.title LIKE '%Speaker%' THEN 4000000
            WHEN p.title LIKE '%GoPro%' OR p.title LIKE '%DJI%' THEN 8000000
            WHEN p.title LIKE '%TV%' THEN 15000000
            WHEN p.title LIKE '%Camera%' OR p.title LIKE N'%Camera%' THEN 2500000
            
            -- Fashion (medium prices)
            WHEN p.title LIKE '%Nike%' OR p.title LIKE '%Adidas%' THEN 2500000
            WHEN p.title LIKE '%Coat%' OR p.title LIKE '%Jacket%' THEN 1800000
            WHEN p.title LIKE '%Jeans%' OR p.title LIKE '%Dress%' THEN 800000
            WHEN p.title LIKE '%Shoes%' OR p.title LIKE '%Sneaker%' OR p.title LIKE '%Boots%' THEN 1200000
            WHEN p.title LIKE '%T-Shirt%' OR p.title LIKE '%Polo%' THEN 450000
            WHEN p.title LIKE '%Bag%' OR p.title LIKE '%Backpack%' THEN 900000
            WHEN p.title LIKE '%Watch%' THEN 3000000
            
            -- Home & Living
            WHEN p.title LIKE '%Sofa%' OR p.title LIKE '%Mattress%' THEN 8000000
            WHEN p.title LIKE '%Table%' OR p.title LIKE '%Desk%' THEN 3500000
            WHEN p.title LIKE '%Chair%' THEN 2000000
            WHEN p.title LIKE '%Lamp%' THEN 350000
            WHEN p.title LIKE '%Rug%' OR p.title LIKE '%Curtain%' THEN 600000
            
            -- Books & Stationery
            WHEN p.title LIKE '%Harry Potter%' THEN 1500000
            WHEN p.title LIKE '%Book%' THEN 250000
            WHEN p.title LIKE '%Notebook%' OR p.title LIKE '%Pen%' THEN 120000
            WHEN p.title LIKE '%Planner%' THEN 180000
            
            -- Sports & Outdoors
            WHEN p.title LIKE '%Treadmill%' OR p.title LIKE '%Bike%' THEN 8000000
            WHEN p.title LIKE '%Dumbbell%' OR p.title LIKE '%Yoga%' THEN 500000
            WHEN p.title LIKE '%Tent%' OR p.title LIKE '%Golf%' THEN 4000000
            WHEN p.title LIKE '%Ball%' OR p.title LIKE '%Racket%' THEN 350000
            
            -- Automotive
            WHEN p.title LIKE N'%Bơm lốp%' OR p.title LIKE N'%Máy lọc%' THEN 650000
            WHEN p.title LIKE N'%Bạt phủ%' OR p.title LIKE N'%Thảm lót%' THEN 450000
            WHEN p.title LIKE N'%Bọc vô lăng%' OR p.title LIKE N'%Giá đỡ%' THEN 250000
            WHEN p.title LIKE N'%Nước hoa%' OR p.title LIKE N'%Sạc%' THEN 180000
            
            -- Pet Supplies
            WHEN p.title LIKE N'%Thức ăn%' OR p.title LIKE N'%Pate%' THEN 180000
            WHEN p.title LIKE N'%Nhà vệ sinh%' OR p.title LIKE N'%Lồng%' THEN 450000
            WHEN p.title LIKE N'%Cát vệ sinh%' OR p.title LIKE N'%Dây dắt%' THEN 120000
            
            ELSE 500000
        END AS list_price,
        CASE 
            WHEN p.title LIKE '%iPhone%' OR p.title LIKE '%Samsung Galaxy S%' THEN 50
            WHEN p.title LIKE '%MacBook%' OR p.title LIKE '%Dell%' THEN 30
            WHEN p.title LIKE '%PS5%' OR p.title LIKE '%Xbox%' THEN 20
            ELSE 100
        END AS stock_qty,
        1 AS is_active
    FROM dbo.product p
    WHERE NOT EXISTS (
        SELECT 1 
        FROM dbo.product_variant pv 
        WHERE pv.product_id = p.product_id 
        AND pv.variant_code = 'DEFAULT'
    );
END;
GO

-- Create additional color variants for popular electronics
INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
SELECT 
    p.product_id,
    v.variant_code,
    v.sku,
    v.list_price,
    v.stock_qty,
    1
FROM dbo.product p
CROSS APPLY (
    SELECT TOP 1 
        dv.list_price,
        dv.stock_qty
    FROM dbo.product_variant dv
    WHERE dv.product_id = p.product_id
    ORDER BY dv.variant_code
) dv
CROSS APPLY (
    SELECT 
        'RED' AS variant_code,
        CONCAT('SKU', RIGHT('0000' + CAST(p.product_id AS VARCHAR(10)), 4), 'R') AS sku,
        dv.list_price * 1.02 AS list_price,
        dv.stock_qty + 5       AS stock_qty
    UNION ALL
    SELECT 
        'BLUE' AS variant_code,
        CONCAT('SKU', RIGHT('0000' + CAST(p.product_id AS VARCHAR(10)), 4), 'B'),
        dv.list_price * 0.98 AS list_price,
        dv.stock_qty + 3      AS stock_qty
) v
WHERE p.title IN (N'iPhone 15 Pro Max', N'Samsung Galaxy S24 Ultra', N'MacBook Pro M3 14"', N'Sony WH-1000XM5')
  AND NOT EXISTS (
      SELECT 1
      FROM dbo.product_variant pv
      WHERE pv.product_id = p.product_id
        AND pv.variant_code = v.variant_code
  );
GO


IF NOT EXISTS (SELECT 1 FROM dbo.product_image)
BEGIN
    -- Insert images using pattern-based mapping; use open placeholder images
    DECLARE @imgMapping TABLE(pattern NVARCHAR(200), url NVARCHAR(255), priority INT);
    INSERT INTO @imgMapping (pattern, url, priority)
    VALUES
      (N'%iPhone%',                       'https://placehold.co/600x400?text=iPhone', 1),
      (N'%Galaxy%',                       'https://placehold.co/600x400?text=Galaxy', 1),
      (N'%Phone%',                        'https://placehold.co/600x400?text=Phone', 2),
      (N'%MacBook%',                      'https://placehold.co/600x400?text=MacBook', 1),
      (N'%Laptop%',                       'https://placehold.co/600x400?text=Laptop', 2),
      (N'%iPad%',                         'https://placehold.co/600x400?text=iPad', 1),
      (N'%Tablet%',                       'https://placehold.co/600x400?text=Tablet', 2),
      (N'%Headphone%',                    'https://placehold.co/600x400?text=Headphones', 1),
      (N'%Earbuds%',                      'https://placehold.co/600x400?text=Earbuds', 2),
      (N'%AirPods%',                      'https://placehold.co/600x400?text=AirPods', 2),
      (N'%Watch%',                        'https://placehold.co/600x400?text=Watch', 2),
      (N'%Camera%',                       'https://placehold.co/600x400?text=Camera', 1),
      (N'%Canon%',                        'https://placehold.co/600x400?text=Camera', 1),
      (N'%Sony A%',                       'https://placehold.co/600x400?text=Camera', 1),
      (N'%GoPro%',                        'https://placehold.co/600x400?text=Action+Cam', 1),
      (N'%DJI%',                          'https://placehold.co/600x400?text=Drone', 1),
      (N'%PS5%',                          'https://placehold.co/600x400?text=Console', 1),
      (N'%Xbox%',                         'https://placehold.co/600x400?text=Console', 1),
      (N'%Nintendo%',                     'https://placehold.co/600x400?text=Console', 1),
      (N'%TV%',                           'https://placehold.co/600x400?text=TV', 1),
      (N'%Speaker%',                      'https://placehold.co/600x400?text=Speaker', 2),
      (N'%Mouse%',                        'https://placehold.co/600x400?text=Mouse', 2),
      (N'%Backpack%',                     'https://placehold.co/600x400?text=Backpack', 1),
      (N'%Bag%',                          'https://placehold.co/600x400?text=Bag', 2),
      (N'%T-Shirt%',                      'https://placehold.co/600x400?text=T-Shirt', 1),
      (N'%Jacket%',                       'https://placehold.co/600x400?text=Jacket', 1),
      (N'%Coat%',                         'https://placehold.co/600x400?text=Coat', 1),
      (N'%Short%',                        'https://placehold.co/600x400?text=Shorts', 1),
      (N'%Shoes%',                        'https://placehold.co/600x400?text=Shoes', 1),
      (N'%Sneaker%',                      'https://placehold.co/600x400?text=Sneakers', 1),
      (N'%Desk%',                         'https://placehold.co/600x400?text=Desk', 1),
      (N'%Chair%',                        'https://placehold.co/600x400?text=Chair', 1),
      (N'%Lamp%',                         'https://placehold.co/600x400?text=Lamp', 1),
      (N'%Mug%',                          'https://placehold.co/600x400?text=Mug', 1),
      (N'%Book%',                         'https://placehold.co/600x400?text=Book', 1),
      (N'%Notebook%',                     'https://placehold.co/600x400?text=Notebook', 2),
      (N'%Pen%',                          'https://placehold.co/600x400?text=Pen', 2),
      (N'%Yoga%',                         'https://placehold.co/600x400?text=Yoga', 1),
      (N'%Dumbbell%',                     'https://placehold.co/600x400?text=Dumbbell', 1),
      (N'%Resistance%',                   'https://placehold.co/600x400?text=Bands', 1),
      (N'%Treadmill%',                    'https://placehold.co/600x400?text=Treadmill', 1),
      (N'%Bike%',                         'https://placehold.co/600x400?text=Bike', 1),
      (N'%Helmet%',                       'https://placehold.co/600x400?text=Helmet', 1),
      (N'%Tent%',                         'https://placehold.co/600x400?text=Tent', 1),
      (N'%Sleeping Bag%',                 'https://placehold.co/600x400?text=Sleeping+Bag', 1),
      (N'%Bottle%',                       'https://placehold.co/600x400?text=Bottle', 1),
      (N'%Basketball%',                   'https://placehold.co/600x400?text=Basketball', 1),
      (N'%Soccer%',                       'https://placehold.co/600x400?text=Soccer', 1),
      (N'%Badminton%',                    'https://placehold.co/600x400?text=Badminton', 1),
      (N'%Golf%',                         'https://placehold.co/600x400?text=Golf', 1),
      (N'%Camping%',                      'https://placehold.co/600x400?text=Camping', 1);

    INSERT INTO dbo.product_image (product_id, url, caption)
    SELECT 
        p.product_id,
        COALESCE(m.url, 'https://placehold.co/600x400?text=Product') AS url,
        p.title
    FROM dbo.product p
    OUTER APPLY (
        SELECT TOP 1 url
        FROM @imgMapping im
        WHERE p.title LIKE im.pattern
        ORDER BY im.priority
    ) m;
END;
GO

-- 7. Buyers
DECLARE @uid_buyer BIGINT;

-- Buyer 1
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'buyer1@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('buyer1@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Minh Nguyen', 'buyer1', '+84911111111', '1992-02-02');
    SET @uid_buyer = SCOPE_IDENTITY();
    INSERT INTO dbo.buyer (user_id, loyalty_level) VALUES (@uid_buyer, 'Silver');
END;

-- Buyer 2
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'buyer2@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('buyer2@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Lan Tran', 'buyer2', '+84922222222', '1995-03-03');
    SET @uid_buyer = SCOPE_IDENTITY();
    INSERT INTO dbo.buyer (user_id, loyalty_level) VALUES (@uid_buyer, 'Bronze');
END;

-- Buyer 3
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'buyer3@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('buyer3@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Quang Le', 'buyer3', '+84933333333', '1990-07-15');
    SET @uid_buyer = SCOPE_IDENTITY();
    INSERT INTO dbo.buyer (user_id, loyalty_level) VALUES (@uid_buyer, 'Gold');
END;

-- Buyer 4
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'buyer4@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('buyer4@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Hoa Pham', 'buyer4', '+84944444444', '1993-12-05');
    SET @uid_buyer = SCOPE_IDENTITY();
    INSERT INTO dbo.buyer (user_id, loyalty_level) VALUES (@uid_buyer, 'Platinum');
END;
GO

-- 8. Addresses
-- Seller Address
DECLARE @seller_id CHAR(6);
SELECT TOP 1 @seller_id = seller_id FROM dbo.seller WHERE shop_name = 'Tech Store';

IF NOT EXISTS (SELECT 1 FROM dbo.address WHERE seller_id = @seller_id)
BEGIN
    INSERT INTO dbo.address (seller_id, recipient_name, phone, line1, city, country, is_default)
    VALUES (@seller_id, 'Tech Store Warehouse', '+84901111111', '456 Vo Van Tan', 'Ho Chi Minh City', 'VN', 1);
END;

-- Buyer Addresses
DECLARE @b1 BIGINT, @b2 BIGINT, @b3 BIGINT;
SELECT @b1 = user_id FROM dbo.user_account WHERE email = 'buyer1@demo.com';
SELECT @b2 = user_id FROM dbo.user_account WHERE email = 'buyer2@demo.com';
SELECT @b3 = user_id FROM dbo.user_account WHERE email = 'buyer3@demo.com';

IF NOT EXISTS (SELECT 1 FROM dbo.address WHERE buyer_id = @b1)
    INSERT INTO dbo.address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
    VALUES (@b1, 'Minh Nguyen', '+84911111111', '123 Le Loi', 'Ho Chi Minh City', 'VN', '700000', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.address WHERE buyer_id = @b2)
    INSERT INTO dbo.address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
    VALUES (@b2, 'Lan Tran', '+84922222222', '89 Nguyen Hue', 'Ho Chi Minh City', 'VN', '700100', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.address WHERE buyer_id = @b3)
    INSERT INTO dbo.address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
    VALUES (@b3, 'Quang Le', '+84933333333', '45 Tran Hung Dao', 'Ha Noi', 'VN', '100000', 1);
GO

-- 9. Orders & Order Items
DECLARE @b1_o BIGINT, @b2_o BIGINT, @b3_o BIGINT;
SELECT @b1_o = user_id FROM dbo.user_account WHERE email = 'buyer1@demo.com';
SELECT @b2_o = user_id FROM dbo.user_account WHERE email = 'buyer2@demo.com';
SELECT @b3_o = user_id FROM dbo.user_account WHERE email = 'buyer3@demo.com';

DECLARE @addr1 BIGINT, @addr2 BIGINT, @addr3 BIGINT, @addr_seller BIGINT;
SELECT TOP 1 @addr1 = address_id FROM dbo.address WHERE buyer_id = @b1_o;
SELECT TOP 1 @addr2 = address_id FROM dbo.address WHERE buyer_id = @b2_o;
SELECT TOP 1 @addr3 = address_id FROM dbo.address WHERE buyer_id = @b3_o;
SELECT TOP 1 @addr_seller = address_id FROM dbo.address WHERE seller_id IS NOT NULL;

DECLARE @svc SMALLINT, @carrier NVARCHAR(50), @svc_name NVARCHAR(80);
SELECT TOP 1 @svc = service_id, @carrier = carrier, @svc_name = service_name 
FROM dbo.shipping_service WHERE carrier = 'GiaoHangNhanh';

DECLARE @p1_o BIGINT, @p2_o BIGINT, @p3_o BIGINT, @p4_o BIGINT, @p5_o BIGINT;
SELECT @p1_o = product_id FROM dbo.product WHERE title = 'iPhone 15 Pro Max';
SELECT @p2_o = product_id FROM dbo.product WHERE title = 'MacBook Pro M3 14"';
SELECT @p3_o = product_id FROM dbo.product WHERE title = 'Sony WH-1000XM5';
SELECT @p4_o = product_id FROM dbo.product WHERE title = 'Zara Wool Coat';
SELECT @p5_o = product_id FROM dbo.product WHERE title = 'Harry Potter Set';

-- Fallback to any products if specific ones not found
IF @p1_o IS NULL SELECT TOP 1 @p1_o = product_id FROM dbo.product ORDER BY product_id;
IF @p2_o IS NULL SELECT TOP 1 @p2_o = product_id FROM dbo.product WHERE product_id != @p1_o ORDER BY product_id;
IF @p3_o IS NULL SELECT TOP 1 @p3_o = product_id FROM dbo.product WHERE product_id NOT IN (@p1_o, @p2_o) ORDER BY product_id;
IF @p4_o IS NULL SELECT TOP 1 @p4_o = product_id FROM dbo.product WHERE product_id NOT IN (@p1_o, @p2_o, @p3_o) ORDER BY product_id;
IF @p5_o IS NULL SELECT TOP 1 @p5_o = product_id FROM dbo.product WHERE product_id NOT IN (@p1_o, @p2_o, @p3_o, @p4_o) ORDER BY product_id;

DECLARE @price1 DECIMAL(18,2), @price2 DECIMAL(18,2), @price3 DECIMAL(18,2), @price4 DECIMAL(18,2), @price5 DECIMAL(18,2);
DECLARE @var1 NVARCHAR(50), @var2 NVARCHAR(50), @var3 NVARCHAR(50), @var4 NVARCHAR(50), @var5 NVARCHAR(50);

-- Get prices and variant codes (prefer DEFAULT variant if exists, otherwise first available)
SELECT TOP 1 @price1 = list_price, @var1 = variant_code 
FROM dbo.product_variant 
WHERE product_id = @p1_o 
ORDER BY CASE WHEN variant_code = 'DEFAULT' THEN 0 ELSE 1 END, variant_code;

SELECT TOP 1 @price2 = list_price, @var2 = variant_code 
FROM dbo.product_variant 
WHERE product_id = @p2_o 
ORDER BY CASE WHEN variant_code = 'DEFAULT' THEN 0 ELSE 1 END, variant_code;

SELECT TOP 1 @price3 = list_price, @var3 = variant_code 
FROM dbo.product_variant 
WHERE product_id = @p3_o 
ORDER BY CASE WHEN variant_code = 'DEFAULT' THEN 0 ELSE 1 END, variant_code;

SELECT TOP 1 @price4 = list_price, @var4 = variant_code 
FROM dbo.product_variant 
WHERE product_id = @p4_o 
ORDER BY CASE WHEN variant_code = 'DEFAULT' THEN 0 ELSE 1 END, variant_code;

SELECT TOP 1 @price5 = list_price, @var5 = variant_code 
FROM dbo.product_variant 
WHERE product_id = @p5_o 
ORDER BY CASE WHEN variant_code = 'DEFAULT' THEN 0 ELSE 1 END, variant_code;

-- Set defaults if NULL
SET @price1 = ISNULL(@price1, 100000);
SET @price2 = ISNULL(@price2, 200000);
SET @price3 = ISNULL(@price3, 150000);
SET @price4 = ISNULL(@price4, 180000);
SET @price5 = ISNULL(@price5, 120000);
SET @var1 = ISNULL(@var1, 'DEFAULT');
SET @var2 = ISNULL(@var2, 'DEFAULT');
SET @var3 = ISNULL(@var3, 'DEFAULT');
SET @var4 = ISNULL(@var4, 'DEFAULT');
SET @var5 = ISNULL(@var5, 'DEFAULT');

DECLARE @s1_o CHAR(6); SELECT @s1_o = seller_id FROM dbo.seller WHERE shop_name = 'Tech Store';

IF NOT EXISTS (SELECT 1 FROM dbo.orders WHERE buyer_id = @b1_o AND status = 'Completed')
   AND @p1_o IS NOT NULL AND @var1 IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @p1_o AND variant_code = @var1)
BEGIN
    DECLARE @subtotal1 DECIMAL(18,2) = @price1 * 1;
    DECLARE @total1    DECIMAL(18,2) = @subtotal1 + 30000;
    INSERT INTO dbo.orders (buyer_id, seller_id, ship_to_address_id, ship_from_address_id, service_id, carrier_name, service_name, shipping_fee, shipped_date, delivered_date, status, total_amount)
    VALUES (@b1_o, @s1_o, @addr1, @addr_seller, @svc, @carrier, @svc_name, 30000, DATEADD(DAY,-2,SYSDATETIME()), DATEADD(DAY,-1,SYSDATETIME()), 'Completed', @total1);
    
    DECLARE @oid1 BIGINT = SCOPE_IDENTITY();
    INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
    VALUES (@oid1, 1, @p1_o, @var1, 1, @price1);
END;

-- Order 2
IF NOT EXISTS (SELECT 1 FROM dbo.orders WHERE buyer_id = @b2_o AND status = 'Paid')
   AND @p2_o IS NOT NULL AND @var2 IS NOT NULL AND @p3_o IS NOT NULL AND @var3 IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @p2_o AND variant_code = @var2)
   AND EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @p3_o AND variant_code = @var3)
BEGIN
    DECLARE @subtotal2 DECIMAL(18,2) = (@price2 * 1) + (@price3 * 2);
    DECLARE @total2    DECIMAL(18,2) = @subtotal2 + 50000;
    INSERT INTO dbo.orders (buyer_id, seller_id, ship_to_address_id, ship_from_address_id, service_id, carrier_name, service_name, shipping_fee, status, total_amount)
    VALUES (@b2_o, @s1_o, @addr2, @addr_seller, @svc, @carrier, @svc_name, 50000, 'Paid', @total2);
    
    DECLARE @oid2 BIGINT = SCOPE_IDENTITY();
    INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
    VALUES (@oid2, 1, @p2_o, @var2, 1, @price2),
           (@oid2, 2, @p3_o, @var3, 2, @price3);
END;

-- Order 3
IF NOT EXISTS (SELECT 1 FROM dbo.orders WHERE buyer_id = @b3_o AND status = 'Shipped')
   AND @p4_o IS NOT NULL AND @var4 IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @p4_o AND variant_code = @var4)
BEGIN
    DECLARE @subtotal3 DECIMAL(18,2) = @price4 * 2;
    DECLARE @total3    DECIMAL(18,2) = @subtotal3 + 25000;
    INSERT INTO dbo.orders (buyer_id, seller_id, ship_to_address_id, ship_from_address_id, service_id, carrier_name, service_name, shipping_fee, shipped_date, status, total_amount)
    VALUES (@b3_o, @s1_o, @addr3, @addr_seller, @svc, @carrier, @svc_name, 25000, DATEADD(DAY,-1,SYSDATETIME()), 'Shipped', @total3);
    
    DECLARE @oid3 BIGINT = SCOPE_IDENTITY();
    INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
    VALUES (@oid3, 1, @p4_o, @var4, 2, @price4);
END;

-- Order 4
IF NOT EXISTS (SELECT 1 FROM dbo.orders WHERE buyer_id = @b1_o AND status = 'Pending')
   AND @p5_o IS NOT NULL AND @var5 IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @p5_o AND variant_code = @var5)
BEGIN
    DECLARE @subtotal4 DECIMAL(18,2) = @price5 * 1;
    DECLARE @total4    DECIMAL(18,2) = @subtotal4; 
    INSERT INTO dbo.orders (buyer_id, seller_id, ship_to_address_id, ship_from_address_id, service_id, carrier_name, service_name, shipping_fee, status, total_amount)
    VALUES (@b1_o, @s1_o, @addr1, @addr_seller, @svc, @carrier, @svc_name, 0, 'Pending', @total4);
    
    DECLARE @oid4 BIGINT = SCOPE_IDENTITY();
    INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
    VALUES (@oid4, 1, @p5_o, @var5, 1, @price5);
END;
GO

-- 10. Admins
DECLARE @uid_admin BIGINT;

IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'admin1@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('admin1@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'System Admin', 'sysadmin', '+84900000001', '1985-01-15');
    SET @uid_admin = SCOPE_IDENTITY();
    INSERT INTO dbo.admin (user_id, role) VALUES (@uid_admin, 'SystemAdmin');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'admin2@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('admin2@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Content Mod', 'contentmod', '+84900000002', '1988-03-20');
    SET @uid_admin = SCOPE_IDENTITY();
    INSERT INTO dbo.admin (user_id, role) VALUES (@uid_admin, 'ContentModerator');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'admin3@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('admin3@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Support Agent', 'supportagent', '+84900000003', '1990-06-10');
    SET @uid_admin = SCOPE_IDENTITY();
    INSERT INTO dbo.admin (user_id, role) VALUES (@uid_admin, 'SupportAgent');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'admin4@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES ('admin4@demo.com', '$2a$12$O4EIA89ij6op7PTKPbheK.YfQyUuqo7.ay0FN4lt2JUCfX6WsLWLC', 'Finance Officer', 'financeofficer', '+84900000004', '1987-09-25');
    SET @uid_admin = SCOPE_IDENTITY();
    INSERT INTO dbo.admin (user_id, role) VALUES (@uid_admin, 'FinanceOfficer');
END;
GO

-- 11. Reviews
-- Need to link to existing orders. We created 4 orders above.
-- Order 1 (Buyer 1, Product 1)
-- Order 2 (Buyer 2, Product 2, 3)
-- Order 3 (Buyer 3, Product 4)
DECLARE @oid1_r BIGINT, @oid2_r BIGINT, @oid3_r BIGINT;
DECLARE @b1_r BIGINT, @b2_r BIGINT, @b3_r BIGINT;

SELECT @b1_r = user_id FROM dbo.user_account WHERE email = 'buyer1@demo.com';
SELECT @b2_r = user_id FROM dbo.user_account WHERE email = 'buyer2@demo.com';
SELECT @b3_r = user_id FROM dbo.user_account WHERE email = 'buyer3@demo.com';

SELECT TOP 1 @oid1_r = order_id FROM dbo.orders WHERE buyer_id = @b1_r AND status = 'Completed';
SELECT TOP 1 @oid2_r = order_id FROM dbo.orders WHERE buyer_id = @b2_r AND status = 'Paid';
SELECT TOP 1 @oid3_r = order_id FROM dbo.orders WHERE buyer_id = @b3_r AND status = 'Shipped';

IF @oid1_r IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.review WHERE order_id = @oid1_r)
    INSERT INTO dbo.review (order_id, line_no, buyer_id, rating, content, created_at)
    VALUES (@oid1_r, 1, @b1_r, 5, 'Amazing phone! Love the camera.', DATEADD(DAY, -10, SYSDATETIME()));

IF @oid2_r IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.review WHERE order_id = @oid2_r AND line_no = 1)
    INSERT INTO dbo.review (order_id, line_no, buyer_id, rating, content, created_at)
    VALUES (@oid2_r, 1, @b2_r, 4, 'Great laptop but expensive.', DATEADD(DAY, -8, SYSDATETIME()));

IF @oid2_r IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.review WHERE order_id = @oid2_r AND line_no = 2)
    INSERT INTO dbo.review (order_id, line_no, buyer_id, rating, content, created_at)
    VALUES (@oid2_r, 2, @b2_r, 5, 'Best headphones I ever had!', DATEADD(DAY, -7, SYSDATETIME()));

IF @oid3_r IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.review WHERE order_id = @oid3_r)
    INSERT INTO dbo.review (order_id, line_no, buyer_id, rating, content, created_at)
    VALUES (@oid3_r, 1, @b3_r, 5, 'Very warm coat, perfect fit.', DATEADD(DAY, -5, SYSDATETIME()));
GO

-- 12. Return requests (demo >=4 bản ghi)
DECLARE @seller_user BIGINT;
SELECT TOP 1 @seller_user = s.user_id FROM dbo.seller s ORDER BY s.seller_id;

DECLARE @tbl_rr TABLE(
    order_id BIGINT,
    line_no INT,
    buyer_id BIGINT,
    reason NVARCHAR(500),
    description NVARCHAR(MAX),
    status NVARCHAR(50),
    refund_amount DECIMAL(10,2) NULL,
    request_date DATETIME2(0),
    response_date DATETIME2(0) NULL,
    refunded_at DATETIME2(0) NULL
);

-- Completed order -> Completed return
DECLARE @oid_c BIGINT = (SELECT TOP 1 order_id FROM dbo.orders WHERE status = N'Completed' ORDER BY order_id);
DECLARE @buyer_c BIGINT = (SELECT TOP 1 buyer_id FROM dbo.orders WHERE order_id = @oid_c);
DECLARE @line_c INT = (SELECT TOP 1 line_no FROM dbo.order_item WHERE order_id = @oid_c);

-- Paid order -> Pending
DECLARE @oid_p BIGINT = (SELECT TOP 1 order_id FROM dbo.orders WHERE status = N'Paid' ORDER BY order_id);
DECLARE @buyer_p BIGINT = (SELECT TOP 1 buyer_id FROM dbo.orders WHERE order_id = @oid_p);
DECLARE @line_p INT = (SELECT TOP 1 line_no FROM dbo.order_item WHERE order_id = @oid_p);

-- Shipped order -> Approved
DECLARE @oid_s BIGINT = (SELECT TOP 1 order_id FROM dbo.orders WHERE status = N'Shipped' ORDER BY order_id);
DECLARE @buyer_s BIGINT = (SELECT TOP 1 buyer_id FROM dbo.orders WHERE order_id = @oid_s);
DECLARE @line_s INT = (SELECT TOP 1 line_no FROM dbo.order_item WHERE order_id = @oid_s);

-- Pending order -> Rejected (demo)
DECLARE @oid_r BIGINT = (SELECT TOP 1 order_id FROM dbo.orders WHERE status = N'Pending' ORDER BY order_id);
DECLARE @buyer_r BIGINT = (SELECT TOP 1 buyer_id FROM dbo.orders WHERE order_id = @oid_r);
DECLARE @line_r INT = (SELECT TOP 1 line_no FROM dbo.order_item WHERE order_id = @oid_r);

INSERT INTO @tbl_rr
SELECT @oid_p, @line_p, @buyer_p, N'Sản phẩm không đúng size/màu', N'Muốn đổi sang màu khác', N'Pending', NULL, DATEADD(DAY,-2,SYSDATETIME()), NULL, NULL WHERE @oid_p IS NOT NULL
UNION ALL
SELECT @oid_s, @line_s, @buyer_s, N'Hàng lỗi kỹ thuật', N'Bật không lên', N'Approved', NULL, DATEADD(DAY,-4,SYSDATETIME()), DATEADD(DAY,-3,SYSDATETIME()), NULL WHERE @oid_s IS NOT NULL
UNION ALL
SELECT @oid_c, @line_c, @buyer_c, N'Không ưng màu', N'Yêu cầu trả hàng, đã gửi lại', N'Completed', 500000, DATEADD(DAY,-6,SYSDATETIME()), DATEADD(DAY,-5,SYSDATETIME()), DATEADD(DAY,-4,SYSDATETIME()) WHERE @oid_c IS NOT NULL
UNION ALL
SELECT @oid_r, @line_r, @buyer_r, N'Đổi ý mua', N'Không cần nữa', N'Rejected', NULL, DATEADD(DAY,-1,SYSDATETIME()), DATEADD(DAY,-1,SYSDATETIME()), NULL WHERE @oid_r IS NOT NULL;

INSERT INTO dbo.return_request (order_id, line_no, buyer_id, seller_id, reason, description, status, refund_amount, request_date, response_date, refunded_at)
SELECT rr.order_id, rr.line_no, rr.buyer_id, @seller_user, rr.reason, rr.description, rr.status, rr.refund_amount, rr.request_date, rr.response_date, rr.refunded_at
FROM @tbl_rr rr
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.return_request r WHERE r.order_id = rr.order_id AND r.line_no = rr.line_no
);
GO


-- 12. Carts
DECLARE @b1_c BIGINT, @b2_c BIGINT, @b3_c BIGINT;
SELECT @b1_c = user_id FROM dbo.user_account WHERE email = 'buyer1@demo.com';
SELECT @b2_c = user_id FROM dbo.user_account WHERE email = 'buyer2@demo.com';
SELECT @b3_c = user_id FROM dbo.user_account WHERE email = 'buyer3@demo.com';

IF NOT EXISTS (SELECT 1 FROM dbo.cart WHERE buyer_id = @b1_c)
    INSERT INTO dbo.cart (buyer_id, status, created_at) VALUES (@b1_c, 'Active', DATEADD(DAY, -2, SYSDATETIME()));

IF NOT EXISTS (SELECT 1 FROM dbo.cart WHERE buyer_id = @b2_c)
    INSERT INTO dbo.cart (buyer_id, status, created_at) VALUES (@b2_c, 'Active', DATEADD(DAY, -1, SYSDATETIME()));

IF NOT EXISTS (SELECT 1 FROM dbo.cart WHERE buyer_id = @b3_c)
    INSERT INTO dbo.cart (buyer_id, status, created_at) VALUES (@b3_c, 'Active', SYSDATETIME());

-- Ensure all buyers have a cart (including buyer4 if any)
INSERT INTO dbo.cart (buyer_id, status)
SELECT b.user_id, N'Active'
FROM dbo.buyer b
WHERE NOT EXISTS (SELECT 1 FROM dbo.cart c WHERE c.buyer_id = b.user_id);

-- Cart Items
DECLARE @c1 BIGINT, @c2 BIGINT, @c3 BIGINT;
SELECT @c1 = cart_id FROM dbo.cart WHERE buyer_id = @b1_c;
SELECT @c2 = cart_id FROM dbo.cart WHERE buyer_id = @b2_c;
SELECT @c3 = cart_id FROM dbo.cart WHERE buyer_id = @b3_c;

DECLARE @p1_c BIGINT, @p2_c BIGINT, @p3_c BIGINT, @p4_c BIGINT;
SELECT TOP 1 @p1_c = product_id FROM dbo.product WHERE title LIKE 'iPad%';
SELECT TOP 1 @p2_c = product_id FROM dbo.product WHERE title LIKE 'Nike%';
SELECT TOP 1 @p3_c = product_id FROM dbo.product WHERE title LIKE 'IKEA%';
SELECT TOP 1 @p4_c = product_id FROM dbo.product WHERE title LIKE 'Yoga%';

IF @c1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.cart_item WHERE cart_id = @c1)
    INSERT INTO dbo.cart_item (cart_id, product_id, variant_code, qty, added_at)
    VALUES (@c1, @p1_c, 'DEFAULT', 1, DATEADD(DAY, -2, SYSDATETIME()));

IF @c2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.cart_item WHERE cart_id = @c2)
    INSERT INTO dbo.cart_item (cart_id, product_id, variant_code, qty, added_at)
    VALUES (@c2, @p2_c, 'DEFAULT', 1, DATEADD(DAY, -1, SYSDATETIME())),
           (@c2, @p3_c, 'DEFAULT', 1, DATEADD(HOUR, -12, SYSDATETIME()));

IF @c3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.cart_item WHERE cart_id = @c3)
    INSERT INTO dbo.cart_item (cart_id, product_id, variant_code, qty, added_at)
    VALUES (@c3, @p4_c, 'DEFAULT', 2, DATEADD(HOUR, -2, SYSDATETIME()));
GO

-- 5. GENERATE INVOICES FOR EXISTING ORDERS
-- ========================================
PRINT 'Generating invoices for existing Paid/Completed orders...';

INSERT INTO dbo.invoice (
    order_id, invoice_number, issue_date, 
    subtotal, tax_rate, tax_amount, shipping_fee, grand_total,
    invoice_type, payment_status
)
SELECT 
    o.order_id,
    'INV' + RIGHT('000000' + CAST(o.order_id AS VARCHAR), 6) AS invoice_number,
    o.order_date AS issue_date,
    o.total_amount - o.shipping_fee AS subtotal,
    10.00 AS tax_rate,
    ROUND((o.total_amount - o.shipping_fee) * 0.10, 2) AS tax_amount,
    o.shipping_fee,
    (o.total_amount - o.shipping_fee) + ROUND((o.total_amount - o.shipping_fee) * 0.10, 2) + o.shipping_fee AS grand_total,
    N'Standard' AS invoice_type,
    CASE 
        WHEN o.status IN (N'Paid', N'Packing', N'Shipped', N'Completed') THEN N'Paid'
        WHEN o.status = N'Cancelled' THEN N'Cancelled'
        ELSE N'Unpaid'
    END AS payment_status
FROM dbo.orders o
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.invoice i WHERE i.order_id = o.order_id
);

PRINT '→ Generated ' + CAST(@@ROWCOUNT AS VARCHAR) + ' invoices';
GO

-- ========================================
-- 6. GENERATE INVOICE ITEMS
-- ========================================
PRINT 'Generating invoice items...';

INSERT INTO dbo.invoice_item (
    invoice_id, line_no, product_id, variant_code, 
    description, qty, unit_price, tax_rate, tax_amount
)
SELECT 
    inv.invoice_id,
    oi.line_no,
    oi.product_id,
    oi.variant_code,
    p.title + N' - ' + oi.variant_code AS description,
    oi.qty,
    oi.unit_price,
    10.00 AS tax_rate,
    ROUND(oi.qty * oi.unit_price * 0.10, 2) AS tax_amount
FROM dbo.invoice inv
INNER JOIN dbo.order_item oi ON inv.order_id = oi.order_id
INNER JOIN dbo.product p ON oi.product_id = p.product_id
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.invoice_item ii 
    WHERE ii.invoice_id = inv.invoice_id AND ii.line_no = oi.line_no
);

PRINT '→ Generated ' + CAST(@@ROWCOUNT AS VARCHAR) + ' invoice items';
GO

-- ========================================
-- 7. CREATE MOCK PAYMENT DATA
-- ========================================
PRINT 'Creating mock payment data...';

INSERT INTO dbo.payment (
    order_id, amount, payment_method, status, 
    transaction_id, payment_date
)
SELECT 
    o.order_id,
    o.total_amount,
    CASE (o.order_id % 5)
        WHEN 0 THEN N'CreditCard'
        WHEN 1 THEN N'Momo'
        WHEN 2 THEN N'VNPay'
        WHEN 3 THEN N'BankTransfer'
        ELSE N'Cash'
    END AS payment_method,
    CASE 
        WHEN o.status IN (N'Paid', N'Packing', N'Shipped', N'Completed') THEN N'Success'
        WHEN o.status = N'Cancelled' THEN N'Cancelled'
        WHEN o.status = N'Refunded' THEN N'Refunded'
        ELSE N'Pending'
    END AS status,
    'TXN' + RIGHT('0000000000' + CAST(o.order_id AS VARCHAR), 10) AS transaction_id,
    CASE 
        WHEN o.status IN (N'Paid', N'Packing', N'Shipped', N'Completed') 
        THEN DATEADD(MINUTE, 5, o.order_date)
        ELSE NULL
    END AS payment_date
FROM dbo.orders o
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.payment p WHERE p.order_id = o.order_id
);

PRINT '→ Created ' + CAST(@@ROWCOUNT AS VARCHAR) + ' payment records';
GO

-- ========================================

PRINT 'Mockup data inserted successfully for MSSQL.';
