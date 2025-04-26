require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const logger = require('./config/logger');

const { securityMiddleware } = require('./utils/security');
const { restResponseTime, metricsMiddleware } = require('./utils/metrics');
const { authLimiter, passwordResetLimiter, apiLimiter } = require('./utils/security');

const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to the database
connectDB();

// Built-in middleware
app.use(express.json());

// Security middleware
app.use(securityMiddleware);

app.use(restResponseTime);

// Metrics endpoint
app.get('/metrics', metricsMiddleware);

// Rate limiting (applied before routes)
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);

// CSRF token endpoint
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handling
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});