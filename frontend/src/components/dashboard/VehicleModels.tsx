import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VehicleModel {
  name: string;
  status: 'available' | 'coming-soon' | 'limited';
  price: string;
  range: string;
  power: string;
  features: string[];
  image?: string;
}

export const VehicleModels: React.FC = () => {
  const models: VehicleModel[] = [
    {
      name: 'CADILLAC LYRIQ',
      status: 'available',
      price: 'ab CHF 89\'900',
      range: '500 km',
      power: '340 PS',
      features: ['Super Cruise', 'AKG Audio', '33" Display', 'Ultium Battery']
    },
    {
      name: 'CADILLAC OPTIQ',
      status: 'coming-soon',
      price: 'ab CHF 79\'900',
      range: '450 km',
      power: '300 PS',
      features: ['Super Cruise', 'Premium Audio', '30" Display', 'Ultium Battery']
    },
    {
      name: 'CADILLAC VISTIQ',
      status: 'limited',
      price: 'ab CHF 99\'900',
      range: '550 km',
      power: '400 PS',
      features: ['Super Cruise', 'AKG Audio', '35" Display', 'Ultium Battery']
    }
  ];

  const getStatusBadge = (status: VehicleModel['status']) => {
    const statusConfig = {
      available: { text: 'Verfügbar', className: 'bg-green-100 text-green-800 border-green-200' },
      'coming-soon': { text: 'Demnächst', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      limited: { text: 'Limitiert', className: 'bg-orange-100 text-orange-800 border-orange-200' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge className={config.className}>
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🚗</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">CADILLAC EV Modelle (Schweiz)</h3>
            <p className="text-sm text-gray-600">Premium Elektrofahrzeuge für die Schweiz</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model, index) => (
            <Card 
              key={index} 
              className="p-4 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-gray-900 text-lg">{model.name}</h4>
                {getStatusBadge(model.status)}
              </div>

              {/* Vehicle Image Placeholder */}
              <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-4xl">🚗</span>
              </div>

              {/* Specifications */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Preis</span>
                  <span className="text-sm font-bold text-blue-700">{model.price}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-green-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Reichweite</p>
                    <p className="text-sm font-bold text-green-700">{model.range}</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Leistung</p>
                    <p className="text-sm font-bold text-purple-700">{model.power}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Ausstattung
                </p>
                <div className="flex flex-wrap gap-1">
                  {model.features.map((feature, featureIndex) => (
                    <Badge 
                      key={featureIndex} 
                      variant="secondary" 
                      className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <span className="mr-1">📋</span>
                  Konfigurieren
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <span className="mr-1">📊</span>
                  TCO
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-xl">ℹ️</span>
            <h4 className="font-semibold text-gray-900">Schweizer Vorteile</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Kantonale Förderungen verfügbar</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Schweizer Service-Netzwerk</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Spezielle Finanzierungslösungen</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 