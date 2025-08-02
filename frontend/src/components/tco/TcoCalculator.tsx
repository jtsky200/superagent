'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Car, Zap, Leaf, Download, Share2 } from 'lucide-react';

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
  }>;
}

interface TcoCalculation {
  vehicleName: string;
  totalCostOfOwnership: number;
  monthlyCost: number;
  costPerKm: number;
  energyCosts: number;
  maintenanceCosts: number;
  insuranceCosts: number;
  depreciationCosts: number;
  taxBenefits: number;
  environmentalSavings: {
    co2Savings: number;
    equivalentTrees: number;
  };
  comparison: {
    electric: number;
    gasoline: number;
    savings: number;
  };
}

export const TcoCalculator = () => {
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [selectedVehicle, setSelectedVehicle] = useState('LYRIQ_2025');
  const [selectedVariant, setSelectedVariant] = useState('lyriq_2025_base');
  const [annualMileage, setAnnualMileage] = useState(15000);
  const [leasingDuration, setLeasingDuration] = useState(48);
  const [energyCosts, setEnergyCosts] = useState({ electric: 0.20, gasoline: 1.65 });
  const [maintenanceCosts, setMaintenanceCosts] = useState({ electric: 400, gasoline: 1000 });
  const [calculation, setCalculation] = useState<TcoCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await fetch('/api/leasing/vehicles');
      const data = await response.json();
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const calculateTCO = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leasing/calculate-tco', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          variantId: selectedVariant,
          annualMileage,
          leasingDuration,
          energyCosts,
          maintenanceCosts,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCalculation(data.data);
      }
    } catch (error) {
      console.error('Error calculating TCO:', error);
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

  const getAvailableVariants = () => {
    const vehicle = vehicles[selectedVehicle];
    return vehicle?.variants || [];
  };

  return (
    <div className="space-y-8">
      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            TCO Kalkulator Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Fahrzeugmodell</label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(vehicles).map(([id, vehicle]) => (
                    <SelectItem key={id} value={id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Variant</label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableVariants().map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Jährliche Kilometerleistung: {annualMileage.toLocaleString('de-CH')} km
              </label>
              <Slider
                value={[annualMileage]}
                onValueChange={(value) => setAnnualMileage(value[0])}
                min={5000}
                max={50000}
                step={1000}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Leasingdauer</label>
              <Select value={leasingDuration.toString()} onValueChange={(value) => setLeasingDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 Monate</SelectItem>
                  <SelectItem value="36">36 Monate</SelectItem>
                  <SelectItem value="48">48 Monate</SelectItem>
                  <SelectItem value="60">60 Monate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Energiekosten</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Strompreis (CHF/kWh)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={energyCosts.electric}
                    onChange={(e) => setEnergyCosts(prev => ({ ...prev, electric: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Benzinpreis (CHF/Liter)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={energyCosts.gasoline}
                    onChange={(e) => setEnergyCosts(prev => ({ ...prev, gasoline: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Wartungskosten (jährlich)</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Elektrofahrzeug (CHF)</label>
                  <Input
                    type="number"
                    value={maintenanceCosts.electric}
                    onChange={(e) => setMaintenanceCosts(prev => ({ ...prev, electric: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Verbrenner (CHF)</label>
                  <Input
                    type="number"
                    value={maintenanceCosts.gasoline}
                    onChange={(e) => setMaintenanceCosts(prev => ({ ...prev, gasoline: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button onClick={calculateTCO} disabled={loading} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            TCO Berechnen
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {calculation && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                TCO Analyse: {calculation.vehicleName}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportieren
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Gesamtkosten (TCO)</p>
                <p className="text-2xl font-bold">{formatCurrency(calculation.totalCostOfOwnership)}</p>
                <p className="text-xs text-gray-500">über {leasingDuration} Monate</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Monatliche Kosten</p>
                <p className="text-2xl font-bold">{formatCurrency(calculation.monthlyCost)}</p>
                <p className="text-xs text-gray-500">pro Monat</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Kosten pro km</p>
                <p className="text-2xl font-bold">{formatCurrency(calculation.costPerKm)}</p>
                <p className="text-xs text-gray-500">pro Kilometer</p>
              </div>
            </div>

            <Separator />

            {/* Cost Breakdown */}
            <div>
              <h4 className="font-medium mb-4">Kostenaufschlüsselung</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Anschaffungspreis</span>
                    <span className="font-medium">{formatCurrency(calculation.totalCostOfOwnership - calculation.energyCosts - calculation.maintenanceCosts - calculation.insuranceCosts - calculation.depreciationCosts + calculation.taxBenefits)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Energiekosten</span>
                    <span className="font-medium">{formatCurrency(calculation.energyCosts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Wartungskosten</span>
                    <span className="font-medium">{formatCurrency(calculation.maintenanceCosts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Versicherungskosten</span>
                    <span className="font-medium">{formatCurrency(calculation.insuranceCosts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Wertverlust</span>
                    <span className="font-medium">{formatCurrency(calculation.depreciationCosts)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Steuervorteile</span>
                    <span className="font-medium">-{formatCurrency(calculation.taxBenefits)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-2">Umweltvorteile</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">CO₂-Einsparung</span>
                        <span className="font-medium">{calculation.environmentalSavings.co2Savings.toFixed(1)} Tonnen</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Äquivalente Bäume</span>
                        <span className="font-medium">{calculation.environmentalSavings.equivalentTrees.toLocaleString('de-CH')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Comparison */}
            <div>
              <h4 className="font-medium mb-4">Vergleich mit Verbrennerfahrzeug</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-blue-600">Elektrofahrzeug</p>
                  <p className="text-xl font-bold">{formatCurrency(calculation.comparison.electric)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <Car className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">Verbrenner</p>
                  <p className="text-xl font-bold">{formatCurrency(calculation.comparison.gasoline)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <Leaf className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-green-600">Ersparnis</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(calculation.comparison.savings)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 