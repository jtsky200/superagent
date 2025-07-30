import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  canton?: string;
  customerType: 'private' | 'business';
  company?: {
    companyName: string;
    uidNumber?: string;
    legalForm?: string;
  };
}

interface Vehicle {
  id: string;
  modelName: string;
  modelVariant: string;
  modelYear: number;
  basePriceChf: number;
  wltpRangeKm: number;
  powerKw: number;
  powerPs: number;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: (token: string, user: User) => {
        localStorage.setItem('auth_token', token);
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ token: null, user: null, isAuthenticated: false });
      },
      setUser: (user: User) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Customer Store
interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  searchQuery: string;
  filters: {
    type?: 'private' | 'business';
    canton?: string;
  };
  isLoading: boolean;
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<CustomerState['filters']>) => void;
  setLoading: (loading: boolean) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  selectedCustomer: null,
  searchQuery: '',
  filters: {},
  isLoading: false,
  setCustomers: (customers) => set({ customers }),
  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (isLoading) => set({ isLoading }),
  addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c),
    selectedCustomer: state.selectedCustomer?.id === id 
      ? { ...state.selectedCustomer, ...updates } 
      : state.selectedCustomer
  })),
  removeCustomer: (id) => set((state) => ({
    customers: state.customers.filter(c => c.id !== id),
    selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer
  })),
}));

// Vehicle Store
interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  vehicleOptions: any[];
  isLoading: boolean;
  setVehicles: (vehicles: Vehicle[]) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setVehicleOptions: (options: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: [],
  selectedVehicle: null,
  vehicleOptions: [],
  isLoading: false,
  setVehicles: (vehicles) => set({ vehicles }),
  setSelectedVehicle: (selectedVehicle) => set({ selectedVehicle }),
  setVehicleOptions: (vehicleOptions) => set({ vehicleOptions }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// TCO Store
interface TcoState {
  calculations: any[];
  currentCalculation: any | null;
  isCalculating: boolean;
  setCalculations: (calculations: any[]) => void;
  setCurrentCalculation: (calculation: any | null) => void;
  setCalculating: (calculating: boolean) => void;
  addCalculation: (calculation: any) => void;
}

export const useTcoStore = create<TcoState>((set) => ({
  calculations: [],
  currentCalculation: null,
  isCalculating: false,
  setCalculations: (calculations) => set({ calculations }),
  setCurrentCalculation: (currentCalculation) => set({ currentCalculation }),
  setCalculating: (isCalculating) => set({ isCalculating }),
  addCalculation: (calculation) => set((state) => ({ 
    calculations: [...state.calculations, calculation] 
  })),
}));

// Notification Store
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  }),
  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false,
    };
    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  removeNotification: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id);
    return {
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: notification && !notification.read 
        ? Math.max(0, state.unreadCount - 1) 
        : state.unreadCount,
    };
  }),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// UI Store
interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      loading: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        sidebarOpen: state.sidebarOpen, 
        theme: state.theme 
      }),
    }
  )
);

// Swiss Data Store
interface SwissDataState {
  cantons: any[];
  electricityPrices: any;
  companySearchResults: any[];
  isSearching: boolean;
  setCantons: (cantons: any[]) => void;
  setElectricityPrices: (prices: any) => void;
  setCompanySearchResults: (results: any[]) => void;
  setSearching: (searching: boolean) => void;
}

export const useSwissDataStore = create<SwissDataState>((set) => ({
  cantons: [],
  electricityPrices: null,
  companySearchResults: [],
  isSearching: false,
  setCantons: (cantons) => set({ cantons }),
  setElectricityPrices: (electricityPrices) => set({ electricityPrices }),
  setCompanySearchResults: (companySearchResults) => set({ companySearchResults }),
  setSearching: (isSearching) => set({ isSearching }),
}));

