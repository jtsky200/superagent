// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Car, 
  Zap,
  MapPin,
  Info,
  GitCompare as Compare,
  Award
} from 'lucide-react';

const SWISS_CANTONS = [
  { code: 'ZH', name: 'Zürich' },
  { code: 'BE', name: 'Bern' },
  { code: 'LU', name: 'Luzern' },
  { code: 'BS', name: 'Basel-Stadt' },
  { code: 'BL', name: 'Basel-Landschaft' },
  { code: 'GE', name: 'Genf' },
  { code: 'VD', name: 'Waadt' },
  { code: 'VS', name: 'Wallis' },
  { code: 'TI', name: 'Tessin' },
  { code: 'SG', name: 'St. Gallen' },
  { code: 'AG', name: 'Aargau' },
  { code: 'SO', name: 'Solothurn' },
  { code: 'FR', name: 'Freiburg' },
  { code: 'SH', name: 'Schaffhausen' },
  { code: 'ZG', name: 'Zug' },
  { code: 'NE', name: 'Neuenburg' },
  { code: 'JU', name: 'Jura' }
];

interface EVCalculationResult {
  success: boolean;
  canton: string;
  calculations: {
    purchase_costs: {
      vehicle_price: number;
      registration_fee: number;
      license_plate_fee: number;
      total_initial: number;
    };
    annual_costs: {
      vehicle_tax_without_discount: number;
      vehicle_tax_with_discount: number;
      energy_cost: number;
      total_annual_operating: number;
    };
    tax_benefits: {
      discount_percent: number;
      discount_years: number | null;
      annual_tax_saving: number;
      total_tax_savings: number;
    };
    total_cost_5_years: number;
    annual_savings: number;
    energy_analysis: {
      annual_consumption_kwh: number;
      electricity_price_per_kwh: number;
      total_energy_cost_5_years: number;
      cost_per_100km: number;
    };
    incentive_summary: {
      has_tax_discount: boolean;
      discount_type: string;
      total_savings: number;
      canton_rank: string;
    };
  };
  vehicle: any;
  customer: any;
  timestamp: string;
  disclaimer: string;
}

interface ComparisonResult {
  success: boolean;
  comparison: {
    canton: string;
    canton_name: string;
    total_cost_5_years: number;
    annual_savings: number;
    tax_benefits: any;
    incentive_summary: any;
    rank: number;
  }[];
  best_canton: any;
  vehicle: any;
  customer: any;
  timestamp: string;
}

export function EVIncentivesCalculator() {
  const [selectedCanton, setSelectedCanton] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('70000');
  const [powerKw, setPowerKw] = useState('255');
  const [weightKg, setWeightKg] = useState('2234');
  const [batteryCapacity, setBatteryCapacity] = useState('102');
  const [efficiency, setEfficiency] = useState('22');
  const [annualMileage, setAnnualMileage] = useState('15000');
  const [yearsOwnership, setYearsOwnership] = useState('5');
  const [businessUse, setBusinessUse] = useState(false);
  const [mode, setMode] = useState<'single' | 'compare'>('single');
  const [selectedCantons, setSelectedCantons] = useState<string[]>(['ZH', 'BE', 'GE', 'VD', 'BS']);
  
  const [loading, setLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<EVCalculationResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    if (mode === 'single' && !selectedCanton) {
      setError('Please select a canton');
      return;
    }

    setLoading(true);
    setError('');
    setSingleResult(null);
    setComparisonResult(null);

    try {
      const token = localStorage.getItem('authToken');
      const vehicleData = {
        purchase_price: parseInt(purchasePrice),
        power_kw: parseInt(powerKw),
        weight_kg: parseInt(weightKg),
        battery_capacity_kwh: parseInt(batteryCapacity),
        efficiency_kwh_100km: parseInt(efficiency)
      };

      const customerData = {
        annual_mileage: parseInt(annualMileage),
        years_ownership: parseInt(yearsOwnership),
        business_use: businessUse
      };

      const endpoint = mode === 'single' 
        ? '/api/swiss-data/ev-incentives/calculate'
        : '/api/swiss-data/ev-incentives/compare';

      const body = mode === 'single'
        ? { canton: selectedCanton, vehicle: vehicleData, customer: customerData }
        : { cantons: selectedCantons, vehicle: vehicleData, customer: customerData };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (response.status === 503) {
        setError(data.error || 'EV incentives calculation service is currently unavailable. Please try again later.');
        setSingleResult(null);
        setComparisonResult(null);
      } else {
        if (mode === 'single') {
          setSingleResult(data);
        } else {
          setComparisonResult(data);
        }
      }
    } catch (err) {
      if (err.message.includes('503')) {
        setError('EV incentives calculation service is currently unavailable. Please try again later.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to calculate incentives');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      style: 'currency', 
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Swiss EV Incentives Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="flex gap-4">
            <Button
              variant={mode === 'single' ? 'default' : 'outline'}
              onClick={() => setMode('single')}
              className="flex-1"
            >
              Single Canton
            </Button>
            <Button
              variant={mode === 'compare' ? 'default' : 'outline'}
              onClick={() => setMode('compare')}
              className="flex-1"
            >
              <Compare className="w-4 h-4 mr-2" />
              Compare Cantons
            </Button>
          </div>

          {/* Canton Selection */}
          {mode === 'single' ? (
            <div className="space-y-2">
              <Label htmlFor="canton">Canton *</Label>
              <Select value={selectedCanton} onValueChange={setSelectedCanton}>
                <SelectTrigger>
                  <SelectValue placeholder="Select canton" />
                </SelectTrigger>
                <SelectContent>
                  {SWISS_CANTONS.map(canton => (
                    <SelectItem key={canton.code} value={canton.code}>
                      {canton.code} - {canton.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Cantons to Compare</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {SWISS_CANTONS.slice(0, 12).map(canton => (
                  <div key={canton.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={canton.code}
                      checked={selectedCantons.includes(canton.code)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCantons([...selectedCantons, canton.code]);
                        } else {
                          setSelectedCantons(selectedCantons.filter(c => c !== canton.code));
                        }
                      }}
                    />
                    <Label htmlFor={canton.code} className="text-sm">
                      {canton.code}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle Information */}
          <Card className="border-dashed">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="w-4 h-4" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Purchase Price (CHF)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="power">Power (kW)</Label>
                  <Input
                    id="power"
                    type="number"
                    value={powerKw}
                    onChange={(e) => setPowerKw(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="battery">Battery Capacity (kWh)</Label>
                  <Input
                    id="battery"
                    type="number"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="efficiency">Efficiency (kWh/100km)</Label>
                  <Input
                    id="efficiency"
                    type="number"
                    value={efficiency}
                    onChange={(e) => setEfficiency(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="border-dashed">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4" />
                Usage Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mileage">Annual Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={annualMileage}
                    onChange={(e) => setAnnualMileage(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years">Ownership Period (years)</Label>
                  <Input
                    id="years"
                    type="number"
                    value={yearsOwnership}
                    onChange={(e) => setYearsOwnership(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="business"
                    checked={businessUse}
                    onCheckedChange={setBusinessUse}
                  />
                  <Label htmlFor="business">Business Use</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleCalculate} disabled={loading} className="w-full">
            <Calculator className="w-4 h-4 mr-2" />
            {loading ? 'Calculating...' : `Calculate ${mode === 'single' ? 'Incentives' : 'Comparison'}`}
          </Button>

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-red-600">⚠️</div>
                <div className="text-red-800 font-medium">Service Unavailable</div>
              </div>
              <p className="text-red-700 mt-2 text-sm">{error}</p>
              <p className="text-red-600 mt-2 text-xs">
                <strong>Important:</strong> Cannot calculate incentives without access to current cantonal tax data. Please consult local authorities for accurate information.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Calculation Results */}
      {singleResult && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Incentives Calculation - {singleResult.canton}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total 5-Year Cost</p>
                      <p className="text-2xl font-bold">{formatCurrency(singleResult.calculations.total_cost_5_years)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Annual Tax Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(singleResult.calculations.annual_savings)}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">EV Discount</p>
                      <p className="text-2xl font-bold">{singleResult.calculations.tax_benefits.discount_percent}%</p>
                      <Badge variant={getRankBadgeColor(singleResult.calculations.incentive_summary.canton_rank)}>
                        {singleResult.calculations.incentive_summary.canton_rank} incentives
                      </Badge>
                    </div>
                    <Zap className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Purchase Costs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Vehicle Price</span>
                    <span>{formatCurrency(singleResult.calculations.purchase_costs.vehicle_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registration Fee</span>
                    <span>{formatCurrency(singleResult.calculations.purchase_costs.registration_fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>License Plate Fee</span>
                    <span>{formatCurrency(singleResult.calculations.purchase_costs.license_plate_fee)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Initial Cost</span>
                    <span>{formatCurrency(singleResult.calculations.purchase_costs.total_initial)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Annual Operating Costs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Vehicle Tax (without EV discount)</span>
                    <span className="line-through text-gray-500">
                      {formatCurrency(singleResult.calculations.annual_costs.vehicle_tax_without_discount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Vehicle Tax (with EV discount)</span>
                    <span>{formatCurrency(singleResult.calculations.annual_costs.vehicle_tax_with_discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energy Cost</span>
                    <span>{formatCurrency(singleResult.calculations.annual_costs.energy_cost)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Annual Operating</span>
                    <span>{formatCurrency(singleResult.calculations.annual_costs.total_annual_operating)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tax Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Discount Percentage</span>
                    <span>{singleResult.calculations.tax_benefits.discount_percent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount Duration</span>
                    <span>
                      {singleResult.calculations.tax_benefits.discount_years 
                        ? `${singleResult.calculations.tax_benefits.discount_years} years`
                        : 'Permanent'}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Annual Tax Saving</span>
                    <span>{formatCurrency(singleResult.calculations.tax_benefits.annual_tax_saving)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                    <span>Total Tax Savings</span>
                    <span>{formatCurrency(singleResult.calculations.tax_benefits.total_tax_savings)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Energy Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Annual Consumption</span>
                    <span>{singleResult.calculations.energy_analysis.annual_consumption_kwh.toLocaleString()} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Electricity Price</span>
                    <span>{singleResult.calculations.energy_analysis.electricity_price_per_kwh.toFixed(2)} CHF/kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per 100km</span>
                    <span>{formatCurrency(singleResult.calculations.energy_analysis.cost_per_100km)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>5-Year Energy Cost</span>
                    <span>{formatCurrency(singleResult.calculations.energy_analysis.total_energy_cost_5_years)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-3 border border-blue-200 bg-blue-50 rounded-md text-blue-700 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              <p className="text-sm">{singleResult.disclaimer}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {comparisonResult && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compare className="w-5 h-5" />
              Canton Comparison Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {comparisonResult.comparison.map((canton, index) => (
                <Card key={canton.canton} className={`${index === 0 ? 'border-green-500 bg-green-50' : ''}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? 'default' : 'outline'}>
                          #{canton.rank}
                        </Badge>
                        <span className="font-semibold">{canton.canton} - {canton.canton_name}</span>
                        {index === 0 && (
                          <Badge className="bg-green-600">
                            <Award className="w-3 h-3 mr-1" />
                            Best Deal
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{formatCurrency(canton.total_cost_5_years)}</div>
                        <div className="text-sm text-green-600">Save {formatCurrency(canton.annual_savings)}/year</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">EV Discount:</span>
                        <span className="ml-2 font-medium">{canton.tax_benefits.discount_percent}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">
                          {canton.tax_benefits.discount_years ? `${canton.tax_benefits.discount_years}y` : 'Permanent'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ranking:</span>
                        <Badge variant={getRankBadgeColor(canton.incentive_summary.canton_rank)} className="ml-2">
                          {canton.incentive_summary.canton_rank}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {comparisonResult.best_canton && (
              <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                <h4 className="font-semibold text-green-800 mb-2">💡 Recommendation</h4>
                <p className="text-green-700">
                  <strong>{comparisonResult.best_canton.canton} - {comparisonResult.best_canton.canton_name}</strong> offers 
                  the best value with total 5-year costs of <strong>{formatCurrency(comparisonResult.best_canton.total_cost_5_years)}</strong> 
                  and annual savings of <strong>{formatCurrency(comparisonResult.best_canton.annual_savings)}</strong>.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}