// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react';

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>();
  const updateTimesRef = useRef<number[]>([]);

  useEffect(() => {
    renderCountRef.current++;
    
    if (!mountTimeRef.current) {
      mountTimeRef.current = performance.now();
    } else {
      updateTimesRef.current.push(performance.now());
    }

    // Log performance data in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCountRef.current}`);
    }
  });

  const getPerformanceData = useCallback(() => {
    return {
      renderCount: renderCountRef.current,
      mountTime: mountTimeRef.current,
      averageUpdateTime: updateTimesRef.current.length > 0 
        ? updateTimesRef.current.reduce((a, b) => a + b, 0) / updateTimesRef.current.length
        : 0
    };
  }, []);

  return { getPerformanceData };
}

// Memory usage monitoring hook
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  const updateMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      });
    }
  }, []);

  useEffect(() => {
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [updateMemoryInfo]);

  return { memoryInfo, updateMemoryInfo };
}

// Network performance monitoring
export function useNetworkMonitor() {
  const [networkInfo, setNetworkInfo] = useState<{
    downlink?: number;
    effectiveType?: string;
    rtt?: number;
    saveData?: boolean;
  }>({});

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkInfo({
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
      }
    };

    updateNetworkInfo();
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkInfo);
      
      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
}

// FPS monitoring hook
export function useFPSMonitor() {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationIdRef = useRef<number>();

  const measureFPS = useCallback(() => {
    frameCountRef.current++;
    const now = performance.now();
    
    if (now - lastTimeRef.current >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
    
    animationIdRef.current = requestAnimationFrame(measureFPS);
  }, []);

  useEffect(() => {
    animationIdRef.current = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [measureFPS]);

  return fps;
}

// Custom hook for debouncing values to prevent excessive re-renders
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for throttling function calls
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// Hook for measuring component render time
export function useRenderTime(componentName: string) {
  const startTimeRef = useRef<number>();

  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      if (startTimeRef.current) {
        const renderTime = performance.now() - startTimeRef.current;
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });
}

// Hook for intersection observer (lazy loading)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  return { targetRef, isIntersecting, entry };
}