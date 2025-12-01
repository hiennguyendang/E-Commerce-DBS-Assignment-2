const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('phone').optional().isString(),
  body('dateOfBirth').optional().isISO8601().toDate()
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      connection.release();
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName = '', lastName = '', phone = null, dateOfBirth } = req.body;

    const [existing] = await connection.execute(
      'SELECT user_id FROM user_account WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    await connection.beginTransaction();

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const displayName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
    let userNameBase = email.split('@')[0].replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 30) || `user${Date.now()}`;
    let userName = userNameBase;

    let suffix = 1;
    while (true) {
      const [u] = await connection.execute('SELECT 1 FROM user_account WHERE user_name = ?', [userName]);
      if (u.length === 0) break;
      userName = `${userNameBase}${suffix++}`;
    }

    const dob = dateOfBirth ? new Date(dateOfBirth) : new Date('1970-01-01');

    const [result] = await connection.execute(
      `INSERT INTO user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, displayName, userName, phone, dob]
    );

    const userId = result.insertId;

    await connection.execute('INSERT INTO buyer (user_id) VALUES (?)', [userId]);

    await connection.commit();
    connection.release();

    const token = jwt.sign(
      { id: userId, email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        firstName: displayName,
        lastName: '',
        role: 'customer',
        userName,
        phone
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
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email, password: '***' });

    const [users] = await pool.execute(
      `SELECT ua.user_id, ua.email, ua.password_hash, ua.display_name, ua.user_name, ua.phone_number,
              CASE WHEN a.user_id IS NOT NULL THEN 'admin'
                   WHEN s.user_id IS NOT NULL THEN 'seller'
                   ELSE 'customer' END AS role
       FROM user_account ua
       LEFT JOIN admin a ON a.user_id = ua.user_id
       LEFT JOIN seller s ON s.user_id = ua.user_id
       WHERE ua.email = ?`,
      [email]
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
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const roleMap = {
      'admin': 'Admin',
      'seller': 'Seller',
      'customer': 'Buyer'
    };

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.display_name,
        role: roleMap[user.role] || 'Buyer',
        userName: user.user_name,
        phone: user.phone_number
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
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