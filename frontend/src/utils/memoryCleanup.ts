import React from 'react';

// Memory cleanup utilities

export class MemoryCleanup {
  private static subscriptions: Set<() => void> = new Set();
  private static intervals: Set<number> = new Set();
  private static timeouts: Set<number> = new Set();
  private static eventListeners: Map<EventTarget, Array<{
    event: string;
    handler: EventListener;
    options?: boolean | AddEventListenerOptions;
  }>> = new Map();

  // Register cleanup functions
  static addSubscription(cleanup: () => void) {
    this.subscriptions.add(cleanup);
    return () => this.subscriptions.delete(cleanup);
  }

  // Track intervals for cleanup
  static setInterval(callback: (...args: any[]) => any, delay: number): number {
    const id = window.setInterval(callback, delay);
    this.intervals.add(id);
    return id;
  }

  static clearInterval(id: number) {
    window.clearInterval(id);
    this.intervals.delete(id);
  }

  // Track timeouts for cleanup
  static setTimeout(callback: (...args: any[]) => any, delay: number): number {
    const id = window.setTimeout(callback, delay);
    this.timeouts.add(id);
    return id;
  }

  static clearTimeout(id: number) {
    window.clearTimeout(id);
    this.timeouts.delete(id);
  }

  // Track event listeners for cleanup
  static addEventListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) {
    target.addEventListener(event, handler, options);
    
    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, []);
    }
    
    this.eventListeners.get(target)!.push({ event, handler, options });
  }

  static removeEventListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) {
    target.removeEventListener(event, handler, options);
    
    const listeners = this.eventListeners.get(target);
    if (listeners) {
      const index = listeners.findIndex(
        l => l.event === event && l.handler === handler
      );
      if (index > -1) {
        listeners.splice(index, 1);
      }
      
      if (listeners.length === 0) {
        this.eventListeners.delete(target);
      }
    }
  }

  // Clean up all tracked resources
  static cleanupAll() {
    // Clear all subscriptions
    this.subscriptions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Error during subscription cleanup:', error);
      }
    });
    this.subscriptions.clear();

    // Clear all intervals
    this.intervals.forEach(id => window.clearInterval(id));
    this.intervals.clear();

    // Clear all timeouts
    this.timeouts.forEach(id => window.clearTimeout(id));
    this.timeouts.clear();

    // Remove all event listeners
    this.eventListeners.forEach((listeners, target) => {
      listeners.forEach(({ event, handler, options }) => {
        try {
          target.removeEventListener(event, handler, options);
        } catch (error) {
          console.warn('Error removing event listener:', error);
        }
      });
    });
    this.eventListeners.clear();
  }

  // Get memory usage statistics
  static getMemoryStats() {
    return {
      subscriptions: this.subscriptions.size,
      intervals: this.intervals.size,
      timeouts: this.timeouts.size,
      eventListeners: Array.from(this.eventListeners.values())
        .reduce((total, listeners) => total + listeners.length, 0)
    };
  }
}

// WeakMap-based cache for preventing memory leaks
export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>();

  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

// Observer pattern with automatic cleanup
export class ObserverManager<T = any> {
  private observers: Set<(data: T) => void> = new Set();

  subscribe(observer: (data: T) => void): () => void {
    this.observers.add(observer);
    
    // Return unsubscribe function
    return () => {
      this.observers.delete(observer);
    };
  }

  notify(data: T): void {
    this.observers.forEach(observer => {
      try {
        observer(data);
      } catch (error) {
        console.warn('Error in observer:', error);
      }
    });
  }

  clear(): void {
    this.observers.clear();
  }

  get size(): number {
    return this.observers.size;
  }
}

// Automatic cleanup hook for React components
export function useCleanup() {
  const cleanupFunctions = new Set<() => void>();

  const addCleanup = (cleanup: () => void) => {
    cleanupFunctions.add(cleanup);
    return () => cleanupFunctions.delete(cleanup);
  };

  const cleanup = () => {
    cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup error:', error);
      }
    });
    cleanupFunctions.clear();
  };

  // Auto cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, []);

  return { addCleanup, cleanup };
}

// Global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    MemoryCleanup.cleanupAll();
  });

  // Also cleanup on page visibility change (mobile apps)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      MemoryCleanup.cleanupAll();
    }
  });
}