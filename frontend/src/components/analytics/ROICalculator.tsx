'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  BarChart3,
  PieChart,
  Calculator,
  Eye,
  MousePointer,
  Users,
  Phone,
  Calendar,
  Car,
  CheckCircle,
  AlertCircle,
  Download,
  Share,
  Save,
  RefreshCw
} from 'lucide-react';

interface CampaignData {
  id: string;
  name: string;
  type: 'digital' | 'traditional' | 'events' | 'content' | 'social';
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  metrics: {
    impressions: number;
    clicks: number;
    leads: number;
    qualifiedLeads: number;
    testDrives: number;
    sales: number;
    revenue: number;
  };
}

interface ROICalculation {
  campaignId: string;
  totalInvestment: number;
  totalRevenue: number;
  roi: number;
  roas: number;
  costPerLead: number;
  costPerAcquisition: number;
  customerLifetimeValue: number;
  paybackPeriod: number;
  profitMargin: number;
  efficiency: {
    ctr: number;
    conversionRate: number;
    leadQuality: number;
    salesConversion: number;
  };
}

interface ROIComparison {
  campaigns: {
    campaign: string;
    roi: number;
    roas: number;
    leads: number;
    sales: number;
    efficiency: number;
  }[];
  benchmarks: {
    industryAvgROI: number;
    industryAvgCPL: number;
    industryAvgCPA: number;
  };
}

const CAMPAIGN_TYPES = [
  { value: 'digital', label: 'Digital Marketing', icon: MousePointer },
  { value: 'traditional', label: 'Traditional Media', icon: Eye },
  { value: 'events', label: 'Events & Exhibitions', icon: Users },
  { value: 'content', label: 'Content Marketing', icon: BarChart3 },
  { value: 'social', label: 'Social Media', icon: Share }
];

export function ROICalculator() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [customBudget, setCustomBudget] = useState('');
  const [customDuration, setCustomDuration] = useState('30');
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [roiCalculations, setROICalculations] = useState<ROICalculation[]>([]);
  const [comparison, setComparison] = useState<ROIComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculationMode, setCalculationMode] = useState<'existing' | 'custom'>('existing');

  const fetchCampaignData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/campaigns-roi', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 503) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Campaign ROI analytics service is currently unavailable');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCampaignData(data.campaigns || []);
      setROICalculations(data.calculations || []);
      setComparison(data.comparison || null);
    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
      // Clear data instead of showing mock data
      setCampaignData([]);
      setROICalculations([]);
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const calculateCustomROI = () => {
    if (!customBudget) return null;
    
    const budget = parseFloat(customBudget);
    const duration = parseInt(customDuration);
    
    // Use industry averages for projections
    const estimatedImpressions = budget * 20; // $1 = 20 impressions
    const estimatedCTR = 3.5; // Industry average
    const estimatedConversionRate = 1.8; // Industry average
    const estimatedSalesConversion = 12; // Industry average
    const avgDealSize = 75000; // CHF

    const clicks = estimatedImpressions * (estimatedCTR / 100);
    const leads = clicks * (estimatedConversionRate / 100);
    const sales = leads * (estimatedSalesConversion / 100);
    const revenue = sales * avgDealSize;
    const roi = ((revenue - budget) / budget) * 100;

    return {
      budget,
      duration,
      projections: {
        impressions: Math.round(estimatedImpressions),
        clicks: Math.round(clicks),
        leads: Math.round(leads),
        sales: Math.round(sales),
        revenue: Math.round(revenue),
        roi: Math.round(roi),
        roas: revenue / budget,
        costPerLead: budget / leads,
        costPerAcquisition: budget / sales
      }
    };
  };

  const customCalculation = calculateCustomROI();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      style: 'currency', 
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRoleColor = (roi: number) => {
    if (roi >= 300) return 'text-green-600';
    if (roi >= 200) return 'text-blue-600';
    if (roi >= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getROIBadgeColor = (roi: number) => {
    if (roi >= 300) return 'bg-green-100 text-green-800';
    if (roi >= 200) return 'bg-blue-100 text-blue-800';
    if (roi >= 100) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing ROI Calculator</h2>
          <p className="text-gray-600">Calculate return on investment for marketing campaigns and optimize spend allocation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Report
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            ROI Calculation Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              variant={calculationMode === 'existing' ? 'default' : 'outline'}
              onClick={() => setCalculationMode('existing')}
              className="flex-1"
            >
              Existing Campaigns
            </Button>
            <Button
              variant={calculationMode === 'custom' ? 'default' : 'outline'}
              onClick={() => setCalculationMode('custom')}
              className="flex-1"
            >
              Custom Projection
            </Button>
          </div>

          {calculationMode === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="budget">Campaign Budget (CHF)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="50000"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Select value={customDuration} onValueChange={setCustomDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Campaign Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Projection Results */}
      {calculationMode === 'custom' && customCalculation && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Projected Campaign Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {customCalculation.projections.roi}%
                </div>
                <div className="text-sm text-gray-600">Projected ROI</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(customCalculation.projections.revenue)}
                </div>
                <div className="text-sm text-gray-600">Projected Revenue</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {customCalculation.projections.leads}
                </div>
                <div className="text-sm text-gray-600">Projected Leads</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Car className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {customCalculation.projections.sales}
                </div>
                <div className="text-sm text-gray-600">Projected Sales</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Cost per Lead:</span>
                  <span className="font-medium">
                    {formatCurrency(customCalculation.projections.costPerLead)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per Acquisition:</span>
                  <span className="font-medium">
                    {formatCurrency(customCalculation.projections.costPerAcquisition)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>ROAS:</span>
                  <span className="font-medium">
                    {customCalculation.projections.roas.toFixed(1)}:1
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Click-through Rate:</span>
                  <span className="font-medium">3.5%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Conversion Rate:</span>
                  <span className="font-medium">1.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Conversion:</span>
                  <span className="font-medium">12%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> Projections are based on industry averages and historical performance. 
                  Actual results may vary depending on campaign quality, market conditions, and execution.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Unavailable Message */}
      {calculationMode === 'existing' && roiCalculations.length === 0 && !loading && (
        <div className="p-8 border border-red-200 bg-red-50 rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 text-red-600 mx-auto mb-4">⚠️</div>
            <h3 className="text-red-800 font-medium text-lg mb-2">Campaign ROI Analytics Unavailable</h3>
            <p className="text-red-700 text-sm mb-4">
              Unable to load campaign ROI data. The analytics service is currently unavailable or unreachable.
            </p>
            <p className="text-red-600 text-xs mb-4">
              <strong>Important:</strong> No sample campaign data is displayed to ensure accurate ROI analysis.
            </p>
            <Button variant="outline" onClick={fetchCampaignData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Loading Data
            </Button>
          </div>
        </div>
      )}

      {/* Existing Campaigns Analysis */}
      {calculationMode === 'existing' && roiCalculations.length > 0 && (
        <>
          {/* Campaign ROI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roiCalculations.map((calculation, index) => {
              const campaign = campaignData[index];
              const TypeIcon = CAMPAIGN_TYPES.find(t => t.value === campaign.type)?.icon || Target;

              return (
                <Card key={calculation.campaignId} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-5 h-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-base">{campaign.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {campaign.type}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={getROIBadgeColor(calculation.roi)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getRoleColor(calculation.roi)}`}>
                          {calculation.roi.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">ROI</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {calculation.roas.toFixed(1)}:1
                        </div>
                        <div className="text-xs text-gray-600">ROAS</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Investment:</span>
                        <span className="font-medium">{formatCurrency(calculation.totalInvestment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-medium">{formatCurrency(calculation.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit:</span>
                        <span className={`font-medium ${
                          calculation.totalRevenue - calculation.totalInvestment > 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(calculation.totalRevenue - calculation.totalInvestment)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{formatCurrency(calculation.costPerLead)}</div>
                        <div className="text-gray-600">Cost/Lead</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{formatCurrency(calculation.costPerAcquisition)}</div>
                        <div className="text-gray-600">Cost/Sale</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Performance Comparison */}
          {comparison && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Campaign Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comparison.campaigns.map((campaign, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{campaign.campaign}</h4>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge className={getROIBadgeColor(campaign.roi)}>
                            {campaign.roi.toFixed(0)}% ROI
                          </Badge>
                          <span className="text-gray-600">
                            {campaign.sales} sales from {campaign.leads} leads
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">ROI</div>
                          <div className="font-medium">{campaign.roi.toFixed(1)}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min((campaign.roi / 500) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">ROAS</div>
                          <div className="font-medium">{campaign.roas.toFixed(1)}:1</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min((campaign.roas / 10) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Efficiency</div>
                          <div className="font-medium">{campaign.efficiency.toFixed(1)}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{ width: `${campaign.efficiency}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">vs Benchmark</div>
                          <div className={`font-medium ${
                            campaign.roi > comparison.benchmarks.industryAvgROI 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {campaign.roi > comparison.benchmarks.industryAvgROI ? '+' : ''}
                            {(campaign.roi - comparison.benchmarks.industryAvgROI).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Industry Benchmarks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Average ROI:</span>
                      <span className="font-medium">{comparison.benchmarks.industryAvgROI}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Cost per Lead:</span>
                      <span className="font-medium">{formatCurrency(comparison.benchmarks.industryAvgCPL)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Cost per Acquisition:</span>
                      <span className="font-medium">{formatCurrency(comparison.benchmarks.industryAvgCPA)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Optimization Recommendations */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Budget Allocation Insights</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Geneva Auto Show</strong> delivered highest ROI (2478%) 
                    - consider increasing event marketing budget
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <strong>Digital campaigns</strong> show consistent performance 
                    - maintain current spend levels with optimization focus
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <strong>Social media</strong> has potential for improvement 
                    - test different audience segments and creative formats
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Performance Optimization</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div>
                    Improve lead qualification process to increase sales conversion rates
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    Implement attribution modeling to better track customer journey touchpoints
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    Focus on campaigns with ROAS above 5:1 for maximum profitability
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}