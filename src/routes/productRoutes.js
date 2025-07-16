/**
 * Routes for product-related API endpoints.
 * Mounts on /api/products
 */
const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

// GET /api/products/top
router.get('/top', productController.getTopProducts);

/**
 * GET /home-rails
 * Returns all rails for HOME page with products
 */
router.get('/home-rails', productController.getHomeRailsWithProducts);

/**
 * GET /category/:categoryName
 * Returns products for the given category (e.g. Mobiles, Laptops, Accessories)
 */
router.get('/category/:categoryName', productController.getProductsByCategory);

/**
 * GET /rails-by-category/:categoryName
 * Returns rails with products filtered by category
 */
router.get('/rails-by-category/:categoryName', productController.getHomeRailsWithProductsByCategory);
module.exports = router;