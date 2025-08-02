'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Search, 
  Plus, 
  Filter, 
  Mail, 
  Phone, 
  Building, 
  User, 
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Lead {
  Id: string;
  FirstName: string;
  LastName: string;
  Company: string;
  Email: string;
  Phone: string;
  Status: string;
  LeadSource: string;
  CreatedDate: string;
  LastModifiedDate: string;
  Street?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
}

interface LeadsSearchParams {
  name?: string;
  company?: string;
  email?: string;
  status?: string;
  limit?: number;
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<LeadsSearchParams>({ limit: 50 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async (params: LeadsSearchParams = searchParams) => {
    try {
      setSearching(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/salesforce/leads?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLeads(searchParams);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'working - contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'unqualified':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadSourceIcon = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'web':
        return '🌐';
      case 'email':
        return '📧';
      case 'phone':
        return '📞';
      case 'referral':
        return '👥';
      default:
        return '📋';
    }
  };

  if (loading && leads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Leads
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Salesforce Leads</h1>
          <p className="text-gray-600">Manage and track your sales leads</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="First or Last Name"
                  value={searchParams.name || ''}
                  onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <Input
                  placeholder="Company Name"
                  value={searchParams.company || ''}
                  onChange={(e) => setSearchParams({ ...searchParams, company: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  placeholder="Email Address"
                  value={searchParams.email || ''}
                  onChange={(e) => setSearchParams({ ...searchParams, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                aria-label="Filter status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={searchParams.status || ''}
                  onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="New">New</option>
                  <option value="Working - Contacted">Working - Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Unqualified">Unqualified</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchParams({ limit: 50 });
                  loadLeads({ limit: 50 });
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {leads.map((lead) => (
          <Card key={lead.Id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {lead.FirstName} {lead.LastName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {lead.Company}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(lead.Status)}>
                  {lead.Status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Contact Information */}
              <div className="space-y-2">
                {lead.Email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-gray-500" />
                    <span className="truncate">{lead.Email}</span>
                  </div>
                )}
                {lead.Phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-gray-500" />
                    <span>{lead.Phone}</span>
                  </div>
                )}
              </div>

              {/* Lead Details */}
              <div className="space-y-2">
                {lead.LeadSource && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>{getLeadSourceIcon(lead.LeadSource)}</span>
                    <span>Source: {lead.LeadSource}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Created {formatDistanceToNow(new Date(lead.CreatedDate))} ago
                  </span>
                </div>
              </div>

              {/* Address */}
              {(lead.City || lead.State || lead.Country) && (
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>
                      {[lead.City, lead.State, lead.Country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLead(lead)}
                >
                  <User className="h-3 w-3 mr-1" />
                  View
                </Button>
                {lead.Email && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`mailto:${lead.Email}`)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`https://login.salesforce.com/${lead.Id}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  SF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {leads.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(searchParams).some(Boolean) 
                ? "Try adjusting your search criteria"
                : "Get started by creating your first lead"
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Lead
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {leads.length > 0 && leads.length >= (searchParams.limit || 50) && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              const newParams = { ...searchParams, limit: (searchParams.limit || 50) + 50 };
              setSearchParams(newParams);
              loadLeads(newParams);
            }}
            disabled={searching}
          >
            {searching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Load More
          </Button>
        </div>
      )}

      {/* Modals would be implemented here */}
      {/* CreateLeadModal */}
      {/* LeadDetailModal */}
    </div>
  );
}