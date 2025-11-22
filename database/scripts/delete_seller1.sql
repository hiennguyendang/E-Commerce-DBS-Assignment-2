-- Xóa seller1@demo.com để đăng ký lại
DELETE FROM seller WHERE user_id IN (SELECT user_id FROM user_account WHERE email = 'seller1@demo.com');
DELETE FROM user_account WHERE email = 'seller1@demo.com';

SELECT 'User deleted successfully! Now you can register again.' as status;
