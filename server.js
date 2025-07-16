// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

const dbConfig = {
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: '', // Change if your MySQL has a password
  database: 'test',
};

app.get('/api/products/top', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // Adjust the field names if your table differs
    const [rows] = await connection.execute(
      'SELECT name, price FROM products ORDER BY id LIMIT 3'
    );
    // Example: price may be int, convert to "Starting at..."
    const formatted = rows.map(r => ({
      name: r.name,
      price: `Starting at ₹${r.price}`,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  } finally {
    if (connection) await connection.end();
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});