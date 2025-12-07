require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/returns', require('./routes/returns'));
app.use('/api/invoice', require('./routes/invoice'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/seller', require('./routes/seller'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Shopeelike Backend is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'E-Commerce API Server is running!' });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist',
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const startServer = async () => {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      console.log('===================================');
      console.log('  SHOPEELIKE BACKEND SERVER STARTED');
      console.log('===================================');
      console.log(`Server running on port: ${PORT}`);
      console.log(
        `Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`
      );
      console.log(`API Base URL: http://localhost:${PORT}/api`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;

