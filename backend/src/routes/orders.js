const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const decodeItemId = (id) => {
  const [p, v] = String(id || '').split(':');
  return { productId: parseInt(p, 10), variantCode: v };
};

const vnStatus = (s) => {
  const map = {
    Pending: 'Đang xử lý',
    Paid: 'Đã thanh toán',
    Packing: 'Đang đóng gói',
    Shipped: 'Đang giao',
    Completed: 'Đã giao',
    Cancelled: 'Đã hủy',
    Refunded: 'Hoàn tiền',
  };
  return map[s] || s;
};

const statusLabel = (s) => {
  const map = {
    Pending: 'Đang xử lý',
    Paid: 'Đã thanh toán',
    Packing: 'Đang đóng gói',
    Shipped: 'Đang giao',
    Completed: 'Hoàn thành',
    Cancelled: 'Đã hủy',
    Refunded: 'Hoàn tiền',
  };
  return map[s] || s;
};

// Danh sách đơn hàng của buyer hiện tại
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT order_id, order_date, status, total_amount
       FROM orders
       WHERE buyer_id = ?
       ORDER BY order_date DESC`,
      [req.user.id]
    );

    const data = rows.map((r) => ({
      id: r.order_id,
      code: `ORD${String(r.order_id).padStart(6, '0')}`,
      date: r.order_date,
      total: Number(r.total_amount),
      status: statusLabel(r.status),
    }));

    res.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Chi tiết 1 đơn hàng (buyer / seller / admin)
router.get('/:id', authenticateToken, async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  if (!orderId) {
    return res.status(400).json({ error: 'Invalid order id' });
  }

  try {
    // Header + thông tin buyer
    const [headerRows] = await pool.execute(
      `SELECT 
         o.order_id,
         o.order_date,
         o.status,
         o.total_amount,
         o.shipping_fee,
         o.ship_to_address_id,
         o.buyer_id,
         ua.display_name AS buyer_name,
         ua.email        AS buyer_email
       FROM orders o
       JOIN user_account ua ON ua.user_id = o.buyer_id
       WHERE o.order_id = ?`,
      [orderId]
    );

    if (headerRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const header = headerRows[0];

    // Authorize by role
    const role = (req.user.role || '').toLowerCase();

    if (role === 'customer') {
      if (header.buyer_id !== req.user.id) {
        return res.status(404).json({ error: 'Order not found' });
      }
    } else if (role === 'seller') {
      const [owned] = await pool.execute(
        `SELECT 1 
         FROM order_item oi
         JOIN product p ON p.product_id = oi.product_id
         JOIN seller s  ON s.seller_id = p.seller_id
         WHERE oi.order_id = ? AND s.user_id = ?`,
        [orderId, req.user.id]
      );

      if (owned.length === 0) {
        return res.status(403).json({ error: 'Access denied for this order' });
      }
    } else if (role === 'admin') {
      // admin luôn được phép
    } else {
      return res.status(403).json({ error: 'Access denied for this order' });
    }

    // Địa chỉ giao hàng
    const [addrRows] = await pool.execute(
      `SELECT recipient_name, phone, line1, city, country, postal_code
       FROM address
       WHERE address_id = ?`,
      [header.ship_to_address_id]
    );

    const shippingAddress = addrRows.length
      ? {
          recipient_name: addrRows[0].recipient_name,
          phone: addrRows[0].phone,
          address: addrRows[0].line1,
          city: addrRows[0].city,
          country: addrRows[0].country,
          postal_code: addrRows[0].postal_code,
        }
      : null;

    // Thông tin shop (seller)
    const [sellerRows] = await pool.execute(
      `SELECT TOP (1)
         p.seller_id,
         s.shop_name
       FROM order_item oi
       JOIN product p ON p.product_id = oi.product_id
       JOIN seller s ON s.seller_id = p.seller_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    const seller = sellerRows.length
      ? {
          id: sellerRows[0].seller_id,
          shop_name: sellerRows[0].shop_name,
        }
      : null;

    const [itemRows] = await pool.execute(
      `SELECT 
         oi.line_no,
         oi.product_id,
         p.title,
         oi.variant_code,
         oi.qty,
         oi.unit_price
       FROM order_item oi
       JOIN product p ON p.product_id = oi.product_id
       WHERE oi.order_id = ?
       ORDER BY oi.line_no`,
      [orderId]
    );

    const items = itemRows.map((it) => ({
      line_no: it.line_no,
      product_id: it.product_id,
      name: it.title,
      variant: it.variant_code,
      qty: Number(it.qty),
      unit_price: Number(it.unit_price),
      line_total: Number(it.unit_price) * Number(it.qty),
    }));

    const subtotal = items.reduce((sum, it) => sum + it.line_total, 0);

    res.json({
      id: header.order_id,
      code: `ORD${String(header.order_id).padStart(6, '0')}`,
      date: header.order_date,
      status: header.status,
      status_label: statusLabel(header.status),
      subtotal,
      shipping_fee: Number(header.shipping_fee),
      total: Number(header.total_amount),
      seller,
      buyer: {
        id: header.buyer_id,
        name: header.buyer_name,
        email: header.buyer_email,
      },
      shipping_address: shippingAddress,
      items,
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ error: 'Failed to fetch order detail' });
  }
});

module.exports = router;

async function ensureBuyerExists(connection, userId) {
  const [b] = await connection.execute('SELECT 1 FROM buyer WHERE user_id = ?', [
    userId,
  ]);
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

// Tạo đơn hàng mới từ giỏ hàng
router.post(
  '/',
  [
    authenticateToken,
    body('shipping_address.recipient_name')
      .notEmpty()
      .withMessage('Recipient name is required'),
    body('shipping_address.phone').notEmpty().withMessage('Phone is required'),
    body('shipping_address.address')
      .notEmpty()
      .withMessage('Address is required'),
    body('shipping_address.city').notEmpty().withMessage('City is required'),
  ],
  async (req, res) => {
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

      const cartId = await getOrCreateActiveCart(connection, userId);

      const selectedItems = Array.isArray(req.body.selected_items)
        ? req.body.selected_items.filter(
            (x) => typeof x === 'string' && x.includes(':')
          )
        : [];

      let itemsQuery = `SELECT 
         ci.product_id,
         ci.variant_code,
         ci.qty,
         v.list_price AS unit_price,
         p.seller_id,
         p.title
       FROM cart_item ci
       JOIN product_variant v ON v.product_id = ci.product_id AND v.variant_code = ci.variant_code AND v.is_active = 1
       JOIN product p ON p.product_id = ci.product_id AND p.status = 'Active'
       WHERE ci.cart_id = ?`;

      const params = [cartId];

      if (selectedItems.length > 0) {
        const conditions = [];
        for (const encoded of selectedItems) {
          const { productId, variantCode } = decodeItemId(encoded);
          if (!productId || !variantCode) continue;
          conditions.push('(ci.product_id = ? AND ci.variant_code = ?)');
          params.push(productId, variantCode);
        }

        if (conditions.length === 0) {
          await connection.rollback();
          connection.release();
          return res
            .status(400)
            .json({ error: 'No valid cart items selected' });
        }

        itemsQuery += ` AND (${conditions.join(' OR ')})`;
      }

      const [items] = await connection.execute(itemsQuery, params);

      if (selectedItems.length > 0 && items.length !== selectedItems.length) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          error:
            'Một hoặc nhiều sản phẩm không còn trong giỏ hàng. Vui lòng tải lại giỏ hàng và thử lại.',
        });
      }

      if (items.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Business rule: một đơn hàng chỉ chứa sản phẩm từ đúng một shop
      const sellerSet = new Set(items.map((it) => it.seller_id));
      if (sellerSet.size > 1) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          error:
            'Giỏ hàng đang chứa sản phẩm từ nhiều shop khác nhau. Vui lòng chỉ thanh toán các sản phẩm thuộc cùng một shop trong mỗi đơn hàng.',
        });
      }

      let subtotal = 0;
      for (const it of items) {
        subtotal += Number(it.unit_price) * Number(it.qty);
      }
      const shippingFee = subtotal > 500000 ? 0 : 50000;
      const totalAmount = subtotal + shippingFee;

      const serviceId = await getOrCreateDefaultService(connection);

      const sa = req.body.shipping_address || {};
      const recipientName =
        sa.recipient_name || `${req.user.first_name || ''}`.trim() || 'Receiver';
      const phone = sa.phone || req.user.phone || '';
      const line1 = sa.address;
      const city = sa.city || '';
      const postal = sa.postal_code || '';
      const country = sa.country || 'VN';
      const [addrToIns] = await connection.execute(
        `INSERT INTO address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [userId, recipientName, phone, line1, city, country, postal]
      );
      const shipToId = addrToIns.insertId;

      const firstSellerId = items[0].seller_id;
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
        const [insSellerAddr] = await connection.execute(
          `INSERT INTO address (seller_id, recipient_name, phone, line1, city, country, is_default)
         VALUES (?, ?, ?, ?, ?, 'VN', 1)`,
          [firstSellerId, 'Warehouse', '', 'Seller Warehouse', 'HCM']
        );
        shipFromId = insSellerAddr.insertId;
      }

      const [orderIns] = await connection.execute(
        `INSERT INTO orders (buyer_id, ship_to_address_id, ship_from_address_id, service_id, shipping_fee, status, total_amount)
       VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
        [userId, shipToId, shipFromId, serviceId, shippingFee, totalAmount]
      );
      const orderId = orderIns.insertId;

      let lineNo = 1;
      for (const it of items) {
        await connection.execute(
          `INSERT INTO order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, lineNo++, it.product_id, it.variant_code, it.qty, it.unit_price]
        );
      }

      if (selectedItems.length > 0) {
        const deleteConditions = [];
        const deleteParams = [cartId];
        for (const encoded of selectedItems) {
          const { productId, variantCode } = decodeItemId(encoded);
          if (!productId || !variantCode) continue;
          deleteConditions.push('(product_id = ? AND variant_code = ?)');
          deleteParams.push(productId, variantCode);
        }

        if (deleteConditions.length > 0) {
          await connection.execute(
            `DELETE FROM cart_item WHERE cart_id = ? AND (${deleteConditions.join(
              ' OR '
            )})`,
            deleteParams
          );
        }

        const [remaining] = await connection.execute(
          `SELECT 1 FROM cart_item WHERE cart_id = ?`,
          [cartId]
        );
        if (remaining.length === 0) {
          await connection.execute(
            `UPDATE cart SET status = 'CheckedOut' WHERE cart_id = ?`,
            [cartId]
          );
        }
      } else {
        await connection.execute(`DELETE FROM cart_item WHERE cart_id = ?`, [
          cartId,
        ]);
        await connection.execute(
          `UPDATE cart SET status = 'CheckedOut' WHERE cart_id = ?`,
          [cartId]
        );
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: orderId,
          code: `ORD${String(orderId).padStart(6, '0')}`,
          total: totalAmount,
          status: statusLabel('Pending'),
        },
      });
    } catch (error) {
      try {
        await connection.rollback();
      } catch (_) {}
      connection.release();
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);
