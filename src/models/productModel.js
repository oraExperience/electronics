/**
 * Model layer for 'products'.
 * Handles direct DB queries for product data.
 */
const pool = require('../config/db');

/**
 * Get the top N products (for 'Top mobiles near you').
 * If you want to filter or join other tables, edit the query here.
 */
async function getTopProducts(limit = 3) {
  // In many MySQL setups you cannot use a bound parameter for LIMIT.
  // Always validate limit to prevent SQL injection!
  limit = Number(limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) limit = 3;
  // Now also select mage (image url column) if present.
  const sql = `SELECT name, price, image FROM products ORDER BY id LIMIT ${limit}`;
  const [rows] = await pool.query(sql);
  // Return as plain array of { name, price, image_url }
  return rows.map(r => ({
    name: r.name,
    price: `Starting at ₹${r.price}`,
    image_url: r.image || "https://via.placeholder.com/160x160?text=No+Image"
  }));
}

/**
 * Get all products by category name.
 * categoryName - string ('Mobiles', 'Laptops', etc)
 * Returns: [{name, price, image_url}]
 */
async function getProductsByCategory(categoryName, limit = 10) {
  // Validate input
  if (typeof categoryName !== "string" || !categoryName) {
    return [];
  }
  // Get the category ID
  const [catRows] = await pool.query(
    "SELECT id FROM category WHERE name = ? LIMIT 1",
    [categoryName]
  );
  if (!catRows.length) return [];
  const categoryId = catRows[0].id;
  // Get products for this category
  limit = Number(limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) limit = 10;
  const [rows] = await pool.query(
    `SELECT name, price, image FROM products WHERE parent_category_id = ? ORDER BY id LIMIT ${limit}`,
    [categoryId]
  );
  return rows.map((r) => ({
    name: r.name,
    price: `Starting at ₹${r.price}`,
    image_url: r.image || "https://via.placeholder.com/160x160?text=No+Image",
  }));
}

/**
 * Like getProductsByCategory, but returns {products, categoryDisplayName}
 * - categoryName: input from URL (e.g. "mobiles", "MOBILES", "Mobiles")
 * Returns: { products, categoryDisplayName }
 */
async function getProductsByCategoryWithName(categoryName, limit = 10) {
  if (typeof categoryName !== "string" || !categoryName) {
    return { products: [], categoryDisplayName: "Unknown" };
  }
  // Match category name case-insensitively
  const [catRows] = await pool.query(
    "SELECT id, name FROM category WHERE LOWER(name) = LOWER(?) LIMIT 1",
    [categoryName]
  );
  if (!catRows.length) return { products: [], categoryDisplayName: "Unknown" };
  const categoryId = catRows[0].id;
  const catName = catRows[0].name;
  // Get products for this category
  limit = Number(limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) limit = 10;
  const [rows] = await pool.query(
    `SELECT name, price, image FROM products WHERE parent_category_id = ? ORDER BY id LIMIT ${limit}`,
    [categoryId]
  );
  const products = rows.map((r) => ({
    name: r.name,
    price: `Starting at ₹${r.price}`,
    image_url: r.image || "https://via.placeholder.com/160x160?text=No+Image",
  }));
  return { products, categoryDisplayName: catName };
}

/**
 * Get all homepage rails with mapped products, ordered by rank.
 * Returns [{ id, header, products: [{name, price, image_url}] }]
 */
async function getHomeRailsWithProducts(limitPerRail = 12) {
  // Select all rails for the HOME page, entity_type='RAIL', ordered by rank.
  const [rails] = await pool.query(
    `SELECT id, header
     FROM entity
     WHERE page = 'HOME' AND entity_type = 'RAIL'
     ORDER BY entity.rank ASC`
  );
  // For each rail, get its products via entity_product_mapping.
  const railsWithProducts = [];
  for (const rail of rails) {
    const [prods] = await pool.query(
      `SELECT p.name, p.price, p.image
       FROM entity_product_mapping m
       INNER JOIN products p ON m.product_id = p.id
       WHERE m.entity_id = ?
       LIMIT ?`,
      [rail.id, limitPerRail]
    );
    railsWithProducts.push({
      id: rail.id,
      header: rail.header,
      products: prods.map(r => ({
        name: r.name,
        price: `Starting at ₹${r.price}`,
        image_url: r.image || "https://via.placeholder.com/160x160?text=No+Image"
      }))
    });
  }
  return railsWithProducts;
}
/**
 * Get all homepage rails, but only products of a specific category.
 * Returns [{ id, header, products: [{name, price, image_url}] }]
 */
async function getHomeRailsWithProductsByCategory(categoryName, limitPerRail = 12) {
  if (!categoryName || typeof categoryName !== "string") return [];
  // Get the category ID
  const [catRows] = await pool.query(
    "SELECT id FROM category WHERE LOWER(name) = LOWER(?) LIMIT 1",
    [categoryName]
  );
  if (!catRows.length) return [];
  const categoryId = catRows[0].id;
  // Get all rails as before
  const [rails] = await pool.query(
    `SELECT id, header
     FROM entity
     WHERE page = 'HOME' AND entity_type = 'RAIL'
     ORDER BY entity.rank ASC`
  );
  const railsWithProducts = [];
  for (const rail of rails) {
    // For this rail, only map products from the selected category
    const [prods] = await pool.query(
      `SELECT p.name, p.price, p.image
       FROM entity_product_mapping m
       INNER JOIN products p ON m.product_id = p.id
       WHERE m.entity_id = ?
         AND p.parent_category_id = ?
       LIMIT ?`,
      [rail.id, categoryId, limitPerRail]
    );
    if (prods.length) {
      railsWithProducts.push({
        id: rail.id,
        header: rail.header,
        products: prods.map(r => ({
          name: r.name,
          price: `Starting at ₹${r.price}`,
          image_url: r.image || "https://via.placeholder.com/160x160?text=No+Image"
        }))
      });
    }
  }
  return railsWithProducts;
}

module.exports = {
  getTopProducts,
  getProductsByCategory,
  getProductsByCategoryWithName,
  getHomeRailsWithProducts,
  getHomeRailsWithProductsByCategory
};