/**
 * Main entry for the Ora backend API server.
 * - Uses Express, MySQL, Morgan (logger), and CORS.
 * - Routes are modular (see 'routes/' folder).
 * 
 * To add new APIs: create a new route, controller, and model file as in the 'products' example.
 * Start the server with: npm start
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = 3001;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // HTTP request logging

// Mount API routes
app.use('/api/products', productRoutes);

// Root endpoint (health check)
app.get('/', (req, res) => {
  res.send({ message: 'Ora API server is running' });
});

// 404 Handler for unknown endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🟢 Ora backend running at http://localhost:${PORT}`);
});