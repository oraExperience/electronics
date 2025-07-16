/**
 * MySQL connection pool configuration for Ora backend.
 * Edit user, password, database, and port as per your environment.
 */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;