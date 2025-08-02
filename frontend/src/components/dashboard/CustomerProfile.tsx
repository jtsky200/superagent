import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CustomerProfileProps {
  customer: {
    name: string;
    type: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    birthDate: string;
    creditRating: string;
    income: string;
    obligations: string;
    creditLimit: string;
    creditHistory: string;
    interests: string[];
    visits: Array<{ activity: string; date: string }>;
    vehicles: Array<{ model: string; period: string }>;
    specialInterests: string[];
  };
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer }) => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Kundenprofil</h3>
              <p className="text-sm text-gray-600">AI-gestützte Kundenanalyse</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <span>🖨️</span>
              <span className="hidden sm:inline">Drucken</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <span>📤</span>
              <span className="hidden sm:inline">Teilen</span>
            </Button>
            <Button size="sm" className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700">
              <span>💾</span>
              <span className="hidden sm:inline">Speichern</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <Card className="p-4 border-2 border-gray-100 hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-gray-900">Persönliche Daten</h4>
              <Badge className="bg-green-100 text-green-800 border-green-200">Verifiziert</Badge>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">E-Mail</p>
                  <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Telefon</p>
                  <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adresse</p>
                  <p className="text-sm font-medium text-gray-900">{customer.address}</p>
                  <p className="text-sm font-medium text-gray-900">{customer.city}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Geburtsdatum</p>
                  <p className="text-sm font-medium text-gray-900">{customer.birthDate}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Info */}
          <Card className="p-4 border-2 border-gray-100 hover:border-green-200 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-gray-900">Finanzdaten</h4>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">ZEK / CRIF</Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Bonitätsbewertung</p>
                  <p className="text-sm font-bold text-green-600">{customer.creditRating}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Einkommen</p>
                  <p className="text-sm font-bold text-green-700">{customer.income}</p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bestehende Verpflichtungen</p>
                  <p className="text-sm font-medium text-yellow-700">{customer.obligations}</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kredit-Leasing-Limite</p>
                  <p className="text-sm font-bold text-blue-700">{customer.creditLimit}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kredithistorie</p>
                  <p className="text-sm font-medium text-gray-900">{customer.creditHistory}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Interest & History */}
          <Card className="p-4 border-2 border-gray-100 hover:border-purple-200 transition-all">
            <h4 className="font-bold text-gray-900 mb-4">Interessen & Historie</h4>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Interessiert an Modellen</p>
                <div className="flex flex-wrap gap-2">
                  {customer.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Besuche</p>
                <div className="space-y-2">
                  {customer.visits.map((visit, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{visit.activity}</span>
                      <span className="text-gray-500">{visit.date}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Aktuelle Fahrzeuge</p>
                <div className="space-y-2">
                  {customer.vehicles.map((vehicle, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{vehicle.model}</span>
                      <span className="text-gray-500">{vehicle.period}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Besondere Interessen</p>
                <div className="flex flex-wrap gap-2">
                  {customer.specialInterests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}; 