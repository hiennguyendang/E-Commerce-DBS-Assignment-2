const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// GET Invoice for Order
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
      // If not buyer, check if seller
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

    // Get invoice
    const [invoices] = await pool.execute(
      `SELECT 
         invoice_id,
         order_id,
         invoice_number,
         issue_date,
         due_date,
         subtotal,
         tax_rate,
         tax_amount,
         shipping_fee,
         grand_total,
         invoice_type,
         tax_code,
         company_name,
         company_address,
         payment_status,
         created_at,
         updated_at
       FROM invoice
       WHERE order_id = ?`,
      [orderId]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found for this order' });
    }

    const invoice = invoices[0];

    // Get invoice items
    const [items] = await pool.execute(
      `SELECT 
         ii.line_no,
         ii.product_id,
         ii.variant_code,
         ii.description,
         ii.qty,
         ii.unit_price,
         ii.tax_rate,
         ii.tax_amount,
         ii.line_subtotal,
         ii.line_total
       FROM invoice_item ii
       WHERE ii.invoice_id = ?
       ORDER BY ii.line_no`,
      [invoice.invoice_id]
    );

    res.json({
      invoice: {
        id: invoice.invoice_id,
        invoiceNumber: invoice.invoice_number,
        orderId: invoice.order_id,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        subtotal: Number(invoice.subtotal),
        taxRate: Number(invoice.tax_rate),
        taxAmount: Number(invoice.tax_amount),
        shippingFee: Number(invoice.shipping_fee),
        grandTotal: Number(invoice.grand_total),
        invoiceType: invoice.invoice_type,
        taxCode: invoice.tax_code,
        companyName: invoice.company_name,
        companyAddress: invoice.company_address,
        paymentStatus: invoice.payment_status,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at
      },
      items: items.map(item => ({
        lineNo: item.line_no,
        productId: item.product_id,
        variantCode: item.variant_code,
        description: item.description,
        qty: Number(item.qty),
        unitPrice: Number(item.unit_price),
        taxRate: Number(item.tax_rate),
        taxAmount: Number(item.tax_amount),
        subtotal: Number(item.line_subtotal),
        total: Number(item.line_total)
      }))
    });

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to retrieve invoice' });
  }
});

// ============================================
// GET Invoice by ID
// ============================================
router.get('/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Get invoice with order info
    const [invoices] = await pool.execute(
      `SELECT 
         i.*,
         o.buyer_id,
         o.seller_id
       FROM invoice i
       JOIN orders o ON o.order_id = i.order_id
       WHERE i.invoice_id = ?`,
      [invoiceId]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoices[0];
    const role = (req.user.role || '').toLowerCase();

    // Authorization check
    if (invoice.buyer_id !== req.user.id && role !== 'admin') {
      if (role === 'seller') {
        const [sellerCheck] = await pool.execute(
          'SELECT user_id FROM seller WHERE seller_id = ?',
          [invoice.seller_id]
        );
        if (sellerCheck.length === 0 || sellerCheck[0].user_id !== req.user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get invoice items
    const [items] = await pool.execute(
      `SELECT * FROM invoice_item WHERE invoice_id = ? ORDER BY line_no`,
      [invoiceId]
    );

    res.json({
      invoice: {
        id: invoice.invoice_id,
        invoiceNumber: invoice.invoice_number,
        orderId: invoice.order_id,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        subtotal: Number(invoice.subtotal),
        taxRate: Number(invoice.tax_rate),
        taxAmount: Number(invoice.tax_amount),
        shippingFee: Number(invoice.shipping_fee),
        grandTotal: Number(invoice.grand_total),
        invoiceType: invoice.invoice_type,
        paymentStatus: invoice.payment_status
      },
      items: items.map(item => ({
        lineNo: item.line_no,
        description: item.description,
        qty: Number(item.qty),
        unitPrice: Number(item.unit_price),
        taxRate: Number(item.tax_rate),
        taxAmount: Number(item.tax_amount),
        subtotal: Number(item.line_subtotal),
        total: Number(item.line_total)
      }))
    });

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to retrieve invoice' });
  }
});

module.exports = router;
