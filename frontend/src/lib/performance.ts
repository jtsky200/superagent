// @ts-nocheck
// Performance optimization utilities for CADILLAC EV CIS

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Memory management utilities
export class MemoryManager {
  private static cache = new Map<string, any>();
  private static maxSize = 100;

  static set(key: string, value: any): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  static get(key: string): any {
    return this.cache.get(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static has(key: string): boolean {
    return this.cache.has(key);
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(label: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  }

  static endTimer(label: string): number {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = performance.getEntriesByName(label)[0];
      const duration = measure.duration;
      
      // Store metric
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
      
      // Clean up
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
      
      return duration;
    }
    return 0;
  }

  static getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }

  static getMetrics(): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

// Image optimization
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Bundle size optimization
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Virtual scrolling utilities
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number
): { start: number; end: number } {
  const start = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(start + visibleCount + 1, totalItems);
  
  return {
    start: Math.max(0, start - 5), // Buffer
    end: Math.min(totalItems, end + 5), // Buffer
  };
}

// Service Worker utilities
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

// Cache management
export class CacheManager {
  private static cacheName = 'cadillac-ev-cis-cache-v1';

  static async cacheResponse(url: string, response: Response): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      await cache.put(url, response.clone());
    }
  }

  static async getCachedResponse(url: string): Promise<Response | null> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      return await cache.match(url);
    }
    return null;
  }

  static async clearCache(): Promise<void> {
    if ('caches' in window) {
      await caches.delete(this.cacheName);
    }
  }
}

// Network status monitoring
export class NetworkMonitor {
  private static listeners: ((online: boolean) => void)[] = [];

  static init(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notifyListeners(true));
      window.addEventListener('offline', () => this.notifyListeners(false));
    }
  }

  static addListener(callback: (online: boolean) => void): void {
    this.listeners.push(callback);
  }

  static removeListener(callback: (online: boolean) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private static notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }

  static isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}

// Initialize network monitoring
if (typeof window !== 'undefined') {
  NetworkMonitor.init();
} 