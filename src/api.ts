import {
  User,
  Category,
  Product,
  Sale,
  DashboardKPIs,
  AnalyticsData,
  DatabaseStatus,
} from './types/index.ts';

const TOKEN_KEY = 'smartstock_jwt_token';
const USER_KEY = 'smartstock_user_profile';

class ApiService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch {
        this.currentUser = null;
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setSession(token: string, user: User) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearSession() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearSession();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    if (!response.ok) {
      let errorMessage = 'Network request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async getUsers(): Promise<{ users: User[] }> {
    return this.request<{ users: User[] }>('/auth/users');
  }

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    return this.request<{ categories: Category[] }>('/categories');
  }

  async createCategory(data: { name: string; description: string }): Promise<{ category: Category }> {
    return this.request<{ category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: { name: string; description: string }): Promise<{ category: Category }> {
    return this.request<{ category: Category }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts(params?: { category_id?: number; search?: string; low_stock?: boolean }): Promise<{ products: Product[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.category_id) query.append('category_id', String(params.category_id));
    if (params?.search) query.append('search', params.search);
    if (params?.low_stock) query.append('low_stock', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ products: Product[]; total: number }>(`/products${qs}`);
  }

  async getProductById(id: number): Promise<{ product: Product }> {
    return this.request<{ product: Product }>(`/products/${id}`);
  }

  async createProduct(data: Partial<Product>): Promise<{ product: Product }> {
    return this.request<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<{ product: Product }> {
    return this.request<{ product: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async restockProduct(id: number, quantity: number): Promise<{ product: Product; message: string }> {
    return this.request<{ product: Product; message: string }>(`/products/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Sales
  async createSale(data: {
    items: { product_id: number; quantity: number }[];
    customer_name?: string;
    customer_phone?: string;
    discount?: number;
    payment_method: 'cash' | 'card' | 'upi';
    amount_paid: number;
  }): Promise<{ sale: Sale }> {
    return this.request<{ sale: Sale }>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSales(params?: { search?: string; limit?: number }): Promise<{ sales: Sale[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ sales: Sale[]; count: number }>(`/sales${qs}`);
  }

  async getSaleByInvoice(invoiceNo: string): Promise<{ sale: Sale }> {
    return this.request<{ sale: Sale }>(`/sales/${invoiceNo}`);
  }

  getReceiptUrl(invoiceNo: string): string {
    return `/api/sales/${invoiceNo}/receipt`;
  }

  // Reports
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    return this.request<DashboardKPIs>('/reports/dashboard');
  }

  async getAnalytics(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>('/reports/analytics');
  }

  getExportCsvUrl(type: 'sales' | 'products'): string {
    const tokenParam = this.token ? `&token=${this.token}` : '';
    return `/api/reports/export/csv?type=${type}${tokenParam}`;
  }

  // System & Database
  async getSystemStatus(): Promise<DatabaseStatus> {
    return this.request<DatabaseStatus>('/reports/system/status');
  }

  async resetDatabase(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/reports/system/reset', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
