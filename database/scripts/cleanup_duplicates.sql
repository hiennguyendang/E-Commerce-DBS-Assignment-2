-- Xóa các products trùng (không có variants)
USE shopeelike;

DELETE FROM product_image WHERE product_id IN (4, 5, 6);
DELETE FROM product_category WHERE product_id IN (4, 5, 6);
DELETE FROM product WHERE product_id IN (4, 5, 6);

-- Kiểm tra lại
SELECT 'After cleanup:' as info;
SELECT * FROM product;
SELECT * FROM product_variant;
