require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jobRoutes = require('./routes/jobRoutes');
const { db } = require('./config/firebase');
const startJobScheduler = require('./scheduler/jobScheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    database: 'Firebase Firestore',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'HirQube Job Aggregation API',
    version: '1.0.0',
    database: 'Firebase Firestore',
    endpoints: {
      health: 'GET /api/health',
      jobs: 'GET /api/jobs',
      jobDetail: 'GET /api/jobs/:id',
      syncAdzuna: 'POST /api/jobs/sync-adzuna',
      stats: 'GET /api/stats',
    },
  });
});

// Routes
app.use('/api/jobs', jobRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ 
    success: false,
    error: err.message || 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: Firebase Firestore`);
  console.log(`🕐 Job Scheduler: Starting...`);
  startJobScheduler();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});
