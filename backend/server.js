const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Establish MongoDB connection
require('./config/mongoose');

// Import Models (Mongoose)
const User = require('./models/User');
const Lead = require('./models/Lead');
const Meeting = require('./models/Meeting');
const Setting = require('./models/Setting');
const AuditLog = require('./models/AuditLog');

// Import Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const leadRoutes = require('./routes/leads');
const meetingRoutes = require('./routes/meetings');
const reportRoutes = require('./routes/reports');
const integrationRoutes = require('./routes/integrations');
const myExcelRoutes = require('./routes/myExcel');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 file payloads
app.use(morgan('dev'));

// Seed data function (runs once after DB connection is open)
async function seedDatabase() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Seeding initial data...');
    await User.create([
      { username: 'admin', email: 'admin@crm.com', password: 'adminpassword', role: 'admin' },
      { username: 'staff1', email: 'staff1@crm.com', password: 'staffpassword', role: 'staff', isActive: false },
      { username: 'staff2', email: 'staff2@crm.com', password: 'staffpassword', role: 'staff' }
    ]);
    console.log('✅ Seed users created');
  }
}

// Once the mongoose connection is open, seed the DB
const db = require('./config/mongoose');

db.once('open', async () => {
  try {
    await seedDatabase();
    console.log('✅ Seed data loaded');
  } catch (err) {
    console.error('Seed error:', err);
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/my-excel', myExcelRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
