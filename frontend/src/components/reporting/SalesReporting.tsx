// @ts-nocheck
'use client';

// 📊 CADILLAC EV CIS - Sales Reporting Dashboard
// Swiss market sales statistics and analytics

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Car,
  Euro,
  MapPin,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Mail,
  Settings,
  Eye,
  Plus,
  Share2
} from 'lucide-react';

// Swiss market data types
interface SalesMetrics {
  totalLeads: number;
  totalProspects: number;
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  tcoCalculations: number;
  dsgvoCompliantLeads: number;
  marketingConsentRate: number;
}

interface CantonData {
  canton: string;
  cantonName: string;
  leads: number;
  prospects: number;
  customers: number;
  sales: number;
  revenue: number;
  conversionRate: number;
}

interface VehiclePerformance {
  model: string;
  interest: number;
  sales: number;
  revenue: number;
  testDrives: number;
  conversionRate: number;
}

interface TimeSeriesData {
  date: string;
  leads: number;
  prospects: number;
  customers: number;
  sales: number;
  revenue: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  format: string;
  lastUsed?: string;
  isActive: boolean;
}

// Swiss cantons with names
const SWISS_CANTONS = [
  { code: 'ZH', name: 'Zürich' },
  { code: 'BE', name: 'Bern' },
  { code: 'LU', name: 'Luzern' },
  { code: 'UR', name: 'Uri' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'OW', name: 'Obwalden' },
  { code: 'NW', name: 'Nidwalden' },
  { code: 'GL', name: 'Glarus' },
  { code: 'ZG', name: 'Zug' },
  { code: 'FR', name: 'Fribourg' },
  { code: 'SO', name: 'Solothurn' },
  { code: 'BS', name: 'Basel-Stadt' },
  { code: 'BL', name: 'Basel-Landschaft' },
  { code: 'SH', name: 'Schaffhausen' },
  { code: 'AR', name: 'Appenzell Ausserrhoden' },
  { code: 'AI', name: 'Appenzell Innerrhoden' },
  { code: 'SG', name: 'St. Gallen' },
  { code: 'GR', name: 'Graubünden' },
  { code: 'AG', name: 'Aargau' },
  { code: 'TG', name: 'Thurgau' },
  { code: 'TI', name: 'Ticino' },
  { code: 'VD', name: 'Vaud' },
  { code: 'VS', name: 'Valais' },
  { code: 'NE', name: 'Neuchâtel' },
  { code: 'GE', name: 'Genève' },
  { code: 'JU', name: 'Jura' }
];

// Chart colors for Swiss branding
const CHART_COLORS = ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#3b82f6', '#10b981'];

const SalesReporting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reports' | 'templates'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [selectedCanton, setSelectedCanton] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [language, setLanguage] = useState<'de' | 'fr' | 'it'>('de');
  
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [cantonData, setCantonData] = useState<CantonData[]>([]);
  const [vehicleData, setVehicleData] = useState<VehiclePerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, selectedCanton, selectedVehicle]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock sales metrics
      setSalesMetrics({
        totalLeads: 1247,
        totalProspects: 523,
        totalCustomers: 186,
        totalSales: 89,
        totalRevenue: 8945000,
        conversionRate: 14.9,
        averageOrderValue: 100500,
        tcoCalculations: 342,
        dsgvoCompliantLeads: 1198,
        marketingConsentRate: 76.2
      });

      // Mock canton data
      setCantonData([
        { canton: 'ZH', cantonName: 'Zürich', leads: 298, prospects: 124, customers: 47, sales: 23, revenue: 2310000, conversionRate: 18.5 },
        { canton: 'GE', cantonName: 'Genève', leads: 187, prospects: 89, customers: 31, sales: 15, revenue: 1507500, conversionRate: 16.6 },
        { canton: 'VD', cantonName: 'Vaud', leads: 156, prospects: 67, customers: 24, sales: 12, revenue: 1206000, conversionRate: 15.4 },
        { canton: 'BE', cantonName: 'Bern', leads: 234, prospects: 98, customers: 34, sales: 16, revenue: 1608000, conversionRate: 14.5 },
        { canton: 'BS', cantonName: 'Basel-Stadt', leads: 143, prospects: 61, customers: 22, sales: 11, revenue: 1105500, conversionRate: 15.4 },
        { canton: 'ZG', cantonName: 'Zug', leads: 98, prospects: 45, customers: 18, sales: 9, revenue: 904500, conversionRate: 18.4 },
        { canton: 'AG', cantonName: 'Aargau', leads: 131, prospects: 39, customers: 10, sales: 3, revenue: 301500, conversionRate: 7.6 }
      ]);

      // Mock vehicle performance
      setVehicleData([
        { model: 'LYRIQ', interest: 687, sales: 52, revenue: 5200000, testDrives: 234, conversionRate: 22.2 },
        { model: 'VISTIQ', interest: 560, sales: 37, revenue: 3745000, testDrives: 198, conversionRate: 18.7 }
      ]);

      // Mock time series data
      const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'];
      setTimeSeriesData(months.map((month, index) => ({
        date: month,
        leads: 180 + Math.random() * 80,
        prospects: 70 + Math.random() * 40,
        customers: 25 + Math.random() * 20,
        sales: 12 + Math.random() * 10,
        revenue: (1200000 + Math.random() * 800000)
      })));

      // Mock report templates
      setReportTemplates([
        { id: '1', name: 'Monatlicher Verkaufsbericht', type: 'sales_summary', description: 'Umfassender Überblick über Verkaufszahlen', format: 'PDF', lastUsed: '2024-01-15', isActive: true },
        { id: '2', name: 'Kantons-Analyse', type: 'canton_analysis', description: 'Detaillierte Analyse nach Schweizer Kantonen', format: 'Excel', lastUsed: '2024-01-10', isActive: true },
        { id: '3', name: 'Fahrzeug-Performance', type: 'vehicle_performance', description: 'LYRIQ vs VISTIQ Vergleich', format: 'PDF', lastUsed: '2024-01-08', isActive: true },
        { id: '4', name: 'DSGVO Compliance Report', type: 'dsgvo_compliance', description: 'Datenschutz-Compliance Übersicht', format: 'PDF', lastUsed: '2024-01-05', isActive: true }
      ]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Generate report
  const generateReport = async (templateId: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          period: selectedPeriod,
          filters: {
            canton: selectedCanton !== 'all' ? selectedCanton : undefined,
            vehicleModel: selectedVehicle !== 'all' ? selectedVehicle : undefined
          },
          language
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cadillac-report-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          📊 Sales Reporting
        </h1>
        <p className="text-lg text-gray-600">
          Schweizer CADILLAC EV Verkaufsstatistiken & Analytics
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Select value={selectedCanton} onValueChange={(value)=>setSelectedCanton(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kantone</SelectItem>
                  {SWISS_CANTONS.map(canton => (
                    <SelectItem key={canton.code} value={canton.code}>
                      {canton.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-gray-500" />
              <Select value={selectedVehicle} onValueChange={(value)=>setSelectedVehicle(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Fahrzeuge</SelectItem>
                  <SelectItem value="LYRIQ">LYRIQ</SelectItem>
                  <SelectItem value="VISTIQ">VISTIQ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={loadDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Vorlagen
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          {salesMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gesamte Leads</p>
                      <p className="text-2xl font-bold">{salesMetrics.totalLeads.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+12.5%</span>
                    <span className="text-gray-500 ml-1">vs. Vormonat</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verkäufe</p>
                      <p className="text-2xl font-bold">{salesMetrics.totalSales}</p>
                    </div>
                    <Car className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+8.3%</span>
                    <span className="text-gray-500 ml-1">vs. Vormonat</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Umsatz</p>
                      <p className="text-2xl font-bold">{formatCurrency(salesMetrics.totalRevenue)}</p>
                    </div>
                    <Euro className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+15.7%</span>
                    <span className="text-gray-500 ml-1">vs. Vormonat</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold">{formatPercentage(salesMetrics.conversionRate)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-600">-2.1%</span>
                    <span className="text-gray-500 ml-1">vs. Vormonat</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Verkaufstrend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(Number(value)) : value,
                      name === 'revenue' ? 'Umsatz' : 
                      name === 'sales' ? 'Verkäufe' :
                      name === 'customers' ? 'Kunden' :
                      name === 'prospects' ? 'Interessenten' : 'Leads'
                    ]} />
                    <Legend />
                    <Area type="monotone" dataKey="leads" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="prospects" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="customers" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="sales" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Canton Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Top Kantone nach Umsatz</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cantonData.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="canton" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Fahrzeug-Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={vehicleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ model, percent }) => `${model} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                      >
                        {vehicleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-center text-sm text-gray-600 mt-2">Verkäufe nach Modell</p>
                </div>

                <div className="space-y-4">
                  {vehicleData.map((vehicle, index) => (
                    <div key={vehicle.model} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">CADILLAC {vehicle.model}</h4>
                        <p className="text-sm text-gray-600">{vehicle.sales} Verkäufe • {formatPercentage(vehicle.conversionRate)} Conversion</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(vehicle.revenue)}</p>
                        <p className="text-sm text-gray-600">{vehicle.testDrives} Probefahrten</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DSGVO Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🇨🇭 DSGVO Compliance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{salesMetrics?.dsgvoCompliantLeads}</div>
                  <div className="text-sm text-gray-600">DSGVO-konforme Leads</div>
                  <div className="text-xs text-gray-500">
                    {salesMetrics ? formatPercentage((salesMetrics.dsgvoCompliantLeads / salesMetrics.totalLeads) * 100) : '0%'} von allen
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{salesMetrics ? formatPercentage(salesMetrics.marketingConsentRate) : '0%'}</div>
                  <div className="text-sm text-gray-600">Marketing-Zustimmung</div>
                  <div className="text-xs text-gray-500">Durchschnittliche Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">100%</div>
                  <div className="text-sm text-gray-600">Datenschutz-Compliance</div>
                  <div className="text-xs text-gray-500">Schweizer Standard</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Erweiterte Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Detaillierte Analyse-Tools werden hier implementiert...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Report-Generierung</h2>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Neuer Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline">{template.format}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  {template.lastUsed && (
                    <p className="text-xs text-gray-500 mb-4">
                      Zuletzt verwendet: {new Date(template.lastUsed).toLocaleDateString('de-CH')}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => generateReport(template.id)}
                      disabled={isLoading}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Generieren
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Vorschau
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      E-Mail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report-Vorlagen verwalten</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Vorlagen-Management wird hier implementiert...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesReporting;