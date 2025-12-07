const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [userCount] = await pool.execute(
      'SELECT COUNT(*) AS total FROM user_account'
    );

    const [sellerCount] = await pool.execute(
      'SELECT COUNT(*) AS total FROM seller'
    );

    const [productCount] = await pool.execute(
      "SELECT COUNT(*) AS total FROM product WHERE status = 'Active'"
    );

    const [orderCount] = await pool.execute(
      'SELECT COUNT(*) AS total FROM orders'
    );

    const [revenue] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) AS total
       FROM orders
       WHERE status IN ('Pending','Paid','Packing','Shipped','Completed')`
    );

    const [ordersByStatus] = await pool.execute(
      `SELECT status, COUNT(*) AS count
       FROM orders
       GROUP BY status`
    );

    res.json({
      users: userCount[0].total,
      sellers: sellerCount[0].total,
      products: productCount[0].total,
      orders: orderCount[0].total,
      revenue: revenue[0].total,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get monthly revenue using fn_monthly_revenue function
router.get('/revenue/monthly', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);

    const [result] = await pool.execute(
      `SELECT 
        1 AS month, dbo.fn_monthly_revenue(?, 1) AS revenue
       UNION ALL SELECT 2, dbo.fn_monthly_revenue(?, 2)
       UNION ALL SELECT 3, dbo.fn_monthly_revenue(?, 3)
       UNION ALL SELECT 4, dbo.fn_monthly_revenue(?, 4)
       UNION ALL SELECT 5, dbo.fn_monthly_revenue(?, 5)
       UNION ALL SELECT 6, dbo.fn_monthly_revenue(?, 6)
       UNION ALL SELECT 7, dbo.fn_monthly_revenue(?, 7)
       UNION ALL SELECT 8, dbo.fn_monthly_revenue(?, 8)
       UNION ALL SELECT 9, dbo.fn_monthly_revenue(?, 9)
       UNION ALL SELECT 10, dbo.fn_monthly_revenue(?, 10)
       UNION ALL SELECT 11, dbo.fn_monthly_revenue(?, 11)
       UNION ALL SELECT 12, dbo.fn_monthly_revenue(?, 12)
       ORDER BY month`,
      [year, year, year, year, year, year, year, year, year, year, year, year]
    );

    res.json({
      year,
      data: result,
    });
  } catch (error) {
    console.error('Get monthly revenue error:', error);
    res.status(500).json({ error: 'Failed to get monthly revenue' });
  }
});

router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const search = req.query.search || '';
    const roleFilter = req.query.role || '';
    const offset = (page - 1) * limit;

    let query = `
      SELECT ua.user_id,
             ua.email,
             ua.user_name,
             ua.display_name,
             ua.phone_number,
             ua.created_at,
             CASE 
               WHEN a.user_id IS NOT NULL THEN 'Admin'
               WHEN s.user_id IS NOT NULL THEN 'Seller'
               ELSE 'Buyer'
             END AS role,
             s.shop_name
      FROM user_account ua
      LEFT JOIN admin a  ON ua.user_id = a.user_id
      LEFT JOIN seller s ON ua.user_id = s.user_id
      WHERE 1 = 1
    `;

    const params = [];

    if (search) {
      query += ' AND (ua.email LIKE ? OR ua.user_name LIKE ? OR ua.display_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (roleFilter) {
      if (roleFilter === 'Seller') {
        query += ' AND s.user_id IS NOT NULL';
      } else if (roleFilter === 'Admin') {
        query += ' AND a.user_id IS NOT NULL';
      } else if (roleFilter === 'Buyer') {
        query += ' AND s.user_id IS NULL AND a.user_id IS NULL';
      }
    }

    query += ` ORDER BY ua.created_at DESC
               OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    const [users] = await pool.execute(query, params);

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM user_account ua
      LEFT JOIN admin a  ON ua.user_id = a.user_id
      LEFT JOIN seller s ON ua.user_id = s.user_id
      WHERE 1 = 1
    `;

    const countParams = [];

    if (search) {
      countQuery += ' AND (ua.email LIKE ? OR ua.user_name LIKE ? OR ua.display_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (roleFilter) {
      if (roleFilter === 'Seller') {
        countQuery += ' AND s.user_id IS NOT NULL';
      } else if (roleFilter === 'Admin') {
        countQuery += ' AND a.user_id IS NOT NULL';
      } else if (roleFilter === 'Buyer') {
        countQuery += ' AND s.user_id IS NULL AND a.user_id IS NULL';
      }
    }

    const [totalResult] = await pool.execute(countQuery, countParams);
    const total = totalResult[0].total;

    res.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = parseInt(req.params.id, 10);

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await connection.beginTransaction();

    await connection.execute('DELETE FROM seller WHERE user_id = ?', [userId]);
    await connection.execute('DELETE FROM admin WHERE user_id = ?', [userId]);
    await connection.execute('DELETE FROM buyer WHERE user_id = ?', [userId]);
    await connection.execute('DELETE FROM user_account WHERE user_id = ?', [userId]);

    await connection.commit();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {}
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    connection.release();
  }
});

router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const search = req.query.search || '';
    const active = req.query.active || '';
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.product_id,
             p.title AS product_name,
             p.description,
             CASE WHEN p.status = 'Active' THEN 1 ELSE 0 END AS is_active,
             p.created_at,
             s.shop_name,
             ua.display_name AS seller_name,
             COUNT(DISTINCT pv.variant_code) AS variant_count,
             MIN(pv.list_price) AS min_price,
             MAX(pv.list_price) AS max_price,
             SUM(pv.stock_qty) AS total_stock
      FROM product p
      JOIN seller s        ON p.seller_id = s.seller_id
      JOIN user_account ua ON s.user_id = ua.user_id
      LEFT JOIN product_variant pv ON p.product_id = pv.product_id
      WHERE 1 = 1
    `;

    const params = [];

    if (search) {
      query += ' AND p.title LIKE ?';
      params.push(`%${search}%`);
    }

    if (active !== '') {
      if (active === '1') {
        query += " AND p.status = 'Active'";
      } else if (active === '0') {
        query += " AND p.status <> 'Active'";
      }
    }

    query += `
      GROUP BY p.product_id, p.title, p.description, p.status, p.created_at, s.shop_name, ua.display_name
      ORDER BY p.created_at DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    const [products] = await pool.execute(query, params);
    res.json(products);
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

router.put('/products/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;

    await pool.execute(
      `UPDATE product 
       SET status = CASE WHEN status = 'Active' THEN 'Hidden' ELSE 'Active' END
       WHERE product_id = ?`,
      [productId]
    );

    res.json({ message: 'Product status updated' });
  } catch (error) {
    console.error('Toggle product error:', error);
    res.status(500).json({ error: 'Failed to toggle product status' });
  }
});

router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const productId = req.params.id;

    await connection.beginTransaction();

    await connection.execute('DELETE FROM product_image WHERE product_id = ?', [productId]);
    await connection.execute('DELETE FROM product_category WHERE product_id = ?', [productId]);
    await connection.execute('DELETE FROM product_variant WHERE product_id = ?', [productId]);
    await connection.execute('DELETE FROM product WHERE product_id = ?', [productId]);

    await connection.commit();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {}
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  } finally {
    connection.release();
  }
});

router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const status = req.query.status || '';
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.order_id,
             o.total_amount,
             o.status       AS order_status,
             o.order_date   AS created_at,
             ua.display_name AS customer_name,
             ua.email
      FROM orders o
      JOIN buyer b         ON o.buyer_id = b.user_id
      JOIN user_account ua ON b.user_id = ua.user_id
      WHERE 1 = 1
    `;

    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += `
      ORDER BY o.order_date DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    const [orders] = await pool.execute(query, params);

    res.json(orders);
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

router.put(
  '/orders/:id/status',
  [
    authenticateToken,
    requireAdmin,
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const orderId = req.params.id;
      const statusClient = req.body.status;

      const statusMap = {
        pending: 'Pending',
        processing: 'Packing',
        shipped: 'Shipped',
        delivered: 'Completed',
        cancelled: 'Cancelled',
      };

      const dbStatus = statusMap[statusClient];

      if (!dbStatus) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      await pool.execute(
        'UPDATE orders SET status = ? WHERE order_id = ?',
        [dbStatus, orderId]
      );

      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
);

router.post('/make-admin/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    const [users] = await pool.execute(
      'SELECT user_id FROM user_account WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [admins] = await pool.execute(
      'SELECT user_id FROM admin WHERE user_id = ?',
      [userId]
    );

    if (admins.length > 0) {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    await pool.execute(
      "INSERT INTO admin (user_id, role) VALUES (?, 'SystemAdmin')",
      [userId]
    );

    res.json({ message: 'User promoted to admin successfully' });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Failed to make user admin' });
  }
});

module.exports = router;

