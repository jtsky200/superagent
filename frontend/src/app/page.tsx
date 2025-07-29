'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';

// Mock data for dashboard
const dashboardStats = [
  {
    title: 'Gesamtkunden',
    value: 1247,
    change: +12.5,
    changeType: 'increase' as const,
    description: 'Aktive Kunden im System'
  },
  {
    title: 'Fahrzeugkonfigurationen',
    value: 89,
    change: +8.2,
    changeType: 'increase' as const,
    description: 'Diesen Monat erstellt'
  },
  {
    title: 'TCO-Berechnungen',
    value: 156,
    change: -2.1,
    changeType: 'decrease' as const,
    description: 'Letzte 30 Tage'
  },
  {
    title: 'Durchschnittlicher TCO',
    value: 'CHF 89,500',
    change: +5.8,
    changeType: 'increase' as const,
    description: 'Pro Fahrzeug über 5 Jahre'
  }
];

const recentCustomers = [
  {
    id: '1',
    name: 'Hans Müller',
    email: 'hans.mueller@email.ch',
    type: 'private',
    canton: 'ZH',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'TechCorp AG',
    email: 'info@techcorp.ch',
    type: 'business',
    canton: 'GE',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    name: 'Maria Schmidt',
    email: 'maria.schmidt@email.ch',
    type: 'private',
    canton: 'BE',
    createdAt: '2024-01-13'
  }
];

const popularVehicles = [
  {
    model: 'CADILLAC LYRIQ Luxury',
    configurations: 45,
    avgPrice: 89900,
    trend: 'up'
  },
  {
    model: 'CADILLAC LYRIQ Premium',
    configurations: 32,
    avgPrice: 96900,
    trend: 'up'
  },
  {
    model: 'CADILLAC OPTIQ',
    configurations: 28,
    avgPrice: 72900,
    trend: 'stable'
  }
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Dashboard</h1>
            <p className="text-primary-600 mt-1">
              Überblick über Ihr CADILLAC EV Customer Intelligence System
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/customers/new">
              <Button>
                + Neuer Kunde
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary-600">
                  {stat.title}
                </CardTitle>
                <div className="h-4 w-4 bg-primary-400 rounded-sm"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary-900">
                  {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                </div>
                <div className="flex items-center space-x-1 text-xs text-primary-600">
                  <span className={stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                    {stat.changeType === 'increase' ? '↑' : '↓'} {Math.abs(stat.change)}%
                  </span>
                  <span>vs. letzter Monat</span>
                </div>
                <p className="text-xs text-primary-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent customers */}
          <Card>
            <CardHeader>
              <CardTitle>Neueste Kunden</CardTitle>
              <CardDescription>
                Zuletzt hinzugefügte Kunden im System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-900">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-900">
                          {customer.name}
                        </p>
                        <p className="text-xs text-primary-500">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={customer.type === 'business' ? 'default' : 'secondary'}>
                        {customer.type === 'business' ? 'Unternehmen' : 'Privat'}
                      </Badge>
                      <Badge variant="outline">
                        {customer.canton}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-primary-200">
                <Link href="/customers">
                  <Button variant="ghost" className="w-full">
                    Alle Kunden anzeigen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Popular vehicles */}
          <Card>
            <CardHeader>
              <CardTitle>Beliebte Fahrzeuge</CardTitle>
              <CardDescription>
                Meistgewählte CADILLAC EV Modelle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularVehicles.map((vehicle, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-900">
                        {vehicle.model}
                      </p>
                      <p className="text-xs text-primary-500">
                        {vehicle.configurations} Konfigurationen
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary-900">
                        {formatCurrency(vehicle.avgPrice)}
                      </p>
                      <div className="flex items-center justify-end space-x-1">
                        <span className="text-xs text-primary-500">
                          {vehicle.trend === 'up' ? '↑ Steigend' : '→ Stabil'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-primary-200">
                <Link href="/vehicles">
                  <Button variant="ghost" className="w-full">
                    Alle Fahrzeuge anzeigen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellaktionen</CardTitle>
            <CardDescription>
              Häufig verwendete Funktionen für einen schnellen Zugriff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/customers/new">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <div className="w-6 h-6 bg-primary-600 rounded-sm"></div>
                  <span>Neuer Kunde</span>
                </Button>
              </Link>
              <Link href="/tco">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <div className="w-6 h-6 bg-primary-600 rounded-sm"></div>
                  <span>TCO berechnen</span>
                </Button>
              </Link>
              <Link href="/vehicles/configure">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <div className="w-6 h-6 bg-primary-600 rounded-sm"></div>
                  <span>Fahrzeug konfigurieren</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

