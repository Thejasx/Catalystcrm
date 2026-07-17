const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// dotenv config removed for Vercel

// Establish MongoDB connection
require('./backend/config/mongoose');

// Import Models
const User = require('./backend/models/User');

// Import Routes
const authRoutes = require('./backend/routes/auth');
const adminRoutes = require('./backend/routes/admin');
const leadRoutes = require('./backend/routes/leads');
const meetingRoutes = require('./backend/routes/meetings');
const reportRoutes = require('./backend/routes/reports');
const integrationRoutes = require('./backend/routes/integrations');
const myExcelRoutes = require('./backend/routes/myExcel');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://catalystcrm-3pod.vercel.app',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Seed function
async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial data...');
      await User.create([
        { username: 'admin', email: 'admin@crm.com', password: 'adminpassword', role: 'admin' },
        { username: 'staff1', email: 'staff1@crm.com', password: 'staffpassword', role: 'staff', isActive: false },
        { username: 'staff2', email: 'staff2@crm.com', password: 'staffpassword', role: 'staff' }
      ]);
      console.log('Seed users created');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
}

const db = require('./backend/config/mongoose');
db.once('open', async () => {
  await seedDatabase();
});

// Mount routes under /api
const pingRoutes = require('./backend/routes/ping');
app.use('/api', pingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/my-excel', myExcelRoutes);

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong' });
});

// Root
app.get('/', (req, res) => {
  res.json({ success: true, message: 'CatalystCRM API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

module.exports = app;
