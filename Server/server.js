const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./Config/db');
const errorHandler = require('./middleware/errorHandler');

// --- Phase 3: Security Imports ---
const { securityHeaders, rateLimiter, preventNoSqlInjection } = require('./middleware/security');

dotenv.config();

const createApp = () => {
const app = express();

// --- Phase 3: Apply Security Headers ---
app.use(securityHeaders);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

// --- Phase 3: Payload Limits (100kb max) ---
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(preventNoSqlInjection);

// --- Phase 3: Rate Limiting for Auth Endpoints ---
const authLimiter = rateLimiter({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, 
  message: 'Too many requests from this IP, please try again after 15 minutes.' 
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Existing API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// --- Phase 3: New Application Routes ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/audit-logs', require('./routes/auditLogRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found` });
});

// Centralized Error Handler
app.use(errorHandler);

return app;
};

const app = createApp();

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`[Server] Enterprise CRM backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
