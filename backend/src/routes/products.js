const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireSellerOrAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    const params = [];
    let where = `p.status = 'Active'`;

    if (search) {
      where += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      where += ' AND EXISTS (SELECT 1 FROM product_category pc WHERE pc.product_id = p.product_id AND pc.category_id = ?)';
      params.push(category);
    }

    if (minPrice) {
      where += ' AND EXISTS (SELECT 1 FROM product_variant v WHERE v.product_id = p.product_id AND v.is_active = 1 AND v.list_price >= ?)';
      params.push(minPrice);
    }
    if (maxPrice) {
      where += ' AND EXISTS (SELECT 1 FROM product_variant v WHERE v.product_id = p.product_id AND v.is_active = 1 AND v.list_price <= ?)';
      params.push(maxPrice);
    }

    const validSort = ['created_at', 'min_price', 'title'];
    const sortKey = validSort.includes(sort) ? sort : 'created_at';
    const orderKey = (order || '').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const listSql = `
      SELECT 
        p.product_id AS id,
        p.title AS name,
        p.created_at,
        'active' AS status,
        COALESCE(
          (SELECT MIN(v.list_price) FROM product_variant v WHERE v.product_id = p.product_id AND v.is_active = 1),
          0
        ) AS min_price,
        COALESCE(
          (SELECT SUM(v.stock_qty) FROM product_variant v WHERE v.product_id = p.product_id AND v.is_active = 1),
          0
        ) AS stock_quantity,
        (SELECT TOP (1) img.url FROM product_image img WHERE img.product_id = p.product_id ORDER BY img.image_id ASC) AS primary_image
      FROM product p
      WHERE ${where}
      ORDER BY ${sortKey === 'min_price' ? 'min_price' : sortKey} ${orderKey}
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    const [rows] = await pool.execute(listSql, params);

    const countSql = `SELECT COUNT(*) AS total FROM product p WHERE ${where}`;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0].total;

    const products = rows.map(r => ({
      id: r.id,
      name: r.name,
      price: r.min_price,
      sale_price: null,
      stock_quantity: r.stock_quantity,
      status: r.status,
      primary_image: r.primary_image,
      created_at: r.created_at
    }));

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: parseInt(page) < Math.ceil(total / limit),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/featured/list', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT TOP (8)
         p.product_id AS id,
         p.title AS name,
         p.created_at,
         COALESCE((SELECT MIN(v.list_price) FROM product_variant v WHERE v.product_id = p.product_id AND v.is_active = 1), 0) AS price,
         (SELECT TOP (1) img.url FROM product_image img WHERE img.product_id = p.product_id ORDER BY img.image_id ASC) AS primary_image
       FROM product p
       WHERE p.status = 'Active'
       ORDER BY p.created_at DESC
       `
    );

    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      sale_price: null,
      primary_image: r.primary_image,
      status: 'active'
    })));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Public: get all active products of a given seller (by seller_id)
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;

    const [sellerRows] = await pool.execute(
      `SELECT 
         s.seller_id,
         s.shop_name,
         s.rating_avg,
         ua.display_name AS owner_name,
         ua.email       AS owner_email
       FROM seller s
       JOIN user_account ua ON ua.user_id = s.user_id
       WHERE s.seller_id = ?`,
      [sellerId]
    );

    if (sellerRows.length === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const seller = sellerRows[0];

    const [productRows] = await pool.execute(
      `SELECT 
         p.product_id AS id,
         p.title      AS name,
         p.created_at,
         'active'     AS status,
         COALESCE((SELECT MIN(v.list_price) FROM product_variant v WHERE v.product_id = p.product_id AND v.is_active = 1), 0) AS min_price,
         COALESCE((SELECT SUM(v.stock_qty) FROM product_variant v WHERE v.product_id = p.product_id AND v.is_active = 1), 0) AS stock_quantity,
         (SELECT TOP (1) img.url FROM product_image img WHERE img.product_id = p.product_id ORDER BY img.image_id ASC) AS primary_image
       FROM product p
       WHERE p.status = 'Active' AND p.seller_id = ?
       ORDER BY p.created_at DESC`,
      [sellerId]
    );

    const products = productRows.map((r) => ({
      id: r.id,
      name: r.name,
      price: r.min_price,
      sale_price: null,
      stock_quantity: r.stock_quantity,
      status: r.status,
      primary_image: r.primary_image,
      created_at: r.created_at,
    }));

    res.json({ seller, products });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ error: 'Failed to fetch seller products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [pRows] = await pool.execute(
      `SELECT 
         p.product_id AS id, 
         p.title      AS name, 
         p.description, 
         p.created_at, 
         p.status,
         s.seller_id,
         s.shop_name,
         s.rating_avg,
         s.user_id    AS seller_user_id,
         ua.display_name AS seller_owner_name
       FROM product p 
       JOIN seller s       ON s.seller_id = p.seller_id
       JOIN user_account ua ON ua.user_id = s.user_id
       WHERE p.product_id = ? AND p.status = 'Active'`,
      [id]
    );
    if (pRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = pRows[0];

    const [metaRows] = await pool.execute(
      `SELECT MIN(list_price) AS min_price, MAX(list_price) AS max_price, SUM(stock_qty) AS total_stock
       FROM product_variant WHERE product_id = ? AND is_active = 1`,
      [id]
    );

    const [images] = await pool.execute(
      `SELECT url AS image_url, caption AS alt_text
       FROM product_image WHERE product_id = ? ORDER BY image_id ASC`,
      [id]
    );

    const [cats] = await pool.execute(
      `SELECT c.category_id AS id, c.name
       FROM product_category pc JOIN category c ON c.category_id = pc.category_id
       WHERE pc.product_id = ?`,
      [id]
    );

    const [variants] = await pool.execute(
      `SELECT product_id, variant_code, sku, list_price, stock_qty, is_active
       FROM product_variant WHERE product_id = ? ORDER BY variant_code ASC`,
      [id]
    );

    res.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: metaRows[0]?.min_price || 0,
      sale_price: null,
      stock_quantity: metaRows[0]?.total_stock || 0,
      status: 'active',
      images,
      categories: cats,
      variants: variants.map(v => ({
        variant_code: v.variant_code,
        sku: v.sku,
        price: v.list_price,
        stock: v.stock_qty,
        is_active: v.is_active === 1 || v.is_active === true,
      })),
      created_at: product.created_at,
      seller: {
        id: product.seller_id,
        user_id: product.seller_user_id,
        shop_name: product.shop_name,
        rating_avg: product.rating_avg,
        owner_name: product.seller_owner_name,
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
