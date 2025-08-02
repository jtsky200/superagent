// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';

interface ApiCallOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retryAttempts?: number;
  retryDelay?: number;
  cacheKey?: string;
  cacheDuration?: number;
}

interface ApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

// Simple in-memory cache with TTL
class ApiCache {
  private static cache = new Map<string, { data: any; timestamp: number; duration: number }>();
  
  static set(key: string, data: any, duration: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration
    });
  }
  
  static get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.duration) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  static clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export function useApiCall<T = any>(
  apiCall: (...args: any[]) => Promise<Response>,
  options: ApiCallOptions = {}
): ApiCallState<T> {
  const {
    immediate = false,
    onSuccess,
    onError,
    retryAttempts = 0,
    retryDelay = 1000,
    cacheKey,
    cacheDuration = 300000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastArgsRef = useRef<any[]>([]);

  const execute = useCallback(async (...args: any[]) => {
    // Store args for retry functionality
    lastArgsRef.current = args;
    
    // Check cache first
    if (cacheKey) {
      const cachedData = ApiCache.get(cacheKey);
      if (cachedData) {
        setData(cachedData);
        onSuccess?.(cachedData);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(...args);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (!response.ok) {
        if (response.status === 503) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Service is currently unavailable');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Cache successful response
      if (cacheKey && responseData) {
        ApiCache.set(cacheKey, responseData, cacheDuration);
      }

      setData(responseData);
      setError(null);
      retryCountRef.current = 0;
      onSuccess?.(responseData);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Retry logic for non-503 errors
      if (retryCountRef.current < retryAttempts && !errorMessage.includes('unavailable')) {
        retryCountRef.current++;
        setTimeout(() => execute(...args), retryDelay * retryCountRef.current);
        return;
      }
      
      setError(errorMessage);
      setData(null);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError, retryAttempts, retryDelay, cacheKey, cacheDuration]);

  const retry = useCallback(async () => {
    if (lastArgsRef.current.length > 0) {
      await execute(...lastArgsRef.current);
    }
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retryCountRef.current = 0;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    retry,
    reset
  };
}

// Specialized hook for analytics API calls
export function useAnalyticsApi<T = any>(
  endpoint: string,
  options: Omit<ApiCallOptions, 'cacheKey'> & { params?: Record<string, string> } = {}
): ApiCallState<T> {
  const { params, ...apiOptions } = options;
  
  const apiCall = useCallback(async () => {
    const url = new URL(`/api/analytics/${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, [endpoint, params]);

  return useApiCall<T>(apiCall, {
    ...apiOptions,
    cacheKey: `analytics-${endpoint}-${JSON.stringify(params || {})}`
  });
}

export { ApiCache };