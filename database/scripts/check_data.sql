-- Kiểm tra database có data không
USE shopeelike;

SELECT 'Products Count:' as info, COUNT(*) as total FROM product;
SELECT 'Variants Count:' as info, COUNT(*) as total FROM product_variant;
SELECT 'Images Count:' as info, COUNT(*) as total FROM product_image;

SELECT '=== PRODUCTS ===' as info;
SELECT * FROM product;

SELECT '=== VARIANTS ===' as info;
SELECT * FROM product_variant;

SELECT '=== IMAGES ===' as info;
SELECT * FROM product_image;
