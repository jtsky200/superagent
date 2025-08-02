'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Phone, Save, Loader2, CheckCircle, AlertCircle, User, Building, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface CallLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  contactId?: string;
  accountId?: string;
}

interface CallData {
  subject: string;
  notes: string;
  date: string;
  duration: string;
  callType: 'Inbound' | 'Outbound';
  callResult: 'Completed' | 'No Answer' | 'Left Voicemail' | 'Busy';
  contactId?: string;
  leadId?: string;
  accountId?: string;
  opportunityId?: string;
  phoneNumber?: string;
}

export default function CallLogger({ isOpen, onClose, leadId, contactId, accountId }: CallLoggerProps) {
  const [callData, setCallData] = useState<CallData>({
    subject: '',
    notes: '',
    date: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    duration: '',
    callType: 'Outbound',
    callResult: 'Completed',
    contactId,
    leadId,
    accountId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCallData({
        subject: '',
        notes: '',
        date: new Date().toISOString().slice(0, 16),
        duration: '',
        callType: 'Outbound',
        callResult: 'Completed',
        contactId,
        leadId,
        accountId,
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, leadId, contactId, accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/salesforce/activities/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          subject: callData.subject || `${callData.callType} Call`,
          notes: callData.notes,
          date: callData.date,
          duration: callData.duration,
          callType: callData.callType,
          callResult: callData.callResult,
          contactId: callData.contactId,
          leadId: callData.leadId,
          accountId: callData.accountId,
          opportunityId: callData.opportunityId,
          phoneNumber: callData.phoneNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to log call activity');
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to log call activity');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log call activity');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CallData, value: string) => {
    setCallData(prev => ({ ...prev, [field]: value }));
  };

  const formatDuration = (minutes: string) => {
    if (!minutes) return '';
    const num = parseInt(minutes);
    if (num < 60) return `${num} min`;
    const hours = Math.floor(num / 60);
    const mins = num % 60;
    return `${hours}h ${mins}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Log Call Activity
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
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
                Call activity logged successfully in Salesforce!
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
            {/* Call Details */}
            <div>
              <h3 className="text-lg font-medium mb-4">Call Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Call Subject</Label>
                  <Input
                    id="subject"
                    value={callData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    disabled={loading}
                    placeholder="e.g., Follow-up call about EV inquiry"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to auto-generate: &quot;{callData.callType} Call&quot;
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="callType">Call Type</Label>
                    <select
                      aria-label="Call type"
                      title="Select call type"
                      id="callType"
                      value={callData.callType}
                      onChange={(e) => handleChange('callType', e.target.value as 'Inbound' | 'Outbound')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      disabled={loading}
                    >
                      <option value="Outbound">Outbound</option>
                      <option value="Inbound">Inbound</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="callResult">Call Result</Label>
                    <select
                      aria-label="Call result"
                      title="Select call result"
                      id="callResult"
                      value={callData.callResult}
                      onChange={(e) => handleChange('callResult', e.target.value as CallData['callResult'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      disabled={loading}
                    >
                      <option value="Completed">Completed</option>
                      <option value="No Answer">No Answer</option>
                      <option value="Left Voicemail">Left Voicemail</option>
                      <option value="Busy">Busy</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={callData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={callData.duration}
                      onChange={(e) => handleChange('duration', e.target.value)}
                      disabled={loading}
                      placeholder="e.g., 15"
                    />
                    {callData.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDuration(callData.duration)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={callData.phoneNumber || ''}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    disabled={loading}
                    placeholder="+41 XX XXX XX XX"
                  />
                </div>
              </div>
            </div>

            {/* Call Notes */}
            <div>
              <h3 className="text-lg font-medium mb-4">Call Notes</h3>
              <div>
                <Label htmlFor="notes">Notes & Summary</Label>
                <Textarea
                  id="notes"
                  value={callData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  disabled={loading}
                  rows={6}
                  placeholder="Enter call summary, discussion points, next steps, etc..."
                />
              </div>
            </div>

            {/* Additional Salesforce Relations */}
            <div>
              <h3 className="text-lg font-medium mb-4">Additional Relations</h3>
              <div>
                <Label htmlFor="opportunityId">Opportunity ID</Label>
                <Input
                  id="opportunityId"
                  value={callData.opportunityId || ''}
                  onChange={(e) => handleChange('opportunityId', e.target.value)}
                  disabled={loading}
                  placeholder="006XXXXXXXXXXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link this call to a specific opportunity if applicable
                </p>
              </div>
            </div>

            {/* Call Summary Preview */}
            {(callData.subject || callData.notes || callData.duration) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Activity Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Subject:</strong> {callData.subject || `${callData.callType} Call`}
                  </div>
                  <div>
                    <strong>Date:</strong> {format(new Date(callData.date), 'PPpp')}
                  </div>
                  <div>
                    <strong>Type:</strong> {callData.callType} | <strong>Result:</strong> {callData.callResult}
                  </div>
                  {callData.duration && (
                    <div>
                      <strong>Duration:</strong> {formatDuration(callData.duration)}
                    </div>
                  )}
                  {callData.phoneNumber && (
                    <div>
                      <strong>Phone:</strong> {callData.phoneNumber}
                    </div>
                  )}
                  {callData.notes && (
                    <div>
                      <strong>Notes:</strong> {callData.notes.slice(0, 100)}{callData.notes.length > 100 ? '...' : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Logged!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Log Call
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