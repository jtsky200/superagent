import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { SalesforceAuthService } from './salesforce-auth.service';
import { 
  CreateLeadDto, 
  UpdateLeadDto, 
  CreateContactDto, 
  UpdateContactDto,
  CreateCaseDto,
  UpdateCaseDto,
  CreateActivityDto,
  SalesforceSearchDto,
  SalesforceApiRequestDto
} from '../dto/salesforce-objects.dto';

@Injectable()
export class SalesforceApiService {
  private readonly logger = new Logger(SalesforceApiService.name);

  constructor(
    private salesforceAuthService: SalesforceAuthService,
    private configService: ConfigService,
  ) {}

  /**
   * Make authenticated API request to Salesforce
   */
  async makeApiRequest(
    userId: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<any> {
    try {
      const accessToken = await this.salesforceAuthService.getValidToken(userId);
      const config = await this.salesforceAuthService.getSalesforceConfig(userId);
      
      if (!config.isConnected) {
        throw new BadRequestException('Salesforce not connected');
      }

      const apiVersion = this.configService.get<string>('SALESFORCE_API_VERSION', 'v60.0');
      const url = `${config.instanceUrl}/services/data/${apiVersion}${endpoint}`;

      const requestConfig: AxiosRequestConfig = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params,
        data,
      };

      this.logger.log(`Making ${method} request to: ${endpoint}`);
      const response: AxiosResponse = await axios(requestConfig);

      return response.data;

    } catch (error) {
      this.logger.error(`API request failed for ${method} ${endpoint}:`, error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        // Try to refresh token and retry once
        try {
          await this.salesforceAuthService.refreshToken(userId);
          return this.makeApiRequest(userId, method, endpoint, data, params);
        } catch (refreshError) {
          throw new BadRequestException('Salesforce authentication failed. Please reconnect.');
        }
      }
      
      throw new BadRequestException(
        error.response?.data?.message || 
        error.response?.data?.[0]?.message || 
        'Salesforce API request failed'
      );
    }
  }

  // Lead Operations
  async createLead(userId: string, leadData: CreateLeadDto): Promise<any> {
    this.logger.log(`Creating lead for user ${userId}`);
    return this.makeApiRequest(userId, 'POST', '/sobjects/Lead/', leadData);
  }

  async getLead(userId: string, leadId: string): Promise<any> {
    this.logger.log(`Getting lead ${leadId} for user ${userId}`);
    return this.makeApiRequest(userId, 'GET', `/sobjects/Lead/${leadId}`);
  }

  async updateLead(userId: string, leadId: string, leadData: Partial<UpdateLeadDto>): Promise<any> {
    this.logger.log(`Updating lead ${leadId} for user ${userId}`);
    const { Id, ...updateData } = leadData;
    return this.makeApiRequest(userId, 'PATCH', `/sobjects/Lead/${leadId}`, updateData);
  }

  async deleteLead(userId: string, leadId: string): Promise<any> {
    this.logger.log(`Deleting lead ${leadId} for user ${userId}`);
    return this.makeApiRequest(userId, 'DELETE', `/sobjects/Lead/${leadId}`);
  }

  async searchLeads(userId: string, searchParams: any): Promise<any> {
    this.logger.log(`Searching leads for user ${userId}`);
    
    // Build SOQL query
    let query = `SELECT Id, FirstName, LastName, Company, Email, Phone, Status, LeadSource, 
                        CreatedDate, LastModifiedDate, Street, City, State, PostalCode, Country 
                 FROM Lead`;
    
    const conditions = [];
    
    if (searchParams.name) {
      conditions.push(`(FirstName LIKE '%${searchParams.name}%' OR LastName LIKE '%${searchParams.name}%')`);
    }
    
    if (searchParams.company) {
      conditions.push(`Company LIKE '%${searchParams.company}%'`);
    }
    
    if (searchParams.email) {
      conditions.push(`Email = '${searchParams.email}'`);
    }
    
    if (searchParams.status) {
      conditions.push(`Status = '${searchParams.status}'`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY LastModifiedDate DESC`;
    
    if (searchParams.limit) {
      query += ` LIMIT ${searchParams.limit}`;
    }

    return this.makeApiRequest(userId, 'GET', '/query/', null, { q: query });
  }

  // Contact Operations
  async createContact(userId: string, contactData: CreateContactDto): Promise<any> {
    this.logger.log(`Creating contact for user ${userId}`);
    return this.makeApiRequest(userId, 'POST', '/sobjects/Contact/', contactData);
  }

  async getContact(userId: string, contactId: string): Promise<any> {
    this.logger.log(`Getting contact ${contactId} for user ${userId}`);
    return this.makeApiRequest(userId, 'GET', `/sobjects/Contact/${contactId}`);
  }

  async updateContact(userId: string, contactId: string, contactData: Partial<UpdateContactDto>): Promise<any> {
    this.logger.log(`Updating contact ${contactId} for user ${userId}`);
    const { Id, ...updateData } = contactData;
    return this.makeApiRequest(userId, 'PATCH', `/sobjects/Contact/${contactId}`, updateData);
  }

  async searchContacts(userId: string, searchParams: any): Promise<any> {
    this.logger.log(`Searching contacts for user ${userId}`);
    
    let query = `SELECT Id, FirstName, LastName, Email, Phone, Title, Department, AccountId, Account.Name,
                        CreatedDate, LastModifiedDate, MailingStreet, MailingCity, MailingState, MailingPostalCode
                 FROM Contact`;
    
    const conditions = [];
    
    if (searchParams.name) {
      conditions.push(`(FirstName LIKE '%${searchParams.name}%' OR LastName LIKE '%${searchParams.name}%')`);
    }
    
    if (searchParams.email) {
      conditions.push(`Email = '${searchParams.email}'`);
    }
    
    if (searchParams.accountId) {
      conditions.push(`AccountId = '${searchParams.accountId}'`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY LastModifiedDate DESC`;
    
    if (searchParams.limit) {
      query += ` LIMIT ${searchParams.limit}`;
    }

    return this.makeApiRequest(userId, 'GET', '/query/', null, { q: query });
  }

  // Case Operations
  async createCase(userId: string, caseData: CreateCaseDto): Promise<any> {
    this.logger.log(`Creating case for user ${userId}`);
    return this.makeApiRequest(userId, 'POST', '/sobjects/Case/', caseData);
  }

  async getCase(userId: string, caseId: string): Promise<any> {
    this.logger.log(`Getting case ${caseId} for user ${userId}`);
    return this.makeApiRequest(userId, 'GET', `/sobjects/Case/${caseId}`);
  }

  async updateCase(userId: string, caseId: string, caseData: Partial<UpdateCaseDto>): Promise<any> {
    this.logger.log(`Updating case ${caseId} for user ${userId}`);
    const { Id, ...updateData } = caseData;
    return this.makeApiRequest(userId, 'PATCH', `/sobjects/Case/${caseId}`, updateData);
  }

  async searchCases(userId: string, searchParams: any): Promise<any> {
    this.logger.log(`Searching cases for user ${userId}`);
    
    let query = `SELECT Id, CaseNumber, Subject, Description, Status, Priority, Origin, Type, Reason,
                        ContactId, Contact.Name, AccountId, Account.Name, CreatedDate, LastModifiedDate
                 FROM Case`;
    
    const conditions = [];
    
    if (searchParams.status) {
      conditions.push(`Status = '${searchParams.status}'`);
    }
    
    if (searchParams.priority) {
      conditions.push(`Priority = '${searchParams.priority}'`);
    }
    
    if (searchParams.contactId) {
      conditions.push(`ContactId = '${searchParams.contactId}'`);
    }
    
    if (searchParams.accountId) {
      conditions.push(`AccountId = '${searchParams.accountId}'`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY LastModifiedDate DESC`;
    
    if (searchParams.limit) {
      query += ` LIMIT ${searchParams.limit}`;
    }

    return this.makeApiRequest(userId, 'GET', '/query/', null, { q: query });
  }

  // Activity Operations
  async createActivity(userId: string, activityData: CreateActivityDto): Promise<any> {
    this.logger.log(`Creating activity for user ${userId}`);
    return this.makeApiRequest(userId, 'POST', '/sobjects/Task/', activityData);
  }

  async logEmail(userId: string, emailData: any): Promise<any> {
    this.logger.log(`Logging email activity for user ${userId}`);
    
    const emailActivity = {
      Subject: emailData.subject || 'Email',
      Description: emailData.body || '',
      Type: 'Email',
      Status: 'Completed',
      ActivityDate: new Date().toISOString(),
      WhoId: emailData.contactId || emailData.leadId,
      WhatId: emailData.accountId || emailData.opportunityId,
      IsCompleted: true,
    };

    return this.createActivity(userId, emailActivity);
  }

  async logCall(userId: string, callData: any): Promise<any> {
    this.logger.log(`Logging call activity for user ${userId}`);
    
    const callActivity = {
      Subject: callData.subject || 'Phone Call',
      Description: callData.notes || '',
      Type: 'Call',
      Status: 'Completed',
      ActivityDate: callData.date || new Date().toISOString(),
      WhoId: callData.contactId || callData.leadId,
      WhatId: callData.accountId || callData.opportunityId,
      IsCompleted: true,
    };

    return this.createActivity(userId, callActivity);
  }

  // Search Operations
  async globalSearch(userId: string, searchDto: SalesforceSearchDto): Promise<any> {
    this.logger.log(`Performing global search for user ${userId}`);
    
    let soslQuery = `FIND {${searchDto.query}}`;
    
    if (searchDto.objectTypes && searchDto.objectTypes.length > 0) {
      soslQuery += ` IN ${searchDto.objectTypes.join(', ')} FIELDS`;
    }
    
    soslQuery += ` RETURNING Lead(Id, FirstName, LastName, Company, Email), 
                           Contact(Id, FirstName, LastName, Email, Account.Name),
                           Case(Id, CaseNumber, Subject, Status)`;
    
    if (searchDto.limit) {
      soslQuery += ` LIMIT ${searchDto.limit}`;
    }

    return this.makeApiRequest(userId, 'GET', '/search/', null, { q: soslQuery });
  }

  // Generic API Operations
  async executeCustomRequest(userId: string, requestDto: SalesforceApiRequestDto): Promise<any> {
    this.logger.log(`Executing custom ${requestDto.method} request to ${requestDto.endpoint} for user ${userId}`);
    
    return this.makeApiRequest(
      userId,
      requestDto.method,
      requestDto.endpoint,
      requestDto.body,
      requestDto.params
    );
  }

  // Utility Operations
  async getObjectMetadata(userId: string, objectType: string): Promise<any> {
    this.logger.log(`Getting metadata for ${objectType} for user ${userId}`);
    return this.makeApiRequest(userId, 'GET', `/sobjects/${objectType}/describe/`);
  }

  async getPicklistValues(userId: string, objectType: string, fieldName: string): Promise<any> {
    this.logger.log(`Getting picklist values for ${objectType}.${fieldName} for user ${userId}`);
    const metadata = await this.getObjectMetadata(userId, objectType);
    
    const field = metadata.fields.find(f => f.name === fieldName);
    if (!field || !field.picklistValues) {
      throw new NotFoundException(`Picklist field ${fieldName} not found on ${objectType}`);
    }
    
    return field.picklistValues;
  }

  async bulkCreate(userId: string, objectType: string, records: any[]): Promise<any> {
    this.logger.log(`Creating ${records.length} ${objectType} records in bulk for user ${userId}`);
    
    const bulkData = {
      records: records.map(record => ({ ...record, attributes: { type: objectType } }))
    };

    return this.makeApiRequest(userId, 'POST', '/composite/sobjects/', bulkData);
  }

  async bulkUpdate(userId: string, objectType: string, records: any[]): Promise<any> {
    this.logger.log(`Updating ${records.length} ${objectType} records in bulk for user ${userId}`);
    
    const bulkData = {
      records: records.map(record => ({ ...record, attributes: { type: objectType } }))
    };

    return this.makeApiRequest(userId, 'PATCH', '/composite/sobjects/', bulkData);
  }
}