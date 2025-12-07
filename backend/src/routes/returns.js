const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// ============================================
// BUYER - Create return request
// ============================================
router.post('/create', [
  authenticateToken,
  body('orderId').isInt().withMessage('Order ID is required'),
  body('lineNo').isInt().withMessage('Line number is required'),
  body('reason').notEmpty().trim().withMessage('Reason is required'),
  body('description').optional().trim()
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      connection.release();
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, lineNo, reason, description } = req.body;
    const buyerId = req.user.id;

    console.log('📦 Create return request:', { orderId, lineNo, buyerId, reason });

    // Verify order exists and belongs to buyer
    const [orders] = await connection.execute(
      `SELECT o.order_id, o.buyer_id, o.total_amount, o.status, o.order_date,
              p.seller_id
       FROM orders o
       INNER JOIN order_item oi ON o.order_id = oi.order_id
       INNER JOIN product p ON oi.product_id = p.product_id
       WHERE o.order_id = ? AND o.buyer_id = ?
       GROUP BY o.order_id, o.buyer_id, o.total_amount, o.status, o.order_date, p.seller_id`,
      [orderId, buyerId]
    );

    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Order not found or access denied' });
    }

    const order = orders[0];

    // Check if order is eligible for return (must be Delivered or Completed)
    if (!['Delivered', 'Completed'].includes(order.status)) {
      connection.release();
      return res.status(400).json({ 
        error: 'Đơn hàng phải được giao thành công trước khi yêu cầu đổi trả' 
      });
    }

    // Check if within 7 days of delivery
    const deliveredDate = new Date(order.order_date); // Thực tế nên dùng delivered_at nếu có
    const now = new Date();
    const daysSinceDelivery = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));

    if (daysSinceDelivery > 7) {
      connection.release();
      return res.status(400).json({ 
        error: `Đã quá thời hạn đổi trả (7 ngày). Đơn hàng đã được giao ${daysSinceDelivery} ngày trước.` 
      });
    }

    // Check if return request already exists for this item
    const [existing] = await connection.execute(
      'SELECT return_request_id FROM return_request WHERE order_id = ? AND line_no = ?',
      [orderId, lineNo]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ 
        error: 'Return request already exists for this item' 
      });
    }

    // Verify line item exists
    const [lineItems] = await connection.execute(
      'SELECT line_no, product_id FROM order_item WHERE order_id = ? AND line_no = ?',
      [orderId, lineNo]
    );

    if (lineItems.length === 0) {
      connection.release();
      return res.status(400).json({ 
        error: 'Invalid line item for this order' 
      });
    }

    await connection.beginTransaction();

    // Create return request
    const [result] = await connection.execute(
      `INSERT INTO return_request (
        order_id, line_no, buyer_id, seller_id, reason, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, N'Pending')`,
      [orderId, lineNo, buyerId, order.seller_id, reason, description || null]
    );

    const returnRequestId = result.insertId;

    await connection.commit();
    connection.release();

    console.log('✅ Return request created:', returnRequestId);

    res.status(201).json({
      message: 'Return request created successfully',
      returnRequestId,
      status: 'Pending'
    });

  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    connection.release();
    console.error('Create return request error:', error);
    res.status(500).json({ error: 'Failed to create return request' });
  }
});

// ============================================
// BUYER - Get my return requests
// ============================================
router.get('/buyer', authenticateToken, async (req, res) => {
  try {
    const buyerId = req.user.id;

    const [requests] = await pool.execute(
      `SELECT 
        rr.return_request_id,
        rr.order_id,
        rr.reason,
        rr.description,
        rr.status,
        rr.seller_response,
        rr.refund_amount,
        rr.request_date,
        rr.response_date,
        rr.refunded_at,
        o.total_amount,
        o.order_date,
        s.shop_name,
        ua.display_name as seller_name
       FROM return_request rr
       INNER JOIN orders o ON rr.order_id = o.order_id
       INNER JOIN seller s ON rr.seller_id = s.user_id
       INNER JOIN user_account ua ON s.user_id = ua.user_id
       WHERE rr.buyer_id = ?
       ORDER BY rr.request_date DESC`,
      [buyerId]
    );

    res.json({ requests });

  } catch (error) {
    console.error('Get buyer return requests error:', error);
    res.status(500).json({ error: 'Failed to fetch return requests' });
  }
});

// ============================================
// SELLER - Get return requests for my shop
// ============================================
router.get('/seller', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.user.id;

    const [requests] = await pool.execute(
      `SELECT 
        rr.return_request_id,
        rr.order_id,
        rr.reason,
        rr.description,
        rr.status,
        rr.seller_response,
        rr.refund_amount,
        rr.request_date,
        rr.response_date,
        rr.refunded_at,
        o.total_amount,
        o.order_date,
        ua.display_name as buyer_name,
        ua.email as buyer_email
       FROM return_request rr
       INNER JOIN orders o ON rr.order_id = o.order_id
       INNER JOIN user_account ua ON rr.buyer_id = ua.user_id
       WHERE rr.seller_id = ?
       ORDER BY rr.request_date DESC`,
      [sellerId]
    );

    res.json({ requests });

  } catch (error) {
    console.error('Get seller return requests error:', error);
    res.status(500).json({ error: 'Failed to fetch return requests' });
  }
});

// ============================================
// SELLER - Respond to return request
// ============================================
router.post('/respond/:id', [
  authenticateToken,
  body('action').isIn(['approve', 'reject']).withMessage('Invalid action'),
  body('response').optional().trim(),
  body('refundAmount').optional().isFloat({ min: 0 })
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      connection.release();
      return res.status(400).json({ errors: errors.array() });
    }

    const returnRequestId = req.params.id;
    const { action, response, refundAmount } = req.body;
    const sellerId = req.user.id;

    console.log('📝 Seller respond to return request:', { returnRequestId, action });

    // Verify return request exists and belongs to seller
    const [requests] = await connection.execute(
      `SELECT rr.return_request_id, rr.order_id, rr.status, o.total_amount
       FROM return_request rr
       INNER JOIN orders o ON rr.order_id = o.order_id
       WHERE rr.return_request_id = ? AND rr.seller_id = ?`,
      [returnRequestId, sellerId]
    );

    if (requests.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Return request not found or access denied' });
    }

    const request = requests[0];

    if (request.status !== 'Pending') {
      connection.release();
      return res.status(400).json({ 
        error: 'Return request has already been processed' 
      });
    }

    await connection.beginTransaction();

    const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
    const finalRefundAmount = action === 'approve' 
      ? (refundAmount || request.total_amount) 
      : null;

    // Update return request
    await connection.execute(
      `UPDATE return_request 
       SET status = ?, 
           seller_response = ?, 
           response_date = GETDATE(),
           refund_amount = ?
       WHERE return_request_id = ?`,
      [newStatus, response || null, finalRefundAmount, returnRequestId]
    );

    // If approved, update order status
    if (action === 'approve') {
      await connection.execute(
        `UPDATE orders SET status = N'Returned' WHERE order_id = ?`,
        [request.order_id]
      );
    }

    await connection.commit();
    connection.release();

    console.log('✅ Return request responded:', { returnRequestId, action, newStatus });

    res.json({
      message: `Return request ${action}d successfully`,
      status: newStatus,
      refundAmount: finalRefundAmount
    });

  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    connection.release();
    console.error('Respond to return request error:', error);
    res.status(500).json({ error: 'Failed to respond to return request' });
  }
});

// ============================================
// SELLER - Process refund
// ============================================
router.post('/refund/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const returnRequestId = req.params.id;
    const sellerId = req.user.id;

    console.log('💰 Process refund:', { returnRequestId });

    // Verify return request
    const [requests] = await connection.execute(
      `SELECT return_request_id, status, refund_amount
       FROM return_request 
       WHERE return_request_id = ? AND seller_id = ?`,
      [returnRequestId, sellerId]
    );

    if (requests.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Return request not found or access denied' });
    }

    const request = requests[0];

    if (request.status !== 'Approved') {
      connection.release();
      return res.status(400).json({ 
        error: 'Return request must be approved before processing refund' 
      });
    }

    await connection.beginTransaction();

    // Update return request status
    await connection.execute(
      `UPDATE return_request 
       SET status = N'Completed', 
           refunded_at = GETDATE()
       WHERE return_request_id = ?`,
      [returnRequestId]
    );

    await connection.commit();
    connection.release();

    console.log('✅ Refund processed:', returnRequestId);

    res.json({
      message: 'Refund processed successfully',
      status: 'Completed',
      refundAmount: request.refund_amount
    });

  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    connection.release();
    console.error('Process refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// ============================================
// BUYER - Cancel return request
// ============================================
router.post('/cancel/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const returnRequestId = req.params.id;
    const buyerId = req.user.id;

    console.log('❌ Cancel return request:', { returnRequestId });

    // Verify return request
    const [requests] = await connection.execute(
      `SELECT return_request_id, status
       FROM return_request 
       WHERE return_request_id = ? AND buyer_id = ?`,
      [returnRequestId, buyerId]
    );

    if (requests.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Return request not found or access denied' });
    }

    const request = requests[0];

    if (!['Pending', 'Rejected'].includes(request.status)) {
      connection.release();
      return res.status(400).json({ 
        error: 'Cannot cancel return request in current status' 
      });
    }

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE return_request 
       SET status = N'Cancelled'
       WHERE return_request_id = ?`,
      [returnRequestId]
    );

    await connection.commit();
    connection.release();

    console.log('✅ Return request cancelled:', returnRequestId);

    res.json({
      message: 'Return request cancelled successfully',
      status: 'Cancelled'
    });

  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    connection.release();
    console.error('Cancel return request error:', error);
    res.status(500).json({ error: 'Failed to cancel return request' });
  }
});

module.exports = router;
