import React, { Suspense, lazy, ComponentType } from 'react';

interface LazyLoaderProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}

export const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  component, 
  fallback = <div className="loading h-32 w-full rounded-lg"></div>,
  props = {}
}) => {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Predefined lazy components for common use cases
export const LazyCustomerSearch = () => import('../dashboard/CustomerSearch');
export const LazyCustomerProfile = () => import('../dashboard/CustomerProfile');
export const LazyVehicleModels = () => import('../dashboard/VehicleModels');
export const LazyStatisticsCard = () => import('../dashboard/StatisticsCard'); 