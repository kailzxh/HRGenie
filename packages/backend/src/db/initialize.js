const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const initializeDatabase = async () => {
  try {
    // Read the SQL file based on environment
    const sqlFile = path.join(__dirname, process.env.NODE_ENV === 'development' ? 'init_v2.sql' : 'init.sql');
    console.log(`Initializing database with schema from: ${sqlFile}`);
    
    let sql = fs.readFileSync(sqlFile, 'utf8');

    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Execute each statement separately
    for (const statement of statements) {
      try {
        await pool.query(statement + ';');
      } catch (err) {
        if (err.code === '42710') {
          // Error code for duplicate type, can be safely ignored
          console.log('Note: Type already exists, continuing...');
          continue;
        }
        throw err;
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;