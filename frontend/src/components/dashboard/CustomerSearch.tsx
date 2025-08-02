'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import React, { useState } from 'react';

interface SearchOption {
  id: string;
  label: string;
  checked: boolean;
  category: string;
}

export const CustomerSearch: React.FC = () => {
  const [searchType, setSearchType] = useState('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [internationalMatch, setInternationalMatch] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOption[]>([
    { id: 'handelsregister', label: 'Handelsregister (Schweiz)', checked: true, category: 'business' },
    { id: 'zek', label: 'ZEK / CRIF (Finanzstatus)', checked: true, category: 'financial' },
    { id: 'social', label: 'Soziale Netzwerke', checked: true, category: 'social' },
    { id: 'signature', label: 'Zeichnungsberechtigungen', checked: true, category: 'business' },
    { id: 'debt', label: 'Betreibungsauszug', checked: true, category: 'financial' },
    { id: 'property', label: 'Immobilienbesitz', checked: false, category: 'property' }
  ]);

  const handleOptionToggle = (id: string) => {
    setSearchOptions(prev => 
      prev.map(option => 
        option.id === id ? { ...option, checked: !option.checked } : option
      )
    );
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Searching with:', {
      searchType,
      searchQuery,
      internationalMatch,
      searchOptions: searchOptions.filter(opt => opt.checked)
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">🔍</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Kundenrecherche</h3>
            <p className="text-sm text-gray-600">Intelligente Suche mit AI-gestützter Analyse</p>
          </div>
        </div>

        {/* Search Form */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="searchType" className="block text-sm font-semibold text-gray-700 mb-2">
                Suchtyp
              </label>
              <select 
                id="searchType" 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="email">E-Mail</option>
                <option value="phone">Telefonnummer</option>
                <option value="name">Name</option>
                <option value="company">Unternehmen</option>
                <option value="uid">UID-Nummer</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="searchQuery" className="block text-sm font-semibold text-gray-700 mb-2">
                Suchbegriff
              </label>
              <Input
                type="text"
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="z.B. josegoncalves11@hotmail.com"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">🔍</span>
              Intelligente Suche starten
            </Button>
            
            <div className="flex items-center space-x-3">
              <label htmlFor="internationalMatch" className="text-sm font-medium text-gray-700">
                Internationaler Abgleich
              </label>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  id="internationalMatch"
                  type="checkbox" 
                  checked={internationalMatch}
                  onChange={(e) => setInternationalMatch(e.target.checked)}
                  className="sr-only peer"
                  aria-label="Internationaler Abgleich aktivieren"
                  title="Aktiviere internationalen Datenabgleich"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Options */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Erweiterte Suchoptionen</h4>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {searchOptions.filter(opt => opt.checked).length} aktiv
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchOptions.map((option) => (
              <label 
                key={option.id}
                className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <input 
                  type="checkbox" 
                  checked={option.checked}
                  onChange={() => handleOptionToggle(option.id)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 