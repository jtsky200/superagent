import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  subtitle?: string;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  change,
  icon,
  trend = 'stable',
  color = 'primary',
  subtitle
}) => {
  const colorClasses = {
    primary: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>

        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center space-x-1 mt-2">
                <span className={`text-sm font-medium ${
                  change.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change.isPositive ? '+' : ''}{change.value}%
                </span>
                <span className="text-xs text-gray-500">vs. letzter Monat</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 