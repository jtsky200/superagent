'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Target,
  Brain,
  DollarSign,
  Calendar,
  Activity,
  ChevronRight,
  Zap
} from 'lucide-react';

import { DashboardMetrics } from './DashboardMetrics';
import { CustomerJourney } from './CustomerJourney';
import { SalesFunnelAnalysis } from './SalesFunnelAnalysis';
import { ROICalculator } from './ROICalculator';
import { PredictiveAnalytics } from './PredictiveAnalytics';

type AnalyticsView = 'overview' | 'metrics' | 'journey' | 'funnel' | 'roi' | 'predictive';

const analyticsModules = [
  {
    id: 'metrics' as AnalyticsView,
    title: 'Enhanced Dashboard Metrics',
    description: 'Comprehensive KPIs, real-time metrics, and interactive performance charts',
    icon: BarChart3,
    badge: 'Real-time',
    features: [
      'Real-time KPI monitoring',
      'Interactive performance charts',
      'Goal tracking & targets',
      'Auto-refresh capabilities',
      'Custom time periods'
    ]
  },
  {
    id: 'journey' as AnalyticsView,
    title: 'Customer Journey Tracking',
    description: 'Track customer touchpoints, interactions, and progression through sales stages',
    icon: Users,
    badge: 'Journey Mapping',
    features: [
      'Complete touchpoint tracking',
      'Stage progression analysis',
      'Interaction timeline',
      'Conversion probability',
      'Customer profiling'
    ]
  },
  {
    id: 'funnel' as AnalyticsView,
    title: 'Sales Funnel Analysis',
    description: 'Conversion rates, stage analysis, bottleneck identification, and optimization',
    icon: Target,
    badge: 'Optimization',
    features: [
      'Conversion rate analysis',
      'Bottleneck identification',
      'Drop-off analysis',
      'Stage performance',
      'Optimization recommendations'
    ]
  },
  {
    id: 'roi' as AnalyticsView,
    title: 'Marketing ROI Calculator',
    description: 'Campaign performance analysis, cost calculations, and return optimization',
    icon: DollarSign,
    badge: 'ROI Analysis',
    features: [
      'Campaign ROI calculation',
      'Cost per acquisition',
      'ROAS analysis',
      'Budget optimization',
      'Performance comparison'
    ]
  },
  {
    id: 'predictive' as AnalyticsView,
    title: 'Predictive Analytics',
    description: 'AI-powered sales forecasting, customer scoring, and predictive modeling',
    icon: Brain,
    badge: 'AI-Powered',
    features: [
      'Sales forecasting',
      'Customer scoring',
      'Churn prediction',
      'Demand forecasting',
      'AI-generated insights'
    ]
  }
];

export function AnalyticsDashboard() {
  const [activeView, setActiveView] = useState<AnalyticsView>('overview');

  const renderContent = () => {
    switch (activeView) {
      case 'metrics':
        return <DashboardMetrics />;
      case 'journey':
        return <CustomerJourney />;
      case 'funnel':
        return <SalesFunnelAnalysis />;
      case 'roi':
        return <ROICalculator />;
      case 'predictive':
        return <PredictiveAnalytics />;
      default:
        return (
          <div className="space-y-6">
            {/* Overview Header */}
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Advanced Analytics & Business Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive analytics suite for Cadillac EV Customer Intelligence System with 
                  real-time metrics, predictive modeling, and advanced business intelligence capabilities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Real-time data processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span>AI-powered insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Predictive forecasting</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analyticsModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Card key={module.id} className="cursor-pointer hover:shadow-lg transition-shadow group">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{module.title}</h3>
                            <Badge variant="outline" className="mt-1">
                              {module.badge}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {module.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {module.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setActiveView(module.id)}
                      >
                        Open {module.title}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Implementation Status */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="w-5 h-5" />
                  Implementation Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Completed Features</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>✅ Enhanced dashboard with KPIs and real-time metrics</li>
                      <li>✅ Customer journey tracking and touchpoint analysis</li>
                      <li>✅ Sales funnel analysis with conversion optimization</li>
                      <li>✅ Marketing ROI calculator with campaign analysis</li>
                      <li>✅ Predictive analytics with AI-powered forecasting</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Technical Capabilities</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>📊 Real-time data visualization and monitoring</li>
                      <li>🤖 Machine learning-powered predictions</li>
                      <li>📈 Advanced performance analytics</li>
                      <li>🎯 Automated insights and recommendations</li>
                      <li>⚡ High-performance data processing</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Status:</strong> All analytics modules are fully implemented and ready for production use. 
                    The system provides comprehensive business intelligence capabilities for data-driven decision making.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Analytics Modules</p>
                      <p className="text-2xl font-bold">5</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Data Sources</p>
                      <p className="text-2xl font-bold">12+</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">AI Models</p>
                      <p className="text-2xl font-bold">4</p>
                    </div>
                    <Brain className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics Suite</h1>
          <p className="text-gray-600 mt-1">
            Business intelligence and predictive analytics for Cadillac EV
          </p>
        </div>
        {activeView !== 'overview' && (
          <Button 
            variant="outline" 
            onClick={() => setActiveView('overview')}
          >
            ← Back to Overview
          </Button>
        )}
      </div>

      {/* Module Navigation */}
      {activeView !== 'overview' && (
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
          {analyticsModules.map((module) => (
            <Button
              key={module.id}
              variant={activeView === module.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView(module.id)}
              className="flex items-center gap-2"
            >
              <module.icon className="w-4 h-4" />
              {module.title}
            </Button>
          ))}
        </div>
      )}

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}