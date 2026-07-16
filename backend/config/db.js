// Legacy DB config removed; migration to Mongoose completed.

const mysql = require('mysql2/promise');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'crm_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
    // Configure SSL if required (Railway uses SSL for remote connections)
    dialectOptions: {
      ...(process.env.DB_SSL === 'true' && process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false // Railway uses self‑signed certs
            }
          }
        : {}),
      connectTimeout: 3000 // Timeout for establishing connection (3 seconds)
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 3000, // Timeout for acquiring a connection from pool (3 seconds)
      idle: 10000
    }
  }
);

async function initializeDatabase() {
  try {
    // Only attempt programmatic database creation locally.
    // Cloud database services (PlanetScale, Aiven, RDS) do not allow database creation via root connection.
    if (process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1') {
      console.log('Local database host detected. Ensuring database exists...');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
      await connection.end();
    }
    
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to initialize the database:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initializeDatabase
};
