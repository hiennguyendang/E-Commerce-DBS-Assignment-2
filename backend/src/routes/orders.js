const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const sql = require('mssql');
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
    const pool = await getPool();
    const result = await pool.request()
      .input('buyer_id', sql.BigInt, req.user.id)
      .query(
        `SELECT order_id, order_date, status, total_amount
         FROM orders
         WHERE buyer_id = @buyer_id
         ORDER BY order_date DESC`
      );

    const data = result.recordset.map((r) => ({
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
    const pool = await getPool();
    
    // Header + thông tin buyer
    const headerResult = await pool.request()
      .input('order_id', sql.BigInt, orderId)
      .query(
        `SELECT 
           o.order_id,
           o.order_date,
           o.shipped_date,
           o.delivered_date,
           o.status,
           o.total_amount,
           o.shipping_fee,
           o.carrier_name,
           o.service_name,
           o.ship_to_address_id,
           o.ship_from_address_id,
           o.buyer_id,
           ua.display_name AS buyer_name,
           ua.email        AS buyer_email
         FROM orders o
         JOIN user_account ua ON ua.user_id = o.buyer_id
         WHERE o.order_id = @order_id`
      );
    
    const headerRows = headerResult.recordset;

    if (headerRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const header = headerRows[0];

    // Authorize by role
    const role = (req.user.role || '').toLowerCase();
    console.log('👤 Order access check:', { 
      orderId, 
      userId: req.user.id, 
      userRole: role, 
      buyerId: header.buyer_id 
    });

    // Buyer access: check if user is the buyer of this order
    if (header.buyer_id === req.user.id) {
      // User is the buyer - always allow
    } else if (role === 'seller') {
      // Seller trying to view order they're NOT the buyer of
      // Check if they sold products in this order
      const ownedResult = await pool.request()
        .input('order_id', sql.BigInt, orderId)
        .input('user_id', sql.BigInt, req.user.id)
        .query(
          `SELECT TOP 1 1 
           FROM order_item oi
           JOIN product p ON p.product_id = oi.product_id
           JOIN seller s  ON s.seller_id = p.seller_id
           WHERE oi.order_id = @order_id AND s.user_id = @user_id`
        );

      if (ownedResult.recordset.length === 0) {
        console.log('🚫 Seller access denied:', { orderId, userId: req.user.id });
        return res.status(403).json({ error: 'Access denied for this order' });
      }
    } else if (role === 'admin') {
      // Admin can view all orders
    } else {
      // Regular customer trying to view someone else's order
      return res.status(403).json({ error: 'Access denied for this order' });
    }

    // Địa chỉ giao hàng
    const addrResult = await pool.request()
      .input('address_id', sql.BigInt, header.ship_to_address_id)
      .query(
        `SELECT recipient_name, phone, line1, city, country, postal_code
         FROM address
         WHERE address_id = @address_id`
      );
    
    const addrRows = addrResult.recordset;

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

    // Địa chỉ người gửi (seller warehouse)
    const shipFromResult = await pool.request()
      .input('ship_from_id', sql.BigInt, header.ship_from_address_id || 0)
      .query(
        `SELECT recipient_name, phone, line1, city, country, postal_code
         FROM address
         WHERE address_id = @ship_from_id`
      );
    
    const shipFromRows = shipFromResult.recordset;

    const senderAddress = shipFromRows.length
      ? {
          recipient_name: shipFromRows[0].recipient_name,
          phone: shipFromRows[0].phone,
          address: shipFromRows[0].line1,
          city: shipFromRows[0].city,
          country: shipFromRows[0].country,
          postal_code: shipFromRows[0].postal_code,
        }
      : null;

    // Thông tin shop (seller) - now use seller_id from orders table
    const sellerResult = await pool.request()
      .input('order_id', sql.BigInt, orderId)
      .query(
        `SELECT 
           s.seller_id,
           s.shop_name
         FROM orders o
         JOIN seller s ON s.seller_id = o.seller_id
         WHERE o.order_id = @order_id`
      );
    
    const sellerRows = sellerResult.recordset;

    const seller = sellerRows.length
      ? {
          id: sellerRows[0].seller_id,
          shop_name: sellerRows[0].shop_name,
        }
      : null;

    const itemResult = await pool.request()
      .input('order_id', sql.BigInt, orderId)
      .query(
        `SELECT 
           oi.line_no,
           oi.product_id,
           p.title,
           oi.variant_code,
           oi.qty,
           oi.unit_price
         FROM order_item oi
         JOIN product p ON p.product_id = oi.product_id
         WHERE oi.order_id = @order_id
         ORDER BY oi.line_no`
      );
    
    const itemRows = itemResult.recordset;

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
      shipped_date: header.shipped_date,
      delivered_date: header.delivered_date,
      status: header.status,
      status_label: statusLabel(header.status),
      subtotal,
      shipping_fee: Number(header.shipping_fee),
      carrier_name: header.carrier_name,
      service_name: header.service_name,
      total: Number(header.total_amount),
      seller_id: seller?.id || null,
      shop_name: seller?.shop_name || null,
      seller,
      buyer: {
        id: header.buyer_id,
        name: header.buyer_name,
        email: header.buyer_email,
      },
      shipping_address: shippingAddress,
      sender_address: senderAddress,
      items,
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ error: 'Failed to fetch order detail' });
  }
});

// ============================================
// Helper Functions (MSSQL)
// ============================================
async function ensureBuyerExists(pool, userId) {
  const result = await pool.request()
    .input('user_id', sql.BigInt, userId)
    .query('SELECT 1 FROM buyer WHERE user_id = @user_id');
  
  if (result.recordset.length === 0) {
    await pool.request()
      .input('user_id', sql.BigInt, userId)
      .query('INSERT INTO buyer (user_id) VALUES (@user_id)');
  }
}

async function getOrCreateActiveCart(pool, buyerId) {
  const result = await pool.request()
    .input('buyer_id', sql.BigInt, buyerId)
    .query(
      `SELECT TOP 1 cart_id 
       FROM cart 
       WHERE buyer_id = @buyer_id AND status = 'Active' 
       ORDER BY created_at DESC`
    );
  
  if (result.recordset.length > 0) return result.recordset[0].cart_id;
  
  const insertResult = await pool.request()
    .input('buyer_id', sql.BigInt, buyerId)
    .query(
      `INSERT INTO cart (buyer_id, status) 
       OUTPUT INSERTED.cart_id
       VALUES (@buyer_id, 'Active')`
    );
  
  return insertResult.recordset[0].cart_id;
}

async function getOrCreateDefaultService(pool) {
  const result = await pool.request()
    .query('SELECT TOP 1 service_id FROM shipping_service ORDER BY service_id ASC');
  
  if (result.recordset.length > 0) return result.recordset[0].service_id;
  
  const insertResult = await pool.request()
    .input('carrier', sql.NVarChar(50), 'DefaultCarrier')
    .input('service_name', sql.NVarChar(80), 'Standard')
    .query(
      `INSERT INTO shipping_service (carrier, service_name, est_days_min, est_days_max, base_fee, per_kg_fee)
       OUTPUT INSERTED.service_id
       VALUES (@carrier, @service_name, 2, 5, 0, 0)`
    );
  
  return insertResult.recordset[0].service_id;
}

// ============================================
// GET /shipping-services - Lấy danh sách đơn vị vận chuyển
// ============================================
router.get('/shipping-services', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query(`SELECT 
        service_id,
        carrier,
        service_name,
        est_days_min,
        est_days_max,
        base_fee,
        per_kg_fee
      FROM shipping_service
      ORDER BY base_fee ASC, carrier ASC`);
    
    res.json({ services: result.recordset });
  } catch (error) {
    console.error('Get shipping services error:', error);
    res.status(500).json({ error: 'Failed to get shipping services' });
  }
});

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
    body('service_id').isInt().withMessage('Service ID is required'),
  ],
  async (req, res) => {
    try {
      const pool = await getPool();
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      await ensureBuyerExists(pool, userId);

      const cartId = await getOrCreateActiveCart(pool, userId);

      const selectedItems = Array.isArray(req.body.selected_items)
        ? req.body.selected_items.filter(
            (x) => typeof x === 'string' && x.includes(':')
          )
        : [];

      // Build dynamic query for cart items
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
       WHERE ci.cart_id = @cart_id`;

      const request = pool.request().input('cart_id', sql.BigInt, cartId);

      if (selectedItems.length > 0) {
        const conditions = [];
        let paramIndex = 0;
        for (const encoded of selectedItems) {
          const { productId, variantCode } = decodeItemId(encoded);
          if (!productId || !variantCode) continue;
          const pidParam = `pid${paramIndex}`;
          const vcParam = `vc${paramIndex}`;
          conditions.push(`(ci.product_id = @${pidParam} AND ci.variant_code = @${vcParam})`);
          request.input(pidParam, sql.BigInt, productId);
          request.input(vcParam, sql.NVarChar(20), variantCode);
          paramIndex++;
        }

        if (conditions.length === 0) {
          return res.status(400).json({ error: 'No valid cart items selected' });
        }

        itemsQuery += ` AND (${conditions.join(' OR ')})`;
      }

      const itemsResult = await request.query(itemsQuery);
      const items = itemsResult.recordset;

      if (selectedItems.length > 0 && items.length !== selectedItems.length) {
        return res.status(400).json({
          error: 'Một hoặc nhiều sản phẩm không còn trong giỏ hàng. Vui lòng tải lại giỏ hàng và thử lại.',
        });
      }

      if (items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Check stock availability
      for (const item of items) {
        const stockResult = await pool.request()
          .input('product_id', sql.BigInt, item.product_id)
          .input('variant_code', sql.NVarChar(20), item.variant_code)
          .query('SELECT stock_qty FROM product_variant WHERE product_id = @product_id AND variant_code = @variant_code');
        
        if (stockResult.recordset.length === 0 || stockResult.recordset[0].stock_qty < item.qty) {
          return res.status(400).json({ 
            error: `Sản phẩm "${item.title}" không đủ hàng trong kho. Còn lại: ${stockResult.recordset[0]?.stock_qty || 0}, Yêu cầu: ${item.qty}` 
          });
        }
      }

      // Check if user is seller trying to buy own products
      const sellerCheckResult = await pool.request()
        .input('user_id', sql.BigInt, userId)
        .query('SELECT seller_id FROM seller WHERE user_id = @user_id');
      
      if (sellerCheckResult.recordset.length > 0) {
        const userSellerId = sellerCheckResult.recordset[0].seller_id;
        const buyingOwnProduct = items.some(item => item.seller_id === userSellerId);
        
        if (buyingOwnProduct) {
          return res.status(400).json({ 
            error: 'Bạn không thể mua sản phẩm của chính cửa hàng mình.' 
          });
        }
      }

      const firstSellerId = items[0].seller_id;
      const sellerSet = new Set(items.map((it) => it.seller_id));
      if (sellerSet.size > 1) {
        return res.status(400).json({
          error: 'Giỏ hàng đang chứa sản phẩm từ nhiều shop khác nhau. Vui lòng chỉ thanh toán các sản phẩm thuộc cùng một shop trong mỗi đơn hàng.',
        });
      }

      let subtotal = 0;
      for (const it of items) {
        subtotal += Number(it.unit_price) * Number(it.qty);
      }
      
      // Get shipping service
      const serviceId = req.body.service_id || await getOrCreateDefaultService(pool);
      const serviceResult = await pool.request()
        .input('service_id', sql.SmallInt, serviceId)
        .query('SELECT carrier, service_name, base_fee FROM shipping_service WHERE service_id = @service_id');
      
      const shippingFee = serviceResult.recordset.length > 0 ? Number(serviceResult.recordset[0].base_fee) : 0;
      const carrierName = serviceResult.recordset.length > 0 ? serviceResult.recordset[0].carrier : null;
      const serviceName = serviceResult.recordset.length > 0 ? serviceResult.recordset[0].service_name : null;
      const totalAmount = subtotal + shippingFee;

      // Insert shipping address
      const sa = req.body.shipping_address || {};
      const recipientName = sa.recipient_name || `${req.user.first_name || ''}`.trim() || 'Receiver';
      const phone = sa.phone || req.user.phone || '';
      const line1 = sa.address;
      const city = sa.city || '';
      const postal = sa.postal_code || '';
      const country = sa.country || 'VN';
      
      const addrResult = await pool.request()
        .input('buyer_id', sql.BigInt, userId)
        .input('recipient_name', sql.NVarChar(100), recipientName)
        .input('phone', sql.NVarChar(20), phone)
        .input('line1', sql.NVarChar(255), line1)
        .input('city', sql.NVarChar(100), city)
        .input('country', sql.Char(2), country)
        .input('postal_code', sql.NVarChar(20), postal)
        .query(
          `INSERT INTO address (buyer_id, recipient_name, phone, line1, city, country, postal_code, is_default)
           OUTPUT INSERTED.address_id
           VALUES (@buyer_id, @recipient_name, @phone, @line1, @city, @country, @postal_code, 1)`
        );
      const shipToId = addrResult.recordset[0].address_id;

      // Get or create seller address
      let shipFromId = null;
      const sellerAddrResult = await pool.request()
        .input('seller_id', sql.Char(6), firstSellerId)
        .query(
          `SELECT TOP 1 address_id 
           FROM address 
           WHERE seller_id = @seller_id 
           ORDER BY is_default DESC, address_id ASC`
        );
      
      if (sellerAddrResult.recordset.length > 0) {
        shipFromId = sellerAddrResult.recordset[0].address_id;
      } else {
        const insSellerAddrResult = await pool.request()
          .input('seller_id', sql.Char(6), firstSellerId)
          .query(
            `INSERT INTO address (seller_id, recipient_name, phone, line1, city, country, is_default)
             OUTPUT INSERTED.address_id
             VALUES (@seller_id, 'Warehouse', '', 'Seller Warehouse', 'HCM', 'VN', 1)`
          );
        shipFromId = insSellerAddrResult.recordset[0].address_id;
      }

      // Create order
      const orderResult = await pool.request()
        .input('buyer_id', sql.BigInt, userId)
        .input('seller_id', sql.Char(6), firstSellerId)
        .input('ship_to_address_id', sql.BigInt, shipToId)
        .input('ship_from_address_id', sql.BigInt, shipFromId)
        .input('service_id', sql.SmallInt, serviceId)
        .input('carrier_name', sql.NVarChar(50), carrierName)
        .input('service_name', sql.NVarChar(80), serviceName)
        .input('shipping_fee', sql.Decimal(12, 2), shippingFee)
        .input('total_amount', sql.Decimal(14, 2), totalAmount)
        .query(
          `INSERT INTO orders (buyer_id, seller_id, ship_to_address_id, ship_from_address_id, service_id, carrier_name, service_name, shipping_fee, status, total_amount)
           OUTPUT INSERTED.order_id
           VALUES (@buyer_id, @seller_id, @ship_to_address_id, @ship_from_address_id, @service_id, @carrier_name, @service_name, @shipping_fee, 'Pending', @total_amount)`
        );
      const orderId = orderResult.recordset[0].order_id;

      // Insert order items and deduct inventory
      let lineNo = 1;
      for (const it of items) {
        await pool.request()
          .input('order_id', sql.BigInt, orderId)
          .input('line_no', sql.Int, lineNo++)
          .input('product_id', sql.BigInt, it.product_id)
          .input('variant_code', sql.NVarChar(20), it.variant_code)
          .input('qty', sql.Int, it.qty)
          .input('unit_price', sql.Decimal(12, 2), it.unit_price)
          .query(
            `INSERT INTO order_item (order_id, line_no, product_id, variant_code, qty, unit_price)
             VALUES (@order_id, @line_no, @product_id, @variant_code, @qty, @unit_price)`
          );
        
        // Deduct inventory
        await pool.request()
          .input('qty', sql.Int, it.qty)
          .input('product_id', sql.BigInt, it.product_id)
          .input('variant_code', sql.NVarChar(20), it.variant_code)
          .query(
            `UPDATE product_variant 
             SET stock_qty = stock_qty - @qty 
             WHERE product_id = @product_id AND variant_code = @variant_code AND stock_qty >= @qty`
          );
      }

      // Clear cart items
      if (selectedItems.length > 0) {
        const deleteReq = pool.request().input('cart_id', sql.BigInt, cartId);
        const deleteConditions = [];
        let delIndex = 0;
        for (const encoded of selectedItems) {
          const { productId, variantCode } = decodeItemId(encoded);
          if (!productId || !variantCode) continue;
          const pidParam = `dpid${delIndex}`;
          const vcParam = `dvc${delIndex}`;
          deleteConditions.push(`(product_id = @${pidParam} AND variant_code = @${vcParam})`);
          deleteReq.input(pidParam, sql.BigInt, productId);
          deleteReq.input(vcParam, sql.NVarChar(20), variantCode);
          delIndex++;
        }

        if (deleteConditions.length > 0) {
          await deleteReq.query(
            `DELETE FROM cart_item WHERE cart_id = @cart_id AND (${deleteConditions.join(' OR ')})`
          );
        }

        const remainingResult = await pool.request()
          .input('cart_id', sql.BigInt, cartId)
          .query('SELECT 1 FROM cart_item WHERE cart_id = @cart_id');
        
        if (remainingResult.recordset.length === 0) {
          await pool.request()
            .input('cart_id', sql.BigInt, cartId)
            .query(`UPDATE cart SET status = 'CheckedOut' WHERE cart_id = @cart_id`);
        }
      } else {
        await pool.request()
          .input('cart_id', sql.BigInt, cartId)
          .query(`DELETE FROM cart_item WHERE cart_id = @cart_id`);
        
        await pool.request()
          .input('cart_id', sql.BigInt, cartId)
          .query(`UPDATE cart SET status = 'CheckedOut' WHERE cart_id = @cart_id`);
      }

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
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

// ============================================
// PUT /:id/status - Update order status (Seller only)
// ============================================
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const userId = req.user.id;
    const pool = await getPool();

    if (!orderId || !status) {
      return res.status(400).json({ error: 'Order ID and status are required' });
    }

    // Valid statuses
    const validStatuses = ['Pending', 'Paid', 'Packing', 'Shipped', 'Completed', 'Cancelled', 'Refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user is the seller of this order
    const checkResult = await pool.request()
      .input('order_id', sql.BigInt, orderId)
      .input('user_id', sql.BigInt, userId)
      .query(`
        SELECT o.order_id, o.status as current_status
        FROM orders o
        JOIN seller s ON s.seller_id = o.seller_id
        WHERE o.order_id = @order_id AND s.user_id = @user_id
      `);

    if (checkResult.recordset.length === 0) {
      return res.status(403).json({ error: 'Access denied - not your order' });
    }

    // Build update query based on status
    let updateQuery = 'UPDATE orders SET status = @status';
    const request = pool.request()
      .input('order_id', sql.BigInt, orderId)
      .input('status', sql.NVarChar(20), status);

    // Auto-set dates based on status
    if (status === 'Shipped') {
      updateQuery += ', shipped_date = SYSDATETIME()';
    } else if (status === 'Completed') {
      updateQuery += ', delivered_date = SYSDATETIME()';
    }

    updateQuery += ' WHERE order_id = @order_id';

    await request.query(updateQuery);

    res.json({ 
      message: 'Order status updated successfully',
      status: statusLabel(status)
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
