const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Middleware kiểm tra role seller
const requireSeller = (req, res, next) => {
  const role = req.user.role.toLowerCase();
  if (role !== 'seller' && role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Seller role required.' });
  }
  next();
};

// GET /api/seller/shop - Lấy thông tin shop của seller
router.get('/shop', authenticateToken, requireSeller, async (req, res) => {
  try {
    const [shops] = await pool.execute(
      `SELECT s.user_id, s.shop_name, s.business_email, s.business_phone, 
              s.tax_id, s.business_license_number, s.created_at,
              u.email, u.user_name, u.display_name
       FROM seller s
       JOIN user_account u ON s.user_id = u.user_id
       WHERE s.user_id = ?`,
      [req.user.id]
    );

    if (shops.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json(shops[0]);
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({ error: 'Failed to get shop information' });
  }
});

// PUT /api/seller/shop - Cập nhật thông tin shop
router.put('/shop', [
  authenticateToken,
  requireSeller,
  body('shop_name').optional().trim().notEmpty(),
  body('business_phone').optional().trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shop_name, business_phone } = req.body;
    
    await pool.execute(
      `UPDATE seller 
       SET shop_name = COALESCE(?, shop_name),
           business_phone = COALESCE(?, business_phone)
       WHERE user_id = ?`,
      [shop_name, business_phone, req.user.id]
    );

    res.json({ message: 'Shop updated successfully' });
  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({ error: 'Failed to update shop' });
  }
});

// GET /api/seller/products - Lấy tất cả sản phẩm của seller
router.get('/products', authenticateToken, requireSeller, async (req, res) => {
  try {
    // Get seller_id
    const [sellers] = await pool.execute(
      'SELECT seller_id FROM seller WHERE user_id = ?',
      [req.user.id]
    );

    if (sellers.length === 0) {
      return res.status(403).json({ error: 'User is not a seller' });
    }

    const sellerId = sellers[0].seller_id;

    const [products] = await pool.execute(
      `SELECT p.product_id, p.title, p.description, p.status, p.created_at,
              COUNT(DISTINCT pv.variant_code) as variant_count,
              MIN(pv.list_price) as min_price,
              MAX(pv.list_price) as max_price,
              SUM(pv.stock_qty) as total_stock,
              (SELECT TOP (1) pi.url FROM product_image pi 
               WHERE pi.product_id = p.product_id 
               ORDER BY pi.image_id ASC) as image_url
       FROM product p
       LEFT JOIN product_variant pv ON p.product_id = pv.product_id
       WHERE p.seller_id = ?
       GROUP BY p.product_id, p.title, p.description, p.status, p.created_at
       ORDER BY p.created_at DESC`,
      [sellerId]
    );

    res.json(products);
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// GET /api/seller/products/:id - Lấy chi tiết 1 sản phẩm
router.get('/products/:id', authenticateToken, requireSeller, async (req, res) => {
  try {
    const productId = req.params.id;

    // Lấy thông tin sản phẩm
    const [products] = await pool.execute(
      `SELECT p.*, 
              (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'category_id', c.category_id,
                'category_name', c.category_name
              ))
              FROM product_category pc
              JOIN category c ON pc.category_id = c.category_id
              WHERE pc.product_id = p.product_id) as categories,
              (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'image_id', pi.product_image_id,
                'image_url', pi.image_url,
                'display_order', pi.display_order
              ) ORDER BY pi.display_order)
              FROM product_image pi
              WHERE pi.product_id = p.product_id) as images
       FROM product p
       WHERE p.product_id = ? AND p.seller_id = ?`,
      [productId, req.user.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Lấy variants
    const [variants] = await pool.execute(
      `SELECT * FROM product_variant WHERE product_id = ? ORDER BY variant_id`,
      [productId]
    );

    res.json({
      ...products[0],
      variants
    });
  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({ error: 'Failed to get product detail' });
  }
});

// POST /api/seller/products - Tạo sản phẩm mới
router.post('/products', [
  authenticateToken,
  requireSeller,
  body('title').trim().notEmpty().withMessage('Product title is required'),
  body('description').optional().trim(),
  body('category_ids').optional().isArray().withMessage('Category IDs must be an array'),
  body('variants').isArray().withMessage('Variants must be an array'),
  body('variants.*.list_price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('variants.*.stock_qty').isInt({ min: 0 }).withMessage('Stock must be non-negative'),
], async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      connection.release();
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category_ids, variants, images } = req.body;

    await connection.beginTransaction();

    // Get seller_id from user_id
    const [sellers] = await connection.execute(
      'SELECT seller_id FROM seller WHERE user_id = ?',
      [req.user.id]
    );

    if (sellers.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(403).json({ error: 'User is not a seller' });
    }

    const sellerId = sellers[0].seller_id;

    // 1. Tạo product - DB schema: seller_id, title, description, status
    const [productResult] = await connection.execute(
      `INSERT INTO product (seller_id, title, description, status)
       VALUES (?, ?, ?, 'Active')`,
      [sellerId, title, description || '']
    );

    const productId = productResult.insertId;

    // 2. Thêm categories
    if (category_ids && category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await connection.execute(
          `INSERT INTO product_category (product_id, category_id) VALUES (?, ?)`,
          [productId, categoryId]
        );
      }
    }

    // 3. Thêm variants - DB schema: product_id, variant_code (PK), sku (unique), list_price, stock_qty, is_active
    if (variants && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const variantCode = variant.variant_code || `VAR${String(i + 1).padStart(3, '0')}`;
        const sku = variant.sku || `${sellerId}-${productId}-${variantCode}`;
        
        await connection.execute(
          `INSERT INTO product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [productId, variantCode, sku, variant.list_price, variant.stock_qty]
        );
      }
    } else {
      // Nếu không có variant, tạo 1 variant mặc định
      await connection.execute(
        `INSERT INTO product_variant (product_id, variant_code, sku, list_price, stock_qty, is_active)
         VALUES (?, 'DEFAULT', ?, 0, 0, 1)`,
        [productId, `${sellerId}-${productId}-DEFAULT`]
      );
    }

    // 4. Thêm images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await connection.execute(
          `INSERT INTO product_image (product_id, url) VALUES (?, ?)`,
          [productId, images[i].image_url || images[i]]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message: 'Product created successfully',
      product_id: productId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  } finally {
    connection.release();
  }
});

// PUT /api/seller/products/:id - Cập nhật sản phẩm
router.put('/products/:id', [
  authenticateToken,
  requireSeller,
  body('product_name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('is_active').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.id;
    const { product_name, description, is_active } = req.body;

    // Kiểm tra quyền sở hữu
    const [products] = await pool.execute(
      `SELECT p.product_id
       FROM product p
       JOIN seller s ON p.seller_id = s.seller_id
       WHERE p.product_id = ? AND s.user_id = ?`,
      [productId, req.user.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    const statusValue =
      typeof is_active === 'boolean' ? (is_active ? 'Active' : 'Hidden') : null;

    await pool.execute(
      `UPDATE product 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           status = COALESCE(?, status)
       WHERE product_id = ?`,
      [product_name, description, statusValue, productId]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/seller/products/:id - Xóa sản phẩm (soft delete)
router.delete('/products/:id', authenticateToken, requireSeller, async (req, res) => {
  try {
    const productId = req.params.id;

    // Kiểm tra quyền sở hữu
    const [products] = await pool.execute(
      `SELECT product_id FROM product WHERE product_id = ? AND seller_id = ?`,
      [productId, req.user.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    // Soft delete - set is_active = 0
    await pool.execute(
      `UPDATE product SET is_active = 0 WHERE product_id = ?`,
      [productId]
    );

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// PUT /api/seller/products/:id/variants/:variantId - Cập nhật variant
router.put('/products/:id/variants/:variantId', [
  authenticateToken,
  requireSeller,
  body('price').optional().isFloat({ min: 0 }),
  body('stock_quantity').optional().isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: productId, variantId } = req.params;
    const { price, stock_quantity, variant_name } = req.body;

    // Kiểm tra quyền sở hữu product
    const [products] = await pool.execute(
      `SELECT product_id FROM product WHERE product_id = ? AND seller_id = ?`,
      [productId, req.user.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    await pool.execute(
      `UPDATE product_variant 
       SET price = COALESCE(?, price),
           stock_quantity = COALESCE(?, stock_quantity),
           variant_name = COALESCE(?, variant_name)
       WHERE product_variant_id = ? AND product_id = ?`,
      [price, stock_quantity, variant_name, variantId, productId]
    );

    res.json({ message: 'Variant updated successfully' });
  } catch (error) {
    console.error('Update variant error:', error);
    res.status(500).json({ error: 'Failed to update variant' });
  }
});

// GET /api/seller/orders - Lấy đơn hàng của shop
router.get('/orders', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { status } = req.query;

    // Lấy seller_id từ user hiện tại
    const [sellers] = await pool.execute(
      'SELECT seller_id FROM seller WHERE user_id = ?',
      [req.user.id]
    );

    if (sellers.length === 0) {
      return res.status(403).json({ error: 'User is not a seller' });
    }

    const sellerId = sellers[0].seller_id;

    let query = `
      SELECT 
        o.order_id,
        o.order_date      AS created_at,
        o.status          AS order_status,
        o.total_amount,
        ua.display_name   AS customer_name,
        ua.email          AS customer_email,
        COUNT(DISTINCT oi.line_no) AS item_count
      FROM orders o
      JOIN order_item oi ON o.order_id = oi.order_id
      JOIN product p     ON p.product_id = oi.product_id
      JOIN buyer b       ON b.user_id = o.buyer_id
      JOIN user_account ua ON ua.user_id = b.user_id
      WHERE p.seller_id = ?
    `;

    const params = [sellerId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += `
      GROUP BY o.order_id, o.order_date, o.status, o.total_amount, ua.display_name, ua.email
      ORDER BY o.order_date DESC
    `;

    const [orders] = await pool.execute(query, params);

    res.json(orders);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get seller orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// GET /api/seller/stats - Thống kê của seller
router.get('/stats', authenticateToken, requireSeller, async (req, res) => {
  try {
    // Tổng sản phẩm
    const [productCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM product WHERE seller_id = ? AND is_active = 1`,
      [req.user.id]
    );

    // Tổng đơn hàng
    const [orderCount] = await pool.execute(
      `SELECT COUNT(DISTINCT o.order_id) as total
       FROM \`order\` o
       JOIN order_item oi ON o.order_id = oi.order_id
       JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id
       JOIN product p ON pv.product_id = p.product_id
       WHERE p.seller_id = ?`,
      [req.user.id]
    );

    // Doanh thu
    const [revenue] = await pool.execute(
      `SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total
       FROM order_item oi
       JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id
       JOIN product p ON pv.product_id = p.product_id
       JOIN \`order\` o ON oi.order_id = o.order_id
       WHERE p.seller_id = ? AND o.order_status IN ('pending', 'processing', 'shipped', 'delivered')`,
      [req.user.id]
    );

    // Sản phẩm bán chạy
    const [topProducts] = await pool.execute(
      `SELECT p.product_name, SUM(oi.quantity) as total_sold
       FROM order_item oi
       JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id
       JOIN product p ON pv.product_id = p.product_id
       WHERE p.seller_id = ?
       GROUP BY p.product_id
       ORDER BY total_sold DESC
       LIMIT 5`,
      [req.user.id]
    );

    res.json({
      products: productCount[0].total,
      orders: orderCount[0].total,
      revenue: revenue[0].total,
      topProducts
    });
  } catch (error) {
    console.error('Get seller stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
