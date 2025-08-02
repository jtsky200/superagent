// @ts-nocheck
// API optimization utilities

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
  expires?: number;
}

interface RequestOptions extends RequestInit {
  cache?: 'force-cache' | 'no-cache' | 'default';
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Advanced caching with ETags and TTL
export class APICache {
  private static cache = new Map<string, CacheEntry<any>>();
  private static maxSize = 100; // Maximum cache entries
  private static accessOrder = new Map<string, number>(); // LRU tracking

  static set<T>(key: string, data: T, options: {
    ttl?: number;
    etag?: string;
  } = {}): void {
    const { ttl = 300000, etag } = options; // 5 minutes default TTL
    
    // Implement LRU eviction
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.accessOrder.entries())
        .sort(([, a], [, b]) => a - b)[0]?.[0];
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.accessOrder.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag,
      expires: Date.now() + ttl
    });
    
    this.accessOrder.set(key, Date.now());
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (entry.expires && Date.now() > entry.expires) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Update access time for LRU
    this.accessOrder.set(key, Date.now());
    return entry.data;
  }

  static getETag(key: string): string | undefined {
    const entry = this.cache.get(key);
    return entry?.etag;
  }

  static invalidate(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          this.accessOrder.delete(key);
        }
      }
    } else {
      this.cache.clear();
      this.accessOrder.clear();
    }
  }

  static getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.accessOrder.size > 0 ? this.cache.size / this.accessOrder.size : 0
    };
  }
}

// Request deduplication
export class RequestDeduplicator {
  private static pendingRequests = new Map<string, Promise<any>>();

  static async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Return existing promise if request is already in flight
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn()
      .finally(() => {
        // Remove from pending requests when complete
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  static clear(key?: string): void {
    if (key) {
      this.pendingRequests.delete(key);
    } else {
      this.pendingRequests.clear();
    }
  }
}

// Optimized fetch with compression, caching, and retries
export async function optimizedFetch<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    cache = 'default',
    timeout = 10000,
    retries = 2,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const cacheKey = `${url}-${JSON.stringify(fetchOptions)}`;

  // Check cache first (unless no-cache)
  if (cache !== 'no-cache') {
    const cached = APICache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Request deduplication
  return RequestDeduplicator.dedupe(cacheKey, async () => {
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers = new Headers(fetchOptions.headers);
        
        // Add compression support
        headers.set('Accept-Encoding', 'gzip, deflate, br');
        
        // Add ETag header for conditional requests
        const etag = APICache.getETag(cacheKey);
        if (etag && cache !== 'no-cache') {
          headers.set('If-None-Match', etag);
        }

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle 304 Not Modified
        if (response.status === 304) {
          const cached = APICache.get<T>(cacheKey);
          if (cached) return cached;
        }

        if (!response.ok) {
          if (response.status === 503) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Service is currently unavailable');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseETag = response.headers.get('etag');
        const data = await response.json();

        // Cache successful responses (unless no-cache)
        if (cache !== 'no-cache') {
          const cacheControl = response.headers.get('cache-control');
          const maxAge = cacheControl?.match(/max-age=(\d+)/)?.[1];
          const ttl = maxAge ? parseInt(maxAge, 10) * 1000 : undefined;

          APICache.set(cacheKey, data, {
            ttl,
            etag: responseETag || undefined
          });
        }

        return data;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (
          error.name === 'AbortError' ||
          error.message.includes('unavailable') ||
          attempt === retries
        ) {
          throw error;
        }

        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }

    throw lastError;
  });
}

// Batch API requests
export class BatchRequestManager {
  private static batches = new Map<string, {
    requests: Array<{
      resolve: (value: any) => void;
      reject: (error: any) => void;
      data: any;
    }>;
    timeout: number;
  }>();

  static async addToBatch<T>(
    batchKey: string,
    data: any,
    batchSize: number = 10,
    maxWait: number = 100
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, {
          requests: [],
          timeout: 0
        });
      }

      const batch = this.batches.get(batchKey)!;
      batch.requests.push({ resolve, reject, data });

      // Clear existing timeout
      if (batch.timeout) {
        clearTimeout(batch.timeout);
      }

      // Process batch if size limit reached or set timeout
      if (batch.requests.length >= batchSize) {
        this.processBatch(batchKey);
      } else {
        batch.timeout = window.setTimeout(() => {
          this.processBatch(batchKey);
        }, maxWait);
      }
    });
  }

  private static async processBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.requests.length === 0) return;

    const requests = batch.requests.slice();
    this.batches.delete(batchKey);

    try {
      // Make batch API call
      const response = await optimizedFetch(`/api/batch/${batchKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: requests.map(r => r.data)
        })
      });

      // Resolve individual requests
      response.results.forEach((result: any, index: number) => {
        if (result.success) {
          requests[index].resolve(result.data);
        } else {
          requests[index].reject(new Error(result.error));
        }
      });

    } catch (error) {
      // Reject all requests in batch
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }
}

// Response compression and pagination
export function createPaginatedRequest<T>(
  baseUrl: string,
  options: {
    pageSize?: number;
    filters?: Record<string, any>;
    sort?: string;
  } = {}
) {
  const { pageSize = 20, filters = {}, sort } = options;
  
  return {
    async getPage(page: number = 1): Promise<{
      data: T[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }> {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== '') {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      if (sort) {
        params.set('sort', sort);
      }

      return optimizedFetch(`${baseUrl}?${params.toString()}`);
    },

    async *getAllPages(): AsyncGenerator<T[], void, unknown> {
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const response = await this.getPage(page);
        yield response.data;
        
        hasNext = response.pagination.hasNext;
        page++;
      }
    }
  };
}

// GraphQL query optimization
export function optimizeGraphQLQuery(query: string): string {
  return query
    // Remove comments
    .replace(/\s*#[^\n]*/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove unnecessary whitespace around punctuation
    .replace(/\s*([{}(),:])\s*/g, '$1')
    .trim();
}

// API response optimization middleware
export function createAPIMiddleware() {
  const middleware: Array<(request: Request, next: () => Promise<Response>) => Promise<Response>> = [];

  return {
    use(fn: (request: Request, next: () => Promise<Response>) => Promise<Response>) {
      middleware.push(fn);
    },

    async execute(request: Request, finalHandler: () => Promise<Response>): Promise<Response> {
      let index = 0;

      const next = async (): Promise<Response> => {
        if (index >= middleware.length) {
          return finalHandler();
        }

        const fn = middleware[index++];
        return fn(request, next);
      };

      return next();
    }
  };
}

// Preload critical API data
export function preloadCriticalData(endpoints: string[]): Promise<void[]> {
  return Promise.all(
    endpoints.map(endpoint =>
      optimizedFetch(endpoint, { cache: 'force-cache' })
        .catch(error => {
          console.warn(`Failed to preload ${endpoint}:`, error);
        })
    )
  );
}