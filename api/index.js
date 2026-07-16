const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'https://catalystcrm.vercel.app', credentials: true }));

// API routes
const apiRouter = require('../backend/routes'); // aggregates all backend routers
app.use('/api', apiRouter);

// Simple health check
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Serve static frontend (fallback for SPA)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

module.exports = app;
