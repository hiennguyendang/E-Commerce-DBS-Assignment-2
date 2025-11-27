-- Sample data for Shopeelike on Microsoft SQL Server
-- Simplified, SQL Server–compatible version of mockup_data_shopeelike.sql

USE shopeelike;

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;

-- SHIPPING SERVICE
IF NOT EXISTS (SELECT 1 FROM dbo.shipping_service)
BEGIN
    INSERT INTO dbo.shipping_service (carrier, service_name, est_days_min, est_days_max, base_fee, per_kg_fee)
    VALUES (N'DefaultCarrier', N'Standard', 2, 5, 0, 0);
END;

-- CATEGORIES
IF NOT EXISTS (SELECT 1 FROM dbo.category WHERE name = N'Electronics')
BEGIN
    INSERT INTO dbo.category (name, description)
    VALUES 
      (N'Electronics',      N'Devices and gadgets'),
      (N'Fashion',          N'Clothing and accessories'),
      (N'Home & Living',    N'Furniture and decor');
END;

-- SELLER ACCOUNT + PROFILE
DECLARE @seller_user_id BIGINT;

IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = N'seller1@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES (
        N'seller1@demo.com',
        N'$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK',
        N'Tech Store',
        N'techstore',
        N'+84901111111',
        '1990-01-01'
    );

    SET @seller_user_id = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @seller_user_id = user_id
    FROM dbo.user_account
    WHERE email = N'seller1@demo.com';
END;

IF NOT EXISTS (SELECT 1 FROM dbo.seller WHERE user_id = @seller_user_id)
BEGIN
    INSERT INTO dbo.seller (seller_id, user_id, shop_name, tax_id)
    VALUES (NULL, @seller_user_id, N'Tech Store', N'TAX123456');
END;

DECLARE @seller_id CHAR(6);
SELECT @seller_id = seller_id FROM dbo.seller WHERE user_id = @seller_user_id;

-- PRODUCTS, VARIANTS, IMAGES
DECLARE @cat_electronics   BIGINT;
DECLARE @cat_fashion       BIGINT;
DECLARE @cat_home_living   BIGINT;

SELECT @cat_electronics   = category_id FROM dbo.category WHERE name = N'Electronics';
SELECT @cat_fashion       = category_id FROM dbo.category WHERE name = N'Fashion';
SELECT @cat_home_living   = category_id FROM dbo.category WHERE name = N'Home & Living';

DECLARE @phone_product_id        BIGINT;
DECLARE @laptop_product_id       BIGINT;
DECLARE @headphone_product_id    BIGINT;
DECLARE @watch_product_id        BIGINT;
DECLARE @backpack_product_id     BIGINT;
DECLARE @shoes_product_id        BIGINT;
DECLARE @smart_speaker_product_id BIGINT;
DECLARE @gaming_monitor_product_id BIGINT;
DECLARE @earbuds_product_id      BIGINT;
DECLARE @tshirt_product_id       BIGINT;
DECLARE @jacket_product_id       BIGINT;
DECLARE @shorts_product_id       BIGINT;
DECLARE @chair_product_id        BIGINT;
DECLARE @lamp_product_id         BIGINT;
DECLARE @mug_product_id          BIGINT;

IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Sample Phone X')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES
      (@seller_id, N'Sample Phone X',             N'A modern smartphone',          N'Active'),
      (@seller_id, N'Lightweight Laptop 13"',    N'Portable productivity laptop', N'Active'),
      (@seller_id, N'Noise-canceling Headphones', N'Immersive sound experience',  N'Active');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Smart Fitness Watch')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Smart Fitness Watch', N'Waterproof fitness tracker with heart-rate monitor', N'Active');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Urban Travel Backpack')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Urban Travel Backpack', N'Laptop-friendly backpack for daily commute', N'Active');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Running Shoes Pro')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Running Shoes Pro', N'Lightweight running shoes with breathable mesh', N'Active');
END;

-- Extra electronics for richer catalog
IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Smart Home Speaker')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Smart Home Speaker', N'Voice-controlled smart speaker for your living room', N'Active');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'4K Gaming Monitor 27"')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'4K Gaming Monitor 27"', N'High refresh-rate 4K monitor for gaming and work', N'Active');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Truly Wireless Earbuds')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Truly Wireless Earbuds', N'Compact earbuds with noise isolation and long battery life', N'Active');
END;

-- Fashion products
IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Classic Cotton T-Shirt')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Classic Cotton T-Shirt', N'Soft unisex cotton t-shirt for daily wear', N'Active');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Denim Jacket')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Denim Jacket', N'Casual denim jacket, slim fit style', N'Active');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Sport Running Shorts')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Sport Running Shorts', N'Breathable running shorts with inner lining', N'Active');
END;

-- Home & Living products
IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Ergonomic Office Chair')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Ergonomic Office Chair', N'Adjustable office chair with lumbar support', N'Active');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Minimalist Desk Lamp')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Minimalist Desk Lamp', N'LED desk lamp with warm and cool light modes', N'Active');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE title = N'Ceramic Coffee Mug Set')
BEGIN
    INSERT INTO dbo.product (seller_id, title, description, status)
    VALUES (@seller_id, N'Ceramic Coffee Mug Set', N'Set of 4 ceramic mugs for coffee or tea', N'Active');
END;

SELECT @phone_product_id = product_id
FROM dbo.product
WHERE title = N'Sample Phone X';

SELECT @laptop_product_id = product_id
FROM dbo.product
WHERE title = N'Lightweight Laptop 13"';

SELECT @headphone_product_id = product_id
FROM dbo.product
WHERE title = N'Noise-canceling Headphones';

SELECT @watch_product_id = product_id
FROM dbo.product
WHERE title = N'Smart Fitness Watch';

SELECT @backpack_product_id = product_id
FROM dbo.product
WHERE title = N'Urban Travel Backpack';

SELECT @shoes_product_id = product_id
FROM dbo.product
WHERE title = N'Running Shoes Pro';

SELECT @smart_speaker_product_id = product_id
FROM dbo.product
WHERE title = N'Smart Home Speaker';

SELECT @gaming_monitor_product_id = product_id
FROM dbo.product
WHERE title = N'4K Gaming Monitor 27"';

SELECT @earbuds_product_id = product_id
FROM dbo.product
WHERE title = N'Truly Wireless Earbuds';

SELECT @tshirt_product_id = product_id
FROM dbo.product
WHERE title = N'Classic Cotton T-Shirt';

SELECT @jacket_product_id = product_id
FROM dbo.product
WHERE title = N'Denim Jacket';

SELECT @shorts_product_id = product_id
FROM dbo.product
WHERE title = N'Sport Running Shorts';

SELECT @chair_product_id = product_id
FROM dbo.product
WHERE title = N'Ergonomic Office Chair';

SELECT @lamp_product_id = product_id
FROM dbo.product
WHERE title = N'Minimalist Desk Lamp';

SELECT @mug_product_id = product_id
FROM dbo.product
WHERE title = N'Ceramic Coffee Mug Set';

IF @cat_electronics IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @phone_product_id AND category_id = @cat_electronics)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@phone_product_id, @cat_electronics);

    IF NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @laptop_product_id AND category_id = @cat_electronics)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@laptop_product_id, @cat_electronics);

    IF NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @headphone_product_id AND category_id = @cat_electronics)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@headphone_product_id, @cat_electronics);
    IF NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @watch_product_id AND category_id = @cat_electronics)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@watch_product_id, @cat_electronics);

    IF @smart_speaker_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @smart_speaker_product_id AND category_id = @cat_electronics)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@smart_speaker_product_id, @cat_electronics);

    IF @gaming_monitor_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @gaming_monitor_product_id AND category_id = @cat_electronics)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@gaming_monitor_product_id, @cat_electronics);

    IF @earbuds_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @earbuds_product_id AND category_id = @cat_electronics)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@earbuds_product_id, @cat_electronics);
END;

IF @cat_fashion IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @backpack_product_id AND category_id = @cat_fashion)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@backpack_product_id, @cat_fashion);

    IF NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @shoes_product_id AND category_id = @cat_fashion)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@shoes_product_id, @cat_fashion);

    IF @tshirt_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @tshirt_product_id AND category_id = @cat_fashion)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@tshirt_product_id, @cat_fashion);

    IF @jacket_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @jacket_product_id AND category_id = @cat_fashion)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@jacket_product_id, @cat_fashion);

    IF @shorts_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @shorts_product_id AND category_id = @cat_fashion)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@shorts_product_id, @cat_fashion);
END;

IF @cat_home_living IS NOT NULL
BEGIN
    IF @chair_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @chair_product_id AND category_id = @cat_home_living)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@chair_product_id, @cat_home_living);

    IF @lamp_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @lamp_product_id AND category_id = @cat_home_living)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@lamp_product_id, @cat_home_living);

    IF @mug_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.product_category WHERE product_id = @mug_product_id AND category_id = @cat_home_living)
        INSERT INTO dbo.product_category (product_id, category_id) VALUES (@mug_product_id, @cat_home_living);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @phone_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@phone_product_id, N'DEFAULT', N'SPX-001', 5990000, 20, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @laptop_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@laptop_product_id, N'DEFAULT', N'LL13-001', 18990000, 10, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @headphone_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@headphone_product_id, N'DEFAULT', N'NCH-001', 2990000, 30, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @watch_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@watch_product_id, N'DEFAULT', N'SW-001', 1290000, 50, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @backpack_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@backpack_product_id, N'DEFAULT', N'BP-001', 499000, 80, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @shoes_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@shoes_product_id, N'DEFAULT', N'RS-001', 899000, 60, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @smart_speaker_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@smart_speaker_product_id, N'DEFAULT', N'SHS-001', 1599000, 40, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @gaming_monitor_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@gaming_monitor_product_id, N'DEFAULT', N'GKM27-001', 7990000, 15, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @earbuds_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@earbuds_product_id, N'DEFAULT', N'EBD-001', 1290000, 70, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @tshirt_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@tshirt_product_id, N'DEFAULT', N'CTS-001', 199000, 150, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @jacket_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@jacket_product_id, N'DEFAULT', N'DJK-001', 699000, 60, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @shorts_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@shorts_product_id, N'DEFAULT', N'SRS-001', 249000, 120, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @chair_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@chair_product_id, N'DEFAULT', N'EOC-001', 2599000, 25, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @lamp_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@lamp_product_id, N'DEFAULT', N'MDL-001', 399000, 80, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_variant WHERE product_id = @mug_product_id AND variant_code = N'DEFAULT')
BEGIN
    INSERT INTO dbo.product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
    VALUES (@mug_product_id, N'DEFAULT', N'CMG-001', 159000, 100, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @phone_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@phone_product_id,
            N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
            N'Sample Phone X');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @laptop_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@laptop_product_id,
            N'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
            N'Lightweight Laptop 13"');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @headphone_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@headphone_product_id,
            N'https://images.unsplash.com/photo-1518443895914-6b0f0d6f58f2?w=600',
            N'Noise-canceling Headphones');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @watch_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@watch_product_id,
            N'https://images.unsplash.com/photo-1519744346363-dc63d49ca0f1?w=600',
            N'Smart Fitness Watch');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @backpack_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@backpack_product_id,
            N'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
            N'Urban Travel Backpack');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @shoes_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@shoes_product_id,
            N'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
            N'Running Shoes Pro');
END;

IF @smart_speaker_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @smart_speaker_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@smart_speaker_product_id,
            N'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
            N'Smart Home Speaker');
END;

IF @gaming_monitor_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @gaming_monitor_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@gaming_monitor_product_id,
            N'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
            N'4K Gaming Monitor 27"');
END;

IF @earbuds_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @earbuds_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@earbuds_product_id,
            N'https://images.unsplash.com/photo-1585386959984-a4155223f3f8?w=600',
            N'Truly Wireless Earbuds');
END;

IF @tshirt_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @tshirt_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@tshirt_product_id,
            N'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
            N'Classic Cotton T-Shirt');
END;

IF @jacket_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @jacket_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@jacket_product_id,
            N'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
            N'Denim Jacket');
END;

IF @shorts_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @shorts_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@shorts_product_id,
            N'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
            N'Sport Running Shorts');
END;

IF @chair_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @chair_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@chair_product_id,
            N'https://images.unsplash.com/photo-1582719478171-2f2df9b3f4b0?w=600',
            N'Ergonomic Office Chair');
END;

IF @lamp_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @lamp_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@lamp_product_id,
            N'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600',
            N'Minimalist Desk Lamp');
END;

IF @mug_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @mug_product_id)
BEGIN
    INSERT INTO dbo.product_image (product_id, url, caption)
    VALUES (@mug_product_id,
            N'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
            N'Ceramic Coffee Mug Set');
END;

-- BUYERS & ADDRESSES
DECLARE @admin_user_id BIGINT;
DECLARE @buyer1_id BIGINT;
DECLARE @buyer2_id BIGINT;
DECLARE @buyer3_id BIGINT;

DECLARE @pwd NVARCHAR(255) = N'$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK';

-- ADMIN USER FOR MANAGEMENT / REPORTING
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = N'admin1@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES (N'admin1@demo.com', @pwd, N'System Admin', N'admin1', N'+84900000001', '1985-01-01');
END;

SELECT @admin_user_id = user_id FROM dbo.user_account WHERE email = N'admin1@demo.com';

IF NOT EXISTS (SELECT 1 FROM dbo.admin WHERE user_id = @admin_user_id)
BEGIN
    INSERT INTO dbo.admin (user_id, role) VALUES (@admin_user_id, N'SystemAdmin');
END;

-- BUYER ACCOUNTS
IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = N'buyer1@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES (N'buyer1@demo.com', @pwd, N'Minh Nguyen', N'buyer1', N'+84911111111', '1992-02-02');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = N'buyer2@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES (N'buyer2@demo.com', @pwd, N'Lan Tran', N'buyer2', N'+84922222222', '1995-03-03');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = N'buyer3@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
    VALUES (N'buyer3@demo.com', @pwd, N'Quang Le', N'buyer3', N'+84933333333', '1998-04-04');
END;

SELECT @buyer1_id = user_id FROM dbo.user_account WHERE email = N'buyer1@demo.com';
SELECT @buyer2_id = user_id FROM dbo.user_account WHERE email = N'buyer2@demo.com';
SELECT @buyer3_id = user_id FROM dbo.user_account WHERE email = N'buyer3@demo.com';

IF NOT EXISTS (SELECT 1 FROM dbo.buyer WHERE user_id = @buyer1_id)
    INSERT INTO dbo.buyer (user_id) VALUES (@buyer1_id);

IF NOT EXISTS (SELECT 1 FROM dbo.buyer WHERE user_id = @buyer2_id)
    INSERT INTO dbo.buyer (user_id) VALUES (@buyer2_id);

IF NOT EXISTS (SELECT 1 FROM dbo.buyer WHERE user_id = @buyer3_id)
    INSERT INTO dbo.buyer (user_id) VALUES (@buyer3_id);

IF NOT EXISTS (SELECT 1 FROM dbo.address WHERE buyer_id = @buyer1_id AND is_default = 1)
BEGIN
    INSERT INTO dbo.address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
    VALUES (@buyer1_id, N'Minh Nguyen', N'+84911111111', N'123 Le Loi', N'Ho Chi Minh City', N'VN', N'700000', 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.address WHERE buyer_id = @buyer2_id AND is_default = 1)
BEGIN
    INSERT INTO dbo.address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
    VALUES (@buyer2_id, N'Lan Tran', N'+84922222222', N'89 Nguyen Hue', N'Ho Chi Minh City', N'VN', N'700100', 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.address WHERE buyer_id = @buyer3_id AND is_default = 1)
BEGIN
    INSERT INTO dbo.address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
    VALUES (@buyer3_id, N'Quang Le', N'+84933333333', N'45 Tran Hung Dao', N'Ha Noi', N'VN', N'100000', 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.address WHERE seller_id = @seller_id AND is_default = 1)
BEGIN
    INSERT INTO dbo.address (seller_id, recipient_name, phone, line1, city, country, postal_code, is_default)
    VALUES (@seller_id, N'Tech Store Warehouse', N'+84901111111', N'1 Tech Street', N'Ho Chi Minh City', N'VN', N'700000', 1);
END;

-- ORDERS & ORDER ITEMS (DEMO)
DECLARE @service_id SMALLINT;
SELECT TOP (1) @service_id = service_id FROM dbo.shipping_service ORDER BY service_id ASC;

DECLARE @ship_from BIGINT;
SELECT TOP (1) @ship_from = address_id
FROM dbo.address
WHERE seller_id = @seller_id
ORDER BY is_default DESC, address_id ASC;

DECLARE @ship_to1 BIGINT;
DECLARE @ship_to2 BIGINT;
DECLARE @ship_to3 BIGINT;

SELECT TOP (1) @ship_to1 = address_id
FROM dbo.address
WHERE buyer_id = @buyer1_id
ORDER BY is_default DESC, address_id ASC;

SELECT TOP (1) @ship_to2 = address_id
FROM dbo.address
WHERE buyer_id = @buyer2_id
ORDER BY is_default DESC, address_id ASC;

SELECT TOP (1) @ship_to3 = address_id
FROM dbo.address
WHERE buyer_id = @buyer3_id
ORDER BY is_default DESC, address_id ASC;

DECLARE @order1 BIGINT;
DECLARE @order2 BIGINT;
DECLARE @order3 BIGINT;
DECLARE @order4 BIGINT;
DECLARE @order5 BIGINT;

-- SAMPLE CARTS FOR EACH BUYER
IF NOT EXISTS (SELECT 1 FROM dbo.cart WHERE buyer_id = @buyer1_id)
BEGIN
    INSERT INTO dbo.cart (buyer_id, status)
    VALUES (@buyer1_id, N'Active');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.cart WHERE buyer_id = @buyer2_id)
BEGIN
    INSERT INTO dbo.cart (buyer_id, status)
    VALUES (@buyer2_id, N'CheckedOut');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.cart WHERE buyer_id = @buyer3_id)
BEGIN
    INSERT INTO dbo.cart (buyer_id, status)
    VALUES (@buyer3_id, N'Abandoned');
END;

DECLARE @cart1 BIGINT;
DECLARE @cart2 BIGINT;
DECLARE @cart3 BIGINT;

SELECT TOP (1) @cart1 = cart_id FROM dbo.cart WHERE buyer_id = @buyer1_id ORDER BY created_at DESC;
SELECT TOP (1) @cart2 = cart_id FROM dbo.cart WHERE buyer_id = @buyer2_id ORDER BY created_at DESC;
SELECT TOP (1) @cart3 = cart_id FROM dbo.cart WHERE buyer_id = @buyer3_id ORDER BY created_at DESC;

IF @cart1 IS NOT NULL AND @phone_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.cart_item WHERE cart_id = @cart1 AND product_id = @phone_product_id)
BEGIN
    INSERT INTO dbo.cart_item (cart_id, product_id, variant_code, qty)
    VALUES (@cart1, @phone_product_id, N'DEFAULT', 1);
END;

IF @cart2 IS NOT NULL AND @laptop_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.cart_item WHERE cart_id = @cart2 AND product_id = @laptop_product_id)
BEGIN
    INSERT INTO dbo.cart_item (cart_id, product_id, variant_code, qty)
    VALUES (@cart2, @laptop_product_id, N'DEFAULT', 1);
END;

IF @cart3 IS NOT NULL AND @headphone_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.cart_item WHERE cart_id = @cart3 AND product_id = @headphone_product_id)
BEGIN
    INSERT INTO dbo.cart_item (cart_id, product_id, variant_code, qty)
    VALUES (@cart3, @headphone_product_id, N'DEFAULT', 2);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.orders WHERE buyer_id = @buyer1_id)
BEGIN
    INSERT INTO dbo.orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
    VALUES (@buyer1_id, @ship_to1, @ship_from, @service_id, 0, N'Completed', 0);

    SET @order1 = SCOPE_IDENTITY();

    INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
    SELECT @order1, 1, @phone_product_id, N'DEFAULT', 1, v.list_price
    FROM dbo.product_variant v
    WHERE v.product_id = @phone_product_id AND v.variant_code = N'DEFAULT';
END;

IF NOT EXISTS (SELECT 1 FROM dbo.orders WHERE buyer_id = @buyer2_id)
BEGIN
    INSERT INTO dbo.orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
    VALUES (@buyer2_id, @ship_to2, @ship_from, @service_id, 50000, N'Paid', 0);

    SET @order2 = SCOPE_IDENTITY();

    INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
    SELECT @order2, 1, @laptop_product_id, N'DEFAULT', 1, v.list_price
    FROM dbo.product_variant v
    WHERE v.product_id = @laptop_product_id AND v.variant_code = N'DEFAULT';

    INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
    SELECT @order2, 2, @headphone_product_id, N'DEFAULT', 2, v.list_price
    FROM dbo.product_variant v
    WHERE v.product_id = @headphone_product_id AND v.variant_code = N'DEFAULT';
END;

IF NOT EXISTS (SELECT 1 FROM dbo.orders WHERE buyer_id = @buyer3_id)
BEGIN
    INSERT INTO dbo.orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
    VALUES (@buyer3_id, @ship_to3, @ship_from, @service_id, 0, N'Shipped', 0);

    SET @order3 = SCOPE_IDENTITY();

    INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
    SELECT @order3, 1, @phone_product_id, N'DEFAULT', 2, v.list_price
    FROM dbo.product_variant v
    WHERE v.product_id = @phone_product_id AND v.variant_code = N'DEFAULT';
END;

-- Additional demo orders so seller dashboard has richer history
IF @smart_speaker_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.orders WHERE buyer_id = @buyer1_id AND status = N'Pending')
BEGIN
    INSERT INTO dbo.orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
    VALUES (@buyer1_id, @ship_to1, @ship_from, @service_id, 30000, N'Pending', 0);

    SET @order4 = SCOPE_IDENTITY();

    INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
    SELECT @order4, 1, @smart_speaker_product_id, N'DEFAULT', 1, v.list_price
    FROM dbo.product_variant v
    WHERE v.product_id = @smart_speaker_product_id AND v.variant_code = N'DEFAULT';

    IF @lamp_product_id IS NOT NULL
    BEGIN
        INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
        SELECT @order4, 2, @lamp_product_id, N'DEFAULT', 1, v.list_price
        FROM dbo.product_variant v
        WHERE v.product_id = @lamp_product_id AND v.variant_code = N'DEFAULT';
    END;
END;

IF @tshirt_product_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.orders WHERE buyer_id = @buyer2_id AND status = N'Completed')
BEGIN
    INSERT INTO dbo.orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
    VALUES (@buyer2_id, @ship_to2, @ship_from, @service_id, 45000, N'Completed', 0);

    SET @order5 = SCOPE_IDENTITY();

    INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
    SELECT @order5, 1, @tshirt_product_id, N'DEFAULT', 2, v.list_price
    FROM dbo.product_variant v
    WHERE v.product_id = @tshirt_product_id AND v.variant_code = N'DEFAULT';

    IF @shoes_product_id IS NOT NULL
    BEGIN
        INSERT INTO dbo.order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
        SELECT @order5, 2, @shoes_product_id, N'DEFAULT', 1, v.list_price
        FROM dbo.product_variant v
        WHERE v.product_id = @shoes_product_id AND v.variant_code = N'DEFAULT';
    END;
END;

-- VOUCHERS AND THEIR RELATIONSHIPS
DECLARE @voucher_all BIGINT;
DECLARE @voucher_elec BIGINT;
DECLARE @voucher_fashion BIGINT;

IF NOT EXISTS (SELECT 1 FROM dbo.voucher WHERE code = N'WELCOME10')
BEGIN
    INSERT INTO dbo.voucher (code, title, start_at, end_at, discount_type, discount_value, min_order_value, stackable, max_uses_per_buyer)
    VALUES (N'WELCOME10', N'Giảm 10% cho đơn đầu tiên', DATEADD(DAY, -7, SYSDATETIME()), DATEADD(DAY, 30, SYSDATETIME()),
            N'Percent', 10, 0, 0, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.voucher WHERE code = N'ELEC50K')
BEGIN
    INSERT INTO dbo.voucher (code, title, start_at, end_at, discount_type, discount_value, min_order_value, stackable, max_uses_per_buyer)
    VALUES (N'ELEC50K', N'Giảm 50K cho đơn điện tử từ 1M', DATEADD(DAY, -7, SYSDATETIME()), DATEADD(DAY, 60, SYSDATETIME()),
            N'Fixed', 50000, 1000000, 1, 2);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.voucher WHERE code = N'FASHION15')
BEGIN
    INSERT INTO dbo.voucher (code, title, start_at, end_at, discount_type, discount_value, min_order_value, stackable, max_uses_per_buyer)
    VALUES (N'FASHION15', N'Giảm 15% cho thời trang', DATEADD(DAY, -7, SYSDATETIME()), DATEADD(DAY, 45, SYSDATETIME()),
            N'Percent', 15, 300000, 1, 3);
END;

SELECT @voucher_all   = voucher_id FROM dbo.voucher WHERE code = N'WELCOME10';
SELECT @voucher_elec  = voucher_id FROM dbo.voucher WHERE code = N'ELEC50K';
SELECT @voucher_fashion = voucher_id FROM dbo.voucher WHERE code = N'FASHION15';

IF @voucher_all IS NOT NULL AND @seller_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.voucher_seller WHERE voucher_id = @voucher_all AND seller_id = @seller_id)
BEGIN
    INSERT INTO dbo.voucher_seller (voucher_id, seller_id) VALUES (@voucher_all, @seller_id);
END;

IF @voucher_elec IS NOT NULL AND @cat_electronics IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.voucher_category WHERE voucher_id = @voucher_elec AND category_id = @cat_electronics)
BEGIN
    INSERT INTO dbo.voucher_category (voucher_id, category_id) VALUES (@voucher_elec, @cat_electronics);
END;

IF @voucher_fashion IS NOT NULL AND @cat_fashion IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.voucher_category WHERE voucher_id = @voucher_fashion AND category_id = @cat_fashion)
BEGIN
    INSERT INTO dbo.voucher_category (voucher_id, category_id) VALUES (@voucher_fashion, @cat_fashion);
END;

-- APPLY VOUCHERS TO SOME ORDERS
IF @voucher_all IS NOT NULL AND @order1 IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.order_voucher WHERE order_id = @order1 AND voucher_id = @voucher_all)
BEGIN
    INSERT INTO dbo.order_voucher (order_id, voucher_id, applied_amount)
    VALUES (@order1, @voucher_all, 0); -- actual discount tính bằng function ở app layer
END;

IF @voucher_elec IS NOT NULL AND @order2 IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.order_voucher WHERE order_id = @order2 AND voucher_id = @voucher_elec)
BEGIN
    INSERT INTO dbo.order_voucher (order_id, voucher_id, applied_amount)
    VALUES (@order2, @voucher_elec, 50000);
END;

-- SIMPLE REVIEWS FOR SOME ORDER ITEMS
IF @order1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.review WHERE order_id = @order1 AND line_no = 1)
BEGIN
    INSERT INTO dbo.review (order_id, line_no, buyer_id, rating, content)
    VALUES (@order1, 1, @buyer1_id, 5, N'Sản phẩm rất tốt, giao hàng nhanh.');
END;

IF @order2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.review WHERE order_id = @order2 AND line_no = 1)
BEGIN
    INSERT INTO dbo.review (order_id, line_no, buyer_id, rating, content)
    VALUES (@order2, 1, @buyer2_id, 4, N'Laptop chạy mượt, pin ổn.');
END;

IF @order3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.review WHERE order_id = @order3 AND line_no = 1)
BEGIN
    INSERT INTO dbo.review (order_id, line_no, buyer_id, rating, content)
    VALUES (@order3, 1, @buyer3_id, 4, N'Điện thoại đúng mô tả, chất lượng tốt.');
END;

-- SHIPMENT RECORDS
IF @order2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.shipment WHERE order_id = @order2)
BEGIN
    INSERT INTO dbo.shipment (order_id, tracking_no, weight_kg, status, shipped_at, delivered_at)
    VALUES (@order2, N'TRACK-0001', 2.5, N'Delivered', DATEADD(DAY, -3, SYSDATETIME()), DATEADD(DAY, -1, SYSDATETIME()));
END;

IF @order3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.shipment WHERE order_id = @order3)
BEGIN
    INSERT INTO dbo.shipment (order_id, tracking_no, weight_kg, status, shipped_at, delivered_at)
    VALUES (@order3, N'TRACK-0002', 1.2, N'Shipping', DATEADD(DAY, -1, SYSDATETIME()), NULL);
END;

SET NOCOUNT OFF;

