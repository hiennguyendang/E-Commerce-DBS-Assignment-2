const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const loadUserWithRole = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT 
       ua.user_id,
       ua.email,
       ua.display_name,
       ua.user_name,
       ua.phone_number,
       ua.created_at,
       CASE 
         WHEN a.user_id IS NOT NULL THEN 'Admin'
         WHEN s.user_id IS NOT NULL THEN 'Seller'
         ELSE 'Customer'
       END AS role
     FROM user_account ua
     LEFT JOIN admin a ON a.user_id = ua.user_id
     LEFT JOIN seller s ON s.user_id = ua.user_id
     WHERE ua.user_id = ?`,
    [userId]
  );
  return rows[0];
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await loadUserWithRole(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = {
      id: user.user_id,
      email: user.email,
      first_name: user.display_name, // map display_name to first_name for compatibility
      last_name: '',
      role: user.role,
      created_at: user.created_at,
      user_name: user.user_name,
      phone: user.phone_number
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `Required role: ${roles.join(' or ')}, your role: ${req.user.role}`
      });
    }

    next();
  };
};

const requireAdmin = requireRole('Admin');

const requireSellerOrAdmin = requireRole('Seller', 'Admin');

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSellerOrAdmin
};