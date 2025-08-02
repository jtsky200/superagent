'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Car, Calculator, Settings, Plus, Edit, Trash2 } from 'lucide-react';

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

export const VehicleModels = () => {
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getVehicleStatus = (vehicleId: string) => {
    // Mock status logic - in real implementation this would come from backend
    if (vehicleId === 'LYRIQ_2025') return 'active';
    if (vehicleId === 'VISTIQ') return 'coming-soon';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Verfügbar</Badge>;
      case 'coming-soon':
        return <Badge variant="secondary">Vorbestellbar</Badge>;
      case 'limited':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Limitiert</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fahrzeugmodelle Verwaltung</h2>
          <p className="text-gray-600">Verwalten Sie alle verfügbaren CADILLAC EV Modelle</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neues Modell
        </Button>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(vehicles).map(([vehicleId, vehicle]) => {
          const status = getVehicleStatus(vehicleId);
          const isSelected = selectedVehicle === vehicleId;

          return (
            <Card 
              key={vehicleId} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedVehicle(isSelected ? null : vehicleId)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                    <p className="text-sm text-gray-600">{vehicle.variants.length} Varianten</p>
                  </div>
                  {getStatusBadge(status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Car className="h-16 w-16 text-gray-400" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Katalogpreis ab</span>
                    <span className="font-medium">{formatCurrency(vehicle.basePrice.inclVat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Varianten</span>
                    <span className="font-medium">{vehicle.variants.length}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calculator className="h-4 w-4 mr-1" />
                    TCO
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-1" />
                    Bearbeiten
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Vehicle Details */}
      {selectedVehicle && vehicles[selectedVehicle] && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {vehicles[selectedVehicle].name} - Details
                </CardTitle>
                <p className="text-sm text-gray-600">Detaillierte Informationen und Varianten</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Variante hinzufügen
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Katalogpreis</p>
                <p className="text-xl font-bold">{formatCurrency(vehicles[selectedVehicle].basePrice.inclVat)}</p>
                <p className="text-xs text-gray-500">inkl. MWST</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Varianten</p>
                <p className="text-xl font-bold">{vehicles[selectedVehicle].variants.length}</p>
                <p className="text-xs text-gray-500">verfügbar</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <div className="mt-1">
                  {getStatusBadge(getVehicleStatus(selectedVehicle))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Variants */}
            <div>
              <h4 className="font-medium mb-4">Verfügbare Varianten</h4>
              <div className="space-y-4">
                {vehicles[selectedVehicle].variants.map((variant, index) => (
                  <Card key={variant.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{variant.name}</h5>
                          <p className="text-sm text-gray-600">{variant.description}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500">
                              Kilometerleistung: {variant.mileageOptions.map(opt => `${opt.annualKm.toLocaleString('de-CH')} km`).join(', ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              Monatsrate ab: {formatCurrency(Math.min(...variant.mileageOptions.map(opt => opt.baseMonthlyRate)))}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Bearbeiten
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Löschen
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pricing Information */}
            <div>
              <h4 className="font-medium mb-4">Preisinformationen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Katalogpreis (inkl. MWST)</p>
                  <p className="font-medium">{formatCurrency(vehicles[selectedVehicle].basePrice.inclVat)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Katalogpreis (exkl. MWST)</p>
                  <p className="font-medium">{formatCurrency(vehicles[selectedVehicle].basePrice.exclVat)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 