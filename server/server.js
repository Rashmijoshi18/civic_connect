require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const problemsRoutes = require('./routes/problemsRoutes');
const solutionsRoutes = require('./routes/solutionsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const usersRoutes = require('./routes/usersRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      process.env.CLIENT_URL,        // set this in Vercel env vars
    ].filter(Boolean);

    if (!origin || allowed.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/solutions', solutionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CivicConnect API is running.', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: true, message: 'Route not found.' });
});

// Global error handler (must be last)
app.use(errorHandler);

// ─── Start Server (skipped on Vercel serverless) ─────────────────────────────

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ CivicConnect API running on http://localhost:${PORT}`);
    console.log(`📁 Uploads served from /${uploadDir}`);
  });
}

module.exports = app;
