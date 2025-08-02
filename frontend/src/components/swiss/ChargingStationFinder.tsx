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
  Search, 
  MapPin, 
  Zap, 
  Clock, 
  CreditCard, 
  Wifi, 
  Car,
  Battery,
  Navigation,
  Phone,
  Filter
} from 'lucide-react';

interface ChargingPoint {
  type: string;
  power_kw: number;
  available: boolean;
  connector_id: string;
}

interface ChargingStation {
  id: string;
  name: string;
  address: string;
  canton: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  charging_points: ChargingPoint[];
  operator: string;
  pricing: string;
  amenities: string[];
  '24_7': boolean;
  payment_methods: string[];
  network: string;
  last_updated: string;
  distance_km?: number;
  status?: string;
}

interface ChargingStationResponse {
  success: boolean;
  charging_stations: ChargingStation[];
  total: number;
  filters_applied: {
    canton?: string;
    city?: string;
    charging_type?: string;
    power_min?: number;
    available_only?: boolean;
    radius_km?: number;
  };
  source: string;
  timestamp: string;
}

const SWISS_CANTONS = [
  'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 
  'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'
];

const CHARGING_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'fast', label: 'Fast Charging (≥50kW)' },
  { value: 'normal', label: 'Normal Charging (<50kW)' },
  { value: 'tesla', label: 'Tesla Supercharger' }
];

export function ChargingStationFinder() {
  const [canton, setCanton] = useState('');
  const [city, setCity] = useState('');
  const [chargingType, setChargingType] = useState('all');
  const [powerMin, setPowerMin] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [radius, setRadius] = useState('50');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ChargingStationResponse | null>(null);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      if (canton) params.append('canton', canton);
      if (city) params.append('city', city);
      if (chargingType && chargingType !== 'all') params.append('type', chargingType);
      if (powerMin) params.append('power_min', powerMin);
      if (availableOnly) params.append('available_only', 'true');
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        params.append('radius', radius);
      }

      const response = await fetch(`/api/swiss-data/charging-stations?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (response.status === 503) {
        setError(data.error || 'Charging station services are currently unavailable. Please try again later.');
        setResults(null);
      } else {
        setResults(data);
      }
    } catch (err) {
      if (err.message.includes('503')) {
        setError('Charging station services are currently unavailable. Please try again later.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to search charging stations');
      }
    } finally {
      setLoading(false);
    }
  };

  const getConnectorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ccs': return '🔌';
      case 'chademo': return '⚡';
      case 'type2': return '🔋';
      case 'tesla': return '🚗';
      default: return '⚡';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-3 h-3" />;
      case 'restaurant': return '🍽️';
      case 'shopping': return '🛍️';
      case 'toilets': return '🚻';
      case 'public_transport': return '🚇';
      default: return '📍';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            EV Charging Station Finder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="canton">Canton</Label>
              <Select value={canton} onValueChange={setCanton}>
                <SelectTrigger>
                  <SelectValue placeholder="Select canton" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cantons</SelectItem>
                  {SWISS_CANTONS.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Zürich"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Charging Type</Label>
              <Select value={chargingType} onValueChange={setChargingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHARGING_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            {userLocation && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Navigation className="w-4 h-4" />
                Location enabled
              </div>
            )}
          </div>

          {showFilters && (
            <Card className="border-dashed">
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="power">Min Power (kW)</Label>
                    <Input
                      id="power"
                      type="number"
                      placeholder="50"
                      value={powerMin}
                      onChange={(e) => setPowerMin(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="radius">Search Radius (km)</Label>
                    <Input
                      id="radius"
                      type="number"
                      placeholder="50"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      disabled={loading || !userLocation}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="available"
                      checked={availableOnly}
                      onCheckedChange={setAvailableOnly}
                    />
                    <Label htmlFor="available">Available only</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleSearch} disabled={loading} className="w-full">
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Searching...' : 'Find Charging Stations'}
          </Button>

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-red-600">⚠️</div>
                <div className="text-red-800 font-medium">Service Unavailable</div>
              </div>
              <p className="text-red-700 mt-2 text-sm">{error}</p>
              <p className="text-red-600 mt-2 text-xs">
                <strong>Important:</strong> Real-time charging station data is unavailable. Please check directly with charging network providers.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Found {results.total} Charging Stations
            </h3>
            <Badge variant="outline">{results.source}</Badge>
          </div>

          {results.warning && (
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-yellow-600">⚠️</div>
                <div className="text-yellow-800 font-medium">Limited Data Available</div>
              </div>
              <p className="text-yellow-700 mt-2 text-sm">{results.warning}</p>
            </div>
          )}

          {results.charging_stations.map((station, index) => (
            <Card key={station.id || index} className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Station Info */}
                  <div className="lg:col-span-2 space-y-3">
                    <div>
                      <h4 className="font-semibold text-lg">{station.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {station.address}
                        {station.distance_km && (
                          <Badge variant="outline" className="ml-2">
                            {station.distance_km} km
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge>{station.operator}</Badge>
                      <Badge variant="outline">{station.network}</Badge>
                      {station['24_7'] && (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          24/7
                        </Badge>
                      )}
                    </div>

                    {/* Charging Points */}
                    <div>
                      <Label className="text-sm font-medium">Charging Points</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {station.charging_points.map((point, idx) => (
                          <Badge
                            key={idx}
                            variant={point.available ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {getConnectorIcon(point.type)} {point.type} 
                            <Battery className="w-3 h-3 mx-1" />
                            {point.power_kw}kW
                            {!point.available && ' (Occupied)'}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    {station.amenities.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Amenities</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {station.amenities.map((amenity, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
                              {getAmenityIcon(amenity)}
                              {amenity.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing & Payment */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Pricing</Label>
                      <p className="text-sm text-gray-600">{station.pricing}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Payment Methods</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {station.payment_methods.map((method, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {method.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          if (station.coordinates.lat && station.coordinates.lng) {
                            window.open(
                              `https://maps.google.com/?q=${station.coordinates.lat},${station.coordinates.lng}`,
                              '_blank'
                            );
                          }
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Open in Maps
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: station.name,
                              text: `${station.name} - ${station.address}`,
                              url: window.location.href
                            });
                          }
                        }}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500">
                      Updated: {new Date(station.last_updated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}