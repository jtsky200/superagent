import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

interface VisibleRange {
  start: number;
  end: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  loading = false,
  loadingComponent,
  emptyComponent
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  const visibleRange: VisibleRange = useMemo(() => {
    const containerItemCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length - 1,
      start + containerItemCount + 2 * overscan
    );

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Reset scroll position when items change significantly
  useEffect(() => {
    if (scrollElementRef.current && items.length === 0) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  if (loading && loadingComponent) {
    return <div className={className}>{loadingComponent}</div>;
  }

  if (items.length === 0 && emptyComponent) {
    return <div className={className}>{emptyComponent}</div>;
  }

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for virtual scrolling with dynamic item heights
export function useVirtualScroll<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  estimatedItemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  
  const measureItem = useCallback((index: number, height: number) => {
    setItemHeights(prev => {
      const newMap = new Map(prev);
      newMap.set(index, height);
      return newMap;
    });
  }, []);

  const getItemHeight = useCallback((index: number) => {
    return itemHeights.get(index) ?? estimatedItemHeight;
  }, [itemHeights, estimatedItemHeight]);

  const getTotalHeight = useCallback(() => {
    return items.reduce((total, _, index) => total + getItemHeight(index), 0);
  }, [items, getItemHeight]);

  const getVisibleRange = useCallback((): VisibleRange => {
    let start = 0;
    let currentOffset = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const itemHeight = getItemHeight(i);
      if (currentOffset + itemHeight > scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
      currentOffset += itemHeight;
    }

    // Find end index
    let end = start;
    currentOffset = items.slice(0, start).reduce((total, _, index) => total + getItemHeight(index), 0);
    
    while (end < items.length && currentOffset < scrollTop + containerHeight + overscan * estimatedItemHeight) {
      currentOffset += getItemHeight(end);
      end++;
    }

    return { start, end: Math.min(items.length - 1, end) };
  }, [scrollTop, containerHeight, items, getItemHeight, overscan, estimatedItemHeight]);

  return {
    scrollTop,
    setScrollTop,
    measureItem,
    getItemHeight,
    getTotalHeight,
    getVisibleRange
  };
}