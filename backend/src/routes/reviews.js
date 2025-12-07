const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const sql = require('mssql');

// Get reviews for a product
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const pool = await getPool();

    // Get all reviews for this product
    const reviewsResult = await pool.request()
      .input('product_id', sql.BigInt, productId)
      .query(`SELECT 
        r.review_id,
        r.rating,
        r.content,
        r.created_at,
        ua.display_name AS buyer_name,
        'ORD' + RIGHT('000000' + CAST(o.order_id AS VARCHAR(6)), 6) AS order_code
      FROM review r
      JOIN order_item oi ON r.order_id = oi.order_id AND r.line_no = oi.line_no
      JOIN orders o ON r.order_id = o.order_id
      JOIN user_account ua ON r.buyer_id = ua.user_id
      WHERE oi.product_id = @product_id
      ORDER BY r.created_at DESC`);

    // Calculate statistics
    const statsResult = await pool.request()
      .input('product_id', sql.BigInt, productId)
      .query(`SELECT 
        COUNT(*) AS total,
        AVG(CAST(rating AS FLOAT)) AS average,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS star_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS star_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS star_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS star_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS star_1
      FROM review r
      JOIN order_item oi ON r.order_id = oi.order_id AND r.line_no = oi.line_no
      WHERE oi.product_id = @product_id`);

    const stats = {
      total: parseInt(statsResult.recordset[0].total) || 0,
      average: parseFloat(statsResult.recordset[0].average) || 0,
      distribution: {
        5: parseInt(statsResult.recordset[0].star_5) || 0,
        4: parseInt(statsResult.recordset[0].star_4) || 0,
        3: parseInt(statsResult.recordset[0].star_3) || 0,
        2: parseInt(statsResult.recordset[0].star_2) || 0,
        1: parseInt(statsResult.recordset[0].star_1) || 0,
      },
    };

    res.json({ reviews: reviewsResult.recordset, stats });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Create a review
router.post('/reviews', authenticateToken, async (req, res) => {
  try {
    const { order_id, line_no, rating, content } = req.body;
    const userId = req.user.id;
    const pool = await getPool();

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user is buyer of this order
    console.log('🔍 Review validation:', { order_id, userId, userType: typeof userId });
    
    const orderCheck = await pool.request()
      .input('order_id', sql.BigInt, order_id)
      .input('user_id', sql.BigInt, userId)
      .query(`SELECT buyer_id FROM orders WHERE order_id = @order_id AND buyer_id = @user_id`);

    console.log('📋 Order check result:', { 
      found: orderCheck.recordset.length,
      buyerId: orderCheck.recordset[0]?.buyer_id 
    });

    if (orderCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order item exists
    const itemCheck = await pool.request()
      .input('order_id', sql.BigInt, order_id)
      .input('line_no', sql.Int, line_no)
      .query(`SELECT product_id FROM order_item WHERE order_id = @order_id AND line_no = @line_no`);

    if (itemCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    // Check if review already exists
    const existingReview = await pool.request()
      .input('order_id', sql.BigInt, order_id)
      .input('line_no', sql.Int, line_no)
      .query(`SELECT review_id FROM review WHERE order_id = @order_id AND line_no = @line_no`);

    if (existingReview.recordset.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this item' });
    }

    // Create review
    await pool.request()
      .input('order_id', sql.BigInt, order_id)
      .input('line_no', sql.Int, line_no)
      .input('buyer_id', sql.BigInt, userId)
      .input('rating', sql.Int, rating)
      .input('content', sql.NVarChar, content || null)
      .query(`INSERT INTO review (order_id, line_no, buyer_id, rating, content)
              VALUES (@order_id, @line_no, @buyer_id, @rating, @content)`);

    res.json({ message: 'Review created successfully' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get buyer's reviews
router.get('/reviews/my-reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await getPool();

    const result = await pool.request()
      .input('buyer_id', sql.BigInt, userId)
      .query(`SELECT 
        r.review_id,
        r.order_id,
        r.line_no,
        r.rating,
        r.content,
        r.created_at,
        'ORD' + RIGHT('000000' + CAST(o.order_id AS VARCHAR(6)), 6) AS order_code,
        p.title AS product_name,
        oi.variant_code
      FROM review r
      JOIN orders o ON r.order_id = o.order_id
      JOIN order_item oi ON r.order_id = oi.order_id AND r.line_no = oi.line_no
      JOIN product p ON oi.product_id = p.product_id
      WHERE r.buyer_id = @buyer_id
      ORDER BY r.created_at DESC`);

    res.json(result.recordset);
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Get reviewable items (completed orders without reviews)
router.get('/reviews/reviewable', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await getPool();

    const result = await pool.request()
      .input('buyer_id', sql.BigInt, userId)
      .query(`SELECT 
        o.order_id,
        'ORD' + RIGHT('000000' + CAST(o.order_id AS VARCHAR(6)), 6) AS order_code,
        oi.line_no,
        oi.product_id,
        p.title AS product_name,
        oi.variant_code,
        oi.qty,
        oi.unit_price
      FROM orders o
      JOIN order_item oi ON o.order_id = oi.order_id
      JOIN product p ON oi.product_id = p.product_id
      WHERE o.buyer_id = @buyer_id
        AND o.status IN ('Completed', 'Delivered')
        AND NOT EXISTS (
          SELECT 1 FROM review r 
          WHERE r.order_id = o.order_id AND r.line_no = oi.line_no
        )
      ORDER BY o.order_date DESC`);

    res.json(result.recordset);
  } catch (error) {
    console.error('Get reviewable items error:', error);
    res.status(500).json({ error: 'Failed to get reviewable items' });
  }
});

// ========== ADMIN REVIEW MANAGEMENT ==========

// Get all reviews (Admin only)
router.get('/admin/reviews', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const { page = 1, limit = 20, rating, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '';
    const params = [];
    
    if (rating) {
      whereClause += ' AND r.rating = @rating';
    }
    
    if (search) {
      whereClause += ' AND (p.title LIKE @search OR r.content LIKE @search OR ua.display_name LIKE @search)';
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM review r
      JOIN order_item oi ON r.order_id = oi.order_id AND r.line_no = oi.line_no
      JOIN product p ON oi.product_id = p.product_id
      JOIN user_account ua ON r.buyer_id = ua.user_id
      WHERE 1=1 ${whereClause}
    `;

    const request = pool.request();
    if (rating) request.input('rating', sql.Int, parseInt(rating));
    if (search) request.input('search', sql.NVarChar, `%${search}%`);

    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Get reviews with pagination
    const dataQuery = `
      SELECT 
        r.review_id,
        r.order_id,
        r.line_no,
        r.rating,
        r.content,
        r.created_at,
        'ORD' + RIGHT('000000' + CAST(r.order_id AS VARCHAR(6)), 6) AS order_code,
        ua.display_name AS buyer_name,
        ua.email AS buyer_email,
        p.product_id,
        p.title AS product_name,
        oi.variant_code
      FROM review r
      JOIN order_item oi ON r.order_id = oi.order_id AND r.line_no = oi.line_no
      JOIN product p ON oi.product_id = p.product_id
      JOIN user_account ua ON r.buyer_id = ua.user_id
      WHERE 1=1 ${whereClause}
      ORDER BY r.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const request2 = pool.request();
    if (rating) request2.input('rating', sql.Int, parseInt(rating));
    if (search) request2.input('search', sql.NVarChar, `%${search}%`);
    request2.input('offset', sql.Int, offset);
    request2.input('limit', sql.Int, parseInt(limit));

    const dataResult = await request2.query(dataQuery);

    res.json({
      reviews: dataResult.recordset,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReviews: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Admin get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Get review statistics (Admin only)
router.get('/admin/reviews/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_reviews,
        AVG(CAST(rating AS FLOAT)) AS average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS star_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS star_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS star_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS star_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS star_1,
        COUNT(DISTINCT buyer_id) AS unique_reviewers
      FROM review
    `);

    const stats = result.recordset[0];

    res.json({
      total_reviews: parseInt(stats.total_reviews) || 0,
      average_rating: parseFloat(stats.average_rating) || 0,
      distribution: {
        5: parseInt(stats.star_5) || 0,
        4: parseInt(stats.star_4) || 0,
        3: parseInt(stats.star_3) || 0,
        2: parseInt(stats.star_2) || 0,
        1: parseInt(stats.star_1) || 0,
      },
      unique_reviewers: parseInt(stats.unique_reviewers) || 0
    });
  } catch (error) {
    console.error('Admin get review stats error:', error);
    res.status(500).json({ error: 'Failed to get review statistics' });
  }
});

// Delete a review (Admin only)
router.delete('/admin/reviews/:reviewId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const pool = await getPool();

    // Check if review exists
    const checkResult = await pool.request()
      .input('review_id', sql.BigInt, reviewId)
      .query('SELECT review_id FROM review WHERE review_id = @review_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Delete review
    await pool.request()
      .input('review_id', sql.BigInt, reviewId)
      .query('DELETE FROM review WHERE review_id = @review_id');

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
