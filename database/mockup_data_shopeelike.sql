-- ============================================
-- MOCKUP DATA FOR SHOPEELIKE (NEW SCHEMA)
-- ============================================
USE shopeelike;

-- Shipping services (ensure at least one)
INSERT INTO shipping_service (carrier, service_name, est_days_min, est_days_max, base_fee, per_kg_fee)
VALUES 
  ('DefaultCarrier', 'Standard', 2, 5, 0, 0),
  ('VNPost', 'Express', 1, 3, 25000, 5000),
  ('GiaoHangNhanh', 'Fast', 1, 2, 30000, 7000),
  ('J&T Express', 'Economy', 3, 7, 15000, 3000),
  ('Grab Express', 'Same Day', 0, 1, 50000, 10000)
ON DUPLICATE KEY UPDATE carrier = VALUES(carrier);

INSERT INTO category (name, description)
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
  ('Pet Supplies', 'Pet food and accessories')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
VALUES ('seller1@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Tech Store', 'techstore', '+84901111111', '1990-01-01')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

INSERT INTO seller (seller_id, user_id, shop_name, tax_id)
VALUES (NULL, (SELECT user_id FROM user_account WHERE email = 'seller1@demo.com'), 'Tech Store', 'TAX123456')
ON DUPLICATE KEY UPDATE tax_id = VALUES(tax_id);

INSERT INTO user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
VALUES 
  ('seller2@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Fashion Hub', 'fashionhub', '+84902222222', '1988-05-15'),
  ('seller3@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Home Decor Plus', 'homedecor', '+84903333333', '1985-08-20'),
  ('seller4@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Book World', 'bookworld', '+84904444444', '1992-11-10'),
  ('seller5@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Sports Pro', 'sportspro', '+84905555555', '1987-03-25')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

INSERT INTO seller (seller_id, user_id, shop_name, tax_id)
VALUES 
  (NULL, (SELECT user_id FROM user_account WHERE email = 'seller2@demo.com'), 'Fashion Hub', 'TAX234567'),
  (NULL, (SELECT user_id FROM user_account WHERE email = 'seller3@demo.com'), 'Home Decor Plus', 'TAX345678'),
  (NULL, (SELECT user_id FROM user_account WHERE email = 'seller4@demo.com'), 'Book World', 'TAX456789'),
  (NULL, (SELECT user_id FROM user_account WHERE email = 'seller5@demo.com'), 'Sports Pro', 'TAX567890')
ON DUPLICATE KEY UPDATE tax_id = VALUES(tax_id);

INSERT INTO product (seller_id, title, description, status) VALUES
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'iPhone 15 Pro Max', 'Latest Apple flagship smartphone', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Samsung Galaxy S24 Ultra', 'Premium Android smartphone', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'MacBook Pro M3 14"', 'Professional laptop for creators', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Dell XPS 15', 'High-performance Windows laptop', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'iPad Air 11"', 'Versatile tablet for work and play', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Sony WH-1000XM5', 'Premium noise-canceling headphones', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'AirPods Pro 2', 'Wireless earbuds with ANC', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Apple Watch Series 9', 'Advanced smartwatch', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Samsung Galaxy Watch 6', 'Android smartwatch', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Canon EOS R6', 'Full-frame mirrorless camera', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Sony A7 IV', 'Professional camera body', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'GoPro Hero 12', 'Action camera 5K60', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'DJI Mini 4 Pro', 'Compact foldable drone', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'PS5 Console', 'Next-gen gaming console', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Xbox Series X', 'Microsoft gaming console', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Nintendo Switch OLED', 'Hybrid gaming console', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'LG 55" OLED TV', '4K OLED Smart TV', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Samsung 65" QLED TV', 'Quantum dot display', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Bose SoundLink', 'Portable Bluetooth speaker', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Tech Store'), 'Logitech MX Master 3S', 'Wireless productivity mouse', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Nike Air Max 270', 'Comfortable running shoes', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Adidas Ultraboost 23', 'Performance running shoes', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Levi''s 501 Jeans', 'Classic straight fit jeans', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Uniqlo Cotton T-Shirt', 'Basic comfort tee', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Zara Wool Coat', 'Winter long coat', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'H&M Dress', 'Summer floral dress', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Ralph Lauren Polo', 'Classic polo shirt', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Tommy Hilfiger Jacket', 'Denim jacket', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Converse Chuck Taylor', 'Classic canvas sneakers', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Vans Old Skool', 'Skate shoes', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Ray-Ban Aviator', 'Classic sunglasses', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Casio G-Shock', 'Digital sports watch', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Michael Kors Bag', 'Leather handbag', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Gucci Belt', 'Luxury leather belt', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Nike Dri-FIT Shirt', 'Athletic performance tee', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Adidas Track Pants', 'Comfortable joggers', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Puma Hoodie', 'Warm pullover hoodie', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'The North Face Jacket', 'Outdoor winter jacket', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Columbia Fleece', 'Soft fleece jacket', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub'), 'Timberland Boots', 'Waterproof work boots', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'IKEA Sofa Bed', 'Convertible 3-seater sofa', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Dining Table Set', 'Wood table with 6 chairs', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Queen Mattress', 'Memory foam mattress', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Office Chair', 'Ergonomic mesh chair', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Bookshelf', '5-tier wooden bookshelf', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Table Lamp', 'Modern LED desk lamp', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Floor Lamp', 'Tall standing lamp', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Area Rug 5x7', 'Soft living room rug', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Curtains Set', 'Blackout window curtains', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Wall Mirror', 'Large decorative mirror', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Plant Pot Set', 'Ceramic planters pack of 3', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Throw Pillows', 'Decorative cushions set', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Coffee Table', 'Glass top coffee table', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'TV Stand', 'Modern media console', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Kitchen Cart', 'Rolling kitchen island', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Bar Stools Set', 'Counter height stools', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Nightstand', 'Bedside table with drawer', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Wardrobe', 'Sliding door closet', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Shoe Rack', 'Entryway shoe organizer', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Home Decor Plus'), 'Coat Rack', 'Standing coat hanger', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Harry Potter Set', 'Complete 7-book series', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Atomic Habits', 'James Clear bestseller', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'The Alchemist', 'Paulo Coelho classic', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), '1984', 'George Orwell dystopian novel', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Sapiens', 'Yuval Noah Harari', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Educated', 'Tara Westover memoir', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'The Hobbit', 'J.R.R. Tolkien fantasy', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Pride and Prejudice', 'Jane Austen romance', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'To Kill a Mockingbird', 'Harper Lee classic', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Think and Grow Rich', 'Napoleon Hill', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Notebook Set', 'Moleskine pack of 3', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Fountain Pen', 'Parker premium pen', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Pencil Case', 'Oxford pencil pouch', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Highlighter Set', 'Stabilo pastel colors', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Sticky Notes', 'Post-it assorted pack', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Planner 2025', 'Daily productivity planner', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Desk Organizer', 'Wooden pen holder', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Stapler', 'Heavy duty stapler', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Paper Clips', 'Assorted sizes box', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Book World'), 'Binder Set', '3-ring binders pack', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Yoga Mat', 'Non-slip exercise mat', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Dumbbell Set', 'Adjustable weights 20kg', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Resistance Bands', 'Exercise bands set of 5', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Treadmill', 'Foldable running machine', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Exercise Bike', 'Indoor cycling bike', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Pull-up Bar', 'Doorway chin-up bar', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Jump Rope', 'Speed jump rope', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Gym Bag', 'Large sports duffel bag', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Water Bottle', '1L insulated bottle', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Tennis Racket', 'Wilson pro racket', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Basketball', 'Spalding official size', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Soccer Ball', 'Adidas match ball', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Badminton Set', 'Rackets and shuttlecocks', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Golf Clubs', 'Complete set with bag', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Camping Tent', '4-person waterproof tent', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Sleeping Bag', 'All-season sleeping bag', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Hiking Backpack', '50L outdoor backpack', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Cycling Helmet', 'Safety bike helmet', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Swimming Goggles', 'Anti-fog swim goggles', 'Active'),
((SELECT seller_id FROM seller WHERE shop_name = 'Sports Pro'), 'Fitness Tracker', 'Smart activity band', 'Active');

INSERT INTO product_category (product_id, category_id)
SELECT p.product_id, c.category_id FROM product p JOIN category c 
WHERE p.product_id <= 20 AND c.name = 'Electronics';

INSERT INTO product_category (product_id, category_id)
SELECT p.product_id, c.category_id FROM product p JOIN category c 
WHERE p.product_id BETWEEN 21 AND 40 AND c.name = 'Fashion';

INSERT INTO product_category (product_id, category_id)
SELECT p.product_id, c.category_id FROM product p JOIN category c 
WHERE p.product_id BETWEEN 41 AND 60 AND c.name = 'Home & Living';

INSERT INTO product_category (product_id, category_id)
SELECT p.product_id, c.category_id FROM product p JOIN category c 
WHERE p.product_id BETWEEN 61 AND 80 AND c.name = 'Books & Stationery';

INSERT INTO product_category (product_id, category_id)
SELECT p.product_id, c.category_id FROM product p JOIN category c 
WHERE p.product_id BETWEEN 81 AND 100 AND c.name = 'Sports & Outdoors';

INSERT INTO product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
SELECT product_id, 'DEFAULT', CONCAT('SKU', LPAD(product_id, 4, '0')), 
  CASE 
    WHEN product_id <= 20 THEN FLOOR(1000000 + RAND() * 29000000)
    WHEN product_id BETWEEN 21 AND 40 THEN FLOOR(200000 + RAND() * 4800000)
    WHEN product_id BETWEEN 41 AND 60 THEN FLOOR(500000 + RAND() * 19500000)
    WHEN product_id BETWEEN 61 AND 80 THEN FLOOR(50000 + RAND() * 450000)
    ELSE FLOOR(300000 + RAND() * 9700000)
  END,
  FLOOR(10 + RAND() * 90),
  TRUE
FROM product
WHERE product_id <= 100;

INSERT INTO product_image (product_id, url, caption)
SELECT product_id, 
  CONCAT('https://images.unsplash.com/photo-', 
    CASE 
      WHEN product_id <= 20 THEN '1486312338219-ce68b7901a2e'
      WHEN product_id BETWEEN 21 AND 40 THEN '1523381210434-271e8be1f52b'
      WHEN product_id BETWEEN 41 AND 60 THEN '1555041469-a586c61ea9bc'
      WHEN product_id BETWEEN 61 AND 80 THEN '1512820790803-83ca734da794'
      ELSE '1517836357463-d25dfeac3438'
    END,
    '?w=600'),
  title
FROM product
WHERE product_id <= 100;


-- Demo buyers (password: password123, same hash as seller)
INSERT INTO user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
VALUES
  ('buyer1@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Minh Nguyen',  'buyer1', '+84911111111', '1992-02-02'),
  ('buyer2@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Lan Tran',     'buyer2', '+84922222222', '1995-03-03'),
  ('buyer3@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Quang Le',     'buyer3', '+84933333333', '1990-07-15')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Buyer profiles
INSERT INTO buyer (user_id, loyalty_level)
VALUES
  ((SELECT user_id FROM user_account WHERE email = 'buyer1@demo.com'), 'Silver'),
  ((SELECT user_id FROM user_account WHERE email = 'buyer2@demo.com'), 'Bronze'),
  ((SELECT user_id FROM user_account WHERE email = 'buyer3@demo.com'), 'Gold')
ON DUPLICATE KEY UPDATE loyalty_level = VALUES(loyalty_level);

INSERT INTO user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
VALUES ('buyer4@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Hoa Pham', 'buyer4', '+84944444444', '1993-12-05')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

INSERT INTO buyer (user_id, loyalty_level)
VALUES ((SELECT user_id FROM user_account WHERE email = 'buyer4@demo.com'), 'Platinum')
ON DUPLICATE KEY UPDATE loyalty_level = VALUES(loyalty_level);

-- Seller default address (warehouse)
SET @seller_id := (SELECT seller_id FROM seller WHERE shop_name = 'Tech Store' LIMIT 1);
INSERT INTO address (seller_id, recipient_name, phone, line1, city, country, is_default)
SELECT @seller_id, 'Tech Store Warehouse', '+84901111111', '456 Vo Van Tan', 'Ho Chi Minh City', 'VN', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM address WHERE seller_id = @seller_id AND is_default = TRUE
);

-- Buyer default addresses
SET @buyer1_id := (SELECT user_id FROM user_account WHERE email = 'buyer1@demo.com');
SET @buyer2_id := (SELECT user_id FROM user_account WHERE email = 'buyer2@demo.com');
SET @buyer3_id := (SELECT user_id FROM user_account WHERE email = 'buyer3@demo.com');

INSERT INTO address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
SELECT @buyer1_id, 'Minh Nguyen', '+84911111111', '123 Le Loi', 'Ho Chi Minh City', 'VN', '700000', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM address WHERE buyer_id = @buyer1_id AND is_default = TRUE
);

INSERT INTO address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
SELECT @buyer2_id, 'Lan Tran', '+84922222222', '89 Nguyen Hue', 'Ho Chi Minh City', 'VN', '700100', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM address WHERE buyer_id = @buyer2_id AND is_default = TRUE
);

INSERT INTO address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
SELECT @buyer3_id, 'Quang Le', '+84933333333', '45 Tran Hung Dao', 'Ha Noi', 'VN', '100000', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM address WHERE buyer_id = @buyer3_id AND is_default = TRUE
);

SET @service_id := (SELECT service_id FROM shipping_service ORDER BY service_id ASC LIMIT 1);

SET @ship_to1 := (SELECT address_id FROM address WHERE buyer_id = @buyer1_id ORDER BY is_default DESC, address_id ASC LIMIT 1);
SET @ship_from := (SELECT address_id FROM address WHERE seller_id = @seller_id ORDER BY is_default DESC, address_id ASC LIMIT 1);

INSERT INTO orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
VALUES (@buyer1_id, @ship_to1, @ship_from, @service_id, 30000, 'Completed', 0);
SET @order1 := LAST_INSERT_ID();

INSERT INTO order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
SELECT @order1, 1, p.product_id, v.variant_code, 1, v.list_price
FROM product p
JOIN product_variant v ON v.product_id = p.product_id AND v.variant_code = 'DEFAULT'
WHERE p.product_id = 1
LIMIT 1;

SET @ship_to2 := (SELECT address_id FROM address WHERE buyer_id = @buyer2_id ORDER BY is_default DESC, address_id ASC LIMIT 1);

INSERT INTO orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
VALUES (@buyer2_id, @ship_to2, @ship_from, @service_id, 50000, 'Paid', 0);
SET @order2 := LAST_INSERT_ID();

INSERT INTO order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
SELECT @order2, 1, p.product_id, v.variant_code, 1, v.list_price
FROM product p
JOIN product_variant v ON v.product_id = p.product_id AND v.variant_code = 'DEFAULT'
WHERE p.product_id = 3
LIMIT 1;

INSERT INTO order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
SELECT @order2, 2, p.product_id, v.variant_code, 2, v.list_price
FROM product p
JOIN product_variant v ON v.product_id = p.product_id AND v.variant_code = 'DEFAULT'
WHERE p.product_id = 6
LIMIT 1;

SET @ship_to3 := (SELECT address_id FROM address WHERE buyer_id = @buyer3_id ORDER BY is_default DESC, address_id ASC LIMIT 1);

INSERT INTO orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
VALUES (@buyer3_id, @ship_to3, @ship_from, @service_id, 25000, 'Shipped', 0);
SET @order3 := LAST_INSERT_ID();

INSERT INTO order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
SELECT @order3, 1, p.product_id, v.variant_code, 2, v.list_price
FROM product p
JOIN product_variant v ON v.product_id = p.product_id AND v.variant_code = 'DEFAULT'
WHERE p.product_id = 2
LIMIT 1;

INSERT INTO orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
VALUES (@buyer1_id, @ship_to1, @ship_from, @service_id, 0, 'Pending', 0);
SET @order4 := LAST_INSERT_ID();

INSERT INTO order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
SELECT @order4, 1, p.product_id, v.variant_code, 1, v.list_price
FROM product p
JOIN product_variant v ON v.product_id = p.product_id AND v.variant_code = 'DEFAULT'
WHERE p.product_id = 25
LIMIT 1;

INSERT INTO orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
VALUES (@buyer2_id, @ship_to2, @ship_from, @service_id, 35000, 'Completed', 0);
SET @order5 := LAST_INSERT_ID();

INSERT INTO order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
SELECT @order5, 1, p.product_id, v.variant_code, 3, v.list_price
FROM product p
JOIN product_variant v ON v.product_id = p.product_id AND v.variant_code = 'DEFAULT'
WHERE p.product_id = 61
LIMIT 1;

INSERT INTO order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
SELECT @order5, 2, p.product_id, v.variant_code, 1, v.list_price
FROM product p
JOIN product_variant v ON v.product_id = p.product_id AND v.variant_code = 'DEFAULT'
WHERE p.product_id = 85
LIMIT 1;

INSERT INTO user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
VALUES 
  ('admin1@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'System Admin', 'sysadmin', '+84900000001', '1985-01-15'),
  ('admin2@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Content Mod', 'contentmod', '+84900000002', '1988-03-20'),
  ('admin3@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Support Agent', 'supportagent', '+84900000003', '1990-06-10'),
  ('admin4@demo.com', '$2a$10$LEE5v5MMt0tgzp5vta8/zew6BhgDpfIwg7/9fKOEbrtZj8LfeJEkK', 'Finance Officer', 'financeofficer', '+84900000004', '1987-09-25')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

INSERT INTO admin (user_id, role)
VALUES 
  ((SELECT user_id FROM user_account WHERE email = 'admin1@demo.com'), 'SystemAdmin'),
  ((SELECT user_id FROM user_account WHERE email = 'admin2@demo.com'), 'ContentModerator'),
  ((SELECT user_id FROM user_account WHERE email = 'admin3@demo.com'), 'SupportAgent'),
  ((SELECT user_id FROM user_account WHERE email = 'admin4@demo.com'), 'FinanceOfficer')
ON DUPLICATE KEY UPDATE role = VALUES(role);

INSERT INTO review (product_id, buyer_id, rating, title, content, created_at)
VALUES
  (1, @buyer1_id, 5, 'Amazing phone!', 'Love the camera quality and battery life. Highly recommended!', NOW() - INTERVAL 10 DAY),
  (1, @buyer2_id, 4, 'Great but expensive', 'Excellent performance but quite pricey.', NOW() - INTERVAL 8 DAY),
  (3, @buyer1_id, 5, 'Perfect laptop', 'Fast, reliable, and beautiful display. Worth every penny!', NOW() - INTERVAL 5 DAY),
  (6, @buyer2_id, 5, 'Best headphones', 'Noise cancellation is incredible. Perfect for travel.', NOW() - INTERVAL 3 DAY),
  (21, @buyer3_id, 4, 'Comfortable shoes', 'Very comfy for running. Good quality.', NOW() - INTERVAL 7 DAY),
  (25, @buyer1_id, 5, 'Love these jeans!', 'Perfect fit and durable material.', NOW() - INTERVAL 6 DAY),
  (41, @buyer2_id, 4, 'Nice sofa', 'Comfortable and stylish. Assembly was easy.', NOW() - INTERVAL 9 DAY),
  (61, @buyer3_id, 5, 'Great book series', 'Re-reading for the 3rd time. Always magical!', NOW() - INTERVAL 4 DAY),
  (62, @buyer1_id, 5, 'Life changing book', 'Amazing insights on building good habits.', NOW() - INTERVAL 2 DAY),
  (85, @buyer2_id, 4, 'Good yoga mat', 'Non-slip and comfortable. Good value.', NOW() - INTERVAL 1 DAY);

SET @seller1_id := (SELECT seller_id FROM seller WHERE shop_name = 'Tech Store' LIMIT 1);
SET @seller2_id := (SELECT seller_id FROM seller WHERE shop_name = 'Fashion Hub' LIMIT 1);

INSERT INTO voucher (code, discount_type, discount_value, min_order_value, max_discount, valid_from, valid_until, usage_limit, used_count, status)
VALUES
  ('TECH50', 'Percentage', 10.00, 1000000, 200000, NOW() - INTERVAL 30 DAY, NOW() + INTERVAL 30 DAY, 100, 15, 'Active'),
  ('FASHION20', 'Percentage', 20.00, 500000, 100000, NOW() - INTERVAL 20 DAY, NOW() + INTERVAL 40 DAY, 200, 45, 'Active'),
  ('FREESHIP', 'Fixed', 30000, 200000, 30000, NOW() - INTERVAL 15 DAY, NOW() + INTERVAL 45 DAY, 500, 120, 'Active'),
  ('NEWYEAR2025', 'Percentage', 15.00, 800000, 300000, NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 60 DAY, 1000, 250, 'Active'),
  ('WELCOME100', 'Fixed', 100000, 1500000, 100000, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 90 DAY, 50, 8, 'Active');

INSERT INTO voucher_seller (voucher_id, seller_id)
VALUES
  (1, @seller1_id),
  (2, @seller2_id),
  (3, @seller1_id),
  (4, @seller2_id);

INSERT INTO voucher_category (voucher_id, category_id)
VALUES
  (1, (SELECT category_id FROM category WHERE name = 'Electronics')),
  (2, (SELECT category_id FROM category WHERE name = 'Fashion')),
  (3, (SELECT category_id FROM category WHERE name = 'Home & Living')),
  (4, (SELECT category_id FROM category WHERE name = 'Sports & Outdoors'));

INSERT INTO voucher_product (voucher_id, product_id)
VALUES
  (1, 1),
  (1, 3),
  (2, 21),
  (2, 25);

INSERT INTO order_voucher (order_id, voucher_id, discount_applied)
VALUES
  (@order1, 1, 50000),
  (@order2, 3, 30000);

INSERT INTO cart (buyer_id, status, created_at)
VALUES
  (@buyer1_id, 'Active', NOW() - INTERVAL 2 DAY),
  (@buyer2_id, 'Active', NOW() - INTERVAL 1 DAY),
  (@buyer3_id, 'Active', NOW());

SET @cart1 := (SELECT cart_id FROM cart WHERE buyer_id = @buyer1_id ORDER BY cart_id DESC LIMIT 1);
SET @cart2 := (SELECT cart_id FROM cart WHERE buyer_id = @buyer2_id ORDER BY cart_id DESC LIMIT 1);
SET @cart3 := (SELECT cart_id FROM cart WHERE buyer_id = @buyer3_id ORDER BY cart_id DESC LIMIT 1);

INSERT INTO cart_item (cart_id, product_id, variant_code, qty, added_at)
VALUES
  (@cart1, 5, 'DEFAULT', 1, NOW() - INTERVAL 2 DAY),
  (@cart1, 15, 'DEFAULT', 2, NOW() - INTERVAL 1 DAY),
  (@cart2, 22, 'DEFAULT', 1, NOW() - INTERVAL 1 DAY),
  (@cart2, 45, 'DEFAULT', 1, NOW() - INTERVAL 12 HOUR),
  (@cart3, 66, 'DEFAULT', 3, NOW() - INTERVAL 6 HOUR),
  (@cart3, 88, 'DEFAULT', 1, NOW() - INTERVAL 2 HOUR);

INSERT INTO shipment (order_id, carrier, tracking_number, shipped_at, estimated_delivery, actual_delivery, status)
VALUES
  (@order1, 'VNPost', 'VNP123456789VN', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 11 DAY, 'Delivered'),
  (@order2, 'GiaoHangNhanh', 'GHN987654321VN', NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 2 DAY, NULL, 'InTransit'),
  (@order3, 'J&T Express', 'JT456789123VN', NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 1 DAY, NULL, 'InTransit'),
  (@order5, 'Grab Express', 'GRAB789456123VN', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 5 DAY, 'Delivered');

