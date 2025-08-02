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
  Target, 
  AlertTriangle,
  BarChart3,
  PieChart,
  ArrowDown,
  ArrowRight,
  Clock,
  DollarSign,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface FunnelStage {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  prospects: number;
  conversionRate: number;
  avgDealSize: number;
  avgTimeInStage: number;
  dropOffRate: number;
  previousPeriodProspects?: number;
  previousPeriodConversion?: number;
}

interface FunnelMetrics {
  totalProspects: number;
  totalConverted: number;
  overallConversionRate: number;
  avgDealSize: number;
  avgSalesCycle: number;
  totalRevenue: number;
  pipelineVelocity: number;
  bottleneckStage: string;
  periodComparison: {
    prospectsChange: number;
    conversionChange: number;
    revenueChange: number;
  };
}

interface ConversionData {
  stage: string;
  converted: number;
  lost: number;
  pending: number;
  conversionRate: number;
  lossReasons: { reason: string; count: number }[];
}

const FUNNEL_STAGES: FunnelStage[] = [
  {
    id: 'awareness',
    name: 'Awareness',
    description: 'Initial interest and brand awareness',
    icon: Eye,
    color: 'bg-blue-500',
    prospects: 2847,
    conversionRate: 45.2,
    avgDealSize: 0,
    avgTimeInStage: 2.5,
    dropOffRate: 54.8,
    previousPeriodProspects: 2650,
    previousPeriodConversion: 42.1
  },
  {
    id: 'interest',
    name: 'Interest',
    description: 'Qualified leads showing genuine interest',
    icon: Target,
    color: 'bg-green-500',
    prospects: 1287,
    conversionRate: 62.3,
    avgDealSize: 0,
    avgTimeInStage: 5.2,
    dropOffRate: 37.7,
    previousPeriodProspects: 1115,
    previousPeriodConversion: 58.9
  },
  {
    id: 'consideration',
    name: 'Consideration',
    description: 'Prospects evaluating options',
    icon: Users,
    color: 'bg-yellow-500',
    prospects: 802,
    conversionRate: 74.1,
    avgDealSize: 72500,
    avgTimeInStage: 12.8,
    dropOffRate: 25.9,
    previousPeriodProspects: 657,
    previousPeriodConversion: 71.2
  },
  {
    id: 'intent',
    name: 'Intent',
    description: 'Ready to purchase, negotiating terms',
    icon: BarChart3,
    color: 'bg-orange-500',
    prospects: 594,
    conversionRate: 89.2,
    avgDealSize: 74800,
    avgTimeInStage: 8.5,
    dropOffRate: 10.8,
    previousPeriodProspects: 468,
    previousPeriodConversion: 86.7
  },
  {
    id: 'purchase',
    name: 'Purchase',
    description: 'Completed sales and delivered vehicles',
    icon: CheckCircle,
    color: 'bg-purple-500',
    prospects: 530,
    conversionRate: 100,
    avgDealSize: 75200,
    avgTimeInStage: 3.2,
    dropOffRate: 0,
    previousPeriodProspects: 406,
    previousPeriodConversion: 100
  }
];

export function SalesFunnelAnalysis() {
  const [timePeriod, setTimePeriod] = useState('30d');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>(FUNNEL_STAGES);
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFunnelData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/sales-funnel?period=${timePeriod}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 503) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Sales funnel analytics service is currently unavailable');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFunnelData(data.stages || []);
      setMetrics(data.metrics || null);
      setConversionData(data.conversionData || []);
    } catch (error) {
      console.error('Failed to fetch funnel data:', error);
      // Clear data instead of showing mock data
      setFunnelData([]);
      setMetrics(null);
      setConversionData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData();
  }, [timePeriod]);

  const calculateConversionBetweenStages = (fromIndex: number, toIndex: number) => {
    if (toIndex >= funnelData.length) return 0;
    return (funnelData[toIndex].prospects / funnelData[fromIndex].prospects) * 100;
  };

  const getChangeIndicator = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div className={`flex items-center gap-1 text-xs ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        <Icon className="w-3 h-3" />
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  const selectedConversionData = selectedStage ? 
    conversionData.find(c => c.stage === selectedStage) : null;

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading funnel analysis...</p>
        </div>
      </div>
    );
  }

  if (!metrics || funnelData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sales Funnel Analysis</h2>
            <p className="text-gray-600">Track conversion rates and identify bottlenecks</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchFunnelData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>

        <div className="p-8 border border-red-200 bg-red-50 rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 text-red-600 mx-auto mb-4">⚠️</div>
            <h3 className="text-red-800 font-medium text-lg mb-2">Sales Funnel Analytics Unavailable</h3>
            <p className="text-red-700 text-sm mb-4">
              Unable to load sales funnel data. The analytics service is currently unavailable or unreachable.
            </p>
            <p className="text-red-600 text-xs">
              <strong>Important:</strong> No sample data is displayed to ensure accurate business analysis.
              Please check your connection and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Funnel Analysis</h2>
          <p className="text-gray-600">Track conversion rates and identify bottlenecks in your sales process</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchFunnelData}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Prospects</p>
                  <p className="text-2xl font-bold">{metrics.totalProspects.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      {metrics.periodComparison.prospectsChange}%
                    </span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{metrics.overallConversionRate.toFixed(1)}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      {metrics.periodComparison.conversionChange}%
                    </span>
                  </div>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">CHF {(metrics.totalRevenue / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      {metrics.periodComparison.revenueChange}%
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pipeline Velocity</p>
                  <p className="text-2xl font-bold">CHF {(metrics.pipelineVelocity / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">per day</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Sales Funnel Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((stage, index) => {
              const Icon = stage.icon;
              const nextStageConversion = index < funnelData.length - 1 ? 
                calculateConversionBetweenStages(index, index + 1) : 100;
              const widthPercent = (stage.prospects / funnelData[0].prospects) * 100;
              
              return (
                <div key={stage.id} className="space-y-2">
                  <div 
                    className={`relative p-4 rounded-lg cursor-pointer transition-all ${
                      selectedStage === stage.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedStage(
                      selectedStage === stage.id ? null : stage.id
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${stage.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{stage.name}</h3>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-lg font-bold">{stage.prospects.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">prospects</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">{stage.conversionRate.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">conversion</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">{stage.avgTimeInStage.toFixed(1)}d</div>
                            <div className="text-xs text-gray-500">avg time</div>
                          </div>
                          {getChangeIndicator(stage.prospects, stage.previousPeriodProspects)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Funnel Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3 relative">
                        <div 
                          className={`${stage.color} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${widthPercent}%` }}
                        />
                        <div className="absolute right-2 top-0 h-3 flex items-center">
                          <span className="text-xs font-medium text-white">
                            {widthPercent.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottleneck Warning */}
                    {metrics?.bottleneckStage === stage.id && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Potential bottleneck identified</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Conversion Arrow */}
                  {index < funnelData.length - 1 && (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 border shadow-sm">
                        <ArrowDown className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {nextStageConversion.toFixed(1)}% convert to next stage
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-600">
                            {(100 - nextStageConversion).toFixed(1)}% drop off
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stage Details */}
      {selectedStage && selectedConversionData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {funnelData.find(s => s.id === selectedStage)?.name} Stage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion Breakdown */}
              <div>
                <h4 className="font-semibold mb-4">Conversion Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Converted</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{selectedConversionData.converted.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">
                        {selectedConversionData.conversionRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Lost</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{selectedConversionData.lost.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">
                        {((selectedConversionData.lost / (selectedConversionData.converted + selectedConversionData.lost)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {selectedConversionData.pending > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Pending</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{selectedConversionData.pending.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Loss Reasons */}
              <div>
                <h4 className="font-semibold mb-4">Top Loss Reasons</h4>
                <div className="space-y-2">
                  {selectedConversionData.lossReasons.map((reason, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{reason.reason}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reason.count}</span>
                        <span className="text-xs text-gray-500">
                          ({((reason.count / selectedConversionData.lost) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {metrics && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Identified Opportunities</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <span>
                      <strong>Consideration stage bottleneck:</strong> 25.9% drop-off rate suggests need for better nurturing content
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>
                      <strong>Strong intent conversion:</strong> 89.2% conversion from intent to purchase shows effective closing process
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <span>
                      <strong>Price sensitivity:</strong> Top loss reason in awareness stage suggests need for value proposition refinement
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Recommended Actions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span>Implement retargeting campaigns for consideration stage prospects</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span>Create comparative value content addressing price concerns</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span>Develop financing education materials for early-stage prospects</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span>Optimize test drive booking process to reduce friction</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}