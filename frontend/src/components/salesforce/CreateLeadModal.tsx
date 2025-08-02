'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: () => void;
}

interface LeadFormData {
  FirstName: string;
  LastName: string;
  Company: string;
  Email: string;
  Phone: string;
  Status: string;
  LeadSource: string;
  Street: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  Industry: string;
  Description: string;
}

const initialFormData: LeadFormData = {
  FirstName: '',
  LastName: '',
  Company: '',
  Email: '',
  Phone: '',
  Status: 'New',
  LeadSource: 'Web',
  Street: '',
  City: '',
  State: '',
  PostalCode: '',
  Country: 'Switzerland',
  Industry: '',
  Description: '',
};

export default function CreateLeadModal({ isOpen, onClose, onLeadCreated }: CreateLeadModalProps) {
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/salesforce/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create lead');
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onLeadCreated();
          handleClose();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to create lead');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Create New Lead</h2>
            <button
              onClick={handleClose}
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
                Lead created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="FirstName">First Name *</Label>
                  <Input
                    id="FirstName"
                    value={formData.FirstName}
                    onChange={(e) => handleChange('FirstName', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="LastName">Last Name *</Label>
                  <Input
                    id="LastName"
                    value={formData.LastName}
                    onChange={(e) => handleChange('LastName', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="Company">Company *</Label>
                  <Input
                    id="Company"
                    value={formData.Company}
                    onChange={(e) => handleChange('Company', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="Email">Email *</Label>
                  <Input
                    id="Email"
                    type="email"
                    value={formData.Email}
                    onChange={(e) => handleChange('Email', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="Phone">Phone</Label>
                  <Input
                    id="Phone"
                    type="tel"
                    value={formData.Phone}
                    onChange={(e) => handleChange('Phone', e.target.value)}
                    placeholder="+41 XX XXX XX XX"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div>
              <h3 className="text-lg font-medium mb-4">Lead Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="Status">Status</Label>
                  <select
                    aria-label="Lead status"
                    title="Select lead status"
                    id="Status"
                    value={formData.Status}
                    onChange={(e) => handleChange('Status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={loading}
                  >
                    <option value="New">New</option>
                    <option value="Working - Contacted">Working - Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Unqualified">Unqualified</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="LeadSource">Lead Source</Label>
                                  <select
                  aria-label="Lead source"
                  title="Select lead source"
                  id="LeadSource"
                    value={formData.LeadSource}
                    onChange={(e) => handleChange('LeadSource', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={loading}
                  >
                    <option value="Web">Web</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Referral">Referral</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Trade Show">Trade Show</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="Industry">Industry</Label>
                  <Input
                    id="Industry"
                    value={formData.Industry}
                    onChange={(e) => handleChange('Industry', e.target.value)}
                    placeholder="e.g., Automotive, Technology, Healthcare"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Address Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="Street">Street</Label>
                  <Input
                    id="Street"
                    value={formData.Street}
                    onChange={(e) => handleChange('Street', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="City">City</Label>
                    <Input
                      id="City"
                      value={formData.City}
                      onChange={(e) => handleChange('City', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="PostalCode">Postal Code</Label>
                    <Input
                      id="PostalCode"
                      value={formData.PostalCode}
                      onChange={(e) => handleChange('PostalCode', e.target.value)}
                      placeholder="e.g., 8001"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="State">State/Canton</Label>
                    <Input
                      id="State"
                      value={formData.State}
                      onChange={(e) => handleChange('State', e.target.value)}
                      placeholder="e.g., ZH, BE, GE"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="Country">Country</Label>
                  <select
                    aria-label="Country"
                    title="Select country"
                    id="Country"
                    value={formData.Country}
                    onChange={(e) => handleChange('Country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={loading}
                  >
                    <option value="Switzerland">Switzerland</option>
                    <option value="Germany">Germany</option>
                    <option value="Austria">Austria</option>
                    <option value="France">France</option>
                    <option value="Italy">Italy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="Description">Description/Notes</Label>
              <textarea
                id="Description"
                value={formData.Description}
                onChange={(e) => handleChange('Description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Additional notes about this lead..."
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
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
                    Creating...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Created!
                  </>
                ) : (
                  'Create Lead'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}