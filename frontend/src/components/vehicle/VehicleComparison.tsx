'use client';

// 🚗 CADILLAC EV CIS - Vehicle Comparison Component
// Advanced LYRIQ vs VISTIQ comparison for Swiss market

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  Battery, 
  Gauge, 
  Euro, 
  MapPin, 
  Clock,
  Zap,
  Shield,
  Award,
  ChevronRight,
  Download,
  Share2,
  Calculator
} from 'lucide-react';

// Swiss market vehicle data types
interface SwissVehicleSpec {
  id: string;
  model: 'LYRIQ' | 'VISTIQ';
  variant: string;
  price: {
    base: number;
    currency: 'CHF';
    afterIncentives?: number;
  };
  performance: {
    range: number; // km
    acceleration: number; // 0-100 km/h
    topSpeed: number; // km/h
    power: number; // kW
    torque: number; // Nm
  };
  battery: {
    capacity: number; // kWh
    chargingSpeed: number; // kW
    chargingTime: {
      dc_fast: string; // 10-80%
      ac_home: string; // 0-100%
    };
  };
  dimensions: {
    length: number; // mm
    width: number; // mm
    height: number; // mm
    wheelbase: number; // mm
    weight: number; // kg
    trunk: number; // liters
  };
  features: {
    luxury: string[];
    technology: string[];
    safety: string[];
    swissSpecific: string[];
  };
  efficiency: {
    consumption: number; // kWh/100km
    co2Emissions: number; // g/km (0 for EV)
  };
  swissMarket: {
    availability: string;
    incentives: {
      federal: number;
      cantonal: Record<string, number>;
    };
    serviceLocations: number;
    winterPerformance: 'excellent' | 'good' | 'fair';
  };
}

// Swiss market vehicle specifications
const swissVehicleData: SwissVehicleSpec[] = [
  {
    id: 'lyriq-luxury',
    model: 'LYRIQ',
    variant: 'Luxury',
    price: {
      base: 89900,
      currency: 'CHF',
      afterIncentives: 84900
    },
    performance: {
      range: 502,
      acceleration: 6.0,
      topSpeed: 190,
      power: 255,
      torque: 440
    },
    battery: {
      capacity: 102,
      chargingSpeed: 190,
      chargingTime: {
        dc_fast: '32 min (10-80%)',
        ac_home: '11h (0-100%)'
      }
    },
    dimensions: {
      length: 4996,
      width: 1977,
      height: 1623,
      wheelbase: 3094,
      weight: 2635,
      trunk: 793
    },
    features: {
      luxury: [
        'Nappaleder-Sitze',
        'Panorama-Glasdach',
        'Bose Premium Audio',
        'Massagefunktion Vordersitze',
        'Ambient Beleuchtung'
      ],
      technology: [
        '33" LED-Curved Display',
        'Super Cruise (Level 2+)',
        'Over-the-Air Updates',
        'Google Built-in',
        'Wireless Charging'
      ],
      safety: [
        'Euro NCAP 5 Sterne',
        'Automatic Emergency Braking',
        '360° Kamera-System',
        'Blind Spot Monitoring',
        'Night Vision'
      ],
      swissSpecific: [
        'Bergfahrassistent',
        'Schweizer Verkehrszeichen-Erkennung',
        'Winterfahrmodus',
        'Kantonsbasierte Navigation'
      ]
    },
    efficiency: {
      consumption: 20.3,
      co2Emissions: 0
    },
    swissMarket: {
      availability: 'Verfügbar ab Q2 2024',
      incentives: {
        federal: 0,
        cantonal: {
          'ZH': 5000,
          'GE': 3000,
          'VD': 3200,
          'BS': 4000,
          'ZG': 3000
        }
      },
      serviceLocations: 12,
      winterPerformance: 'excellent'
    }
  },
  {
    id: 'vistiq-premium',
    model: 'VISTIQ',
    variant: 'Premium Luxury',
    price: {
      base: 125900,
      currency: 'CHF',
      afterIncentives: 120900
    },
    performance: {
      range: 615,
      acceleration: 4.8,
      topSpeed: 200,
      power: 375,
      torque: 880
    },
    battery: {
      capacity: 102,
      chargingSpeed: 200,
      chargingTime: {
        dc_fast: '28 min (10-80%)',
        ac_home: '10h (0-100%)'
      }
    },
    dimensions: {
      length: 5202,
      width: 2014,
      height: 1773,
      wheelbase: 3152,
      weight: 2945,
      trunk: 1063
    },
    features: {
      luxury: [
        'Semi-Aniline Ledersitze',
        'Executive Rear Seats',
        'AKG Studio Reference Audio',
        '4-Zonen Klimaautomatik',
        'Kristall-Ambientebeleuchtung'
      ],
      technology: [
        '33" 9K LED Curved Display',
        'Ultra Cruise (Level 3)',
        'Augmented Reality HUD',
        'Google Built-in Premium',
        'Wireless Charging (vorne + hinten)'
      ],
      safety: [
        'Euro NCAP 5 Sterne',
        'Enhanced Automatic Braking',
        'Night Vision mit Pedestrian Detection',
        'Rear Cross Traffic Braking',
        'Intersection Collision Avoidance'
      ],
      swissSpecific: [
        'Schweizer Alpen-Fahrmodus',
        'Erweiterte Verkehrszeichen-Erkennung',
        'Adaptiver Winterfahrmodus',
        'Schweizer E-Tankstellen Integration'
      ]
    },
    efficiency: {
      consumption: 16.6,
      co2Emissions: 0
    },
    swissMarket: {
      availability: 'Verfügbar ab Q3 2024',
      incentives: {
        federal: 0,
        cantonal: {
          'ZH': 5000,
          'GE': 3000,
          'VD': 3200,
          'BS': 4000,
          'ZG': 3000
        }
      },
      serviceLocations: 15,
      winterPerformance: 'excellent'
    }
  }
];

const VehicleComparison: React.FC = () => {
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(['lyriq-luxury', 'vistiq-premium']);
  const [selectedCanton, setSelectedCanton] = useState<string>('ZH');
  const [comparisonMode, setComparisonMode] = useState<'overview' | 'detailed' | 'tco'>('overview');
  const [language, setLanguage] = useState<'de' | 'fr' | 'it'>('de');

  const vehicles = swissVehicleData.filter(v => selectedVehicles.includes(v.id));

  // Calculate Swiss market specific values
  const calculateSwissPrice = (vehicle: SwissVehicleSpec) => {
    const cantonalIncentive = vehicle.swissMarket.incentives.cantonal[selectedCanton] || 0;
    return vehicle.price.base - cantonalIncentive;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getWinnerBadge = (vehicles: SwissVehicleSpec[], category: keyof SwissVehicleSpec['performance']) => {
    if (vehicles.length !== 2) return null;
    
    const [v1, v2] = vehicles;
    const value1 = v1.performance[category];
    const value2 = v2.performance[category];
    
    if (category === 'acceleration') {
      return value1 < value2 ? v1.model : v2.model; // Lower is better for acceleration
    } else {
      return value1 > value2 ? v1.model : v2.model; // Higher is better for range, power, etc.
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          🚗 CADILLAC EV Fahrzeugvergleich
        </h1>
        <p className="text-lg text-gray-600">
          Vergleichen Sie LYRIQ und VISTIQ für den Schweizer Markt
        </p>
        
        {/* Canton Selection */}
        <div className="flex items-center justify-center gap-4">
          <MapPin className="h-5 w-5 text-gray-500" />
          <select 
            value={selectedCanton}
            onChange={(e) => setSelectedCanton(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ZH">Zürich</option>
            <option value="GE">Genève</option>
            <option value="VD">Vaud</option>
            <option value="BS">Basel-Stadt</option>
            <option value="ZG">Zug</option>
            <option value="BE">Bern</option>
          </select>
        </div>
      </div>

      {/* Comparison Mode Tabs */}
      <Tabs value={comparisonMode} onValueChange={(value) => setComparisonMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="detailed">Detailvergleich</TabsTrigger>
          <TabsTrigger value="tco">TCO Analyse</TabsTrigger>
        </TabsList>

        {/* Overview Comparison */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="relative overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">
                      CADILLAC {vehicle.model}
                    </CardTitle>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {vehicle.variant}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(calculateSwissPrice(vehicle))}
                    </div>
                    <div className="text-sm text-gray-500">
                      Nach kantonalem Rabatt in {selectedCanton}
                    </div>
                    {vehicle.swissMarket.incentives.cantonal[selectedCanton] && (
                      <Badge variant="secondary" className="text-xs">
                        -{formatCurrency(vehicle.swissMarket.incentives.cantonal[selectedCanton])} Rabatt
                      </Badge>
                    )}
                  </div>

                  {/* Key Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <Battery className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Reichweite</span>
                        {getWinnerBadge(vehicles, 'range') === vehicle.model && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-xl font-bold">{vehicle.performance.range} km</div>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">0-100 km/h</span>
                        {getWinnerBadge(vehicles, 'acceleration') === vehicle.model && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-xl font-bold">{vehicle.performance.acceleration}s</div>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <Gauge className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Leistung</span>
                        {getWinnerBadge(vehicles, 'power') === vehicle.model && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-xl font-bold">{vehicle.performance.power} kW</div>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Laden</span>
                      </div>
                      <div className="text-xl font-bold">{vehicle.battery.chargingTime.dc_fast}</div>
                    </div>
                  </div>

                  {/* Swiss Market Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">🇨🇭 Schweizer Markt Features</h4>
                    <div className="grid gap-2">
                      {vehicle.features.swissSpecific.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">
                      {vehicle.swissMarket.availability}
                    </div>
                    <div className="text-xs text-gray-500">
                      {vehicle.swissMarket.serviceLocations} Service-Standorte in der Schweiz
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Comparison Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Vergleichsübersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <h4 className="font-semibold">Bester Preis</h4>
                  <div className="text-lg font-bold text-green-600">
                    {vehicles.reduce((min, v) => 
                      calculateSwissPrice(v) < calculateSwissPrice(min) ? v : min
                    ).model}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(Math.min(...vehicles.map(v => calculateSwissPrice(v))))}
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h4 className="font-semibold">Beste Reichweite</h4>
                  <div className="text-lg font-bold text-blue-600">
                    {vehicles.reduce((max, v) => 
                      v.performance.range > max.performance.range ? v : max
                    ).model}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.max(...vehicles.map(v => v.performance.range))} km
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h4 className="font-semibold">Schnellste Beschleunigung</h4>
                  <div className="text-lg font-bold text-purple-600">
                    {vehicles.reduce((min, v) => 
                      v.performance.acceleration < min.performance.acceleration ? v : min
                    ).model}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.min(...vehicles.map(v => v.performance.acceleration))}s
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h4 className="font-semibold">Größter Kofferraum</h4>
                  <div className="text-lg font-bold text-orange-600">
                    {vehicles.reduce((max, v) => 
                      v.dimensions.trunk > max.dimensions.trunk ? v : max
                    ).model}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.max(...vehicles.map(v => v.dimensions.trunk))} L
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Comparison */}
        <TabsContent value="detailed" className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left font-semibold">Spezifikation</th>
                  {vehicles.map(vehicle => (
                    <th key={vehicle.id} className="border border-gray-300 p-3 text-center font-semibold">
                      CADILLAC {vehicle.model}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Performance Section */}
                <tr className="bg-blue-50">
                  <td colSpan={vehicles.length + 1} className="border border-gray-300 p-3 font-semibold text-blue-800">
                    ⚡ Performance
                  </td>
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Reichweite (WLTP)</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {vehicle.performance.range} km
                        {getWinnerBadge(vehicles, 'range') === vehicle.model && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Beschleunigung 0-100 km/h</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {vehicle.performance.acceleration}s
                        {getWinnerBadge(vehicles, 'acceleration') === vehicle.model && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Höchstgeschwindigkeit</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      {vehicle.performance.topSpeed} km/h
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Systemleistung</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {vehicle.performance.power} kW
                        {getWinnerBadge(vehicles, 'power') === vehicle.model && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Battery & Charging Section */}
                <tr className="bg-green-50">
                  <td colSpan={vehicles.length + 1} className="border border-gray-300 p-3 font-semibold text-green-800">
                    🔋 Batterie & Laden
                  </td>
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Batteriekapazität</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      {vehicle.battery.capacity} kWh
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">DC-Ladeleistung (max)</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      {vehicle.battery.chargingSpeed} kW
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Ladezeit 10-80% (DC)</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      {vehicle.battery.chargingTime.dc_fast}
                    </td>
                  ))}
                </tr>

                {/* Dimensions Section */}
                <tr className="bg-purple-50">
                  <td colSpan={vehicles.length + 1} className="border border-gray-300 p-3 font-semibold text-purple-800">
                    📏 Abmessungen
                  </td>
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Länge x Breite x Höhe</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      {vehicle.dimensions.length} x {vehicle.dimensions.width} x {vehicle.dimensions.height} mm
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Kofferraumvolumen</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      {vehicle.dimensions.trunk} L
                    </td>
                  ))}
                </tr>

                {/* Swiss Market Section */}
                <tr className="bg-red-50">
                  <td colSpan={vehicles.length + 1} className="border border-gray-300 p-3 font-semibold text-red-800">
                    🇨🇭 Schweizer Markt
                  </td>
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Preis {selectedCanton} (nach Rabatt)</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center font-semibold text-green-600">
                      {formatCurrency(calculateSwissPrice(vehicle))}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Winterperformance</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      <Badge variant={vehicle.swissMarket.winterPerformance === 'excellent' ? 'default' : 'secondary'}>
                        {vehicle.swissMarket.winterPerformance}
                      </Badge>
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Service-Standorte CH</td>
                  {vehicles.map(vehicle => (
                    <td key={vehicle.id} className="border border-gray-300 p-3 text-center">
                      {vehicle.swissMarket.serviceLocations}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TCO Analysis */}
        <TabsContent value="tco" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Total Cost of Ownership (5 Jahre)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vehicles.map(vehicle => {
                  const purchasePrice = calculateSwissPrice(vehicle);
                  const insuranceYearly = purchasePrice * 0.015; // 1.5% of purchase price
                  const maintenanceYearly = 800; // CHF per year
                  const electricityCost = (vehicle.efficiency.consumption * 15000 * 0.25) / 100; // 15k km/year, 0.25 CHF/kWh
                  const depreciation = purchasePrice * 0.6; // 60% over 5 years
                  
                  const totalTco = purchasePrice + (insuranceYearly * 5) + (maintenanceYearly * 5) + (electricityCost * 5);
                  
                  return (
                    <Card key={vehicle.id} className="space-y-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">CADILLAC {vehicle.model}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalTco)}
                          </div>
                          <div className="text-sm text-gray-500">Gesamtkosten über 5 Jahre</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Anschaffungspreis:</span>
                            <span className="font-medium">{formatCurrency(purchasePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Versicherung (5J):</span>
                            <span className="font-medium">{formatCurrency(insuranceYearly * 5)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wartung (5J):</span>
                            <span className="font-medium">{formatCurrency(maintenanceYearly * 5)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Stromkosten (5J):</span>
                            <span className="font-medium">{formatCurrency(electricityCost * 5)}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between font-bold">
                            <span>Monatliche Kosten:</span>
                            <span>{formatCurrency(totalTco / 60)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          PDF herunterladen
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Vergleich teilen
        </Button>
        <Button className="flex items-center gap-2">
          <Car className="h-4 w-4" />
          Probefahrt buchen
        </Button>
        <Button variant="secondary" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Detaillierte TCO-Berechnung
        </Button>
      </div>
    </div>
  );
};

export default VehicleComparison;