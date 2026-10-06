-- =======================================================
-- SmartStock Academic - Relational Database Schema (MySQL)
-- Enterprise-grade schema with proper foreign keys,
-- DECIMAL monetary columns, indexes, and constraints.
-- =======================================================

CREATE DATABASE IF NOT EXISTS smartstock_db;
USE smartstock_db;

-- 1. Users Table (Role-based access: admin, cashier)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'cashier') NOT NULL DEFAULT 'cashier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  barcode VARCHAR(50) NOT NULL UNIQUE,
  category_id INT NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock_quantity INT NOT NULL DEFAULT 0,
  min_stock_level INT NOT NULL DEFAULT 5,
  image_url VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_products_sku (sku),
  INDEX idx_products_barcode (barcode),
  INDEX idx_products_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Sales Table (Transactions header)
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  customer_name VARCHAR(100) DEFAULT 'Walk-in Student',
  customer_phone VARCHAR(20) DEFAULT '',
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'card', 'upi') NOT NULL DEFAULT 'cash',
  amount_paid DECIMAL(10, 2) NOT NULL,
  change_returned DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('completed', 'refunded') NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_sales_invoice (invoice_no),
  INDEX idx_sales_created_at (created_at),
  INDEX idx_sales_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Sale Items Table (Transaction details)
CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_sale_items_sale (sale_id),
  INDEX idx_sale_items_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
