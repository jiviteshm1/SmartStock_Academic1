# SmartStock Academic - Inventory & Point of Sale (POS) System

SmartStock Academic is an enterprise-grade campus inventory and Point of Sale (POS) management platform designed for university stores, engineering labs, and technical academies. It features role-based JWT authentication, ACID-compliant stock deduction, real-time thermal receipt generation, and analytical sales reporting.

---

## 🌟 Key Features

1. **Transaction-Safe POS Terminal (`/billing`)**:
   - Barcode and SKU scanner input with instant keyboard lookups.
   - Live visual catalogue with category filtering and stock alerts.
   - Quantity increments/decrements with real-time inventory limit constraints.
   - Tax and discount engine with custom line calculations.
   - Tender drawer for Cash, Card, and UPI with quick denominations and live change calculator.
   - Immediate thermal receipt generation (`/api/sales/:invoiceNo/receipt`) and confetti celebrations.

2. **Inventory Management & Reorder Thresholds (`/products`)**:
   - Master catalogue with SKU, barcode, cost price, retail price, and automated profit margin calculations.
   - Color-coded stock badges: Healthy (Green), Low Stock Alert (Amber), Out of Stock (Red).
   - 1-Click Quick Restock modal for counter staff.
   - Modal-based Product CRUD with SKU and barcode uniqueness validation.

3. **Taxonomy & Departments (`/categories`)**:
   - Departmental breakdown with dynamic product count badges.

4. **Sales Audit Ledger (`/sales`)**:
   - Searchable transaction ledger filterable by invoice number, customer name, and payment method.
   - Full receipt modal and browser print integration.

5. **Business Intelligence & Reporting (`/reports`)**:
   - Department revenue split charts and percentage distribution.
   - Tender method breakdown (Cash vs Card vs UPI).
   - Top 5 fast-moving products leaderboard.
   - 1-Click CSV data export for spreadsheet auditing.

6. **Dual-Mode Database Architecture (Zero-Crash Guarantee)**:
   - **Production Mode**: Full MySQL 8.0+ support with connection pooling, transactional queries, foreign keys, and indexes via `mysql2/promise`.
   - **Standalone / Sandbox Mode**: Built-in ACID-compliant persisted relational engine that activates automatically if MySQL is not running or credentials are not supplied. No setup headaches, no `ECONNREFUSED` crashes!

---

## 🚀 Quick Start & Installation

### Option A: Standard Full-Stack Execution
```bash
# 1. Install dependencies
npm install

# 2. Start the unified development server (Port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🔑 Default Credentials (Seeded)

| Role | Username | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full Access: Inventory CRUD, Category CRUD, Financial Analytics, CSV Exports |
| **Cashier** | `cashier` | `cashier123` | Operational Access: POS Billing Terminal, Stock Lookups, Restock, Receipt Printing |

*(You can also use the 1-click quick login buttons directly on the login screen).*

---

## 🗄️ Relational Database Setup (MySQL)

If you wish to run MySQL locally:

### 1. macOS (Homebrew)
```bash
brew install mysql
brew services start mysql
mysql -u root -e "CREATE DATABASE smartstock_db;"
mysql -u root smartstock_db < database/schema.sql
mysql -u root smartstock_db < database/seed.sql
```

### 2. Linux (Ubuntu / Debian)
```bash
sudo apt update && sudo apt install -y mysql-server
sudo systemctl start mysql
mysql -u root -e "CREATE DATABASE smartstock_db;"
mysql -u root smartstock_db < database/schema.sql
mysql -u root smartstock_db < database/seed.sql
```

### 3. Environment Variables (`.env`)
```env
PORT=3000
JWT_SECRET=smartstock_academic_jwt_secret_key_2026

# MySQL Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=smartstock_db
```

---

## 📡 REST API Endpoints

- `POST /api/auth/login` - Authenticate cashier/admin and receive JWT
- `GET /api/auth/me` - Fetch profile for authenticated session
- `GET /api/products` - Filtered products (`?category_id=`, `?search=`, `?low_stock=true`)
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product
- `POST /api/products/:id/restock` - Quick increment units
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/categories` - Fetch categories with product counts
- `POST /api/sales` - Process POS transaction with atomic stock decrement
- `GET /api/sales` - Fetch transaction ledger
- `GET /api/sales/:invoiceNo/receipt` - Raw printable HTML thermal receipt
- `GET /api/reports/dashboard` - Executive KPI metrics
- `GET /api/reports/analytics` - Sales breakdown and fast-moving items
- `GET /api/reports/export/csv` - Download CSV export of sales or catalog
