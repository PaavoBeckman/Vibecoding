const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// GET all products (with optional search/category filter)
app.get('/api/products', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM products';
  const params = [];

  const conditions = [];
  if (search) {
    conditions.push("(name LIKE ? OR sku LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category && category !== 'All') {
    conditions.push("category = ?");
    params.push(category);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY name ASC';

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// GET distinct categories
app.get('/api/categories', (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM products ORDER BY category ASC").all();
  res.json(rows.map(r => r.category));
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(row);
});

// POST create product
app.post('/api/products', (req, res) => {
  const { name, category, price, quantity, sku, description } = req.body;
  if (!name || !category || price == null || quantity == null || !sku) {
    return res.status(400).json({ error: 'name, category, price, quantity and sku are required' });
  }
  try {
    const info = db
      .prepare('INSERT INTO products (name, category, price, quantity, sku, description) VALUES (?, ?, ?, ?, ?, ?)')
      .run(name, category, parseFloat(price), parseInt(quantity), sku, description || '');
    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PATCH update quantity
app.patch('/api/products/:id/quantity', (req, res) => {
  const { quantity } = req.body;
  if (quantity == null || isNaN(quantity) || parseInt(quantity) < 0) {
    return res.status(400).json({ error: 'quantity must be a non-negative integer' });
  }
  const info = db
    .prepare('UPDATE products SET quantity = ? WHERE id = ?')
    .run(parseInt(quantity), req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const { name, category, price, quantity, sku, description } = req.body;
  if (!name || !category || price == null || quantity == null || !sku) {
    return res.status(400).json({ error: 'name, category, price, quantity and sku are required' });
  }
  try {
    const info = db
      .prepare('UPDATE products SET name=?, category=?, price=?, quantity=?, sku=?, description=? WHERE id=?')
      .run(name, category, parseFloat(price), parseInt(quantity), sku, description || '', req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.status(204).end();
});

const staticLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

// Serve built React app in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('/{*path}', staticLimiter, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
