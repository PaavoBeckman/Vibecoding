const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'inventory.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    sku TEXT UNIQUE NOT NULL,
    description TEXT
  )
`);

const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (countRow.count === 0) {
  const insert = db.prepare(
    'INSERT INTO products (name, category, price, quantity, sku, description) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const seed = db.transaction(() => {
    insert.run('Wireless Headphones', 'Electronics', 79.99, 42, 'SKU-001', 'Over-ear noise-cancelling headphones');
    insert.run('Mechanical Keyboard', 'Electronics', 129.99, 17, 'SKU-002', 'Compact tenkeyless with RGB lighting');
    insert.run('Running Shoes', 'Footwear', 89.95, 30, 'SKU-003', 'Lightweight breathable trainers');
    insert.run('Yoga Mat', 'Sports', 34.99, 55, 'SKU-004', 'Non-slip 6mm thick exercise mat');
    insert.run('Stainless Water Bottle', 'Kitchen', 24.99, 100, 'SKU-005', '32 oz insulated bottle');
    insert.run('Desk Lamp', 'Office', 45.00, 23, 'SKU-006', 'LED adjustable-arm desk lamp');
    insert.run('Notebook Set', 'Stationery', 12.99, 200, 'SKU-007', 'Pack of 3 ruled notebooks');
    insert.run('USB-C Hub', 'Electronics', 39.99, 60, 'SKU-008', '7-in-1 multiport adapter');
    insert.run('Coffee Maker', 'Kitchen', 59.95, 14, 'SKU-009', '12-cup programmable drip coffee maker');
    insert.run('Backpack', 'Bags', 64.99, 38, 'SKU-010', '30L waterproof hiking backpack');
    insert.run('Sunglasses', 'Accessories', 29.99, 75, 'SKU-011', 'Polarised UV400 sunglasses');
    insert.run('Bluetooth Speaker', 'Electronics', 49.99, 28, 'SKU-012', 'Portable IPX7 waterproof speaker');
    insert.run('Plant Pot Set', 'Home', 19.99, 90, 'SKU-013', 'Set of 3 ceramic pots with trays');
    insert.run('Resistance Bands', 'Sports', 17.99, 120, 'SKU-014', 'Set of 5 latex bands with guide');
    insert.run('Cutting Board', 'Kitchen', 22.50, 45, 'SKU-015', 'Bamboo chopping board large');
    insert.run('Wireless Mouse', 'Electronics', 35.00, 53, 'SKU-016', 'Ergonomic silent wireless mouse');
    insert.run('Phone Stand', 'Accessories', 9.99, 150, 'SKU-017', 'Adjustable aluminium phone stand');
    insert.run('Scented Candle', 'Home', 14.99, 80, 'SKU-018', 'Soy wax lavender scented candle');
    insert.run('Fleece Jacket', 'Clothing', 54.99, 22, 'SKU-019', 'Lightweight zip-up fleece jacket');
    insert.run('Poster Frame', 'Home', 18.00, 35, 'SKU-020', 'A3 black aluminium picture frame');
  });

  seed();
}

module.exports = db;
