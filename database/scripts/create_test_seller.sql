-- Tạo seller account test
-- Password: password123
-- Hash được tạo bằng bcrypt với salt rounds = 10

-- Xóa user cũ nếu tồn tại
DELETE FROM seller WHERE user_id IN (SELECT user_id FROM user_account WHERE email = 'seller1@demo.com');
DELETE FROM user_account WHERE email = 'seller1@demo.com';

-- Tạo user_account mới
INSERT INTO user_account (email, password_hash, user_name, display_name, phone_number)
VALUES (
  'seller1@demo.com',
  '$2a$10$YourHashHere',  -- Placeholder, sẽ được thay bằng hash thật
  'seller1',
  'Test Seller',
  '0123456789'
);

-- Lấy user_id vừa tạo
SET @user_id = LAST_INSERT_ID();

-- Tạo seller record
INSERT INTO seller (user_id, shop_name, business_email, business_phone, tax_id, business_license_number)
VALUES (
  @user_id,
  'Test Shop',
  'seller1@demo.com',
  '0123456789',
  '1234567890',
  'BL123456'
);

SELECT 'User created successfully!' as status, @user_id as user_id;
