const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Map status to Vietnamese labels expected by FE
const vnStatus = (s) => {
  const map = {
    Pending: 'Đang xử lý',
    Paid: 'Đã thanh toán',
    Packing: 'Đang đóng gói',
    Shipped: 'Đã gửi',
    Completed: 'Đã giao',
    Cancelled: 'Đã hủy',
    Refunded: 'Hoàn tiền'
  };
  return map[s] || s;
};

// GET /api/orders - return simple array for FE
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT order_id, order_date, status, total_amount
       FROM orders
       WHERE buyer_id = ?
       ORDER BY order_date DESC`,
      [req.user.id]
    );

    const data = rows.map(r => ({
      id: r.order_id,
      code: `ORD${String(r.order_id).padStart(6, '0')}`,
      date: r.order_date,
      total: Number(r.total_amount),
      status: vnStatus(r.status)
    }));

    res.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
 
// Helpers (shared with cart but re-defined here for isolation)
async function ensureBuyerExists(connection, userId) {
  const [b] = await connection.execute('SELECT 1 FROM buyer WHERE user_id = ?', [userId]);
  if (b.length === 0) {
    await connection.execute('INSERT INTO buyer (user_id) VALUES (?)', [userId]);
  }
}

async function getOrCreateActiveCart(connection, buyerId) {
  const [c] = await connection.execute(
    `SELECT TOP (1) cart_id 
     FROM cart 
     WHERE buyer_id = ? AND status = 'Active' 
     ORDER BY created_at DESC`,
    [buyerId]
  );
  if (c.length > 0) return c[0].cart_id;
  const [ins] = await connection.execute(
    `INSERT INTO cart (buyer_id, status) VALUES (?, 'Active')`,
    [buyerId]
  );
  return ins.insertId;
}

async function getOrCreateDefaultService(connection) {
  const [s] = await connection.execute(
    'SELECT TOP (1) service_id FROM shipping_service ORDER BY service_id ASC'
  );
  if (s.length > 0) return s[0].service_id;
  const [ins] = await connection.execute(
    `INSERT INTO shipping_service (carrier, service_name, est_days_min, est_days_max, base_fee, per_kg_fee)
     VALUES ('DefaultCarrier', 'Standard', 2, 5, 0, 0)`
  );
  return ins.insertId;
}

// POST /api/orders - Create order from active cart
router.post('/', [
  authenticateToken,
  body('shipping_address.recipient_name').notEmpty().withMessage('Recipient name is required'),
  body('shipping_address.phone').notEmpty().withMessage('Phone is required'),
  body('shipping_address.address').notEmpty().withMessage('Address is required'),
  body('shipping_address.city').notEmpty().withMessage('City is required')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      connection.release();
      return res.status(400).json({ errors: errors.array() });
    }

    await connection.beginTransaction();

    const userId = req.user.id;
    await ensureBuyerExists(connection, userId);

    // Load cart items
    const cartId = await getOrCreateActiveCart(connection, userId);
    const [items] = await connection.execute(
      `SELECT 
         ci.product_id,
         ci.variant_code,
         ci.qty,
         v.list_price AS unit_price,
         p.seller_id,
         p.title
       FROM cart_item ci
       JOIN product_variant v ON v.product_id = ci.product_id AND v.variant_code = ci.variant_code AND v.is_active = 1
       JOIN product p ON p.product_id = ci.product_id AND p.status = 'Active'
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (items.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Compute totals
    let subtotal = 0;
    for (const it of items) {
      subtotal += Number(it.unit_price) * Number(it.qty);
    }
    const shippingFee = subtotal > 500000 ? 0 : 50000;
    const totalAmount = subtotal + shippingFee;

    // Ensure shipping service
    const serviceId = await getOrCreateDefaultService(connection);

    // Create or reuse ship-to address for buyer
    const sa = req.body.shipping_address || {};
    const recipientName = sa.recipient_name || `${req.user.first_name || ''}`.trim() || 'Receiver';
    const phone = sa.phone || req.user.phone || '';
    const line1 = sa.address;
    const city = sa.city || '';
    const postal = sa.postal_code || '';
    const country = sa.country || 'VN';
    const [addrToIns] = await connection.execute(
      `INSERT INTO address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [userId, recipientName, phone, line1, city, country, postal]
    );
    const shipToId = addrToIns.insertId;

    // Ensure ship-from address for the first seller in items
    const firstSellerId = items[0].seller_id; // e.g. 'SEL001'
    // Try find existing address for seller
    let shipFromId = null;
    const [sellerAddr] = await connection.execute(
      `SELECT TOP (1) address_id 
       FROM address 
       WHERE seller_id = ? 
       ORDER BY is_default DESC, address_id ASC`,
      [firstSellerId]
    );
    if (sellerAddr.length > 0) {
      shipFromId = sellerAddr[0].address_id;
    } else {
      // Create a placeholder seller address
      const [insSellerAddr] = await connection.execute(
        `INSERT INTO address (seller_id, recipient_name, phone, line1, city, country, is_default)
         VALUES (?, ?, ?, ?, ?, 'VN', TRUE)`,
        [firstSellerId, 'Warehouse', '', 'Seller Warehouse', 'HCM']
      );
      shipFromId = insSellerAddr.insertId;
    }

    // Create order
    const [orderIns] = await connection.execute(
      `INSERT INTO orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
       VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
      [userId, shipToId, shipFromId, serviceId, shippingFee, totalAmount]
    );
    const orderId = orderIns.insertId;

    // Insert order items
    let lineNo = 1;
    for (const it of items) {
      await connection.execute(
        `INSERT INTO order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, lineNo++, it.product_id, it.variant_code, it.qty, it.unit_price]
      );
    }

    // Clear cart and set status
    await connection.execute(`DELETE FROM cart_item WHERE cart_id = ?`, [cartId]);
    await connection.execute(`UPDATE cart SET status = 'CheckedOut' WHERE cart_id = ?`, [cartId]);

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: orderId,
        code: `ORD${String(orderId).padStart(6, '0')}`,
        total: totalAmount,
        status: vnStatus('Pending')
      }
    });
  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    connection.release();
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});
