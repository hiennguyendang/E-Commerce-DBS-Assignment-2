const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const ensureBuyerExists = async (connection, userId) => {
  const [b] = await connection.execute('SELECT 1 FROM buyer WHERE user_id = ?', [userId]);
  if (b.length === 0) {
    await connection.execute('INSERT INTO buyer (user_id) VALUES (?)', [userId]);
  }
};

const getOrCreateActiveCart = async (connection, buyerId) => {
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
};

const encodeItemId = (productId, variantCode) => `${productId}:${variantCode}`;
const decodeItemId = (id) => {
  const [p, v] = id.split(':');
  return { productId: parseInt(p, 10), variantCode: v };
};

router.get('/', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await ensureBuyerExists(connection, req.user.id);
    const cartId = await getOrCreateActiveCart(connection, req.user.id);

    const [rows] = await connection.execute(
      `SELECT 
         ci.product_id,
         ci.variant_code,
         ci.qty AS quantity,
         p.title AS name,
         p.seller_id,
         s.shop_name AS seller_name,
         COALESCE((SELECT TOP (1) url FROM product_image img WHERE img.product_id = p.product_id ORDER BY image_id ASC), '') AS image,
         v.list_price AS price
       FROM cart_item ci
       JOIN cart c ON c.cart_id = ci.cart_id AND c.status = 'Active'
       JOIN product p ON p.product_id = ci.product_id AND p.status = 'Active'
       JOIN seller s ON s.seller_id = p.seller_id
       JOIN product_variant v ON v.product_id = ci.product_id AND v.variant_code = ci.variant_code AND v.is_active = 1
       WHERE c.cart_id = ?
       ORDER BY ci.added_at DESC`,
      [cartId]
    );

    const items = rows.map(r => ({
      id: encodeItemId(r.product_id, r.variant_code),
      productId: r.product_id,
      variant: r.variant_code,
      name: r.name,
      seller_id: r.seller_id,
      seller_name: r.seller_name,
      image: r.image,
      price: Number(r.price),
      quantity: r.quantity
    }));

    res.json(items);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  } finally {
    connection.release();
  }
});

router.post('/items', [
  authenticateToken,
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('variant_code').optional().isString().isLength({ min: 1, max: 20 }),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      connection.release();
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, variant_code: variantCodeInput, quantity } = req.body;

    const [pRows] = await connection.execute(
      `SELECT p.product_id, p.title, p.status, p.seller_id, s.user_id AS seller_user_id
       FROM product p
       JOIN seller s ON s.seller_id = p.seller_id
       WHERE p.product_id = ?`,
      [product_id]
    );
    if (pRows.length === 0 || pRows[0].status !== 'Active') {
      connection.release();
      return res.status(404).json({ error: 'Product not found or inactive' });
    }

    // Prevent seller from buying their own product
    if (pRows[0].seller_user_id === req.user.id) {
      connection.release();
      return res.status(403).json({ error: 'Sellers cannot purchase their own products' });
    }

    let variantCode = variantCodeInput;
    if (!variantCode) {
      const [vPick] = await connection.execute(
        `SELECT TOP (1) variant_code, list_price, stock_qty 
         FROM product_variant 
         WHERE product_id = ? AND is_active = 1 AND stock_qty > 0 
         ORDER BY list_price ASC`,
        [product_id]
      );
      if (vPick.length === 0) {
        connection.release();
        return res.status(400).json({ error: 'No available variant' });
      }
      variantCode = vPick[0].variant_code;
    }

    const [vRows] = await connection.execute(
      `SELECT list_price, stock_qty FROM product_variant WHERE product_id = ? AND variant_code = ? AND is_active = 1`,
      [product_id, variantCode]
    );
    if (vRows.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'Variant not available' });
    }
    if (vRows[0].stock_qty < quantity) {
      connection.release();
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    await ensureBuyerExists(connection, req.user.id);
    const cartId = await getOrCreateActiveCart(connection, req.user.id);

    const [exist] = await connection.execute(
      `SELECT qty FROM cart_item WHERE cart_id = ? AND product_id = ? AND variant_code = ?`,
      [cartId, product_id, variantCode]
    );

    if (exist.length > 0) {
      const newQty = exist[0].qty + quantity;
      if (newQty > vRows[0].stock_qty) {
        connection.release();
        return res.status(400).json({ error: 'Total quantity exceeds available stock' });
      }
      await connection.execute(
        `UPDATE cart_item SET qty = ?, added_at = CURRENT_TIMESTAMP WHERE cart_id = ? AND product_id = ? AND variant_code = ?`,
        [newQty, cartId, product_id, variantCode]
      );
      return res.json({
        message: 'Cart updated successfully',
        id: encodeItemId(product_id, variantCode),
        quantity: newQty
      });
    }

    await connection.execute(
      `INSERT INTO cart_item (cart_id, product_id, variant_code, qty) VALUES (?, ?, ?, ?)`,
      [cartId, product_id, variantCode, quantity]
    );

    res.status(201).json({
      message: 'Item added to cart successfully',
      id: encodeItemId(product_id, variantCode),
      quantity
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  } finally {
    connection.release();
  }
});

router.put('/items/:id', [
  authenticateToken,
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      connection.release();
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity } = req.body;
    const { productId, variantCode } = decodeItemId(id);

    await ensureBuyerExists(connection, req.user.id);
    const cartId = await getOrCreateActiveCart(connection, req.user.id);

    const [vRows] = await connection.execute(
      `SELECT stock_qty FROM product_variant WHERE product_id = ? AND variant_code = ? AND is_active = 1`,
      [productId, variantCode]
    );
    if (vRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Variant not found' });
    }
    if (quantity > vRows[0].stock_qty) {
      connection.release();
      return res.status(400).json({ error: 'Quantity exceeds available stock' });
    }

    const [affected] = await connection.execute(
      `UPDATE cart_item SET qty = ? WHERE cart_id = ? AND product_id = ? AND variant_code = ?`,
      [quantity, cartId, productId, variantCode]
    );
    if (affected.affectedRows === 0) {
      connection.release();
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Cart item updated successfully', quantity });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  } finally {
    connection.release();
  }
});

router.delete('/items/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { productId, variantCode } = decodeItemId(id);

    await ensureBuyerExists(connection, req.user.id);
    const cartId = await getOrCreateActiveCart(connection, req.user.id);

    const [result] = await connection.execute(
      `DELETE FROM cart_item WHERE cart_id = ? AND product_id = ? AND variant_code = ?`,
      [cartId, productId, variantCode]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  } finally {
    connection.release();
  }
});

router.delete('/', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await ensureBuyerExists(connection, req.user.id);
    const cartId = await getOrCreateActiveCart(connection, req.user.id);

    await connection.execute('DELETE FROM cart_item WHERE cart_id = ?', [cartId]);

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  } finally {
    connection.release();
  }
});

module.exports = router;
