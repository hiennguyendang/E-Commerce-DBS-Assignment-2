const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireSellerOrAdmin } = require('../middleware/auth');

// GET /api/reports/seller/stats - use stored procedure sp_get_seller_stats
router.get('/seller/stats', authenticateToken, requireSellerOrAdmin, async (req, res) => {
  try {
    // Get seller_id from current user
    const [sellers] = await pool.execute(
      'SELECT seller_id FROM seller WHERE user_id = ?',
      [req.user.id]
    );

    if (sellers.length === 0) {
      return res.status(403).json({ error: 'User is not a seller' });
    }

    const sellerId = sellers[0].seller_id;

    // Call stored procedure sp_get_seller_stats
    const [rows] = await pool.query('CALL sp_get_seller_stats(?)', [sellerId]);

    // mysql2: first element is an array of rows
    const statsRows = Array.isArray(rows) ? rows[0] : null;
    const stats =
      Array.isArray(statsRows) && statsRows.length > 0
        ? statsRows[0]
        : { products: 0, orders: 0, revenue: 0 };

    res.json({
      products: Number(stats.products || 0),
      orders: Number(stats.orders || 0),
      revenue: Number(stats.revenue || 0),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get seller stats via SP error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;

