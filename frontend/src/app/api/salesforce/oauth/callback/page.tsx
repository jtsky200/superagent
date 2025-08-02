'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Alert, AlertDescription } from '../../../../../components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function SalesforceOAuthCallbackInner() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Salesforce authorization...');
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors
        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Send authorization code to backend
        const response = await fetch('/api/salesforce/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Authorization failed');
        }

        const data = await response.json();
        
        if (data.success) {
          setStatus('success');
          setMessage('Salesforce integration configured successfully!');
          
          // Notify parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'SALESFORCE_AUTH_SUCCESS',
              data: data
            }, window.location.origin);
          }
          
          // Auto-close after delay
          setTimeout(() => {
            window.close();
          }, 2000);
          
        } else {
          throw new Error(data.message || 'Authorization failed');
        }

      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Authorization failed');
        
        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage({
            type: 'SALESFORCE_AUTH_ERROR',
            error: err instanceof Error ? err.message : 'Authorization failed'
          }, window.location.origin);
        }
        
        // Auto-close after delay
        setTimeout(() => {
          window.close();
        }, 5000);
      }
    };

    handleCallback();
  }, [searchParams]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
    }
  };

  const getAlertVariant = () => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive' as const;
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {getIcon()}
            Salesforce Authorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant={getAlertVariant()}>
            <AlertDescription className="text-center">
              {message}
            </AlertDescription>
          </Alert>
          
          {status === 'success' && (
            <div className="mt-4 text-center text-sm text-gray-600">
              This window will close automatically...
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => window.close()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Close Window
              </button>
            </div>
          )}
          
          {status === 'loading' && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Please wait while we configure your Salesforce integration...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SalesforceOAuthCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SalesforceOAuthCallbackInner />
    </Suspense>
  );
}