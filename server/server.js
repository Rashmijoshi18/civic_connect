require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const problemsRoutes = require('./routes/problemsRoutes');
const solutionsRoutes = require('./routes/solutionsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const usersRoutes = require('./routes/usersRoutes');

const path = require('path');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, serverless internal calls)
    if (!origin) return callback(null, true);

    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      process.env.CLIENT_URL,
    ].filter(Boolean);

    const isAllowed =
      allowed.some(o => origin === o || origin.startsWith(o)) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve local uploads folder (useful during local development)
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Root API Greeting
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CivicConnect Backend API is running.',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      problems: '/api/problems',
      solutions: '/api/solutions',
      admin: '/api/admin',
      users: '/api/users'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'CivicConnect API endpoint root',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/solutions', solutionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CivicConnect API is running.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler (must be last)
app.use(errorHandler);

// ─── Start Server (skipped on Vercel serverless) ─────────────────────────────

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ CivicConnect API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
