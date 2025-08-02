'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  MapPin, 
  Zap, 
  Calculator, 
  Database,
  ChevronRight,
  Flag,
  Info
} from 'lucide-react';

import { CompanyLookup } from './CompanyLookup';
import { PostalCodeValidator } from './PostalCodeValidator';
import { ChargingStationFinder } from './ChargingStationFinder';
import { EVIncentivesCalculator } from './EVIncentivesCalculator';

type ServiceType = 'overview' | 'company-lookup' | 'postal-validation' | 'charging-stations' | 'ev-incentives';

const services = [
  {
    id: 'company-lookup' as ServiceType,
    title: 'Company Lookup (ZEFIX)',
    description: 'Look up company information from the Swiss Federal Commercial Registry',
    icon: Building,
    badge: 'Real-time API',
    features: [
      'Official ZEFIX data',
      'UID number search',
      'Company name search',
      'Complete company details',
      'Real-time validation'
    ]
  },
  {
    id: 'postal-validation' as ServiceType,
    title: 'Postal Code Validation',
    description: 'Validate and look up Swiss postal codes with comprehensive location data',
    icon: MapPin,
    badge: 'OpenPLZ API',
    features: [
      'Real postal data',
      'Canton information',
      'District & commune details',
      'Format validation',
      'Location mapping'
    ]
  },
  {
    id: 'charging-stations' as ServiceType,
    title: 'EV Charging Stations',
    description: 'Find electric vehicle charging stations across Switzerland',
    icon: Zap,
    badge: 'Live Data',
    features: [
      'Real-time availability',
      'Multiple networks (IONITY, Tesla, etc.)',
      'Power ratings & connector types',
      'Pricing information',
      'Amenities & payment methods'
    ]
  },
  {
    id: 'ev-incentives' as ServiceType,
    title: 'EV Incentives Calculator',
    description: 'Calculate cantonal EV incentives and tax benefits',
    icon: Calculator,
    badge: 'Swiss Cantons',
    features: [
      'All 26 cantons supported',
      'Tax discount calculations',
      'Total cost of ownership',
      'Cantonal comparison',
      'Energy cost analysis'
    ]
  }
];

export function SwissServicesPage() {
  const [activeService, setActiveService] = useState<ServiceType>('overview');

  const renderServiceContent = () => {
    switch (activeService) {
      case 'company-lookup':
        return <CompanyLookup />;
      case 'postal-validation':
        return <PostalCodeValidator />;
      case 'charging-stations':
        return <ChargingStationFinder />;
      case 'ev-incentives':
        return <EVIncentivesCalculator />;
      default:
        return (
          <div className="space-y-6">
            <Card className="border-l-4 border-l-red-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5" />
                  Swiss-Specific Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive Swiss integrations for the Cadillac EV Customer Intelligence System.
                  All services use real Swiss APIs and official data sources.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>Real-time API integrations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Flag className="w-4 h-4 text-red-600" />
                    <span>Official Swiss data sources</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{service.title}</h3>
                            <Badge variant="outline" className="mt-1">
                              {service.badge}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {service.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {service.features.map((feature, index) => (
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
                        onClick={() => setActiveService(service.id)}
                      >
                        Open {service.title}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="w-5 h-5" />
                  Implementation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Data Sources</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• ZEFIX - Swiss Federal Commercial Registry</li>
                      <li>• OpenPLZ API - Swiss Postal Codes</li>
                      <li>• ich-tanke-strom.ch - Charging Networks</li>
                      <li>• Swiss Federal Energy Office</li>
                      <li>• Cantonal tax authorities</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Real-time data integration</li>
                      <li>• Fallback to mock data if APIs unavailable</li>
                      <li>• Comprehensive input validation</li>
                      <li>• Error handling & user feedback</li>
                      <li>• Mobile-responsive interfaces</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> All calculations are estimates based on current regulations. 
                    Users should verify information with local authorities for official purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Swiss Services Integration</h1>
          <p className="text-gray-600 mt-1">
            Real Swiss API integrations for enhanced customer intelligence
          </p>
        </div>
        {activeService !== 'overview' && (
          <Button 
            variant="outline" 
            onClick={() => setActiveService('overview')}
          >
            ← Back to Overview
          </Button>
        )}
      </div>

      {/* Service Navigation */}
      {activeService !== 'overview' && (
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <Button
              key={service.id}
              variant={activeService === service.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveService(service.id)}
              className="flex items-center gap-2"
            >
              <service.icon className="w-4 h-4" />
              {service.title}
            </Button>
          ))}
        </div>
      )}

      {/* Main Content */}
      {renderServiceContent()}
    </div>
  );
}