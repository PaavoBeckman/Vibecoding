# Vibecoding – Inventory Manager

A modern, full-stack web app to manage the inventory of a retail store.

## Features

- 📦 **Browse products** – paginated table with sorting by name, SKU, category, price, or quantity
- 🔍 **Search & filter** – live search by name/SKU plus one-click category filter
- ➕ **Add products** – modal form with validation
- ✏️ **Edit products** – update all product details
- 🔢 **Update quantity** – inline ±1 buttons or direct number editing
- 🗑️ **Delete products** – confirmation dialog before deletion
- 📊 **Dashboard stats** – total products, total inventory value, low-stock count, out-of-stock count
- 🟢 **Stock badges** – colour-coded In stock / Low stock / Out of stock indicators
- 🗄️ **Local SQLite database** – pre-seeded with 20 products

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express 5 |
| Database | SQLite (via `better-sqlite3`) |

## Getting Started

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Start the backend (port 3001)
cd server && npm start

# 3. Start the frontend dev server (port 5173, proxies /api → 3001)
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

### Production build

```bash
cd client && npm run build
cd ../server && npm start   # serves the built app on http://localhost:3001
```
