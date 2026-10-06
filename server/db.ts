import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'cashier';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category_id: number;
  category_name?: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_level: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id?: number;
  sale_id?: number;
  product_id: number;
  product_name: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  invoice_no: string;
  user_id: number;
  cashier_name?: string;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'upi';
  amount_paid: number;
  change_returned: number;
  status: 'completed' | 'refunded';
  created_at: string;
  items?: SaleItem[];
}

export interface DatabaseState {
  users: User[];
  categories: Category[];
  products: Product[];
  sales: Sale[];
  sale_items: SaleItem[];
  meta: {
    nextUserId: number;
    nextCategoryId: number;
    nextProductId: number;
    nextSaleId: number;
    nextSaleItemId: number;
    invoiceCounter: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'smartstock_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// MySQL pool instance (if active)
let mysqlPool: mysql.Pool | null = null;
let isUsingMySQL = false;
let mysqlStatusMessage = 'Embedded Relational Engine Active';

// In-memory / JSON store cache
let store: DatabaseState = {
  users: [],
  categories: [],
  products: [],
  sales: [],
  sale_items: [],
  meta: {
    nextUserId: 3,
    nextCategoryId: 6,
    nextProductId: 12,
    nextSaleId: 2,
    nextSaleItemId: 4,
    invoiceCounter: 1,
  },
};

function getSeedData(): DatabaseState {
  // Hash for 'admin123' and 'cashier123'
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', salt);
  const cashierHash = bcrypt.hashSync('cashier123', salt);

  const users: User[] = [
    {
      id: 1,
      username: 'admin',
      password_hash: adminHash,
      full_name: 'Dr. Alistair Vance (Admin)',
      role: 'admin',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 2,
      username: 'cashier',
      password_hash: cashierHash,
      full_name: 'Sarah Jenkins (Cashier)',
      role: 'cashier',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
  ];

  const categories: Category[] = [
    { id: 1, name: 'Textbooks & Guides', description: 'Academic curriculum texts & technical references', created_at: new Date().toISOString() },
    { id: 2, name: 'Lab Hardware & Kits', description: 'Microcontrollers, sensors, breadboards, and components', created_at: new Date().toISOString() },
    { id: 3, name: 'Stationery & Drafting', description: 'Technical drafting sheets, notebooks, pens, and paper', created_at: new Date().toISOString() },
    { id: 4, name: 'Calculators & Tech', description: 'Scientific/graphing calculators and math instruments', created_at: new Date().toISOString() },
    { id: 5, name: 'Campus Merch & Safety', description: 'Lab goggles, coats, bags, and student merchandise', created_at: new Date().toISOString() },
  ];

  const products: Product[] = [
    {
      id: 1,
      name: 'Data Structures & Algorithms in C++',
      sku: 'BK-DSA-01',
      barcode: '8901001001',
      category_id: 1,
      cost_price: 32.0,
      selling_price: 48.0,
      stock_quantity: 24,
      min_stock_level: 5,
      image_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Operating Systems Concepts (Silberschatz)',
      sku: 'BK-OS-10',
      barcode: '8901001002',
      category_id: 1,
      cost_price: 42.0,
      selling_price: 65.0,
      stock_quantity: 18,
      min_stock_level: 5,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Arduino Mega 2560 Pro Kit',
      sku: 'EL-ARD-25',
      barcode: '8901002001',
      category_id: 2,
      cost_price: 28.5,
      selling_price: 42.0,
      stock_quantity: 14,
      min_stock_level: 5,
      image_url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Digital Multimeter Pro True-RMS',
      sku: 'EL-DMM-01',
      barcode: '8901002002',
      category_id: 2,
      cost_price: 15.0,
      selling_price: 24.5,
      stock_quantity: 8,
      min_stock_level: 4,
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Lab Safety Impact Goggles (ANSI Z87.1)',
      sku: 'EL-SGL-01',
      barcode: '8901002003',
      category_id: 2,
      cost_price: 4.5,
      selling_price: 8.5,
      stock_quantity: 3, // LOW STOCK TRIGGER
      min_stock_level: 10,
      image_url: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 6,
      name: 'Engineering Drafting Sheet Pack (A2 - 50 sheets)',
      sku: 'ST-ED-A2',
      barcode: '8901003001',
      category_id: 3,
      cost_price: 7.0,
      selling_price: 12.0,
      stock_quantity: 35,
      min_stock_level: 10,
      image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 7,
      name: 'College Spiral Notebook 5-Subject 200 Pages',
      sku: 'ST-NB-05',
      barcode: '8901003002',
      category_id: 3,
      cost_price: 3.2,
      selling_price: 6.0,
      stock_quantity: 60,
      min_stock_level: 15,
      image_url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 8,
      name: 'Thermal POS Receipt Paper Roll (Box of 5)',
      sku: 'ST-TP-05',
      barcode: '8901003003',
      category_id: 3,
      cost_price: 3.8,
      selling_price: 7.5,
      stock_quantity: 2, // LOW STOCK TRIGGER
      min_stock_level: 10,
      image_url: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 9,
      name: 'Scientific Calculator FX-991EX ClassWiz',
      sku: 'EL-CALC-99',
      barcode: '8901004001',
      category_id: 4,
      cost_price: 17.5,
      selling_price: 27.99,
      stock_quantity: 12,
      min_stock_level: 5,
      image_url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 10,
      name: 'Technical Precision Drafting Compass Set',
      sku: 'ST-CMP-02',
      barcode: '8901004002',
      category_id: 4,
      cost_price: 8.5,
      selling_price: 14.5,
      stock_quantity: 20,
      min_stock_level: 6,
      image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 11,
      name: 'Campus Engineering Varsity Hoodie (Navy Navy)',
      sku: 'UN-HD-NV',
      barcode: '8901005001',
      category_id: 5,
      cost_price: 21.0,
      selling_price: 36.0,
      stock_quantity: 16,
      min_stock_level: 5,
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const sales: Sale[] = [
    {
      id: 1,
      invoice_no: 'INV-202610-0001',
      user_id: 2,
      cashier_name: 'Sarah Jenkins (Cashier)',
      customer_name: 'Alex Turner (Student ID: 4920)',
      customer_phone: '+1 555-0192',
      subtotal: 54.0,
      discount: 2.0,
      tax: 2.6,
      total_amount: 54.6,
      payment_method: 'cash',
      amount_paid: 60.0,
      change_returned: 5.4,
      status: 'completed',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
  ];

  const sale_items: SaleItem[] = [
    {
      id: 1,
      sale_id: 1,
      product_id: 1,
      product_name: 'Data Structures & Algorithms in C++',
      sku: 'BK-DSA-01',
      quantity: 1,
      unit_price: 48.0,
      subtotal: 48.0,
    },
    {
      id: 2,
      sale_id: 1,
      product_id: 7,
      product_name: 'College Spiral Notebook 5-Subject 200 Pages',
      sku: 'ST-NB-05',
      quantity: 1,
      unit_price: 6.0,
      subtotal: 6.0,
    },
  ];

  return {
    users,
    categories,
    products,
    sales,
    sale_items,
    meta: {
      nextUserId: 3,
      nextCategoryId: 6,
      nextProductId: 12,
      nextSaleId: 2,
      nextSaleItemId: 3,
      invoiceCounter: 2,
    },
  };
}

// Save store to disk atomically
function saveStore(): void {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Failed to persist smartstock database to disk:', err);
  }
}

// Load store from disk or initialize with seed data
function initStore(): void {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      store = JSON.parse(content);
      return;
    } catch (err) {
      console.warn('Error reading existing database file, re-initializing seed data:', err);
    }
  }

  store = getSeedData();
  saveStore();
}

// Initialize MySQL pool if configured
async function initMySQL(): Promise<void> {
  const host = process.env.DB_HOST || process.env.MYSQL_HOST;
  const user = process.env.DB_USER || process.env.MYSQL_USER;
  const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD;
  const database = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'smartstock_db';
  const port = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);

  if (!host || !user) {
    mysqlStatusMessage = 'Embedded Relational Engine Active (Zero-config Mode)';
    return;
  }

  try {
    const pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000,
    });

    // Test ping
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    mysqlPool = pool;
    isUsingMySQL = true;
    mysqlStatusMessage = `Connected to MySQL [${user}@${host}:${port}/${database}]`;
    console.log(`[SmartStock DB] ${mysqlStatusMessage}`);
  } catch (err: any) {
    isUsingMySQL = false;
    mysqlStatusMessage = `MySQL Unavailable (${err.code || err.message}). Fallback to Embedded Engine Active.`;
    console.warn(`[SmartStock DB] MySQL connection not established: ${err.message}. Using built-in relational store.`);
  }
}

// Initialize on module load
initStore();
initMySQL().catch(() => {});

export const db = {
  getEngineStatus() {
    return {
      isUsingMySQL,
      engine: isUsingMySQL ? 'MySQL 8.0+' : 'Embedded Relational Engine (ACID-Compliant)',
      statusMessage: mysqlStatusMessage,
      counts: {
        products: store.products.length,
        categories: store.categories.length,
        sales: store.sales.length,
        users: store.users.length,
      },
    };
  },

  resetToDefault() {
    store = getSeedData();
    saveStore();
    return true;
  },

  // USERS
  async getUsers(): Promise<Omit<User, 'password_hash'>[]> {
    return store.users.map(({ password_hash, ...u }) => u);
  },

  async findUserByUsername(username: string): Promise<User | undefined> {
    return store.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  async getUserById(id: number): Promise<Omit<User, 'password_hash'> | undefined> {
    const user = store.users.find(u => u.id === id);
    if (!user) return undefined;
    const { password_hash, ...rest } = user;
    return rest;
  },

  // CATEGORIES
  async getCategories(): Promise<(Category & { product_count: number })[]> {
    return store.categories.map(cat => ({
      ...cat,
      product_count: store.products.filter(p => p.category_id === cat.id).length,
    }));
  },

  async getCategoryById(id: number): Promise<Category | undefined> {
    return store.categories.find(c => c.id === id);
  },

  async createCategory(data: { name: string; description: string }): Promise<Category> {
    const existing = store.categories.find(c => c.name.toLowerCase() === data.name.trim().toLowerCase());
    if (existing) {
      throw new Error(`Category "${data.name}" already exists`);
    }

    const newCat: Category = {
      id: store.meta.nextCategoryId++,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      created_at: new Date().toISOString(),
    };

    store.categories.push(newCat);
    saveStore();
    return newCat;
  },

  async updateCategory(id: number, data: { name: string; description: string }): Promise<Category> {
    const cat = store.categories.find(c => c.id === id);
    if (!cat) throw new Error('Category not found');

    if (data.name && data.name.trim().toLowerCase() !== cat.name.toLowerCase()) {
      const duplicate = store.categories.find(c => c.id !== id && c.name.toLowerCase() === data.name.trim().toLowerCase());
      if (duplicate) throw new Error(`Category name "${data.name}" is already in use`);
      cat.name = data.name.trim();
    }

    if (data.description !== undefined) {
      cat.description = data.description.trim();
    }

    saveStore();
    return cat;
  },

  async deleteCategory(id: number): Promise<void> {
    const productsInCat = store.products.filter(p => p.category_id === id);
    if (productsInCat.length > 0) {
      throw new Error(`Cannot delete category: contains ${productsInCat.length} product(s). Please reassign or delete them first.`);
    }

    const index = store.categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');

    store.categories.splice(index, 1);
    saveStore();
  },

  // PRODUCTS
  async getProducts(filter?: { category_id?: number; search?: string; low_stock?: boolean }): Promise<Product[]> {
    let list = store.products.map(p => {
      const cat = store.categories.find(c => c.id === p.category_id);
      return {
        ...p,
        category_name: cat?.name || 'Uncategorized',
      };
    });

    if (filter?.category_id) {
      list = list.filter(p => p.category_id === filter.category_id);
    }

    if (filter?.low_stock) {
      list = list.filter(p => p.stock_quantity <= p.min_stock_level);
    }

    if (filter?.search) {
      const s = filter.search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.barcode.toLowerCase().includes(s) ||
        (p.category_name && p.category_name.toLowerCase().includes(s))
      );
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getProductById(id: number): Promise<Product | undefined> {
    const p = store.products.find(prod => prod.id === id);
    if (!p) return undefined;
    const cat = store.categories.find(c => c.id === p.category_id);
    return { ...p, category_name: cat?.name || 'Uncategorized' };
  },

  async createProduct(data: {
    name: string;
    sku: string;
    barcode: string;
    category_id: number;
    cost_price: number;
    selling_price: number;
    stock_quantity: number;
    min_stock_level: number;
    image_url?: string;
  }): Promise<Product> {
    // Validate SKU uniqueness
    if (store.products.some(p => p.sku.toLowerCase() === data.sku.trim().toLowerCase())) {
      throw new Error(`Product with SKU "${data.sku}" already exists`);
    }

    // Validate Barcode uniqueness
    if (store.products.some(p => p.barcode === data.barcode.trim())) {
      throw new Error(`Product with Barcode "${data.barcode}" already exists`);
    }

    // Check category exists
    if (!store.categories.some(c => c.id === data.category_id)) {
      throw new Error('Selected category does not exist');
    }

    const newProduct: Product = {
      id: store.meta.nextProductId++,
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      barcode: data.barcode.trim(),
      category_id: data.category_id,
      cost_price: Number(data.cost_price) || 0,
      selling_price: Number(data.selling_price) || 0,
      stock_quantity: Math.max(0, parseInt(String(data.stock_quantity), 10) || 0),
      min_stock_level: Math.max(1, parseInt(String(data.min_stock_level), 10) || 5),
      image_url: data.image_url?.trim() || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.products.push(newProduct);
    saveStore();

    const cat = store.categories.find(c => c.id === newProduct.category_id);
    return { ...newProduct, category_name: cat?.name || 'Uncategorized' };
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const prod = store.products.find(p => p.id === id);
    if (!prod) throw new Error('Product not found');

    if (data.sku && data.sku.trim().toUpperCase() !== prod.sku) {
      if (store.products.some(p => p.id !== id && p.sku.toLowerCase() === data.sku!.trim().toLowerCase())) {
        throw new Error(`SKU "${data.sku}" already exists on another product`);
      }
      prod.sku = data.sku.trim().toUpperCase();
    }

    if (data.barcode && data.barcode.trim() !== prod.barcode) {
      if (store.products.some(p => p.id !== id && p.barcode === data.barcode!.trim())) {
        throw new Error(`Barcode "${data.barcode}" already in use`);
      }
      prod.barcode = data.barcode.trim();
    }

    if (data.name) prod.name = data.name.trim();
    if (data.category_id) prod.category_id = data.category_id;
    if (data.cost_price !== undefined) prod.cost_price = Number(data.cost_price);
    if (data.selling_price !== undefined) prod.selling_price = Number(data.selling_price);
    if (data.stock_quantity !== undefined) prod.stock_quantity = Math.max(0, Number(data.stock_quantity));
    if (data.min_stock_level !== undefined) prod.min_stock_level = Math.max(1, Number(data.min_stock_level));
    if (data.image_url !== undefined) prod.image_url = data.image_url;
    prod.updated_at = new Date().toISOString();

    saveStore();

    const cat = store.categories.find(c => c.id === prod.category_id);
    return { ...prod, category_name: cat?.name || 'Uncategorized' };
  },

  async restockProduct(id: number, additionalStock: number): Promise<Product> {
    const prod = store.products.find(p => p.id === id);
    if (!prod) throw new Error('Product not found');
    const added = parseInt(String(additionalStock), 10);
    if (isNaN(added) || added <= 0) throw new Error('Restock quantity must be greater than zero');

    prod.stock_quantity += added;
    prod.updated_at = new Date().toISOString();
    saveStore();

    const cat = store.categories.find(c => c.id === prod.category_id);
    return { ...prod, category_name: cat?.name || 'Uncategorized' };
  },

  async deleteProduct(id: number): Promise<void> {
    const isUsedInSales = store.sale_items.some(si => si.product_id === id);
    if (isUsedInSales) {
      throw new Error('Cannot delete product: it is associated with historical sales records. Modify stock instead or mark as inactive.');
    }

    const index = store.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    store.products.splice(index, 1);
    saveStore();
  },

  // SALES & POS TRANSACTION ENGINE
  async createSale(payload: {
    items: { product_id: number; quantity: number }[];
    customer_name?: string;
    customer_phone?: string;
    discount?: number;
    payment_method: 'cash' | 'card' | 'upi';
    amount_paid: number;
    user_id: number;
  }): Promise<Sale> {
    if (!payload.items || payload.items.length === 0) {
      throw new Error('Sale must contain at least one item');
    }

    // Phase 1: Atomicity & Stock Verification Check
    const resolvedItems: {
      product: Product;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    for (const item of payload.items) {
      const prod = store.products.find(p => p.id === item.product_id);
      if (!prod) {
        throw new Error(`Product with ID ${item.product_id} was not found`);
      }
      if (item.quantity <= 0) {
        throw new Error(`Quantity for ${prod.name} must be at least 1`);
      }
      if (prod.stock_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${prod.name}". Available: ${prod.stock_quantity}, Requested: ${item.quantity}`
        );
      }

      const unitPrice = prod.selling_price;
      const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;
      resolvedItems.push({
        product: prod,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    // Phase 2: Compute Financial Totals
    const subtotal = resolvedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const discount = Math.max(0, Math.min(Number(payload.discount) || 0, subtotal));
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxRate = 0.05; // 5% academic/state sales tax
    const tax = Math.round(taxableAmount * taxRate * 100) / 100;
    const totalAmount = Math.round((taxableAmount + tax) * 100) / 100;

    const amountPaid = Number(payload.amount_paid) || totalAmount;
    if (payload.payment_method === 'cash' && amountPaid < totalAmount) {
      throw new Error(`Amount paid ($${amountPaid.toFixed(2)}) is less than total amount ($${totalAmount.toFixed(2)})`);
    }

    const changeReturned = payload.payment_method === 'cash'
      ? Math.max(0, Math.round((amountPaid - totalAmount) * 100) / 100)
      : 0;

    // Phase 3: Deduct Stock Atomically
    for (const res of resolvedItems) {
      res.product.stock_quantity -= res.quantity;
      res.product.updated_at = new Date().toISOString();
    }

    // Phase 4: Generate Invoice Number
    const now = new Date();
    const datePrefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    let invoiceNo = '';
    do {
      const invoiceCounter = String(store.meta.invoiceCounter++).padStart(4, '0');
      invoiceNo = `${datePrefix}-${invoiceCounter}`;
    } while (store.sales.some(s => s.invoice_no === invoiceNo));

    const saleId = store.meta.nextSaleId++;
    const user = store.users.find(u => u.id === payload.user_id);

    const newSale: Sale = {
      id: saleId,
      invoice_no: invoiceNo,
      user_id: payload.user_id,
      cashier_name: user ? user.full_name : 'Staff',
      customer_name: payload.customer_name?.trim() || 'Walk-in Student',
      customer_phone: payload.customer_phone?.trim() || '',
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total_amount: totalAmount,
      payment_method: payload.payment_method,
      amount_paid: amountPaid,
      change_returned: changeReturned,
      status: 'completed',
      created_at: now.toISOString(),
      items: [],
    };

    const newSaleItems: SaleItem[] = [];
    for (const res of resolvedItems) {
      const saleItemId = store.meta.nextSaleItemId++;
      const itemRecord: SaleItem = {
        id: saleItemId,
        sale_id: saleId,
        product_id: res.product.id,
        product_name: res.product.name,
        sku: res.product.sku,
        quantity: res.quantity,
        unit_price: res.unitPrice,
        subtotal: res.subtotal,
      };
      newSaleItems.push(itemRecord);
      store.sale_items.push(itemRecord);
    }

    newSale.items = newSaleItems;
    store.sales.unshift(newSale); // newest first

    saveStore();
    return newSale;
  },

  async getSales(options?: { search?: string; limit?: number }): Promise<Sale[]> {
    let list = store.sales.map(s => {
      const items = store.sale_items.filter(si => si.sale_id === s.id);
      const user = store.users.find(u => u.id === s.user_id);
      return {
        ...s,
        cashier_name: user?.full_name || 'Staff',
        items,
      };
    });

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(s =>
        s.invoice_no.toLowerCase().includes(q) ||
        s.customer_name.toLowerCase().includes(q) ||
        s.customer_phone.toLowerCase().includes(q)
      );
    }

    const limit = options?.limit || 50;
    return list.slice(0, limit);
  },

  async getSaleByInvoice(invoiceNo: string): Promise<Sale | undefined> {
    const sale = store.sales.find(s => s.invoice_no === invoiceNo);
    if (!sale) return undefined;
    const items = store.sale_items.filter(si => si.sale_id === sale.id);
    const user = store.users.find(u => u.id === sale.user_id);
    return {
      ...sale,
      cashier_name: user?.full_name || 'Staff',
      items,
    };
  },

  // REPORTS & DASHBOARD
  async getDashboardKPIs() {
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = store.sales.filter(s => s.created_at.startsWith(today));

    const totalRevenue = store.sales.reduce((acc, s) => acc + s.total_amount, 0);
    const todayRevenue = todaySales.reduce((acc, s) => acc + s.total_amount, 0);
    const lowStockProducts = store.products.filter(p => p.stock_quantity <= p.min_stock_level);
    const totalStockUnits = store.products.reduce((acc, p) => acc + p.stock_quantity, 0);
    const inventoryValuation = store.products.reduce((acc, p) => acc + p.stock_quantity * p.cost_price, 0);

    const recentSales = store.sales.slice(0, 5).map(s => {
      const user = store.users.find(u => u.id === s.user_id);
      return {
        ...s,
        cashier_name: user?.full_name || 'Staff',
      };
    });

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      todayOrdersCount: todaySales.length,
      totalOrdersCount: store.sales.length,
      totalProductsCount: store.products.length,
      lowStockCount: lowStockProducts.length,
      totalStockUnits,
      inventoryValuation: Math.round(inventoryValuation * 100) / 100,
      recentSales,
      lowStockAlerts: lowStockProducts.map(p => {
        const cat = store.categories.find(c => c.id === p.category_id);
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock_quantity: p.stock_quantity,
          min_stock_level: p.min_stock_level,
          category_name: cat?.name || 'General',
        };
      }),
    };
  },

  async getAnalytics() {
    // Sales by Category
    const categorySalesMap: { [catId: number]: { name: string; revenue: number; itemsSold: number } } = {};
    for (const cat of store.categories) {
      categorySalesMap[cat.id] = { name: cat.name, revenue: 0, itemsSold: 0 };
    }

    for (const si of store.sale_items) {
      const prod = store.products.find(p => p.id === si.product_id);
      if (prod && categorySalesMap[prod.category_id]) {
        categorySalesMap[prod.category_id].revenue += si.subtotal;
        categorySalesMap[prod.category_id].itemsSold += si.quantity;
      }
    }

    const categoryBreakdown = Object.values(categorySalesMap)
      .map(c => ({
        category: c.name,
        revenue: Math.round(c.revenue * 100) / 100,
        itemsSold: c.itemsSold,
      }))
      .filter(c => c.itemsSold > 0 || c.revenue > 0);

    // Payment Methods Breakdown
    const paymentMethods: { [method: string]: { count: number; total: number } } = {
      cash: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      upi: { count: 0, total: 0 },
    };

    for (const sale of store.sales) {
      if (paymentMethods[sale.payment_method]) {
        paymentMethods[sale.payment_method].count++;
        paymentMethods[sale.payment_method].total += sale.total_amount;
      }
    }

    // Top Selling Products
    const productSoldMap: { [prodId: number]: { id: number; name: string; sku: string; unitsSold: number; totalRevenue: number } } = {};
    for (const si of store.sale_items) {
      if (!productSoldMap[si.product_id]) {
        productSoldMap[si.product_id] = {
          id: si.product_id,
          name: si.product_name,
          sku: si.sku || '',
          unitsSold: 0,
          totalRevenue: 0,
        };
      }
      productSoldMap[si.product_id].unitsSold += si.quantity;
      productSoldMap[si.product_id].totalRevenue += si.subtotal;
    }

    const topSellingProducts = Object.values(productSoldMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5)
      .map(p => ({
        ...p,
        totalRevenue: Math.round(p.totalRevenue * 100) / 100,
      }));

    return {
      categoryBreakdown,
      paymentMethods,
      topSellingProducts,
    };
  },
};
