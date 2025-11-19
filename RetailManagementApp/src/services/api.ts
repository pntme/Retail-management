import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// Update this URL to point to your backend server
// For local development: use your computer's IP address (not localhost)
// Example: 'http://192.168.1.100:3000' or your Railway deployment URL
const API_BASE_URL = 'http://10.0.2.2:3000'; // Android emulator default (localhost on host machine)

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - logout
          AsyncStorage.removeItem('token');
          AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(username: string, password: string) {
    const response = await this.api.post('/api/auth/login', { username, password });
    return response.data;
  }

  // Customers
  async getCustomers(search?: string) {
    const response = await this.api.get('/api/customers', {
      params: { search },
    });
    return response.data;
  }

  async getCustomer(id: number) {
    const response = await this.api.get(`/api/customers/${id}`);
    return response.data;
  }

  async createCustomer(customer: any) {
    const response = await this.api.post('/api/customers', customer);
    return response.data;
  }

  async updateCustomer(id: number, customer: any) {
    const response = await this.api.put(`/api/customers/${id}`, customer);
    return response.data;
  }

  async deleteCustomer(id: number) {
    const response = await this.api.delete(`/api/customers/${id}`);
    return response.data;
  }

  async getCustomerCallLogs(id: number) {
    const response = await this.api.get(`/api/customers/${id}/call-logs`);
    return response.data;
  }

  async addCustomerCallLog(id: number, note: string) {
    const response = await this.api.post(`/api/customers/${id}/call-logs`, { note });
    return response.data;
  }

  async getCustomerServiceHistory(id: number) {
    const response = await this.api.get(`/api/customers/${id}/service-history`);
    return response.data;
  }

  // Products
  async getProducts() {
    const response = await this.api.get('/api/products');
    return response.data;
  }

  async getProduct(id: number) {
    const response = await this.api.get(`/api/products/${id}`);
    return response.data;
  }

  async createProduct(product: any) {
    const response = await this.api.post('/api/products', product);
    return response.data;
  }

  async updateProduct(id: number, product: any) {
    const response = await this.api.put(`/api/products/${id}`, product);
    return response.data;
  }

  async deleteProduct(id: number) {
    const response = await this.api.delete(`/api/products/${id}`);
    return response.data;
  }

  // Inventory Transactions
  async getInventoryTransactions() {
    const response = await this.api.get('/api/inventory-transactions');
    return response.data;
  }

  async getProductTransactions(productId: number) {
    const response = await this.api.get(`/api/inventory-transactions/product/${productId}`);
    return response.data;
  }

  async createInventoryTransaction(transaction: any) {
    const response = await this.api.post('/api/inventory-transactions', transaction);
    return response.data;
  }

  // Sales
  async getSales(page: number = 1, limit: number = 20) {
    const response = await this.api.get('/api/sales', {
      params: { page, limit },
    });
    return response.data;
  }

  async getSale(id: number) {
    const response = await this.api.get(`/api/sales/${id}`);
    return response.data;
  }

  async createSale(sale: any) {
    const response = await this.api.post('/api/sales', sale);
    return response.data;
  }

  // Dashboard
  async getDashboardStats() {
    const response = await this.api.get('/api/dashboard/stats');
    return response.data;
  }

  async getLowStockItems() {
    const response = await this.api.get('/api/dashboard/low-stock');
    return response.data;
  }

  async getRecentSales() {
    const response = await this.api.get('/api/dashboard/recent-sales');
    return response.data;
  }

  // Job Cards
  async getJobCards(page: number = 1, limit: number = 20, status?: string) {
    const response = await this.api.get('/api/job-cards', {
      params: { page, limit, status },
    });
    return response.data;
  }

  async searchCustomer(query: string) {
    const response = await this.api.get('/api/job-cards/search-customer', {
      params: { query },
    });
    return response.data;
  }

  async getJobCard(id: number) {
    const response = await this.api.get(`/api/job-cards/${id}`);
    return response.data;
  }

  async createJobCard(jobCard: any) {
    const response = await this.api.post('/api/job-cards', jobCard);
    return response.data;
  }

  async updateJobCard(id: number, jobCard: any) {
    const response = await this.api.put(`/api/job-cards/${id}`, jobCard);
    return response.data;
  }

  async addJobCardStockItem(jobCardId: number, stockItem: any) {
    const response = await this.api.post(`/api/job-cards/${jobCardId}/stock-items`, stockItem);
    return response.data;
  }

  async removeJobCardStockItem(jobCardId: number, stockItemId: number) {
    const response = await this.api.delete(`/api/job-cards/${jobCardId}/stock-items/${stockItemId}`);
    return response.data;
  }

  async addJobCardTask(jobCardId: number, task: any) {
    const response = await this.api.post(`/api/job-cards/${jobCardId}/tasks`, task);
    return response.data;
  }

  async updateJobCardTask(jobCardId: number, taskId: number, task: any) {
    const response = await this.api.put(`/api/job-cards/${jobCardId}/tasks/${taskId}`, task);
    return response.data;
  }

  async deleteJobCardTask(jobCardId: number, taskId: number) {
    const response = await this.api.delete(`/api/job-cards/${jobCardId}/tasks/${taskId}`);
    return response.data;
  }

  async completeJobCard(id: number) {
    const response = await this.api.post(`/api/job-cards/${id}/complete`);
    return response.data;
  }

  async rejectJobCard(id: number) {
    const response = await this.api.post(`/api/job-cards/${id}/reject`);
    return response.data;
  }

  async getJobCardBill(id: number) {
    const response = await this.api.get(`/api/job-cards/${id}/bill`);
    return response.data;
  }

  // Bills
  async getBills() {
    const response = await this.api.get('/api/bills');
    return response.data;
  }

  async getBill(id: number) {
    const response = await this.api.get(`/api/bills/${id}`);
    return response.data;
  }

  async markBillPaid(id: number, paymentMethod: string, amountPaid: number) {
    const response = await this.api.post(`/api/bills/${id}/mark-paid`, {
      paymentMethod,
      amountPaid,
    });
    return response.data;
  }

  async cancelBill(id: number) {
    const response = await this.api.post(`/api/bills/${id}/cancel`);
    return response.data;
  }

  // Reports
  async getProfitLossReport(startDate?: string, endDate?: string) {
    const response = await this.api.get('/api/reports/profit-loss', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  // Services
  async getServices() {
    const response = await this.api.get('/api/services');
    return response.data;
  }

  async createService(service: any) {
    const response = await this.api.post('/api/services', service);
    return response.data;
  }

  async updateService(id: number, service: any) {
    const response = await this.api.put(`/api/services/${id}`, service);
    return response.data;
  }

  // Document Upload
  async uploadDocument(formData: FormData) {
    const response = await this.api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getDocuments(entityType: string, entityId: number) {
    const response = await this.api.get(`/api/documents/${entityType}/${entityId}`);
    return response.data;
  }

  async deleteDocument(id: number) {
    const response = await this.api.delete(`/api/documents/${id}`);
    return response.data;
  }
}

export default new ApiService();
