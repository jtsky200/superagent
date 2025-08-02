// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MapPin, Search, AlertTriangle } from 'lucide-react';

interface PostalValidationResult {
  success: boolean;
  valid: boolean;
  postal_code: string;
  localities?: {
    postal_code: string;
    locality: string;
    canton: string;
    district: string;
    commune: string;
  }[];
  error?: string;
  format_error?: boolean;
  warning?: string;
  source: string;
}

export function PostalCodeValidator() {
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PostalValidationResult | null>(null);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!postalCode) {
      setError('Please enter a postal code');
      return;
    }

    if (!/^\d{4}$/.test(postalCode)) {
      setError('Swiss postal codes must be exactly 4 digits');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/swiss-data/postal-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          postal_code: postalCode,
          city: city || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (response.status === 503) {
        setError(data.error || 'Swiss postal code validation service is currently unavailable. Please try again later.');
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      if (err.message.includes('503')) {
        setError('Swiss postal code validation service is currently unavailable. Please try again later.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to validate postal code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Swiss Postal Code Validator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal">Postal Code *</Label>
              <Input
                id="postal"
                placeholder="8001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                maxLength={4}
                pattern="\d{4}"
              />
              <p className="text-xs text-gray-500">Enter 4-digit Swiss postal code</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <Input
                id="city"
                placeholder="Zürich"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">For additional validation</p>
            </div>
          </div>

          <Button
            onClick={handleValidate}
            disabled={loading || !postalCode}
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Validating...' : 'Validate Postal Code'}
          </Button>

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <div className="text-red-800 font-medium">Service Unavailable</div>
              </div>
              <p className="text-red-700 mt-2 text-sm">{error}</p>
              <p className="text-red-600 mt-2 text-xs">
                <strong>Important:</strong> Cannot validate postal code without access to official Swiss postal database.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className={`border-l-4 ${result.valid ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.valid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              Validation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge 
                variant={result.valid ? 'default' : 'destructive'}
                className="text-sm"
              >
                {result.valid ? 'Valid' : 'Invalid'}
              </Badge>
              <Badge variant="outline">
                {result.source}
              </Badge>
              <span className="text-sm text-gray-600">
                Code: {result.postal_code}
              </span>
            </div>

            {result.warning && (
              <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-md text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {result.warning}
              </div>
            )}

            {result.error && !result.format_error && (
              <div className="p-3 border border-red-200 bg-red-50 rounded-md text-red-700">
                {result.error}
              </div>
            )}

            {result.localities && result.localities.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Found Localities:</h4>
                <div className="grid gap-3">
                  {result.localities.map((locality, index) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Locality:</span> {locality.locality}
                        </div>
                        <div>
                          <span className="font-medium">Canton:</span> {locality.canton}
                        </div>
                        <div>
                          <span className="font-medium">District:</span> {locality.district}
                        </div>
                        <div>
                          <span className="font-medium">Commune:</span> {locality.commune}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}