-- Kiểm tra tất cả users trong database
SELECT 
    u.user_id,
    u.email,
    u.user_name,
    u.display_name,
    CASE 
        WHEN a.user_id IS NOT NULL THEN 'admin'
        WHEN s.user_id IS NOT NULL THEN 'seller'
        ELSE 'customer'
    END as role,
    u.password_hash
FROM user_account u
LEFT JOIN admin a ON u.user_id = a.user_id
LEFT JOIN seller s ON u.user_id = s.user_id
ORDER BY u.user_id;
