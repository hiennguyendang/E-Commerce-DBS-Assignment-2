const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// GET Payment for Order
// ============================================
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if user has access to this order
    const [orderCheck] = await pool.execute(
      'SELECT buyer_id, seller_id FROM orders WHERE order_id = ?',
      [orderId]
    );

    if (orderCheck.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderCheck[0];
    const role = (req.user.role || '').toLowerCase();

    // Authorization check
    if (order.buyer_id !== req.user.id && role !== 'admin') {
      if (role === 'seller') {
        const [sellerCheck] = await pool.execute(
          'SELECT user_id FROM seller WHERE seller_id = ?',
          [order.seller_id]
        );
        if (sellerCheck.length === 0 || sellerCheck[0].user_id !== req.user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get payments for this order
    const [payments] = await pool.execute(
      `SELECT 
         payment_id,
         order_id,
         amount,
         payment_method,
         status,
         transaction_id,
         payment_date,
         created_at,
         updated_at
       FROM payment
       WHERE order_id = ?
       ORDER BY created_at DESC`,
      [orderId]
    );

    res.json({
      payments: payments.map(p => ({
        id: p.payment_id,
        orderId: p.order_id,
        amount: Number(p.amount),
        method: p.payment_method,
        status: p.status,
        transactionId: p.transaction_id,
        paymentDate: p.payment_date,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }))
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to retrieve payment' });
  }
});

// ============================================
// CREATE Payment (Mock for now)
// ============================================
router.post('/create', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      connection.release();
      return res.status(400).json({ error: 'Order ID and payment method are required' });
    }

    // Check if user owns this order
    const [orders] = await connection.execute(
      'SELECT order_id, buyer_id, total_amount, status FROM orders WHERE order_id = ? AND buyer_id = ?',
      [orderId, req.user.id]
    );

    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Order not found or access denied' });
    }

    const order = orders[0];

    if (order.status !== 'Pending') {
      connection.release();
      return res.status(400).json({ error: 'Order already paid or cannot be paid' });
    }

    // Check if payment already exists
    const [existingPayments] = await connection.execute(
      'SELECT payment_id FROM payment WHERE order_id = ?',
      [orderId]
    );

    if (existingPayments.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Payment already exists for this order' });
    }

    await connection.beginTransaction();

    // Create payment record
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const [result] = await connection.execute(
      `INSERT INTO payment (
        order_id, amount, payment_method, status, transaction_id, payment_date
      ) VALUES (?, ?, ?, N'Success', ?, SYSDATETIME())`,
      [orderId, order.total_amount, paymentMethod, transactionId]
    );

    // Trigger will auto-update order status to 'Paid'

    // Update invoice payment status
    await connection.execute(
      `UPDATE invoice SET payment_status = N'Paid' WHERE order_id = ?`,
      [orderId]
    );

    await connection.commit();
    connection.release();

    console.log('✅ Payment created:', result.insertId);

    res.status(201).json({
      message: 'Payment successful',
      paymentId: result.insertId,
      transactionId,
      status: 'Success'
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

module.exports = router;
