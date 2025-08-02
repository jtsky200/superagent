'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Car, Calculator, FileText, Download, Share2, Printer, Save } from 'lucide-react';

interface Vehicle {
  name: string;
  basePrice: {
    inclVat: number;
    exclVat: number;
  };
  variants: Array<{
    id: string;
    name: string;
    description: string;
    mileageOptions: Array<{
      annualKm: number;
      residualPercent: number;
      residualValue: number;
      baseMonthlyRate: number;
      services: {
        comfortPlus: number;
        gap: number;
        legalProtection: number;
      };
    }>;
  }>;
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  type: 'private' | 'business';
  creditRating: string;
  income: number;
  existingObligations: number;
  communicationPreferences: string[];
  interests: string[];
  currentVehicles: Array<{
    model: string;
    year: string;
  }>;
  visits: Array<{
    type: string;
    date: string;
  }>;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [searchType, setSearchType] = useState('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState({
    handelsregister: true,
    zekCrif: true,
    socialNetworks: true,
    signingAuthorities: true,
    debtCollection: true,
    realEstate: false,
    internationalMatch: false
  });
  const [loading, setLoading] = useState(false);

  // Load vehicle data on component mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leasing/vehicles');
      const data = await response.json();
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomer = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      // Simulate customer search - in real implementation, this would call your backend API
      const mockCustomer: CustomerProfile = {
        id: '1',
        name: 'Michael Müller',
        email: 'michael.mueller@example.com',
        phone: '+41 78 123 45 67',
        address: 'Bahnhofstrasse 42, 8001 Zürich',
        birthDate: '15.05.1978',
        type: 'private',
        creditRating: 'A+',
        income: 145000,
        existingObligations: 650000,
        communicationPreferences: ['E-Mail', 'WhatsApp'],
        interests: ['Technologie', 'Nachhaltigkeit', 'Premium'],
        currentVehicles: [
          { model: 'Tesla Model S', year: 'Seit 2020' },
          { model: 'Mercedes GLE', year: '2016-2020' }
        ],
        visits: [
          { type: 'Website-Besuch (LYRIQ)', date: 'Vor 3 Tagen' },
          { type: 'Showroom Zürich', date: '12.04.2023' }
        ]
      };
      setCustomerProfile(mockCustomer);
    } catch (error) {
      console.error('Error searching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Kundenrecherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Suchtyp</label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">E-Mail</SelectItem>
                  <SelectItem value="phone">Telefonnummer</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="company">Unternehmen</SelectItem>
                  <SelectItem value="uid">UID-Nummer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Suchbegriff</label>
              <Input
                placeholder="z.B. josegoncalves11@hotmail.com"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchCustomer} disabled={loading} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Suchen
              </Button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Erweiterte Suchoptionen</h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Internationaler Abgleich</span>
                <Checkbox
                  checked={searchOptions.internationalMatch}
                  onCheckedChange={(checked) => 
                    setSearchOptions(prev => ({ ...prev, internationalMatch: !!checked }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'handelsregister', label: 'Handelsregister (Schweiz)' },
                { key: 'zekCrif', label: 'ZEK / CRIF (Finanzstatus)' },
                { key: 'socialNetworks', label: 'Soziale Netzwerke' },
                { key: 'signingAuthorities', label: 'Zeichnungsberechtigungen' },
                { key: 'debtCollection', label: 'Betreibungsauszug' },
                { key: 'realEstate', label: 'Immobilienbesitz' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={searchOptions[key as keyof typeof searchOptions]}
                    onCheckedChange={(checked) => 
                      setSearchOptions(prev => ({ ...prev, [key]: !!checked }))
                    }
                  />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Profile */}
      {customerProfile && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Kundenprofil</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Drucken
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
                <Button size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Data */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">Persönliche Daten</CardTitle>
                    <Badge variant="secondary">Verifiziert</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <p className="font-medium">{customerProfile.name}</p>
                      <p className="text-sm text-gray-600">
                        {customerProfile.type === 'private' ? 'Privatperson' : 'Unternehmen'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">E-Mail</p>
                      <p className="text-sm">{customerProfile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Telefon</p>
                      <p className="text-sm">{customerProfile.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Adresse</p>
                      <p className="text-sm">{customerProfile.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Geburtsdatum</p>
                      <p className="text-sm">{customerProfile.birthDate}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Kommunikationspräferenz</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {customerProfile.communicationPreferences.map((pref, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Data */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">Finanzdaten</CardTitle>
                    <Badge variant="secondary">ZEK / CRIF</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm">Bonitätsbewertung</p>
                      <p className="text-sm font-medium">{customerProfile.creditRating}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-black h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Einkommen</p>
                    <p className="text-sm">{formatCurrency(customerProfile.income)} / Jahr</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Bestehende Verpflichtungen</p>
                    <p className="text-sm">Hypothek: {formatCurrency(customerProfile.existingObligations)}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Kredit-Leasing-Limite (geschätzt)</p>
                    <p className="text-sm">Bis {formatCurrency(2500)} / Monat</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Kredithistorie</p>
                    <p className="text-sm">Keine negativen Einträge</p>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Vollständigen Finanzreport anzeigen
                  </Button>
                </CardContent>
              </Card>

              {/* Interests & History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Interessen & Historie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Interessiert an Modellen</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">CADILLAC LYRIQ</Badge>
                      <Badge variant="outline" className="text-xs">CADILLAC OPTIQ</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Besuche</p>
                    <div className="mt-1 space-y-2">
                      {customerProfile.visits.map((visit, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{visit.type}</span>
                          <span>{visit.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Aktuelle Fahrzeuge</p>
                    <div className="mt-1 space-y-2">
                      {customerProfile.currentVehicles.map((vehicle, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{vehicle.model}</span>
                          <span>{vehicle.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Besondere Interessen</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {customerProfile.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Models */}
      {Object.keys(vehicles).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              CADILLAC EV Modelle (Schweiz)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(vehicles).map(([vehicleId, vehicle]) => (
                <Card key={vehicleId} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle className="text-base">{vehicle.name}</CardTitle>
                      <Badge variant="secondary">Verfügbar</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-48 bg-gray-200 flex items-center justify-center rounded">
                      <Car className="h-16 w-16 text-gray-500" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Preis ab</p>
                        <p className="font-bold">{formatCurrency(vehicle.basePrice.inclVat)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Varianten</p>
                        <p className="font-medium">{vehicle.variants.length}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button className="flex-1" size="sm">
                        <Calculator className="h-4 w-4 mr-2" />
                        TCO Berechnen
                      </Button>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCustomerSearch = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Erweiterte Kundensuche</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Funktionalität wird implementiert...</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderVehicleModels = () => {
    const VehicleModels = React.lazy(() => import('@/components/vehicles/VehicleModels').then(module => ({ default: module.VehicleModels })));
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
        <VehicleModels />
      </React.Suspense>
    );
  };

  const renderTcoCalculator = () => {
    // Dynamic import to avoid SSR issues
    const TcoCalculator = React.lazy(() => import('@/components/tco/TcoCalculator').then(module => ({ default: module.TcoCalculator })));
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
        <TcoCalculator />
      </React.Suspense>
    );
  };

  const renderFinancing = () => {
    const LeasingCalculator = React.lazy(() => import('@/components/leasing/LeasingCalculator').then(module => ({ default: module.LeasingCalculator })));
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
        <LeasingCalculator />
      </React.Suspense>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Funktionalität wird implementiert...</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Einstellungen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Funktionalität wird implementiert...</p>
        </CardContent>
      </Card>
    </div>
  );

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'search', label: 'Kundensuche' },
    { id: 'vehicles', label: 'Fahrzeugmodelle' },
    { id: 'tco', label: 'TCO-Kalkulator' },
    { id: 'finance', label: 'Finanzierung' },
    { id: 'analytics', label: 'Analysen' },
    { id: 'settings', label: 'Einstellungen' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'search':
        return renderCustomerSearch();
      case 'vehicles':
        return renderVehicleModels();
      case 'tco':
        return renderTcoCalculator();
      case 'finance':
        return renderFinancing();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">CADILLAC EV</h1>
            <span className="text-xl font-light">|</span>
            <h2 className="text-xl">Customer Intelligence System</h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Hilfe
            </Button>
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-6 py-4 font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === item.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
}

