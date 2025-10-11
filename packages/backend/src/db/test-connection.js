const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres', // Connect to default database first
  ssl: false
});

async function testConnection() {
  try {
    // Try to connect to PostgreSQL
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL');
    
    // Create database if it doesn't exist
    await client.query(`
      SELECT 'CREATE DATABASE ${process.env.DB_NAME}'
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${process.env.DB_NAME}')
    `).then(() => {
      console.log(`Database ${process.env.DB_NAME} exists or was created`);
    });

    // Create database if it doesn't exist
    try {
      await client.query('CREATE DATABASE hrgenie');
      console.log('Created database hrgenie');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('Database hrgenie already exists');
      } else {
        throw err;
      }
    }

    // Close the connection to postgres database
    await client.end();

    // Now connect to hrgenie database
    const hrgeniePool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      ssl: false
    });

    const hrgenieClient = await hrgeniePool.connect();
    console.log('Successfully connected to hrgenie database');
    await hrgenieClient.end();

  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

testConnection();