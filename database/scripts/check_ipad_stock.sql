-- Check iPad Air 11" stock
USE shopeelike;

SELECT 
    p.product_id,
    p.title,
    pv.variant_code,
    pv.list_price,
    pv.stock_qty,
    pv.is_active
FROM product p
JOIN product_variant pv ON p.product_id = pv.product_id
WHERE p.title LIKE '%iPad Air%';

-- Check all orders for iPad Air
SELECT 
    o.order_id,
    o.order_date,
    o.status,
    oi.qty,
    p.title
FROM orders o
JOIN order_item oi ON o.order_id = oi.order_id
JOIN product p ON oi.product_id = p.product_id
WHERE p.title LIKE '%iPad Air%'
ORDER BY o.order_date DESC;
