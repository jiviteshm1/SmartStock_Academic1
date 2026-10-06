export interface User {
  id: number;
  username: string;
  role: 'admin' | 'cashier';
  full_name: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  product_count?: number;
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

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
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

export interface DashboardKPIs {
  totalRevenue: number;
  todayRevenue: number;
  todayOrdersCount: number;
  totalOrdersCount: number;
  totalProductsCount: number;
  lowStockCount: number;
  totalStockUnits: number;
  inventoryValuation: number;
  recentSales: Sale[];
  lowStockAlerts: {
    id: number;
    name: string;
    sku: string;
    stock_quantity: number;
    min_stock_level: number;
    category_name: string;
  }[];
}

export interface AnalyticsData {
  categoryBreakdown: {
    category: string;
    revenue: number;
    itemsSold: number;
  }[];
  paymentMethods: {
    [key: string]: {
      count: number;
      total: number;
    };
  };
  topSellingProducts: {
    id: number;
    name: string;
    sku: string;
    unitsSold: number;
    totalRevenue: number;
  }[];
}

export interface DatabaseStatus {
  isUsingMySQL: boolean;
  engine: string;
  statusMessage: string;
  counts: {
    products: number;
    categories: number;
    sales: number;
    users: number;
  };
}
