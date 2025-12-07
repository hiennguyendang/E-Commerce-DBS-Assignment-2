const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('userName').notEmpty().withMessage('Username is required'),
  body('displayName').notEmpty().withMessage('Display name is required'),
  body('phoneNumber').optional().isString(),
  body('role').optional().isIn(['Buyer', 'Seller']).withMessage('Invalid role')
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      connection.release();
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      email, 
      password, 
      userName, 
      displayName, 
      phoneNumber = null, 
      role = 'Buyer',
      shopName,
      businessEmail,
      businessPhone,
      taxId,
      businessLicenseNumber
    } = req.body;

    console.log('📝 Register attempt:', { email, userName, displayName, role });

    // Check if email already exists
    const [existingEmail] = await connection.execute(
      'SELECT user_id FROM user_account WHERE email = ?',
      [email]
    );
    if (existingEmail.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check if username already exists
    const [existingUsername] = await connection.execute(
      'SELECT user_id FROM user_account WHERE user_name = ?',
      [userName]
    );
    if (existingUsername.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Username already exists' });
    }

    await connection.beginTransaction();

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const dob = new Date('1970-01-01');

    const [result] = await connection.execute(
      `INSERT INTO user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, displayName, userName, phoneNumber, dob]
    );

    const userId = result.insertId;

    // Create role-specific record
    if (role === 'Seller') {
      await connection.execute(
        `INSERT INTO seller (user_id, shop_name, business_email, business_phone, tax_id, business_license_number, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          userId,
          shopName || displayName,
          businessEmail || email,
          businessPhone || phoneNumber,
          taxId || null,
          businessLicenseNumber || null
        ]
      );
    } else {
      await connection.execute('INSERT INTO buyer (user_id) VALUES (?)', [userId]);
    }

    await connection.commit();
    connection.release();

    console.log('✅ User registered successfully:', { userId, userName, email, role });

    // Normalize role to Title Case for frontend compatibility
    const normalizedRole = role === 'Seller' ? 'Seller' : 'Customer';

    const token = jwt.sign(
      { id: userId, email, role: normalizedRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        name: displayName,
        role: normalizedRole,  // Return Title Case: Customer or Seller
        userName,
        phone: phoneNumber
      }
    });
  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    connection.release();
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', [
  body('emailOrUsername').notEmpty().withMessage('Please provide email or username'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailOrUsername, password } = req.body;

    console.log('🔐 Login attempt:', { emailOrUsername, password: '***' });

    const [users] = await pool.execute(
      `SELECT ua.user_id, ua.email, ua.password_hash, ua.display_name, ua.user_name, ua.phone_number,
              CASE WHEN a.user_id IS NOT NULL THEN 'Admin'
                   WHEN s.user_id IS NOT NULL THEN 'Seller'
                   ELSE 'Customer' END AS role,
              s.seller_id
       FROM user_account ua
       LEFT JOIN admin a ON a.user_id = ua.user_id
       LEFT JOIN seller s ON s.user_id = ua.user_id
       WHERE ua.email = ? OR ua.user_name = ?`,
      [emailOrUsername, emailOrUsername]
    );

    console.log('👤 Found users:', users.length);
    if (users.length > 0) {
      console.log('User data:', { 
        id: users[0].user_id, 
        email: users[0].email, 
        role: users[0].role,
        hasPassword: !!users[0].password_hash 
      });
    }

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Return role as-is from database (lowercase: customer, seller, admin)
    // Frontend will handle display formatting
    const userResponse = {
      id: user.user_id,
      email: user.email,
      name: user.display_name,
      role: user.role,  // Send DB role directly: customer, seller, admin
      userName: user.user_name,
      phone: user.phone_number
    };

    // Add seller_id if user is a seller
    if (user.seller_id) {
      userResponse.seller_id = user.seller_id;
    }

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/upgrade-to-seller', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      shopName,
      businessEmail,
      businessPhone,
      taxId,
      businessLicenseNumber
    } = req.body;

    const userId = req.user.id;

    console.log('🏪 Upgrade to seller attempt:', { userId, shopName });

    // Check if user is already a seller
    const [existingSeller] = await connection.execute(
      'SELECT user_id FROM seller WHERE user_id = ?',
      [userId]
    );

    if (existingSeller.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'User is already a seller' });
    }

    // Get user info for defaults
    const [users] = await connection.execute(
      'SELECT email, phone_number, display_name FROM user_account WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    await connection.beginTransaction();

    // Create seller record
    await connection.execute(
      `INSERT INTO seller (user_id, shop_name, business_email, business_phone, tax_id, business_license_number, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        userId,
        shopName || user.display_name,
        businessEmail || user.email,
        businessPhone || user.phone_number,
        taxId || null,
        businessLicenseNumber || null
      ]
    );

    // Role is derived from seller table presence, no need to update user_account

    await connection.commit();
    connection.release();

    console.log('✅ User upgraded to seller successfully:', { userId, shopName });

    res.json({
      message: 'Successfully upgraded to seller',
      seller: {
        userId,
        shopName: shopName || user.display_name
      }
    });
  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    connection.release();
    console.error('Upgrade to seller error:', error);
    res.status(500).json({ error: 'Failed to upgrade to seller' });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        role: req.user.role,
        userName: req.user.user_name,
        phone: req.user.phone,
        createdAt: req.user.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;