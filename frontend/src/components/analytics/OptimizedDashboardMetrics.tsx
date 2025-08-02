'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useAnalyticsApi } from '@/hooks/useApiCall';
import { usePerformanceMonitor, useDebounce } from '@/hooks/usePerformance';
import { VirtualizedList } from '@/components/common/VirtualizedList';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';

interface KPIData {
  id: string;
  title: string;
  value: string | number;
  change: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  icon: any;
  color: 'success' | 'warning' | 'danger' | 'primary' | 'secondary';
  target?: number;
  unit?: string;
  trend?: number[];
}

interface DashboardData {
  overview: KPIData[];
  customerMetrics: KPIData[];
  salesMetrics: KPIData[];
  marketingMetrics: KPIData[];
  operationalMetrics: KPIData[];
  lastUpdated: string;
}

const TIME_PERIODS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' }
] as const;

// Memoized KPI Card component to prevent unnecessary re-renders
const KPICard = memo<{ kpi: KPIData }>(({ kpi }) => {
  const Icon = kpi.icon;
  const isPositive = kpi.change.isPositive;
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  const progressPercentage = useMemo(() => {
    if (!kpi.target) return 0;
    const numericValue = Number(kpi.value.toString().replace(/[^\d]/g, ''));
    return Math.min((numericValue / kpi.target) * 100, 100);
  }, [kpi.value, kpi.target]);

  const colorClasses = useMemo(() => ({
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    primary: 'bg-blue-100 text-blue-600',
    secondary: 'bg-gray-100 text-gray-600'
  }), []);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {kpi.title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[kpi.color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold">{kpi.value}</div>
            {kpi.unit && (
              <div className="text-xs text-gray-500">{kpi.unit}</div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <ChangeIcon className={`w-3 h-3 ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`} />
            <span className={`text-xs font-medium ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {Math.abs(kpi.change.value)}%
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {kpi.change.period}
        </p>
        {kpi.target && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress to target</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  kpi.color === 'success' ? 'bg-green-500' :
                  kpi.color === 'primary' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

KPICard.displayName = 'KPICard';

// Memoized metrics section component
const MetricsSection = memo<{
  title: string;
  icon: React.ComponentType<any>;
  metrics: KPIData[];
}>(({ title, icon: Icon, metrics }) => {
  const renderKPICard = useCallback((item: KPIData) => (
    <KPICard key={item.id} kpi={item} />
  ), []);

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(renderKPICard)}
      </div>
    </section>
  );
});

MetricsSection.displayName = 'MetricsSection';

export function OptimizedDashboardMetrics() {
  const { getPerformanceData } = usePerformanceMonitor('DashboardMetrics');
  
  const [timePeriod, setTimePeriod] = React.useState('30d');
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  
  // Debounce time period changes to prevent excessive API calls
  const debouncedTimePeriod = useDebounce(timePeriod, 300);

  const {
    data: dashboardData,
    loading,
    error,
    execute: fetchData,
    retry
  } = useAnalyticsApi<DashboardData>('kpi-metrics', {
    params: { period: debouncedTimePeriod },
    immediate: true,
    cacheDuration: 60000, // 1 minute cache
    retryAttempts: 2
  });

  // Auto-refresh functionality
  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const handleTimePeriodChange = useCallback((value: string) => {
    setTimePeriod(value);
  }, []);

  const handleAutoRefreshToggle = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  const sections = useMemo(() => [
    {
      id: 'overview',
      title: 'Key Performance Indicators',
      icon: BarChart3,
      metrics: dashboardData?.overview || []
    },
    {
      id: 'customer',
      title: 'Customer Metrics',
      icon: TrendingUp,
      metrics: dashboardData?.customerMetrics || []
    },
    {
      id: 'sales',
      title: 'Sales Performance',
      icon: TrendingUp,
      metrics: dashboardData?.salesMetrics || []
    },
    {
      id: 'marketing',
      title: 'Marketing Performance',
      icon: TrendingUp,
      metrics: dashboardData?.marketingMetrics || []
    },
    {
      id: 'operational',
      title: 'Operational Metrics',
      icon: Activity,
      metrics: dashboardData?.operationalMetrics || []
    }
  ], [dashboardData]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
            <p className="text-gray-600">Real-time business metrics and KPIs</p>
          </div>
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>

        <div className="p-8 border border-red-200 bg-red-50 rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 text-red-600 mx-auto mb-4">⚠️</div>
            <h3 className="text-red-800 font-medium text-lg mb-2">Analytics Service Unavailable</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <p className="text-red-600 text-xs">
              <strong>Important:</strong> No placeholder data is displayed to prevent incorrect business decisions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
            <p className="text-gray-600">
              Last updated: {dashboardData?.lastUpdated ? 
                new Date(dashboardData.lastUpdated).toLocaleString() : 
                'Never'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map(period => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoRefreshToggle}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData()}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics Sections */}
        {sections.map(section => (
          <MetricsSection
            key={section.id}
            title={section.title}
            icon={section.icon}
            metrics={section.metrics}
          />
        ))}

        {/* Real-time Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Status: Operational</span>
                {autoRefresh && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Auto-refreshing every 30s
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Data sources: CRM, Marketing Automation, Swiss APIs, Analytics Platform
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-gray-500">
            <summary>Performance Data</summary>
            <pre>{JSON.stringify(getPerformanceData(), null, 2)}</pre>
          </details>
        )}
      </div>
    </ErrorBoundary>
  );
}