import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookie
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Generic API methods
export const api = {
  // GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data.data as T;
  },

  // POST request
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  },

  // PUT request
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  },

  // PATCH request
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  },

  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data.data as T;
  },
};

// Specific API endpoints
export const customerApi = {
  // Get all customers
  getCustomers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    canton?: string;
  }) => api.get<PaginatedResponse<any>>('/customers', { params }),

  // Get customer by ID
  getCustomer: (id: string) => api.get<any>(`/customers/${id}`),

  // Create customer
  createCustomer: (data: any) => api.post<any>('/customers', data),

  // Update customer
  updateCustomer: (id: string, data: any) => api.put<any>(`/customers/${id}`, data),

  // Delete customer
  deleteCustomer: (id: string) => api.delete<void>(`/customers/${id}`),

  // Search customers
  searchCustomers: (query: string) => api.get<any[]>(`/customers/search?q=${encodeURIComponent(query)}`),
};

export const vehicleApi = {
  // Get all vehicles
  getVehicles: () => api.get<any[]>('/vehicles'),

  // Get vehicle by ID
  getVehicle: (id: string) => api.get<any>(`/vehicles/${id}`),

  // Get vehicle options
  getVehicleOptions: () => api.get<any[]>('/vehicles/options'),

  // Create vehicle configuration
  createConfiguration: (data: any) => api.post<any>('/vehicles/configurations', data),

  // Get customer configurations
  getCustomerConfigurations: (customerId: string) => api.get<any[]>(`/customers/${customerId}/configurations`),
};

export const tcoApi = {
  // Calculate TCO
  calculateTco: (data: {
    vehicleId: string;
    customerId?: string;
    canton: string;
    durationYears: number;
    annualKilometers: number;
    chargingMix: {
      homeCharging: number;
      publicCharging: number;
      fastCharging: number;
    };
  }) => api.post<any>('/tco/calculate', data),

  // Get TCO calculations
  getTcoCalculations: (customerId?: string) => api.get<any[]>('/tco/calculations', {
    params: customerId ? { customerId } : undefined
  }),

  // Get TCO calculation by ID
  getTcoCalculation: (id: string) => api.get<any>(`/tco/calculations/${id}`),
};

export const analysisApi = {
  // Analyze customer
  analyzeCustomer: (customerId: string, analysisType?: string) => 
    api.post<any>(`/analysis/customers/${customerId}`, { analysisType }),

  // Get customer analysis
  getCustomerAnalysis: (customerId: string) => api.get<any[]>(`/analysis/customers/${customerId}`),

  // Get analysis by ID
  getAnalysis: (id: string) => api.get<any>(`/analysis/${id}`),
};

export const authApi = {
  // Login
  login: (credentials: { email: string; password: string }) => 
    api.post<{ token: string; user: any }>('/auth/login', credentials),

  // Register
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => 
    api.post<{ token: string; user: any }>('/auth/register', userData),

  // Refresh token
  refreshToken: () => api.post<{ token: string }>('/auth/refresh'),

  // Logout
  logout: () => api.post<void>('/auth/logout'),

  // Get current user
  getCurrentUser: () => api.get<any>('/auth/me'),
};

export const swissDataApi = {
  // Search company in Handelsregister
  searchCompany: (query: string) => api.get<any[]>(`/swiss-data/companies/search?q=${encodeURIComponent(query)}`),

  // Get company details
  getCompanyDetails: (uid: string) => api.get<any>(`/swiss-data/companies/${uid}`),

  // Get credit information
  getCreditInfo: (customerId: string) => api.get<any>(`/swiss-data/credit/${customerId}`),

  // Get canton data
  getCantons: () => api.get<any[]>('/swiss-data/cantons'),

  // Get electricity prices
  getElectricityPrices: (canton?: string) => api.get<any>('/swiss-data/electricity-prices', {
    params: canton ? { canton } : undefined
  }),
};

export const notificationApi = {
  // Get notifications
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => 
    api.get<PaginatedResponse<any>>('/notifications', { params }),

  // Mark notification as read
  markAsRead: (id: string) => api.patch<void>(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.patch<void>('/notifications/read-all'),

  // Delete notification
  deleteNotification: (id: string) => api.delete<void>(`/notifications/${id}`),
};

export const reportApi = {
  // Generate customer report
  generateCustomerReport: (customerId: string, format: 'pdf' | 'excel' = 'pdf') => 
    api.post<{ downloadUrl: string }>(`/reports/customers/${customerId}`, { format }),

  // Generate TCO report
  generateTcoReport: (calculationId: string, format: 'pdf' | 'excel' = 'pdf') => 
    api.post<{ downloadUrl: string }>(`/reports/tco/${calculationId}`, { format }),

  // Generate sales report
  generateSalesReport: (params: {
    startDate: string;
    endDate: string;
    canton?: string;
    vehicleModel?: string;
    format?: 'pdf' | 'excel';
  }) => api.post<{ downloadUrl: string }>('/reports/sales', params),
};

// Export the axios instance for custom requests
export { apiClient };
export default api;

