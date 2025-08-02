'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle, Loader2, Settings, Users, Building, Phone } from 'lucide-react';

import SalesforceAuth from '../../components/salesforce/SalesforceAuth';
import LeadsDashboard from '../../components/salesforce/LeadsDashboard';
// import ContactsDashboard from '../../components/salesforce/ContactsDashboard';
// import CasesDashboard from '../../components/salesforce/CasesDashboard';
// import SyncDashboard from '../../components/salesforce/SyncDashboard';

interface SalesforceConfig {
  isConnected: boolean;
  environment: 'sandbox' | 'production';
  instanceUrl: string;
  userInfo?: {
    id: string;
    username: string;
    display_name: string;
    email: string;
    organization_id: string;
  };
}

export default function SalesforcePage() {
  const [config, setConfig] = useState<SalesforceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/salesforce/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load configuration');
      }

      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = () => {
    loadConfig();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Salesforce Integration
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Salesforce CRM Integration</h1>
          <p className="text-gray-600 mt-2">
            Manage your customer relationships with seamless Salesforce integration
          </p>
        </div>

        {/* Connection Status */}
        {!config?.isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Required:</strong> Please connect your Salesforce org to access CRM features.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="leads" disabled={!config?.isConnected} className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="contacts" disabled={!config?.isConnected} className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="cases" disabled={!config?.isConnected} className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Cases
            </TabsTrigger>
            <TabsTrigger value="sync" disabled={!config?.isConnected} className="flex items-center gap-2">
              <Loader2 className="h-4 w-4" />
              Sync
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SalesforceAuth />
            
            {config?.isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Get started with your Salesforce integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('leads')}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <Users className="h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="font-medium">Manage Leads</h3>
                      <p className="text-sm text-gray-600">View and create sales leads</p>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('contacts')}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <Building className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-medium">Manage Contacts</h3>
                      <p className="text-sm text-gray-600">Organize customer contacts</p>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('cases')}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <Phone className="h-8 w-8 text-orange-600 mb-2" />
                      <h3 className="font-medium">Support Cases</h3>
                      <p className="text-sm text-gray-600">Track customer support</p>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('sync')}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <Loader2 className="h-8 w-8 text-purple-600 mb-2" />
                      <h3 className="font-medium">Synchronization</h3>
                      <p className="text-sm text-gray-600">Manage data sync</p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            {config?.isConnected ? (
              <LeadsDashboard />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Salesforce Not Connected</h3>
                  <p className="text-gray-600 mb-4">
                    Please connect your Salesforce org to access lead management features.
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Go to Setup
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            {config?.isConnected ? (
              <Card>
                <CardHeader>
                  <CardTitle>Contacts Dashboard</CardTitle>
                  <CardDescription>
                    Manage your customer contacts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Contacts dashboard coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Salesforce Not Connected</h3>
                  <p className="text-gray-600 mb-4">
                    Please connect your Salesforce org to access contact management features.
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Go to Setup
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            {config?.isConnected ? (
              <Card>
                <CardHeader>
                  <CardTitle>Cases Dashboard</CardTitle>
                  <CardDescription>
                    Track and manage support cases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Cases dashboard coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Salesforce Not Connected</h3>
                  <p className="text-gray-600 mb-4">
                    Please connect your Salesforce org to access case management features.
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Go to Setup
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sync" className="space-y-6">
            {config?.isConnected ? (
              <Card>
                <CardHeader>
                  <CardTitle>Synchronization Dashboard</CardTitle>
                  <CardDescription>
                    Monitor and manage data synchronization between systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Synchronization dashboard coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Salesforce Not Connected</h3>
                  <p className="text-gray-600 mb-4">
                    Please connect your Salesforce org to access synchronization features.
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Go to Setup
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}