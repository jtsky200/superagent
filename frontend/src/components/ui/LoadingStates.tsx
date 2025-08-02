import { cn } from '@/lib/utils';
import { useAccessibility } from '@/accessibility/AccessibilityProvider';

import React from 'react';

// Skeleton component for content placeholders
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className, 
  width = '100%', 
  height = '1rem',
  variant = 'rectangular',
  animation = 'pulse',
  ...props 
}: SkeletonProps) {
  const { settings } = useAccessibility();
  
  const variantClasses = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
  };

  const animationClasses = {
    pulse: settings.reducedMotion ? '' : 'animate-pulse',
    wave: settings.reducedMotion ? '' : 'animate-wave',
    none: '',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(
        'bg-neutral-200 dark:bg-neutral-700',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

// Card skeleton for dashboard cards
export function CardSkeleton() {
  return (
    <div className="p-6 border border-neutral-200 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton height="1.5rem" width="60%" />
        <Skeleton height="2rem" width="2rem" variant="circular" />
      </div>
      <Skeleton height="2.5rem" width="40%" />
      <div className="space-y-2">
        <Skeleton height="0.875rem" width="80%" />
        <Skeleton height="0.875rem" width="60%" />
      </div>
      <Skeleton height="0.5rem" width="100%" variant="rounded" />
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Table header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="1.25rem" width="80%" />
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              height="1rem" 
              width={colIndex === 0 ? '90%' : Math.random() > 0.5 ? '70%' : '85%'} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// List skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton height="2.5rem" width="2.5rem" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton height="1rem" width="70%" />
            <Skeleton height="0.875rem" width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton height="1.5rem" width="30%" />
        <Skeleton height="2rem" width="6rem" variant="rounded" />
      </div>
      <div className="h-64 flex items-end justify-between gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            width="100%" 
            height={`${Math.random() * 80 + 20}%`}
            variant="rounded"
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="0.875rem" width="3rem" />
        ))}
      </div>
    </div>
  );
}

// Loading spinner component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const { settings } = useAccessibility();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-neutral-600 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div
      className={cn(
        'border-2 rounded-full',
        sizeClasses[size],
        colorClasses[color],
        !settings.reducedMotion && 'animate-spin',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Dots loading indicator
export function DotsLoader({ className }: { className?: string }) {
  const { settings } = useAccessibility();
  
  return (
    <div className={cn('flex space-x-1', className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 bg-primary-600 rounded-full',
            !settings.reducedMotion && 'animate-bounce'
          )}
          style={!settings.reducedMotion ? { animationDelay: `${i * 0.1}s` } : undefined}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Progress bar component
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  size = 'md',
  color = 'primary',
  showLabel = false,
  label,
  className 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-500',
    error: 'bg-error-600',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-neutral-600 mb-1">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div 
        className={cn(
          'w-full bg-neutral-200 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        {...({
          'aria-valuenow': value,
          'aria-valuemin': 0,
          'aria-valuemax': max,
          'aria-label': label
        } as React.AriaAttributes)}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Loading overlay for entire sections
interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ 
  loading, 
  children, 
  loadingComponent,
  className 
}: LoadingOverlayProps) {
  const { announce } = useAccessibility();
  
  React.useEffect(() => {
    if (loading) {
      announce('Content is loading', 'polite');
    }
  }, [loading, announce]);

  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          {loadingComponent || (
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="lg" />
              <p className="text-sm text-neutral-600">Loading...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Pulse loading animation for interactive elements
export function PulseLoader({ className }: { className?: string }) {
  const { settings } = useAccessibility();
  
  return (
    <div 
      className={cn(
        'inline-block w-4 h-4 bg-primary-600 rounded-full',
        !settings.reducedMotion && 'animate-pulse',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}