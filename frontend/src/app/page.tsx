'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function Dashboard() {
  return (
         <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">CADILLAC EV</h1>
            <span className="text-xl font-light">|</span>
            <h2 className="text-xl">Customer Intelligence System</h2>
          </div>
          <div className="flex items-center space-x-6">
            <Button variant="outline" className="flex items-center space-x-2">
              <span>?</span>
              <span>Hilfe</span>
            </Button>
            <div className="relative">
              <Button variant="outline" className="flex items-center space-x-2">
                <span>👤</span>
                <span>Admin</span>
                <span>▼</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="border-b border-gray-300 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <a href="#" className="px-6 py-4 font-medium text-gray-900 border-b-2 border-gray-900">Dashboard</a>
            <a href="#" className="px-6 py-4 font-medium text-gray-600 hover:text-gray-900">Kundensuche</a>
            <a href="#" className="px-6 py-4 font-medium text-gray-600 hover:text-gray-900">Fahrzeugmodelle</a>
            <a href="#" className="px-6 py-4 font-medium text-gray-600 hover:text-gray-900">TCO-Kalkulator</a>
            <a href="#" className="px-6 py-4 font-medium text-gray-600 hover:text-gray-900">Finanzierung</a>
            <a href="#" className="px-6 py-4 font-medium text-gray-600 hover:text-gray-900">Analysen</a>
            <a href="#" className="px-6 py-4 font-medium text-gray-600 hover:text-gray-900">Einstellungen</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">Kundenrecherche</h3>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <label htmlFor="searchType" className="block text-sm font-medium text-gray-700 mb-1">Suchtyp</label>
                  <select id="searchType" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500">
                    <option value="email">E-Mail</option>
                    <option value="phone">Telefonnummer</option>
                    <option value="name">Name</option>
                    <option value="company">Unternehmen</option>
                    <option value="uid">UID-Nummer</option>
                  </select>
                </div>
                <div className="flex-grow">
                  <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">Suchbegriff</label>
                  <Input
                    type="text"
                    id="searchQuery"
                    placeholder="z.B. josegoncalves11@hotmail.com"
                    className="w-full"
                  />
                </div>
                <div className="self-end">
                  <Button className="flex items-center space-x-2">
                    <span>🔍</span>
                    <span>Suchen</span>
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Erweiterte Suchoptionen</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Internationaler Abgleich</span>
                                         <label className="relative inline-flex items-center cursor-pointer">
                       <input type="checkbox" className="sr-only peer" aria-label="Internationaler Abgleich aktivieren" title="Internationaler Abgleich aktivieren" />
                       <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                     </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                    <span>Handelsregister (Schweiz)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                    <span>ZEK / CRIF (Finanzstatus)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                    <span>Soziale Netzwerke</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                    <span>Zeichnungsberechtigungen</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                    <span>Betreibungsauszug</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="h-5 w-5" />
                    <span>Immobilienbesitz</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sample Customer Profile */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold">Kundenprofil</h3>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <span>🖨️</span>
                    <span>Drucken</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <span>📤</span>
                    <span>Teilen</span>
                  </Button>
                  <Button size="sm" className="flex items-center space-x-1">
                    <span>💾</span>
                    <span>Speichern</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <Card className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold">Persönliche Daten</h4>
                    <Badge className="bg-gray-800 text-white">Verifiziert</Badge>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <p className="font-medium">Michael Müller</p>
                        <p className="text-sm text-gray-600">Privatperson</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">E-Mail</p>
                        <p className="text-sm">michael.mueller@example.ch</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Telefon</p>
                        <p className="text-sm">+41 78 123 45 67</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Adresse</p>
                        <p className="text-sm">Bahnhofstrasse 42</p>
                        <p className="text-sm">8001 Zürich</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Geburtsdatum</p>
                        <p className="text-sm">15.05.1978</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Financial Info */}
                <Card className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold">Finanzdaten</h4>
                    <Badge className="bg-gray-800 text-white">ZEK / CRIF</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm">Bonitätsbewertung</p>
                        <p className="text-sm font-medium">A+</p>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div className="bg-gray-800 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Einkommen</p>
                                             <p className="text-sm">CHF 145&apos;000 / Jahr</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Bestehende Verpflichtungen</p>
                                             <p className="text-sm">Hypothek: CHF 650&apos;000</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Kredit-Leasing-Limite (geschätzt)</p>
                                             <p className="text-sm">Bis CHF 2&apos;500 / Monat</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Kredithistorie</p>
                      <p className="text-sm">Keine negativen Einträge</p>
                    </div>
                  </div>
                </Card>

                {/* Interest & History */}
                <Card className="p-4">
                  <h4 className="font-bold mb-4">Interessen & Historie</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500">Interessiert an Modellen</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary">CADILLAC LYRIQ</Badge>
                        <Badge variant="secondary">CADILLAC OPTIQ</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Besuche</p>
                      <div className="mt-1 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Website-Besuch (LYRIQ)</span>
                          <span>Vor 3 Tagen</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Showroom Zürich</span>
                          <span>12.04.2023</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Aktuelle Fahrzeuge</p>
                      <div className="mt-1 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tesla Model S</span>
                          <span>Seit 2020</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Mercedes GLE</span>
                          <span>2016-2020</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Besondere Interessen</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary">Technologie</Badge>
                        <Badge variant="secondary">Nachhaltigkeit</Badge>
                        <Badge variant="secondary">Premium</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CADILLAC EV Models */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">CADILLAC EV Modelle (Schweiz)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* LYRIQ Model */}
                <Card className="p-4 hover:shadow-lg transition-all">
                  <div className="flex justify-between mb-4">
                    <h4 className="font-bold">CADILLAC LYRIQ</h4>
                    <Badge className="bg-gray-800 text-white">Verfügbar</Badge>
                  </div>
                  
                  <div className="h-48 bg-gray-200 flex items-center justify-center mb-4 rounded">
                    <span className="text-6xl text-gray-500">🚗</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Reichweite</p>
                        <p className="text-sm">Bis zu 500 km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ladedauer (DC)</p>
                        <p className="text-sm">30 Min. (10-80%)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Leistung</p>
                        <p className="text-sm">340 kW (462 PS)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">0-100 km/h</p>
                        <p className="text-sm">4.9 Sekunden</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-xs text-gray-500">Preis ab</p>
                                             <p className="text-lg font-bold">CHF 89&apos;900</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button className="flex-1">TCO Berechnen</Button>
                      <Button variant="outline" className="flex-1">Details</Button>
                    </div>
                  </div>
                </Card>
                
                {/* CELESTIQ Model */}
                <Card className="p-4 hover:shadow-lg transition-all">
                  <div className="flex justify-between mb-4">
                    <h4 className="font-bold">CADILLAC CELESTIQ</h4>
                    <Badge className="bg-gray-800 text-white">Limitiert</Badge>
                  </div>
                  
                  <div className="h-48 bg-gray-200 flex items-center justify-center mb-4 rounded">
                    <span className="text-6xl text-gray-500">🚗</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Reichweite</p>
                        <p className="text-sm">Bis zu 480 km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ladedauer (DC)</p>
                        <p className="text-sm">35 Min. (10-80%)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Leistung</p>
                        <p className="text-sm">447 kW (608 PS)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">0-100 km/h</p>
                        <p className="text-sm">3.8 Sekunden</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-xs text-gray-500">Preis ab</p>
                                             <p className="text-lg font-bold">CHF 350&apos;000</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button className="flex-1">TCO Berechnen</Button>
                      <Button variant="outline" className="flex-1">Details</Button>
                    </div>
                  </div>
                </Card>
                
                {/* OPTIQ Model */}
                <Card className="p-4 hover:shadow-lg transition-all">
                  <div className="flex justify-between mb-4">
                    <h4 className="font-bold">CADILLAC OPTIQ</h4>
                    <Badge className="bg-gray-800 text-white">Vorbestellbar</Badge>
                  </div>
                  
                  <div className="h-48 bg-gray-200 flex items-center justify-center mb-4 rounded">
                    <span className="text-6xl text-gray-500">🚗</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Reichweite</p>
                        <p className="text-sm">Bis zu 450 km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ladedauer (DC)</p>
                        <p className="text-sm">28 Min. (10-80%)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Leistung</p>
                        <p className="text-sm">220 kW (299 PS)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">0-100 km/h</p>
                        <p className="text-sm">6.1 Sekunden</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-xs text-gray-500">Preis ab</p>
                                             <p className="text-lg font-bold">CHF 67&apos;900</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button className="flex-1">TCO Berechnen</Button>
                      <Button variant="outline" className="flex-1">Details</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* TCO Calculator */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold">TCO Kalkulator (CADILLAC LYRIQ)</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <span>📥</span>
                    <span>Exportieren</span>
                  </Button>
                  <Button size="sm" className="flex items-center space-x-1">
                    <span>📤</span>
                    <span>Mit Kunde teilen</span>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* TCO Settings */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4">TCO Parameter</h4>
                  
                  <div className="space-y-4">
                                         <div>
                       <label className="block text-sm mb-1">Fahrzeugmodell</label>
                       <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500" aria-label="Fahrzeugmodell auswählen" title="Fahrzeugmodell auswählen">
                         <option>CADILLAC LYRIQ Luxury</option>
                         <option>CADILLAC LYRIQ Sport</option>
                         <option>CADILLAC LYRIQ Premium</option>
                       </select>
                     </div>
                     
                     <div>
                       <label className="block text-sm mb-1">Besitzdauer</label>
                       <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500" aria-label="Besitzdauer auswählen" title="Besitzdauer auswählen">
                         <option>4 Jahre</option>
                         <option>5 Jahre</option>
                         <option>6 Jahre</option>
                       </select>
                     </div>
                    
                    <div>
                      <label className="block text-sm mb-1">Jährliche Kilometerleistung</label>
                      <Input type="number" defaultValue={15000} className="w-full" />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1">Stromkosten pro kWh</label>
                      <div className="flex">
                        <Input type="number" defaultValue={0.22} step={0.01} className="w-full rounded-r-none" />
                        <span className="bg-gray-200 px-3 py-2 rounded-r border-t border-r border-b border-gray-300">CHF</span>
                      </div>
                    </div>
                    
                    <Button className="w-full">Berechnung aktualisieren</Button>
                  </div>
                </Card>
                
                {/* TCO Results */}
                <div className="lg:col-span-2">
                  <Card className="p-4">
                    <h4 className="font-medium mb-4">TCO Analyse</h4>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="p-3 bg-gray-100 rounded">
                        <p className="text-xs text-gray-500">Anschaffung</p>
                                                 <p className="text-lg font-medium">CHF 89&apos;900</p>
                      </div>
                      <div className="p-3 bg-gray-100 rounded">
                        <p className="text-xs text-gray-500">Energiekosten</p>
                                                 <p className="text-lg font-medium">CHF 6&apos;600</p>
                         <p className="text-xs text-gray-500">für 4 Jahre</p>
                      </div>
                      <div className="p-3 bg-gray-100 rounded">
                        <p className="text-xs text-gray-500">Versicherung</p>
                                                 <p className="text-lg font-medium">CHF 7&apos;200</p>
                         <p className="text-xs text-gray-500">für 4 Jahre</p>
                      </div>
                      <div className="p-3 bg-gray-100 rounded">
                        <p className="text-xs text-gray-500">Wartung</p>
                                                 <p className="text-lg font-medium">CHF 2&apos;400</p>
                         <p className="text-xs text-gray-500">für 4 Jahre</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-100 rounded">
                      <div className="flex justify-between mb-2">
                        <h5 className="font-medium">Gesamtkosten (TCO) über 4 Jahre</h5>
                                                 <p className="font-bold">CHF 106&apos;100</p>
                      </div>
                      <div className="flex justify-between mb-2">
                        <h5 className="font-medium">Monatliche Kosten</h5>
                                                 <p className="font-bold">CHF 2&apos;211</p>
                      </div>
                      <div className="flex justify-between">
                        <h5 className="font-medium">Kosten pro km</h5>
                        <p className="font-bold">CHF 0.44</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* AI Sales Strategy */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">KI-gestützte Verkaufsstrategie</h3>
              
              <div className="bg-gray-100 p-4 rounded mb-6">
                <div className="flex justify-between mb-4">
                  <h4 className="font-medium">Kundenempfehlungen</h4>
                  <Badge className="bg-gray-800 text-white">Auf Kundendaten basierend</Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg mt-1">💡</span>
                    <div>
                      <h5 className="font-medium">Primäre Empfehlung: CADILLAC LYRIQ Luxury</h5>
                      <p className="text-sm text-gray-600">Basierend auf dem bisherigen Fahrzeugbesitz (Tesla Model S) und den finanziellen Möglichkeiten ist der LYRIQ eine optimale Wahl.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-lg mt-1">🏷️</span>
                    <div>
                      <h5 className="font-medium">Finanzierungsvorschlag</h5>
                      <p className="text-sm text-gray-600">Der Kunde hat eine starke Bonität (A+) und könnte von einem Leasing mit niedrigem Zinssatz profitieren, speziell bei einer Laufzeit von 48 Monaten.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-lg mt-1">📈</span>
                    <div>
                      <h5 className="font-medium">Upselling-Potential</h5>
                      <p className="text-sm text-gray-600">Höherwertige Ausstattungspakete mit Schwerpunkt auf Technologie und Konnektivität könnten für diesen Kunden interessant sein.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Verkaufsargumente</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="min-w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white">
                        <span>⚡</span>
                      </div>
                      <div>
                        <h5 className="font-medium">Nachhaltige Mobilität</h5>
                        <p className="text-sm text-gray-600">Vollelektrisch mit Schweizer Wasserkraft geladen - 97% CO2-Reduktion im Vergleich zum Verbrenner.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="min-w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white">
                        <span>💰</span>
                      </div>
                      <div>
                        <h5 className="font-medium">Kosteneffizienz</h5>
                        <p className="text-sm text-gray-600">Befreit von Strassenverkehrsabgaben und deutlich niedrigere Energiekosten im Vergleich zu Benzin.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="min-w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white">
                        <span>🔧</span>
                      </div>
                      <div>
                        <h5 className="font-medium">Wartungsarm</h5>
                        <p className="text-sm text-gray-600">Weniger bewegliche Teile bedeuten weniger Verschleiss und niedrigere Servicekosten.</p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Nächste Schritte</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="min-w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white">
                        <span>1</span>
                      </div>
                      <div>
                        <h5 className="font-medium">Probefahrt anbieten</h5>
                        <p className="text-sm text-gray-600">CADILLAC LYRIQ für eine Wochenendprobefahrt vorschlagen.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="min-w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white">
                        <span>2</span>
                      </div>
                      <div>
                        <h5 className="font-medium">Persönliches TCO-Dokument zusenden</h5>
                        <p className="text-sm text-gray-600">Angepasste TCO-Berechnung per E-Mail mit Vergleich zu seinem Tesla Model S.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="min-w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white">
                        <span>3</span>
                      </div>
                      <div>
                        <h5 className="font-medium">Ladeinfrastruktur besprechen</h5>
                        <p className="text-sm text-gray-600">Wallbox-Installation anbieten und Details zur Förderung in seiner Gemeinde vorstellen.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button className="w-full flex items-center justify-center space-x-2">
                      <span>📅</span>
                      <span>Termin vereinbaren</span>
                    </Button>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold mb-4">CADILLAC EV - Customer Intelligence System</h4>
              <p className="text-sm text-gray-600">Ein umfassendes Tool für den Verkauf von CADILLAC Elektrofahrzeugen in der Schweiz. Entwickelt für optimale Kundenberatung und datengestützte Verkaufsstrategien.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Datenschutzrichtlinie</a></li>
                <li><a href="#" className="hover:underline">Nutzungsbedingungen</a></li>
                <li><a href="#" className="hover:underline">Impressum</a></li>
                <li><a href="#" className="hover:underline">Haftungsausschluss</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>📍 Bahnhofstrasse 123, 8001 Zürich</li>
                <li>📞 +41 44 123 45 67</li>
                <li>📧 info@cadillac-schweiz.ch</li>
                <li>🌐 www.cadillac-schweiz.ch</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 mt-6 pt-6 text-center text-sm text-gray-600">
            <p>&copy; 2023 CADILLAC Schweiz. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

