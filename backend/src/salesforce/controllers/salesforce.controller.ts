import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req, 
  Res, 
  UseGuards,
  HttpStatus,
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SalesforceAuthService } from '../services/salesforce-auth.service';
import { SalesforceApiService } from '../services/salesforce-api.service';
import { SalesforceSyncService } from '../services/salesforce-sync.service';
import {
  SalesforceAuthDto,
  SalesforceConfigDto
} from '../dto/salesforce-auth.dto';
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

@ApiTags('Salesforce Integration')
@Controller('salesforce')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesforceController {
  constructor(
    private salesforceAuthService: SalesforceAuthService,
    private salesforceApiService: SalesforceApiService,
    private salesforceSyncService: SalesforceSyncService,
  ) {}

  // Authentication Endpoints
  @Get('auth/url')
  @ApiOperation({ summary: 'Generate Salesforce OAuth authorization URL' })
  @ApiResponse({ status: 200, description: 'Authorization URL generated successfully' })
  async getAuthUrl(@Req() req: Request) {
    const userId = req.user['sub'];
    const authUrl = this.salesforceAuthService.generateAuthUrl(userId);
    
    return {
      success: true,
      authUrl,
      message: 'Please visit this URL to authorize Salesforce integration'
    };
  }

  @Post('auth/callback')
  @ApiOperation({ summary: 'Handle Salesforce OAuth callback' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async handleCallback(@Body() authDto: SalesforceAuthDto, @Req() req: Request) {
    const tokenInfo = await this.salesforceAuthService.exchangeCodeForToken(
      authDto.code,
      authDto.state
    );

    return {
      success: true,
      message: 'Salesforce integration successfully configured',
      tokenInfo: {
        instanceUrl: tokenInfo.instance_url,
        issuedAt: tokenInfo.issued_at
      }
    };
  }

  @Get('config')
  @ApiOperation({ summary: 'Get Salesforce configuration status' })
  @ApiResponse({ status: 200, description: 'Configuration retrieved successfully', type: SalesforceConfigDto })
  async getConfig(@Req() req: Request): Promise<SalesforceConfigDto> {
    const userId = req.user['sub'];
    return this.salesforceAuthService.getSalesforceConfig(userId);
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Disconnect Salesforce integration' })
  @ApiResponse({ status: 200, description: 'Disconnected successfully' })
  async disconnect(@Req() req: Request) {
    const userId = req.user['sub'];
    await this.salesforceAuthService.revokeToken(userId);
    
    return {
      success: true,
      message: 'Salesforce integration disconnected successfully'
    };
  }

  // Lead Management
  @Post('leads')
  @ApiOperation({ summary: 'Create a new lead in Salesforce' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  async createLead(@Body() createLeadDto: CreateLeadDto, @Req() req: Request) {
    const userId = req.user['sub'];
    const result = await this.salesforceApiService.createLead(userId, createLeadDto);
    
    // Queue for local sync
    await this.salesforceSyncService.queueForSync(userId, 'CREATE', 'Lead', result);
    
    return {
      success: true,
      lead: result,
      message: 'Lead created successfully'
    };
  }

  @Get('leads')
  @ApiOperation({ summary: 'Search leads in Salesforce' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  async searchLeads(@Query() searchParams: any, @Req() req: Request) {
    const userId = req.user['sub'];
    const results = await this.salesforceApiService.searchLeads(userId, searchParams);
    
    return {
      success: true,
      leads: results.records || [],
      totalSize: results.totalSize || 0,
      message: 'Leads retrieved successfully'
    };
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get a specific lead from Salesforce' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  async getLead(@Param('id') leadId: string, @Req() req: Request) {
    const userId = req.user['sub'];
    const lead = await this.salesforceApiService.getLead(userId, leadId);
    
    return {
      success: true,
      lead,
      message: 'Lead retrieved successfully'
    };
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update a lead in Salesforce' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  async updateLead(
    @Param('id') leadId: string,
    @Body() updateLeadDto: Partial<UpdateLeadDto>,
    @Req() req: Request
  ) {
    const userId = req.user['sub'];
    await this.salesforceApiService.updateLead(userId, leadId, updateLeadDto);
    
    // Queue for local sync
    await this.salesforceSyncService.queueForSync(userId, 'UPDATE', 'Lead', { id: leadId, ...updateLeadDto });
    
    return {
      success: true,
      message: 'Lead updated successfully'
    };
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Delete a lead from Salesforce' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  async deleteLead(@Param('id') leadId: string, @Req() req: Request) {
    const userId = req.user['sub'];
    await this.salesforceApiService.deleteLead(userId, leadId);
    
    // Queue for local sync
    await this.salesforceSyncService.queueForSync(userId, 'DELETE', 'Lead', { id: leadId });
    
    return {
      success: true,
      message: 'Lead deleted successfully'
    };
  }

  // Contact Management
  @Post('contacts')
  @ApiOperation({ summary: 'Create a new contact in Salesforce' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  async createContact(@Body() createContactDto: CreateContactDto, @Req() req: Request) {
    const userId = req.user['sub'];
    const result = await this.salesforceApiService.createContact(userId, createContactDto);
    
    await this.salesforceSyncService.queueForSync(userId, 'CREATE', 'Contact', result);
    
    return {
      success: true,
      contact: result,
      message: 'Contact created successfully'
    };
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Search contacts in Salesforce' })
  @ApiResponse({ status: 200, description: 'Contacts retrieved successfully' })
  async searchContacts(@Query() searchParams: any, @Req() req: Request) {
    const userId = req.user['sub'];
    const results = await this.salesforceApiService.searchContacts(userId, searchParams);
    
    return {
      success: true,
      contacts: results.records || [],
      totalSize: results.totalSize || 0,
      message: 'Contacts retrieved successfully'
    };
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: 'Get a specific contact from Salesforce' })
  @ApiResponse({ status: 200, description: 'Contact retrieved successfully' })
  async getContact(@Param('id') contactId: string, @Req() req: Request) {
    const userId = req.user['sub'];
    const contact = await this.salesforceApiService.getContact(userId, contactId);
    
    return {
      success: true,
      contact,
      message: 'Contact retrieved successfully'
    };
  }

  @Patch('contacts/:id')
  @ApiOperation({ summary: 'Update a contact in Salesforce' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  async updateContact(
    @Param('id') contactId: string,
    @Body() updateContactDto: Partial<UpdateContactDto>,
    @Req() req: Request
  ) {
    const userId = req.user['sub'];
    await this.salesforceApiService.updateContact(userId, contactId, updateContactDto);
    
    await this.salesforceSyncService.queueForSync(userId, 'UPDATE', 'Contact', { id: contactId, ...updateContactDto });
    
    return {
      success: true,
      message: 'Contact updated successfully'
    };
  }

  // Case Management
  @Post('cases')
  @ApiOperation({ summary: 'Create a new case in Salesforce' })
  @ApiResponse({ status: 201, description: 'Case created successfully' })
  async createCase(@Body() createCaseDto: CreateCaseDto, @Req() req: Request) {
    const userId = req.user['sub'];
    const result = await this.salesforceApiService.createCase(userId, createCaseDto);
    
    await this.salesforceSyncService.queueForSync(userId, 'CREATE', 'Case', result);
    
    return {
      success: true,
      case: result,
      message: 'Case created successfully'
    };
  }

  @Get('cases')
  @ApiOperation({ summary: 'Search cases in Salesforce' })
  @ApiResponse({ status: 200, description: 'Cases retrieved successfully' })
  async searchCases(@Query() searchParams: any, @Req() req: Request) {
    const userId = req.user['sub'];
    const results = await this.salesforceApiService.searchCases(userId, searchParams);
    
    return {
      success: true,
      cases: results.records || [],
      totalSize: results.totalSize || 0,
      message: 'Cases retrieved successfully'
    };
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Get a specific case from Salesforce' })
  @ApiResponse({ status: 200, description: 'Case retrieved successfully' })
  async getCase(@Param('id') caseId: string, @Req() req: Request) {
    const userId = req.user['sub'];
    const caseData = await this.salesforceApiService.getCase(userId, caseId);
    
    return {
      success: true,
      case: caseData,
      message: 'Case retrieved successfully'
    };
  }

  @Patch('cases/:id')
  @ApiOperation({ summary: 'Update a case in Salesforce' })
  @ApiResponse({ status: 200, description: 'Case updated successfully' })
  async updateCase(
    @Param('id') caseId: string,
    @Body() updateCaseDto: Partial<UpdateCaseDto>,
    @Req() req: Request
  ) {
    const userId = req.user['sub'];
    await this.salesforceApiService.updateCase(userId, caseId, updateCaseDto);
    
    await this.salesforceSyncService.queueForSync(userId, 'UPDATE', 'Case', { id: caseId, ...updateCaseDto });
    
    return {
      success: true,
      message: 'Case updated successfully'
    };
  }

  // Activity Tracking
  @Post('activities')
  @ApiOperation({ summary: 'Create an activity/task in Salesforce' })
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  async createActivity(@Body() createActivityDto: CreateActivityDto, @Req() req: Request) {
    const userId = req.user['sub'];
    const result = await this.salesforceApiService.createActivity(userId, createActivityDto);
    
    return {
      success: true,
      activity: result,
      message: 'Activity created successfully'
    };
  }

  @Post('activities/email')
  @ApiOperation({ summary: 'Log email activity in Salesforce' })
  @ApiResponse({ status: 201, description: 'Email activity logged successfully' })
  async logEmail(@Body() emailData: any, @Req() req: Request) {
    const userId = req.user['sub'];
    const result = await this.salesforceApiService.logEmail(userId, emailData);
    
    return {
      success: true,
      activity: result,
      message: 'Email activity logged successfully'
    };
  }

  @Post('activities/call')
  @ApiOperation({ summary: 'Log call activity in Salesforce' })
  @ApiResponse({ status: 201, description: 'Call activity logged successfully' })
  async logCall(@Body() callData: any, @Req() req: Request) {
    const userId = req.user['sub'];
    const result = await this.salesforceApiService.logCall(userId, callData);
    
    return {
      success: true,
      activity: result,
      message: 'Call activity logged successfully'
    };
  }

  // Search and Utility
  @Post('search')
  @ApiOperation({ summary: 'Perform global search across Salesforce objects' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  async globalSearch(@Body() searchDto: SalesforceSearchDto, @Req() req: Request) {
    const userId = req.user['sub'];
    const results = await this.salesforceApiService.globalSearch(userId, searchDto);
    
    return {
      success: true,
      results,
      message: 'Search completed successfully'
    };
  }

  @Post('api/custom')
  @ApiOperation({ summary: 'Execute custom Salesforce API request' })
  @ApiResponse({ status: 200, description: 'Custom request executed successfully' })
  async executeCustomRequest(@Body() requestDto: SalesforceApiRequestDto, @Req() req: Request) {
    const userId = req.user['sub'];
    const result = await this.salesforceApiService.executeCustomRequest(userId, requestDto);
    
    return {
      success: true,
      result,
      message: 'Custom request executed successfully'
    };
  }

  @Get('metadata/:objectType')
  @ApiOperation({ summary: 'Get object metadata from Salesforce' })
  @ApiResponse({ status: 200, description: 'Metadata retrieved successfully' })
  async getObjectMetadata(@Param('objectType') objectType: string, @Req() req: Request) {
    const userId = req.user['sub'];
    const metadata = await this.salesforceApiService.getObjectMetadata(userId, objectType);
    
    return {
      success: true,
      metadata,
      message: 'Metadata retrieved successfully'
    };
  }

  @Get('picklist/:objectType/:fieldName')
  @ApiOperation({ summary: 'Get picklist values for a field' })
  @ApiResponse({ status: 200, description: 'Picklist values retrieved successfully' })
  async getPicklistValues(
    @Param('objectType') objectType: string,
    @Param('fieldName') fieldName: string,
    @Req() req: Request
  ) {
    const userId = req.user['sub'];
    const values = await this.salesforceApiService.getPicklistValues(userId, objectType, fieldName);
    
    return {
      success: true,
      values,
      message: 'Picklist values retrieved successfully'
    };
  }

  // Synchronization
  @Post('sync/full')
  @ApiOperation({ summary: 'Perform full bidirectional synchronization' })
  @ApiResponse({ status: 200, description: 'Full sync completed' })
  async performFullSync(@Req() req: Request) {
    const userId = req.user['sub'];
    const result = await this.salesforceSyncService.performFullSync(userId);
    
    return {
      success: result.success,
      result,
      message: result.success ? 'Full sync completed successfully' : 'Full sync completed with errors'
    };
  }

  @Post('sync/incremental')
  @ApiOperation({ summary: 'Perform incremental synchronization' })
  @ApiResponse({ status: 200, description: 'Incremental sync completed' })
  async performIncrementalSync(@Req() req: Request) {
    const userId = req.user['sub'];
    const result = await this.salesforceSyncService.performIncrementalSync(userId);
    
    return {
      success: result.success,
      result,
      message: 'Incremental sync completed'
    };
  }

  @Get('sync/conflicts')
  @ApiOperation({ summary: 'Get sync conflicts that need resolution' })
  @ApiResponse({ status: 200, description: 'Conflicts retrieved successfully' })
  async getSyncConflicts(@Req() req: Request) {
    const userId = req.user['sub'];
    const conflicts = await this.salesforceSyncService.getSyncConflicts(userId);
    
    return {
      success: true,
      conflicts,
      message: 'Conflicts retrieved successfully'
    };
  }

  @Post('sync/conflicts/:id/resolve')
  @ApiOperation({ summary: 'Resolve a sync conflict' })
  @ApiResponse({ status: 200, description: 'Conflict resolved successfully' })
  async resolveConflict(
    @Param('id') conflictId: string,
    @Body() resolution: { strategy: 'USE_SALESFORCE' | 'USE_LOCAL' | 'MERGE', mergeData?: any },
    @Req() req: Request
  ) {
    await this.salesforceSyncService.resolveConflict(
      conflictId,
      resolution.strategy,
      resolution.mergeData
    );
    
    return {
      success: true,
      message: 'Conflict resolved successfully'
    };
  }

  @Get('sync/logs')
  @ApiOperation({ summary: 'Get synchronization logs' })
  @ApiResponse({ status: 200, description: 'Sync logs retrieved successfully' })
  async getSyncLogs(@Query('limit') limit: string, @Req() req: Request) {
    const userId = req.user['sub'];
    const logs = await this.salesforceSyncService.getSyncLogs(userId, parseInt(limit) || 50);
    
    return {
      success: true,
      logs,
      message: 'Sync logs retrieved successfully'
    };
  }

  // Bulk Operations
  @Post('bulk/create/:objectType')
  @ApiOperation({ summary: 'Bulk create records in Salesforce' })
  @ApiResponse({ status: 201, description: 'Bulk create completed' })
  async bulkCreate(
    @Param('objectType') objectType: string,
    @Body() records: any[],
    @Req() req: Request
  ) {
    const userId = req.user['sub'];
    
    if (!records || records.length === 0) {
      throw new BadRequestException('No records provided for bulk create');
    }
    
    if (records.length > 200) {
      throw new BadRequestException('Maximum 200 records allowed per bulk operation');
    }
    
    const result = await this.salesforceApiService.bulkCreate(userId, objectType, records);
    
    return {
      success: true,
      result,
      message: `Bulk create completed for ${records.length} ${objectType} records`
    };
  }

  @Patch('bulk/update/:objectType')
  @ApiOperation({ summary: 'Bulk update records in Salesforce' })
  @ApiResponse({ status: 200, description: 'Bulk update completed' })
  async bulkUpdate(
    @Param('objectType') objectType: string,
    @Body() records: any[],
    @Req() req: Request
  ) {
    const userId = req.user['sub'];
    
    if (!records || records.length === 0) {
      throw new BadRequestException('No records provided for bulk update');
    }
    
    if (records.length > 200) {
      throw new BadRequestException('Maximum 200 records allowed per bulk operation');
    }
    
    const result = await this.salesforceApiService.bulkUpdate(userId, objectType, records);
    
    return {
      success: true,
      result,
      message: `Bulk update completed for ${records.length} ${objectType} records`
    };
  }
}