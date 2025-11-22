-- Update password cho seller1@demo.com
-- Password mới: password123
-- Hash: $2a$10$rKz3qLnPZ5YX7YEr3dKLLOxXvV7YvJ8qK6nX9YqJ5Z7Zk8X9YqJ5Z (example)

-- Cách tốt nhất: Dùng Node.js để tạo hash
-- Chạy lệnh: cd backend && node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10).then(console.log)"

-- Sau đó copy hash vào lệnh dưới:
-- UPDATE user_account SET password_hash = 'PASTE_HASH_HERE' WHERE email = 'seller1@demo.com';

SELECT 
    'Run this in Node.js first:' as instruction,
    'cd C:\\Users\\HAD\\Desktop\\DB\\E-Commerce\\backend' as step1,
    'node -e "const bcrypt = require(\'bcryptjs\'); bcrypt.hash(\'password123\', 10).then(console.log)"' as step2,
    'Then update user_account table with the hash' as step3;
