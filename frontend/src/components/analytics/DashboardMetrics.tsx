'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  DollarSign, 
  Target,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Clock,
  Award
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
];

export function DashboardMetrics() {
  const [timePeriod, setTimePeriod] = useState('30d');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/kpi-metrics?period=${timePeriod}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 503) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Analytics service is currently unavailable');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Don't set mock data - show error instead
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timePeriod]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const renderKPICard = (kpi: KPIData) => {
    const Icon = kpi.icon;
    const isPositive = kpi.change.isPositive;
    const changeIcon = isPositive ? TrendingUp : TrendingDown;
    const ChangeIcon = changeIcon;

    return (
      <Card key={kpi.id} className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {kpi.title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${
            kpi.color === 'success' ? 'bg-green-100' :
            kpi.color === 'warning' ? 'bg-yellow-100' :
            kpi.color === 'danger' ? 'bg-red-100' :
            kpi.color === 'primary' ? 'bg-blue-100' :
            'bg-gray-100'
          }`}>
            <Icon className={`w-4 h-4 ${
              kpi.color === 'success' ? 'text-green-600' :
              kpi.color === 'warning' ? 'text-yellow-600' :
              kpi.color === 'danger' ? 'text-red-600' :
              kpi.color === 'primary' ? 'text-blue-600' :
              'text-gray-600'
            }`} />
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
                <span>{Math.round((Number(kpi.value.toString().replace(/[^\d]/g, '')) / kpi.target) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    kpi.color === 'success' ? 'bg-green-500' :
                    kpi.color === 'primary' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}
                  style={{ 
                    width: `${Math.min((Number(kpi.value.toString().replace(/[^\d]/g, '')) / kpi.target) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
            <p className="text-gray-600">Real-time business metrics and KPIs</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>

        <div className="p-8 border border-red-200 bg-red-50 rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 text-red-600 mx-auto mb-4">⚠️</div>
            <h3 className="text-red-800 font-medium text-lg mb-2">Analytics Service Unavailable</h3>
            <p className="text-red-700 text-sm mb-4">
              Unable to load dashboard metrics. The analytics service is currently unavailable or unreachable.
            </p>
            <p className="text-red-600 text-xs">
              <strong>Important:</strong> No placeholder data is displayed to prevent incorrect business decisions.
              Please check your connection and try again, or contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
          <p className="text-gray-600">
            Last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
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
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview KPIs */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Key Performance Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.overview.map(renderKPICard)}
        </div>
      </section>

      {/* Customer Metrics */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Customer Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.customerMetrics.map(renderKPICard)}
        </div>
      </section>

      {/* Sales Metrics */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Sales Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.salesMetrics.map(renderKPICard)}
        </div>
      </section>

      {/* Marketing Metrics */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Marketing Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.marketingMetrics.map(renderKPICard)}
        </div>
      </section>

      {/* Operational Metrics */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Operational Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.operationalMetrics.map(renderKPICard)}
        </div>
      </section>

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
    </div>
  );
}