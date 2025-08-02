'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ExternalLink, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface SalesforceConfig {
  environment: 'sandbox' | 'production';
  instanceUrl: string;
  isConnected: boolean;
  userInfo?: {
    id: string;
    username: string;
    display_name: string;
    email: string;
    organization_id: string;
  };
}

export default function SalesforceAuth() {
  const [config, setConfig] = useState<SalesforceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

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
        throw new Error('Failed to load Salesforce configuration');
      }

      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      const response = await fetch('/api/salesforce/auth/url', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate authorization URL');
      }

      const data = await response.json();
      
      if (data.success && data.authUrl) {
        // Open Salesforce authorization in a new window
        const authWindow = window.open(
          data.authUrl,
          'salesforce-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Listen for the authorization callback
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            setConnecting(false);
            // Reload config to check if connection was successful
            setTimeout(loadConfig, 1000);
          }
        }, 1000);

        // Handle postMessage from callback window
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'SALESFORCE_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            authWindow?.close();
            setConnecting(false);
            loadConfig();
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'SALESFORCE_AUTH_ERROR') {
            clearInterval(checkClosed);
            authWindow?.close();
            setConnecting(false);
            setError(event.data.error || 'Authentication failed');
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);

      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setConnecting(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      setError(null);

      const response = await fetch('/api/salesforce/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Salesforce');
      }

      const data = await response.json();
      
      if (data.success) {
        await loadConfig();
      } else {
        throw new Error(data.message || 'Disconnect failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnect failed');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Salesforce Configuration
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.948 12.459c-.895 0-1.635-.357-1.635-1.252s.74-1.252 1.635-1.252c.896 0 1.636.357 1.636 1.252s-.74 1.252-1.636 1.252zm6.187 0c-.895 0-1.635-.357-1.635-1.252s.74-1.252 1.635-1.252c.896 0 1.636.357 1.636 1.252s-.74 1.252-1.636 1.252z"/>
            </svg>
            Salesforce Integration
            {config?.isConnected ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Connect your Salesforce org to enable seamless CRM integration with bidirectional synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {config?.isConnected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Environment</label>
                  <p className="text-sm text-gray-600 capitalize">{config.environment}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Instance URL</label>
                  <p className="text-sm text-gray-600 break-all">{config.instanceUrl}</p>
                </div>
                {config.userInfo && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Connected User</label>
                      <p className="text-sm text-gray-600">{config.userInfo.display_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Username</label>
                      <p className="text-sm text-gray-600">{config.userInfo.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-gray-600">{config.userInfo.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Organization ID</label>
                      <p className="text-sm text-gray-600 font-mono">{config.userInfo.organization_id}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Disconnect
                </Button>
                <Button
                  variant="outline"
                  onClick={loadConfig}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">To connect Salesforce, you&apos;ll need:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>A Salesforce org (Sandbox or Production)</li>
                  <li>System Administrator or appropriate permissions</li>
                  <li>Connected App configured in Salesforce</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Setup Required:</strong> Please ensure your Salesforce Connected App is configured with the correct callback URL:
                  <code className="block mt-1 p-2 bg-gray-100 rounded text-xs">
                    {window.location.origin}/api/salesforce/oauth/callback
                  </code>
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full"
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Connect to Salesforce
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {config?.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Features</CardTitle>
            <CardDescription>
              Available CRM features with your connected Salesforce org
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Lead Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Contact Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Case Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Activity Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Email Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Call Logging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Bidirectional Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Real-time Updates</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}