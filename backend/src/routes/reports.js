const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireSellerOrAdmin } = require('../middleware/auth');

router.get('/seller/stats', authenticateToken, requireSellerOrAdmin, async (req, res) => {
  try {
    const [sellers] = await pool.execute(
      'SELECT seller_id FROM seller WHERE user_id = ?',
      [req.user.id]
    );

    if (sellers.length === 0) {
      return res.status(403).json({ error: 'User is not a seller' });
    }

    const sellerId = sellers[0].seller_id;

    const [rows] = await pool.execute('EXEC dbo.sp_get_seller_stats ?', [sellerId]);

    const statsRow = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    const stats = statsRow || { products: 0, orders: 0, revenue: 0 };

    res.json({
      products: Number(stats.products || 0),
      orders: Number(stats.orders || 0),
      revenue: Number(stats.revenue || 0),
    });
  } catch (error) {
    console.error('Get seller stats via SP error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;

