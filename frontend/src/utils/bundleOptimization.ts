// @ts-nocheck
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare const __webpack_share_scopes__: any;

// Bundle optimization utilities

// Dynamic import wrapper with error handling
export async function dynamicImport<T = any>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T> {
  try {
    const importedModule = await importFn();
    return importedModule.default;
  } catch (error) {
    console.error('Dynamic import failed:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

// Lazy component loader with retry logic
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    retries?: number;
    retryDelay?: number;
    fallback?: React.ComponentType;
  } = {}
): React.LazyExoticComponent<T> {
  const { retries = 3, retryDelay = 1000 } = options;

  return React.lazy(async () => {
    let lastError: Error = new Error('Unknown import error');
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  });
}

// Preload critical components
export function preloadComponent(importFn: () => Promise<any>): void {
  if (typeof window !== 'undefined') {
    // Preload on idle or after a short delay
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn());
    } else {
      setTimeout(() => importFn(), 100);
    }
  }
}

// Resource hints for optimization
export function addResourceHint(
  href: string,
  as: 'script' | 'style' | 'image' | 'font' | 'document',
  rel: 'preload' | 'prefetch' | 'dns-prefetch' | 'preconnect' = 'preload'
): void {
  if (typeof document === 'undefined') return;

  // Check if hint already exists
  const existing = document.querySelector(`link[href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (rel === 'preload') {
    link.as = as;
  }
  
  document.head.appendChild(link);
}

// Tree-shakable icon imports
export const Icons = {
  // Analytics icons
  get BarChart3() {
    return dynamicImport(() => import('lucide-react').then(m => ({ default: m.BarChart3 })));
  },
  get TrendingUp() {
    return dynamicImport(() => import('lucide-react').then(m => ({ default: m.TrendingUp })));
  },
  get Users() {
    return dynamicImport(() => import('lucide-react').then(m => ({ default: m.Users })));
  },
  get DollarSign() {
    return dynamicImport(() => import('lucide-react').then(m => ({ default: m.DollarSign })));
  },
  get Brain() {
    return dynamicImport(() => import('lucide-react').then(m => ({ default: m.Brain })));
  },
  // Common icons
  get Home() {
    return dynamicImport(() => import('lucide-react').then(m => ({ default: m.Home })));
  },
  get Search() {
    return dynamicImport(() => import('lucide-react').then(m => ({ default: m.Search })));
  },
  get Settings() {
    return dynamicImport(() => import('lucide-react').then(m => ({ default: m.Settings })));
  },
  get RefreshCw() {
    return dynamicImport(() => import('lucide-react').then(m => ({ default: m.RefreshCw })));
  }
};

// Bundle analyzer helper (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') return;

  // Estimate bundle size
  const scripts = Array.from(document.scripts);
  let totalSize = 0;

  scripts.forEach(script => {
    if (script.src) {
      fetch(script.src, { method: 'HEAD' })
        .then(response => {
          const size = response.headers.get('content-length');
          if (size) {
            totalSize += parseInt(size, 10);
            console.log(`Script ${script.src}: ${(parseInt(size, 10) / 1024).toFixed(2)} KB`);
          }
        })
        .catch(() => {
          // Ignore errors for cross-origin scripts
        });
    }
  });

  setTimeout(() => {
    console.log(`Estimated total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
  }, 2000);
}

// Code splitting by route
export const RouteComponents = {
  Dashboard: createLazyComponent(
    () => import('@/app/page'),
    { retries: 3 }
  ),
  Analytics: createLazyComponent(
    () => import('@/components/analytics/AnalyticsDashboard'),
    { retries: 3 }
  ),
  SwissServices: createLazyComponent(
    () => import('@/components/swiss/SwissServicesPage'),
    { retries: 3 }
  ),
  Customers: createLazyComponent(
    () => import('@/app/customers/page'),
    { retries: 3 }
  )
};

// Module federation helper for microfrontends
export function loadMicrofrontend(
  remoteUrl: string,
  scope: string,
  module: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = remoteUrl;
    script.onerror = reject;
    script.onload = () => {
      // Get the container from window
      const container = (window as any)[scope];
      if (!container) {
        reject(new Error(`Container ${scope} not found`));
        return;
      }

      // Initialize and get the module
      container.init(__webpack_share_scopes__.default);
      container.get(module).then((factory: any) => {
        const Module = factory();
        resolve(Module);
      }).catch(reject);
    };

    document.head.appendChild(script);
  });
}

// Service worker registration for caching
export function registerServiceWorker(swUrl: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  return navigator.serviceWorker.register(swUrl)
    .then(registration => {
      console.log('Service Worker registered:', registration);
      return registration;
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
      return null;
    });
}

// Critical CSS extraction helper
export function extractCriticalCSS(): string {
  const criticalStyles: string[] = [];
  
  // Get styles from inline style tags
  document.querySelectorAll('style').forEach(style => {
    if (style.textContent) {
      criticalStyles.push(style.textContent);
    }
  });

  return criticalStyles.join('\n');
}

// Optimize images with lazy loading and WebP support
export function optimizeImageSrc(src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
} = {}): string {
  const { width, height, quality = 80, format = 'auto' } = options;
  
  // Check WebP support
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  })();

  let optimizedSrc = src;
  
  // Add optimization parameters if using a CDN
  if (src.includes('cloudinary.com') || src.includes('imagekit.io')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    
    if (format === 'auto') {
      params.set('f', supportsWebP ? 'webp' : 'auto');
    } else {
      params.set('f', format);
    }
    
    optimizedSrc = `${src}?${params.toString()}`;
  }
  
  return optimizedSrc;
}