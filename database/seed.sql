-- =======================================================
-- SmartStock Academic - Database Seed Data (MySQL)
-- Passwords:
-- admin / admin123 (bcrypt: $2a$10$w8T9OQZ5Z2kYhMv3.1Yn1e3i4d1X9Y2p5eZ7tL1M0O3x4.K3.)
-- cashier / cashier123 (bcrypt: $2a$10$aBcDeFgHiJkLmNoPqRsTu.u6pY1e4i7d1X9Y2p5eZ7tL1M0O3x4)
-- =======================================================

USE smartstock_db;

-- Clear previous data in correct reverse-dependency order
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM users;

-- 1. Insert Users
INSERT INTO users (id, username, password_hash, full_name, role) VALUES
(1, 'admin', '$2a$10$wT0E8y91Qy08r1l9C5n0euLkJzDcf3uQ4oP.LpQe4P2hO9s9v2KGe', 'Dr. Alistair Vance (Admin)', 'admin'),
(2, 'cashier', '$2a$10$wT0E8y91Qy08r1l9C5n0euLkJzDcf3uQ4oP.LpQe4P2hO9s9v2KGe', 'Sarah Jenkins (Campus Store Cashier)', 'cashier');

-- 2. Insert Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Textbooks & Study Guides', 'Core engineering, computing, and science academic manuals'),
(2, 'Lab Equipment & Electronics', 'Microcontrollers, multimeters, sensors, and safety gear'),
(3, 'Stationery & Drafting', 'Notebooks, technical drafting tools, pens, and paper'),
(4, 'Calculators & Tech', 'Scientific and graphing calculators and accessories'),
(5, 'Campus Apparel & Merch', 'University hoodies, bags, and student merchandise');

-- 3. Insert Products
INSERT INTO products (id, name, sku, barcode, category_id, cost_price, selling_price, stock_quantity, min_stock_level, image_url) VALUES
(1, 'Data Structures & Algorithms in C++', 'BK-DSA-01', '8901001001', 1, 32.00, 48.00, 25, 5, 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&auto=format&fit=crop&q=80'),
(2, 'Operating Systems Concepts (10th Ed)', 'BK-OS-10', '8901001002', 1, 45.00, 65.00, 18, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'),
(3, 'Arduino Mega 2560 Pro Kit', 'EL-ARD-25', '8901002001', 2, 28.50, 42.00, 14, 5, 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&auto=format&fit=crop&q=80'),
(4, 'Digital Multimeter Pro True-RMS', 'EL-DMM-01', '8901002002', 2, 16.00, 24.50, 8, 4, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80'),
(5, 'Lab Safety Impact Goggles', 'EL-SGL-01', '8901002003', 2, 4.50, 8.50, 3, 10, 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&auto=format&fit=crop&q=80'),
(6, 'Engineering Drafting Sheet Pack (A2)', 'ST-ED-A2', '8901003001', 3, 7.50, 12.00, 40, 10, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80'),
(7, 'College Spiral Notebook 5-Subject', 'ST-NB-05', '8901003002', 3, 3.20, 6.00, 65, 15, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&auto=format&fit=crop&q=80'),
(8, 'Thermal Receipt Paper Roll (Pack of 5)', 'ST-TP-05', '8901003003', 3, 4.00, 7.50, 2, 10, 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=400&auto=format&fit=crop&q=80'),
(9, 'Scientific Calculator FX-991EX', 'EL-CALC-99', '8901004001', 4, 18.00, 27.99, 12, 5, 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=400&auto=format&fit=crop&q=80'),
(10, 'Precision Technical Compass Set', 'ST-CMP-02', '8901004002', 4, 8.50, 14.50, 22, 6, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80'),
(11, 'Campus Varsity Hoodie (Navy Navy)', 'UN-HD-NV', '8901005001', 5, 22.00, 36.00, 15, 5, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80');

-- 4. Initial Sample Sale
INSERT INTO sales (id, invoice_no, user_id, customer_name, customer_phone, subtotal, discount, tax, total_amount, payment_method, amount_paid, change_returned, status, created_at)
VALUES
(1, 'INV-202610-0001', 2, 'Alex Turner (Student ID: 4920)', '+1 555-0192', 55.50, 2.50, 2.65, 55.65, 'cash', 60.00, 4.35, 'completed', NOW() - INTERVAL 1 HOUR);

INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES
(1, 1, 'Data Structures & Algorithms in C++', 1, 48.00, 48.00),
(1, 7, 'College Spiral Notebook 5-Subject', 1, 6.00, 6.00),
(1, 6, 'Engineering Drafting Sheet Pack (A2)', 1, 1.50, 1.50);
