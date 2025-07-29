'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

// Mock customer data
const mockCustomers = [
  {
    id: '1',
    firstName: 'Hans',
    lastName: 'Müller',
    email: 'hans.mueller@email.ch',
    phone: '+41 79 123 45 67',
    city: 'Zürich',
    canton: 'ZH',
    customerType: 'private' as const,
    createdAt: '2024-01-15T10:30:00Z',
    company: null
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Schmidt',
    email: 'maria.schmidt@email.ch',
    phone: '+41 78 987 65 43',
    city: 'Bern',
    canton: 'BE',
    customerType: 'private' as const,
    createdAt: '2024-01-14T14:20:00Z',
    company: null
  },
  {
    id: '3',
    firstName: 'Peter',
    lastName: 'Weber',
    email: 'p.weber@techcorp.ch',
    phone: '+41 44 123 45 67',
    city: 'Genf',
    canton: 'GE',
    customerType: 'business' as const,
    createdAt: '2024-01-13T09:15:00Z',
    company: {
      companyName: 'TechCorp AG',
      uidNumber: 'CHE-123.456.789',
      legalForm: 'AG'
    }
  },
  {
    id: '4',
    firstName: 'Anna',
    lastName: 'Fischer',
    email: 'anna.fischer@email.ch',
    phone: '+41 76 555 44 33',
    city: 'Basel',
    canton: 'BS',
    customerType: 'private' as const,
    createdAt: '2024-01-12T16:45:00Z',
    company: null
  },
  {
    id: '5',
    firstName: 'Thomas',
    lastName: 'Meier',
    email: 't.meier@consulting.ch',
    phone: '+41 31 987 65 43',
    city: 'Luzern',
    canton: 'LU',
    customerType: 'business' as const,
    createdAt: '2024-01-11T11:30:00Z',
    company: {
      companyName: 'Meier Consulting GmbH',
      uidNumber: 'CHE-987.654.321',
      legalForm: 'GmbH'
    }
  }
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'private' | 'business'>('all');
  const [customers] = useState(mockCustomers);

  // Filter customers based on search and type
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.company?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || customer.customerType === filterType;
    
    return matchesSearch && matchesType;
  });

  const getCustomerDisplayName = (customer: typeof mockCustomers[0]) => {
    if (customer.customerType === 'business' && customer.company) {
      return customer.company.companyName;
    }
    return `${customer.firstName} ${customer.lastName}`;
  };

  const getCustomerSubtitle = (customer: typeof mockCustomers[0]) => {
    if (customer.customerType === 'business' && customer.company) {
      return `${customer.firstName} ${customer.lastName} • ${customer.company.legalForm}`;
    }
    return customer.email;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Kunden</h1>
            <p className="text-primary-600 mt-1">
              Verwalten Sie Ihre CADILLAC EV Kunden
            </p>
          </div>
          <Link href="/customers/new">
            <Button>
              + Neuer Kunde
            </Button>
          </Link>
        </div>

        {/* Filters and search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400">🔍</span>
                  <Input
                    placeholder="Kunden suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-primary-400">🔽</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-primary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value="all">Alle Kunden</option>
                  <option value="private">Privatkunden</option>
                  <option value="business">Geschäftskunden</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamtkunden</CardTitle>
              <span className="text-primary-400">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-primary-500">
                Aktive Kunden im System
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Privatkunden</CardTitle>
              <span className="text-primary-400">👤</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter(c => c.customerType === 'private').length}
              </div>
              <p className="text-xs text-primary-500">
                Privatpersonen
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Geschäftskunden</CardTitle>
              <span className="text-primary-400">🏢</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter(c => c.customerType === 'business').length}
              </div>
              <p className="text-xs text-primary-500">
                Unternehmen
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Customer list */}
        <Card>
          <CardHeader>
            <CardTitle>Kundenliste</CardTitle>
            <CardDescription>
              {filteredCustomers.length} von {customers.length} Kunden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">
                        {customer.customerType === 'business' ? '🏢' : '👤'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-primary-900">
                        {getCustomerDisplayName(customer)}
                      </h3>
                      <p className="text-sm text-primary-500">
                        {getCustomerSubtitle(customer)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={customer.customerType === 'business' ? 'default' : 'secondary'}>
                          {customer.customerType === 'business' ? 'Unternehmen' : 'Privat'}
                        </Badge>
                        <Badge variant="outline">
                          {customer.canton}
                        </Badge>
                        <span className="text-xs text-primary-400">
                          {customer.city}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-primary-500">
                      {formatDate(new Date(customer.createdAt))}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm">
                          👁️
                        </Button>
                      </Link>
                      <Link href={`/customers/${customer.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          ✏️
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl text-primary-300 mb-4">👥</div>
                  <h3 className="mt-2 text-sm font-medium text-primary-900">
                    Keine Kunden gefunden
                  </h3>
                  <p className="mt-1 text-sm text-primary-500">
                    {searchQuery ? 'Versuchen Sie eine andere Suche.' : 'Erstellen Sie Ihren ersten Kunden.'}
                  </p>
                  {!searchQuery && (
                    <div className="mt-6">
                      <Link href="/customers/new">
                        <Button>
                          + Neuer Kunde
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

