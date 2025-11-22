UPDATE user_account SET password_hash = '$2a$10$F6o6Tsax9oNxIpQwHF6K0OwbHCmvIenwJDGUqLL0Iav6BvX/h3u5K' WHERE email = 'seller1@demo.com';

SELECT 'Password updated successfully!' as status, email, user_name FROM user_account WHERE email = 'seller1@demo.com';
