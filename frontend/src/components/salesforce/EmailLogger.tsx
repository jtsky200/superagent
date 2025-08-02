'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Mail, Send, Loader2, CheckCircle, AlertCircle, User, Building } from 'lucide-react';

interface EmailLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  contactId?: string;
  accountId?: string;
}

interface EmailData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  contactId?: string;
  leadId?: string;
  accountId?: string;
  opportunityId?: string;
}

export default function EmailLogger({ isOpen, onClose, leadId, contactId, accountId }: EmailLoggerProps) {
  const [emailData, setEmailData] = useState<EmailData>({
    to: '',
    subject: '',
    body: '',
    contactId,
    leadId,
    accountId,
  });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logOnly, setLogOnly] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmailData({
        to: '',
        subject: '',
        body: '',
        contactId,
        leadId,
        accountId,
      });
      setError(null);
      setSuccess(false);
      setLogOnly(false);
    }
  }, [isOpen, leadId, contactId, accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (logOnly) {
        await logEmailActivity();
      } else {
        await sendAndLogEmail();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const sendAndLogEmail = async () => {
    setSending(true);
    setError(null);

    try {
      // First, send the email (if email service is configured)
      // This would typically integrate with your email service provider
      const emailResponse = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!emailResponse.ok) {
        // If email sending fails, still offer to log the activity
        const errorData = await emailResponse.json();
        setError(`Email sending failed: ${errorData.message}. Would you like to log this email activity anyway?`);
        return;
      }

      // Then log the email activity in Salesforce
      await logEmailActivity();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const logEmailActivity = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/salesforce/activities/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          subject: emailData.subject || 'Email',
          body: emailData.body,
          contactId: emailData.contactId,
          leadId: emailData.leadId,
          accountId: emailData.accountId,
          opportunityId: emailData.opportunityId,
          to: emailData.to,
          cc: emailData.cc,
          bcc: emailData.bcc,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to log email activity');
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to log email activity');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log email activity');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof EmailData, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email & Activity Logger
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading || sending}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Email activity logged successfully in Salesforce!
              </AlertDescription>
            </Alert>
          )}

          {/* Related Records */}
          {(leadId || contactId || accountId) && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Related Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {leadId && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-blue-600" />
                    <span>Lead: {leadId}</span>
                  </div>
                )}
                {contactId && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-green-600" />
                    <span>Contact: {contactId}</span>
                  </div>
                )}
                {accountId && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-3 w-3 text-purple-600" />
                    <span>Account: {accountId}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Recipients */}
            <div>
              <h3 className="text-lg font-medium mb-4">Email Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="to">To *</Label>
                  <Input
                    id="to"
                    type="email"
                    value={emailData.to}
                    onChange={(e) => handleChange('to', e.target.value)}
                    required
                    disabled={loading || sending}
                    placeholder="recipient@example.com"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cc">CC</Label>
                    <Input
                      id="cc"
                      type="email"
                      value={emailData.cc || ''}
                      onChange={(e) => handleChange('cc', e.target.value)}
                      disabled={loading || sending}
                      placeholder="cc@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bcc">BCC</Label>
                    <Input
                      id="bcc"
                      type="email"
                      value={emailData.bcc || ''}
                      onChange={(e) => handleChange('bcc', e.target.value)}
                      disabled={loading || sending}
                      placeholder="bcc@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div>
              <h3 className="text-lg font-medium mb-4">Message</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={emailData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    required
                    disabled={loading || sending}
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <Label htmlFor="body">Message Body *</Label>
                  <Textarea
                    id="body"
                    value={emailData.body}
                    onChange={(e) => handleChange('body', e.target.value)}
                    required
                    disabled={loading || sending}
                    rows={8}
                    placeholder="Enter your email message..."
                  />
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <h3 className="text-lg font-medium mb-4">Options</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    aria-label="Log activity only"
                    title="Log activity only (don&apos;t send email)"
                    type="checkbox"
                    id="logOnly"
                    checked={logOnly}
                    onChange={(e) => setLogOnly(e.target.checked)}
                    disabled={loading || sending}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="logOnly" className="text-sm">
                    Log activity only (don&apos;t send email)
                  </Label>
                </div>
                {logOnly && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This will create an activity record in Salesforce without sending an actual email.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Additional Salesforce Fields */}
            <div>
              <h3 className="text-lg font-medium mb-4">Salesforce Relations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="opportunityId">Opportunity ID</Label>
                  <Input
                    id="opportunityId"
                    value={emailData.opportunityId || ''}
                    onChange={(e) => handleChange('opportunityId', e.target.value)}
                    disabled={loading || sending}
                    placeholder="006XXXXXXXXXXXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading || sending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || sending || success}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending & Logging...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Logged!
                  </>
                ) : logOnly ? (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Log Activity
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send & Log
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}