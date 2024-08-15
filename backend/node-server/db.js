// db.js
const mysql = require('mysql2');

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Use environment variables or hardcode values
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cv_website',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the pool to be used in other files
module.exports = pool;
