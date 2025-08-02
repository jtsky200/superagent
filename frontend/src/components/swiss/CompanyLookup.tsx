// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Building, MapPin, Calendar, Info } from 'lucide-react';

interface Company {
  uid: string;
  name: string;
  legal_form: string;
  status: string;
  address: {
    street: string;
    postal_code: string;
    city: string;
    canton: string;
  };
  industry: string;
  founded_date: string;
  registration_date: string;
  last_updated: string;
  ehraid: string;
  language: string;
}

interface CompanyLookupResponse {
  success: boolean;
  companies: Company[];
  total_results: number;
  source: string;
  timestamp: string;
  query: {
    uid_number?: string;
    company_name?: string;
  };
  fallback?: boolean;
}

export function CompanyLookup() {
  const [uidNumber, setUidNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompanyLookupResponse | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!uidNumber && !companyName) {
      setError('Please enter either a UID number or company name');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/swiss-data/company-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid_number: uidNumber || undefined,
          company_name: companyName || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (response.status === 503) {
        setError(data.error || 'Swiss Federal Commercial Registry (ZEFIX) is currently unavailable. Please try again later.');
        setResults(null);
      } else {
        setResults(data);
      }
    } catch (err) {
      if (err.message.includes('503')) {
        setError('Swiss Federal Commercial Registry (ZEFIX) is currently unavailable. Please try again later.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to lookup company');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatUID = (uid: string) => {
    if (!uid.startsWith('CHE-')) return uid;
    const clean = uid.replace('CHE-', '');
    return `CHE-${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Swiss Company Lookup (ZEFIX)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="uid">UID Number</Label>
              <Input
                id="uid"
                placeholder="CHE-123.456.789"
                value={uidNumber}
                onChange={(e) => setUidNumber(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Company AG"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading || (!uidNumber && !companyName)}
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Searching...' : 'Search Company'}
          </Button>

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-red-600">⚠️</div>
                <div className="text-red-800 font-medium">Service Unavailable</div>
              </div>
              <p className="text-red-700 mt-2 text-sm">{error}</p>
              <p className="text-red-600 mt-2 text-xs">
                <strong>Important:</strong> No mock data is provided to prevent incorrect customer information.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Search Results ({results.total_results} found)
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={results.fallback ? 'secondary' : 'default'}>
                {results.source}
              </Badge>
              {results.fallback && (
                <Badge variant="outline">
                  <Info className="w-3 h-3 mr-1" />
                  Fallback Data
                </Badge>
              )}
            </div>
          </div>

          {results.companies.map((company, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-lg">{company.name}</h4>
                      <p className="text-sm text-gray-600">
                        UID: {formatUID(company.uid)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={company.status === 'active' ? 'default' : 'secondary'}
                      >
                        {company.status}
                      </Badge>
                      <Badge variant="outline">
                        {company.legal_form}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {company.address.street}, {company.address.postal_code} {company.address.city} ({company.address.canton})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Industry</Label>
                      <p className="text-sm text-gray-600">{company.industry}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <Label className="text-xs font-medium">Founded</Label>
                        <p className="text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {company.founded_date ? new Date(company.founded_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Language</Label>
                        <p className="text-gray-600">{company.language}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Last Updated</Label>
                      <p className="text-xs text-gray-500">
                        {new Date(company.last_updated).toLocaleString()}
                      </p>
                    </div>
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