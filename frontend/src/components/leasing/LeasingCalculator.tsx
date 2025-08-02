'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Car, CreditCard, Download, Share2, FileText } from 'lucide-react';

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

interface LeasingCalculation {
  vehicleName: string;
  basePrice: number;
  downPaymentAmount: number;
  financingAmount: number;
  residualValue: number;
  residualPercent: number;
  baseMonthlyRate: number;
  serviceRates: {
    comfortPlus: number;
    gap: number;
    legalProtection: number;
  };
  totalServiceCosts: number;
  totalMonthlyRate: number;
  totalLeasingCost: number;
  totalServiceCost: number;
  leasingDuration: number;
  annualMileage: number;
}

export const LeasingCalculator = () => {
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [selectedVehicle, setSelectedVehicle] = useState('LYRIQ_2025');
  const [selectedVariant, setSelectedVariant] = useState('lyriq_2025_base');
  const [selectedMileage, setSelectedMileage] = useState(15000);
  const [leasingDuration, setLeasingDuration] = useState(48);
  const [downPaymentPercent, setDownPaymentPercent] = useState(0);
  const [selectedServices, setSelectedServices] = useState({
    comfortPlus: true,
    gap: true,
    legalProtection: true
  });
  const [calculation, setCalculation] = useState<LeasingCalculation | null>(null);
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

  const calculateLeasing = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leasing/calculate-leasing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          variantId: selectedVariant,
          annualMileage: selectedMileage,
          leasingDuration,
          downPaymentPercent,
          selectedServices,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCalculation(data.data);
      }
    } catch (error) {
      console.error('Error calculating leasing:', error);
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

  const getAvailableMileageOptions = () => {
    const vehicle = vehicles[selectedVehicle];
    const variant = vehicle?.variants.find(v => v.id === selectedVariant);
    return variant?.mileageOptions || [];
  };

  const getCurrentVehicleData = () => {
    const vehicle = vehicles[selectedVehicle];
    const variant = vehicle?.variants.find(v => v.id === selectedVariant);
    return { vehicle, variant };
  };

  return (
    <div className="space-y-8">
      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Leasing Kalkulator
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
              <label className="block text-sm font-medium mb-2">Jährliche Kilometerleistung</label>
              <Select value={selectedMileage.toString()} onValueChange={(value) => setSelectedMileage(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMileageOptions().map((option) => (
                    <SelectItem key={option.annualKm} value={option.annualKm.toString()}>
                      {option.annualKm.toLocaleString('de-CH')} km
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div>
              <label className="block text-sm font-medium mb-2">
                Anzahlung: {downPaymentPercent}%
              </label>
              <Slider
                value={[downPaymentPercent]}
                onValueChange={(value) => setDownPaymentPercent(value[0])}
                min={0}
                max={30}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                Verfügbare Optionen: 0%, 5%, 10%, 15%, 20%, 25%, 30%
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-4">Zusatzleistungen</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={selectedServices.comfortPlus}
                  onCheckedChange={(checked) => setSelectedServices(prev => ({ ...prev, comfortPlus: checked }))}
                />
                <div>
                  <label className="text-sm font-medium">Comfort Plus</label>
                  <p className="text-xs text-gray-500">Vollkasko-Versicherung</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={selectedServices.gap}
                  onCheckedChange={(checked) => setSelectedServices(prev => ({ ...prev, gap: checked }))}
                />
                <div>
                  <label className="text-sm font-medium">GAP-Versicherung</label>
                  <p className="text-xs text-gray-500">Wertdifferenz-Schutz</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={selectedServices.legalProtection}
                  onCheckedChange={(checked) => setSelectedServices(prev => ({ ...prev, legalProtection: checked }))}
                />
                <div>
                  <label className="text-sm font-medium">Rechtsschutz</label>
                  <p className="text-xs text-gray-500">Rechtliche Unterstützung</p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={calculateLeasing} disabled={loading} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Leasing Berechnen
          </Button>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      {(() => {
        const { vehicle, variant } = getCurrentVehicleData();
        if (!vehicle || !variant) return null;

        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Fahrzeuginformationen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fahrzeug</p>
                  <p className="font-medium">{vehicle.name} {variant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Katalogpreis</p>
                  <p className="font-medium">{formatCurrency(vehicle.basePrice.inclVat)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Beschreibung</p>
                  <p className="font-medium">{variant.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Results Section */}
      {calculation && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Leasing-Offerte: {calculation.vehicleName}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
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
                <p className="text-sm text-gray-600">Monatliche Rate</p>
                <p className="text-2xl font-bold">{formatCurrency(calculation.totalMonthlyRate)}</p>
                <p className="text-xs text-gray-500">inkl. MWST</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Anzahlung</p>
                <p className="text-2xl font-bold">{formatCurrency(calculation.downPaymentAmount)}</p>
                <p className="text-xs text-gray-500">einmalig</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Gesamtkosten</p>
                <p className="text-2xl font-bold">{formatCurrency(calculation.totalLeasingCost)}</p>
                <p className="text-xs text-gray-500">über {calculation.leasingDuration} Monate</p>
              </div>
            </div>

            <Separator />

            {/* Detailed Breakdown */}
            <div>
              <h4 className="font-medium mb-4">Detaillierte Aufschlüsselung</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Katalogpreis</span>
                    <span className="font-medium">{formatCurrency(calculation.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Anzahlung ({downPaymentPercent}%)</span>
                    <span className="font-medium">-{formatCurrency(calculation.downPaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Finanzierungsbetrag</span>
                    <span className="font-medium">{formatCurrency(calculation.financingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Restwert ({calculation.residualPercent.toFixed(1)}%)</span>
                    <span className="font-medium">{formatCurrency(calculation.residualValue)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Basis-Monatsrate</span>
                    <span className="font-medium">{formatCurrency(calculation.baseMonthlyRate)}</span>
                  </div>
                  {calculation.serviceRates.comfortPlus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Comfort Plus</span>
                      <span className="font-medium">+{formatCurrency(calculation.serviceRates.comfortPlus)}</span>
                    </div>
                  )}
                  {calculation.serviceRates.gap > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">GAP-Versicherung</span>
                      <span className="font-medium">+{formatCurrency(calculation.serviceRates.gap)}</span>
                    </div>
                  )}
                  {calculation.serviceRates.legalProtection > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Rechtsschutz</span>
                      <span className="font-medium">+{formatCurrency(calculation.serviceRates.legalProtection)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Gesamt Monatsrate</span>
                    <span>{formatCurrency(calculation.totalMonthlyRate)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Terms */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Leasing-Bedingungen</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Laufzeit:</strong> {calculation.leasingDuration} Monate</p>
                  <p><strong>Kilometerleistung:</strong> {calculation.annualMileage.toLocaleString('de-CH')} km/Jahr</p>
                  <p><strong>Zinssatz:</strong> 0% (Aktuelles Angebot)</p>
                </div>
                <div>
                  <p><strong>Überkilometer:</strong> CHF 0.50/km</p>
                  <p><strong>Versicherung:</strong> Vollkasko erforderlich</p>
                  <p><strong>Wartung:</strong> Nicht inklusive</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 