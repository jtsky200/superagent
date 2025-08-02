'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Eye, 
  MousePointer, 
  Phone, 
  Calendar, 
  Car, 
  FileText, 
  CreditCard,
  CheckCircle,
  ArrowRight,
  Clock,
  MapPin,
  Search,
  Filter,
  Download,
  TrendingUp
} from 'lucide-react';

interface TouchPoint {
  id: string;
  type: 'website' | 'email' | 'phone' | 'showroom' | 'test_drive' | 'consultation' | 'purchase';
  timestamp: string;
  duration?: number;
  details: {
    page?: string;
    campaign?: string;
    source?: string;
    action?: string;
    outcome?: string;
  };
  value?: number;
}

interface CustomerJourneyData {
  customerId: string;
  customerName: string;
  email: string;
  phone?: string;
  status: 'prospect' | 'qualified' | 'negotiation' | 'closed' | 'lost';
  totalValue: number;
  journeyStart: string;
  lastActivity: string;
  touchPoints: TouchPoint[];
  conversionProbability: number;
  stageProgress: {
    awareness: number;
    interest: number;
    consideration: number;
    purchase: number;
  };
}

interface JourneyStage {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  avgDuration: string;
  conversionRate: number;
  touchPoints: string[];
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'awareness',
    name: 'Awareness',
    description: 'Customer becomes aware of Cadillac EV',
    icon: Eye,
    color: 'bg-blue-500',
    avgDuration: '2-5 days',
    conversionRate: 45.2,
    touchPoints: ['Website Visit', 'Social Media', 'Advertisement']
  },
  {
    id: 'interest',
    name: 'Interest',
    description: 'Customer shows interest in specific models',
    icon: MousePointer,
    color: 'bg-green-500',
    avgDuration: '5-10 days',
    conversionRate: 32.8,
    touchPoints: ['Model Pages', 'Brochure Download', 'Email Signup']
  },
  {
    id: 'consideration',
    name: 'Consideration',
    description: 'Customer evaluates options and features',
    icon: FileText,
    color: 'bg-yellow-500',
    avgDuration: '10-21 days',
    conversionRate: 28.5,
    touchPoints: ['Configurator', 'Comparison Tools', 'Reviews']
  },
  {
    id: 'intent',
    name: 'Intent',
    description: 'Customer shows purchase intent',
    icon: Calendar,
    color: 'bg-orange-500',
    avgDuration: '3-7 days',
    conversionRate: 67.3,
    touchPoints: ['Test Drive', 'Consultation', 'Quote Request']
  },
  {
    id: 'purchase',
    name: 'Purchase',
    description: 'Customer completes the purchase',
    icon: CheckCircle,
    color: 'bg-purple-500',
    avgDuration: '1-3 days',
    conversionRate: 89.1,
    touchPoints: ['Contract', 'Financing', 'Delivery']
  }
];

const TOUCHPOINT_ICONS = {
  website: Eye,
  email: FileText,
  phone: Phone,
  showroom: MapPin,
  test_drive: Car,
  consultation: Users,
  purchase: CreditCard
};

export function CustomerJourney() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [journeyData, setJourneyData] = useState<CustomerJourneyData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJourneyData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/customer-journeys', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 503) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Customer journey analytics service is currently unavailable');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJourneyData(data);
    } catch (error) {
      console.error('Failed to fetch journey data:', error);
      // Don't set mock data - leave empty for service unavailable message
      setJourneyData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneyData();
  }, []);

  const filteredCustomers = journeyData.filter(customer => {
    const matchesSearch = customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedCustomerData = selectedCustomer ? 
    journeyData.find(c => c.customerId === selectedCustomer) : null;

  const getTouchPointIcon = (type: TouchPoint['type']) => {
    const Icon = TOUCHPOINT_ICONS[type] || Eye;
    return Icon;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: CustomerJourneyData['status']) => {
    switch (status) {
      case 'prospect': return 'bg-gray-100 text-gray-800';
      case 'qualified': return 'bg-blue-100 text-blue-800';
      case 'negotiation': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Journey Tracking</h2>
          <p className="text-gray-600">Track customer interactions and progression through the sales funnel</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Journey Stages Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer Journey Stages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {JOURNEY_STAGES.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 ${stage.color} rounded-full flex items-center justify-center mb-2`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm">{stage.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{stage.description}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{stage.avgDuration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{stage.conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                  {index < JOURNEY_STAGES.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-6 -right-6 w-4 h-4 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredCustomers.length === 0 && !loading ? (
                <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 text-red-600">⚠️</div>
                    <div className="text-red-800 font-medium">Service Unavailable</div>
                  </div>
                  <p className="text-red-700 mt-2 text-sm">
                    Customer journey analytics service is currently unavailable. Cannot load customer data.
                  </p>
                  <p className="text-red-600 mt-2 text-xs">
                    <strong>Important:</strong> No placeholder data is shown to prevent incorrect customer information.
                  </p>
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                <div
                  key={customer.customerId}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCustomer === customer.customerId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCustomer(customer.customerId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{customer.customerName}</h4>
                      <p className="text-xs text-gray-600">{customer.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {customer.conversionProbability}% probability
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        CHF {(customer.totalValue / 1000)}K
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.touchPoints.length} touchpoints
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Journey Details */}
        <div className="lg:col-span-2">
          {selectedCustomerData ? (
            <div className="space-y-6">
              {/* Customer Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedCustomerData.customerName}</CardTitle>
                      <p className="text-gray-600">{selectedCustomerData.email}</p>
                      {selectedCustomerData.phone && (
                        <p className="text-gray-600">{selectedCustomerData.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(selectedCustomerData.status)}`}>
                        {selectedCustomerData.status}
                      </Badge>
                      <div className="mt-2 text-sm">
                        <div className="font-semibold">CHF {(selectedCustomerData.totalValue / 1000)}K</div>
                        <div className="text-gray-500">{selectedCustomerData.conversionProbability}% probability</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Awareness</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${selectedCustomerData.stageProgress.awareness}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Interest</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${selectedCustomerData.stageProgress.interest}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Consideration</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${selectedCustomerData.stageProgress.consideration}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Purchase</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${selectedCustomerData.stageProgress.purchase}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TouchPoints Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Journey Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCustomerData.touchPoints.map((touchPoint, index) => {
                      const Icon = getTouchPointIcon(touchPoint.type);
                      const isLast = index === selectedCustomerData.touchPoints.length - 1;
                      
                      return (
                        <div key={touchPoint.id} className="relative">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Icon className="w-5 h-5 text-blue-600" />
                              </div>
                              {!isLast && (
                                <div className="absolute top-10 left-1/2 transform -translate-x-px w-0.5 h-8 bg-gray-200" />
                              )}
                            </div>
                            <div className="flex-1 pb-8">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium capitalize">
                                  {touchPoint.type.replace('_', ' ')}
                                </h4>
                                <span className="text-sm text-gray-500">
                                  {new Date(touchPoint.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                {touchPoint.details.page && (
                                  <div>Page: {touchPoint.details.page}</div>
                                )}
                                {touchPoint.details.campaign && (
                                  <div>Campaign: {touchPoint.details.campaign}</div>
                                )}
                                {touchPoint.details.source && (
                                  <div>Source: {touchPoint.details.source}</div>
                                )}
                                {touchPoint.details.action && (
                                  <div>Action: {touchPoint.details.action}</div>
                                )}
                                {touchPoint.details.outcome && (
                                  <div>Outcome: {touchPoint.details.outcome}</div>
                                )}
                                {touchPoint.duration && (
                                  <div>Duration: {formatDuration(touchPoint.duration)}</div>
                                )}
                                {touchPoint.value && (
                                  <div className="font-medium text-green-600">
                                    Value: CHF {(touchPoint.value / 1000)}K
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a customer to view their journey details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}