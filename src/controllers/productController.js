/**
 * Controller for product-related operations.
 * Calls product model for DB work, processes results.
 */
const productModel = require('../models/productModel');

/**
 * GET /api/products/top
 * Responds with a list of top products (name and price only).
 */
async function getTopProducts(req, res) {
  try {
    const products = await productModel.getTopProducts();
    res.json(products);
  } catch (err) {
    console.error('[productController] getTopProducts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
}

/**
 * GET /api/products/category/:categoryName
 * Responds with a canonical category name and product array.
 */
async function getProductsByCategory(req, res) {
  try {
    const { categoryName } = req.params;
    const { products, categoryDisplayName } = await productModel.getProductsByCategoryWithName(categoryName);
    res.json({ category: categoryDisplayName, products });
  } catch (err) {
    console.error('[productController] getProductsByCategory error:', err.message);
    res.status(500).json({ error: 'Failed to fetch products for category' });
  }
}

/**
 * GET /api/home-rails
 * Responds with all homepage rails and their products
 */
async function getHomeRailsWithProducts(req, res) {
  try {
    const rails = await productModel.getHomeRailsWithProducts();
    console.log('[getHomeRailsWithProducts] rails returned:', rails.length, rails.map(r => r.header));
    res.json(rails);
  } catch (err) {
    const errorObj = err || {};
    console.error('[productController] getHomeRailsWithProducts error:', errorObj.message, errorObj.stack);
    res.status(500).json({
      error: 'Failed to fetch home rails',
      detail: errorObj.message || 'Unknown error',
      stack: errorObj.stack || 'No stack'
    });
  }
}

/**
 * GET /api/products/rails-by-category/:categoryName
 * Return all homepage rails, but filter products within each rail to the given category.
 */
async function getHomeRailsWithProductsByCategory(req, res) {
  try {
    const { categoryName } = req.params;
    const rails = await productModel.getHomeRailsWithProductsByCategory(categoryName);
    res.json(rails);
  } catch (err) {
    const errorObj = err || {};
    console.error('[productController] getHomeRailsWithProductsByCategory error:', errorObj.message, errorObj.stack);
    res.status(500).json({
      error: 'Failed to fetch category-filtered rails',
      detail: errorObj.message || 'Unknown error',
      stack: errorObj.stack || 'No stack'
    });
  }
}
module.exports = {
  getTopProducts,
  getProductsByCategory,
  getHomeRailsWithProducts,
  getHomeRailsWithProductsByCategory
};
