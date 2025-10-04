const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const useProxy = process.env.USE_PROXY === 'true';

// Connection configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // If using proxy, connect to localhost:5432, otherwise use the Cloud SQL host
  host: useProxy ? 'localhost' : process.env.DB_HOST,
  port: useProxy ? 5432 : process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

console.log('Database configuration:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  ssl: config.ssl
});

const pool = new Pool(config);

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    console.error('Database connection details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    });
  } else {
    console.log('Successfully connected to database');
    release();
  }
});

// Export both the pool and a query helper
module.exports = {
  pool,
  query: async (text, params) => {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', error.message);
      console.error('Query details:', { text, params });
      throw error;
    }
  }
};