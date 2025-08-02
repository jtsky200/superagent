'use client';

// 🔔 CADILLAC EV CIS - Notification Center
// Swiss market notification system with real-time updates

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing,
  Check, 
  X, 
  Users, 
  Car, 
  Euro, 
  Calendar,
  MapPin,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Mail as MarkAsUnread,
  Phone,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';

// Swiss market notification types
interface SwissNotification {
  id: string;
  type: 'new_customer' | 'new_lead' | 'test_drive_requested' | 'sale_completed' | 'tco_calculation_completed' | 'dsgvo_consent_required' | 'service_reminder' | 'system_maintenance';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  canton?: string;
  language: 'de' | 'fr' | 'it' | 'en';
  scheduledAt?: string;
  sentAt?: string;
  readAt?: string;
  metadata?: {
    entityType?: string;
    entityId?: string;
    vehicleModel?: string;
    customerName?: string;
    dealerLocation?: string;
    amount?: number;
    dsgvoReference?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  high_priority: number;
  urgent: number;
  failed: number;
  today: number;
}

// Swiss cantons for filtering
const SWISS_CANTONS = [
  { code: 'ZH', name: 'Zürich' },
  { code: 'BE', name: 'Bern' },
  { code: 'GE', name: 'Genève' },
  { code: 'VD', name: 'Vaud' },
  { code: 'BS', name: 'Basel-Stadt' },
  { code: 'ZG', name: 'Zug' },
  { code: 'AG', name: 'Aargau' },
  { code: 'TI', name: 'Ticino' }
];

const NotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'high_priority' | 'failed'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCanton, setSelectedCanton] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [notifications, setNotifications] = useState<SwissNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const wsRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load notifications and stats
  useEffect(() => {
    loadNotifications();
    loadStats();
    
    if (autoRefresh) {
      setupAutoRefresh();
      setupWebSocket();
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [activeTab, selectedType, selectedCanton, selectedLanguage, searchQuery, autoRefresh]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockNotifications: SwissNotification[] = [
        {
          id: '1',
          type: 'new_customer',
          title: 'Neuer Kunde registriert',
          message: 'Ein neuer Kunde hat sich für LYRIQ interessiert',
          priority: 'normal',
          status: 'delivered',
          channel: 'in_app',
          canton: 'ZH',
          language: 'de',
          metadata: {
            entityType: 'customer',
            entityId: 'cust-123',
            customerName: 'Max Mustermann',
            vehicleModel: 'LYRIQ',
            dealerLocation: 'Zürich'
          },
          createdAt: '2024-01-15T14:30:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          type: 'test_drive_requested',
          title: 'Probefahrt angefragt',
          message: 'Probefahrt für VISTIQ wurde angefragt',
          priority: 'high',
          status: 'read',
          channel: 'email',
          canton: 'GE',
          language: 'fr',
          metadata: {
            entityType: 'test_drive',
            entityId: 'td-456',
            customerName: 'Marie Dupont',
            vehicleModel: 'VISTIQ',
            dealerLocation: 'Genève'
          },
          readAt: '2024-01-15T15:45:00Z',
          createdAt: '2024-01-15T15:30:00Z',
          updatedAt: '2024-01-15T15:45:00Z'
        },
        {
          id: '3',
          type: 'sale_completed',
          title: 'Verkauf abgeschlossen',
          message: 'CADILLAC LYRIQ erfolgreich verkauft',
          priority: 'high',
          status: 'delivered',
          channel: 'in_app',
          canton: 'VD',
          language: 'fr',
          metadata: {
            entityType: 'sale',
            entityId: 'sale-789',
            customerName: 'Jean Martin',
            vehicleModel: 'LYRIQ',
            amount: 89900,
            dealerLocation: 'Lausanne'
          },
          createdAt: '2024-01-15T16:00:00Z',
          updatedAt: '2024-01-15T16:00:00Z'
        },
        {
          id: '4',
          type: 'dsgvo_consent_required',
          title: 'DSGVO-Zustimmung erforderlich',
          message: 'Kundeneinwilligung für Datenverarbeitung benötigt',
          priority: 'urgent',
          status: 'pending',
          channel: 'email',
          canton: 'BS',
          language: 'de',
          metadata: {
            entityType: 'customer',
            entityId: 'cust-321',
            customerName: 'Hans Weber',
            dsgvoReference: 'DSGVO-2024-001'
          },
          createdAt: '2024-01-15T16:15:00Z',
          updatedAt: '2024-01-15T16:15:00Z'
        },
        {
          id: '5',
          type: 'tco_calculation_completed',
          title: 'TCO-Berechnung abgeschlossen',
          message: 'TCO-Analyse für Kunde verfügbar',
          priority: 'normal',
          status: 'sent',
          channel: 'email',
          canton: 'ZG',
          language: 'de',
          metadata: {
            entityType: 'tco_calculation',
            entityId: 'tco-555',
            customerName: 'Anna Müller',
            vehicleModel: 'VISTIQ'
          },
          sentAt: '2024-01-15T16:30:00Z',
          createdAt: '2024-01-15T16:25:00Z',
          updatedAt: '2024-01-15T16:30:00Z'
        },
        {
          id: '6',
          type: 'system_maintenance',
          title: 'Systemwartung geplant',
          message: 'Wartungsfenster heute Abend 22:00-02:00',
          priority: 'normal',
          status: 'delivered',
          channel: 'in_app',
          language: 'de',
          scheduledAt: '2024-01-15T22:00:00Z',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ];
      
      // Filter notifications based on current filters
      let filteredNotifications = mockNotifications;
      
      if (activeTab === 'unread') {
        filteredNotifications = filteredNotifications.filter(n => !n.readAt);
      } else if (activeTab === 'high_priority') {
        filteredNotifications = filteredNotifications.filter(n => n.priority === 'high' || n.priority === 'urgent');
      } else if (activeTab === 'failed') {
        filteredNotifications = filteredNotifications.filter(n => n.status === 'failed');
      }
      
      if (selectedType !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.type === selectedType);
      }
      
      if (selectedCanton !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.canton === selectedCanton);
      }
      
      if (selectedLanguage !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.language === selectedLanguage);
      }
      
      if (searchQuery) {
        filteredNotifications = filteredNotifications.filter(n => 
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.metadata?.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats
      setStats({
        total: 156,
        unread: 23,
        high_priority: 8,
        urgent: 2,
        failed: 1,
        today: 42
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const setupAutoRefresh = () => {
    refreshIntervalRef.current = setInterval(() => {
      loadNotifications();
      loadStats();
    }, 30000); // Refresh every 30 seconds
  };

  const setupWebSocket = () => {
    // WebSocket connection for real-time notifications
    wsRef.current = new WebSocket('ws://localhost:3001/notifications');
    
    wsRef.current.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications(prev => [newNotification, ...prev]);
      loadStats(); // Refresh stats
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'read', readAt: new Date().toISOString() }
            : n
        )
      );
      
      loadStats();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/unread`, {
        method: 'POST'
      });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'delivered', readAt: undefined }
            : n
        )
      );
      
      loadStats();
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      loadStats();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const bulkMarkAsRead = async () => {
    try {
      await fetch('/api/notifications/bulk/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: selectedNotifications })
      });
      
      setNotifications(prev => 
        prev.map(n => 
          selectedNotifications.includes(n.id)
            ? { ...n, status: 'read', readAt: new Date().toISOString() }
            : n
        )
      );
      
      setSelectedNotifications([]);
      loadStats();
    } catch (error) {
      console.error('Failed to bulk mark as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-CH');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_customer':
      case 'new_lead':
        return <Users className="h-4 w-4" />;
      case 'test_drive_requested':
      case 'sale_completed':
        return <Car className="h-4 w-4" />;
      case 'tco_calculation_completed':
        return <Euro className="h-4 w-4" />;
      case 'dsgvo_consent_required':
        return <AlertTriangle className="h-4 w-4" />;
      case 'service_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'system_maintenance':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string, readAt?: string) => {
    if (readAt) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <MarkAsUnread className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
            🔔 Benachrichtigungen
          </h1>
          <p className="text-lg text-gray-600">
            Schweizer CADILLAC EV Notification Center
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            {autoRefresh ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {autoRefresh ? 'Live' : 'Manuell'}
          </Button>
          
          <Button
            variant="outline"
            onClick={loadNotifications}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Settings className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Gesamt</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
              <div className="text-sm text-gray-600">Ungelesen</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.high_priority}</div>
              <div className="text-sm text-gray-600">Hoch</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <div className="text-sm text-gray-600">Dringend</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
              <div className="text-sm text-gray-600">Fehlgeschlagen</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.today}</div>
              <div className="text-sm text-gray-600">Heute</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Benachrichtigungen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-60"
              />
            </div>

            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Typen</option>
              <option value="new_customer">Neuer Kunde</option>
              <option value="new_lead">Neuer Lead</option>
              <option value="test_drive_requested">Probefahrt</option>
              <option value="sale_completed">Verkauf</option>
              <option value="tco_calculation_completed">TCO</option>
              <option value="dsgvo_consent_required">DSGVO</option>
              <option value="service_reminder">Service</option>
              <option value="system_maintenance">System</option>
            </select>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <select 
                value={selectedCanton}
                onChange={(e) => setSelectedCanton(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Alle Kantone</option>
                {SWISS_CANTONS.map(canton => (
                  <option key={canton.code} value={canton.code}>
                    {canton.name}
                  </option>
                ))}
              </select>
            </div>

            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Sprachen</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alle ({stats?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <BellRing className="h-4 w-4" />
              Ungelesen ({stats?.unread || 0})
            </TabsTrigger>
            <TabsTrigger value="high_priority" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Wichtig ({(stats?.high_priority || 0) + (stats?.urgent || 0)})
            </TabsTrigger>
            <TabsTrigger value="failed" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Fehler ({stats?.failed || 0})
            </TabsTrigger>
          </TabsList>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} ausgewählt
              </span>
              <Button
                size="sm"
                onClick={bulkMarkAsRead}
                className="flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Als gelesen markieren
              </Button>
            </div>
          )}
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Keine Benachrichtigungen gefunden</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.readAt ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotifications(prev => [...prev, notification.id]);
                              } else {
                                setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                              }
                            }}
                            className="mt-2"
                          />

                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant={getPriorityColor(notification.priority)}>
                                  {notification.priority}
                                </Badge>
                                {getStatusIcon(notification.status, notification.readAt)}
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{formatTime(notification.createdAt)}</span>
                              {notification.canton && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.canton}
                                </Badge>
                              )}
                              {notification.metadata?.vehicleModel && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.metadata.vehicleModel}
                                </Badge>
                              )}
                              {notification.metadata?.customerName && (
                                <span>• {notification.metadata.customerName}</span>
                              )}
                              {notification.metadata?.amount && (
                                <span>• {formatCurrency(notification.metadata.amount)}</span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3">
                              {!notification.readAt ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsRead(notification.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  Als gelesen markieren
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsUnread(notification.id)}
                                  className="flex items-center gap-1"
                                >
                                  <EyeOff className="h-3 w-3" />
                                  Als ungelesen markieren
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteNotification(notification.id)}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Löschen
                              </Button>

                              {notification.metadata?.entityId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Navigate to related entity
                                    const { entityType, entityId } = notification.metadata!;
                                    window.location.href = `/${entityType}s/${entityId}`;
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  Details anzeigen
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;