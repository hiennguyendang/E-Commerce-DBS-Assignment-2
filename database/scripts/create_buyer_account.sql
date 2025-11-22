-- Tạo buyer account để test
USE shopeelike;

-- Tạo user account cho buyer
INSERT INTO user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
VALUES ('buyer1@demo.com', '$2a$12$LQv3c1yqBw1uWFlE6qs6Zu5lUyED8VZl5.Q6A9a8BQ4QGCWw8a1nq', 'Nguyễn Văn A', 'buyer1', '+84901234567', '1995-01-01')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Tạo buyer profile
INSERT INTO buyer (user_id)
SELECT user_id FROM user_account WHERE email = 'buyer1@demo.com'
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Kiểm tra
SELECT ua.email, ua.display_name, b.user_id as buyer_id
FROM user_account ua
LEFT JOIN buyer b ON b.user_id = ua.user_id
WHERE ua.email IN ('seller1@demo.com', 'buyer1@demo.com');
