import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SalesforceSyncLog } from '../entities/salesforce-sync-log.entity';
import { SalesforceApiService } from './salesforce-api.service';
import { SalesforceAuthService } from './salesforce-auth.service';

export interface SyncConflict {
  objectType: string;
  objectId: string;
  salesforceData: any;
  localData: any;
  conflictFields: string[];
}

export interface SyncResult {
  success: boolean;
  synced: number;
  conflicts: number;
  errors: number;
  details: {
    created: number;
    updated: number;
    deleted: number;
    conflicts: SyncConflict[];
    errors: string[];
  };
}

@Injectable()
export class SalesforceSyncService {
  private readonly logger = new Logger(SalesforceSyncService.name);
  private readonly syncQueues = new Map<string, any[]>();

  constructor(
    @InjectRepository(SalesforceSyncLog)
    private syncLogRepository: Repository<SalesforceSyncLog>,
    private salesforceApiService: SalesforceApiService,
    private salesforceAuthService: SalesforceAuthService,
    private configService: ConfigService,
  ) {}

  /**
   * Perform full bidirectional sync for a user
   */
  async performFullSync(userId: string): Promise<SyncResult> {
    this.logger.log(`Starting full sync for user ${userId}`);

    const result: SyncResult = {
      success: true,
      synced: 0,
      conflicts: 0,
      errors: 0,
      details: {
        created: 0,
        updated: 0,
        deleted: 0,
        conflicts: [],
        errors: []
      }
    };

    try {
      // Check if user has valid Salesforce connection
      const config = await this.salesforceAuthService.getSalesforceConfig(userId);
      if (!config.isConnected) {
        throw new Error('Salesforce not connected');
      }

      // Sync Leads
      const leadResult = await this.syncLeads(userId);
      this.mergeResults(result, leadResult);

      // Sync Contacts
      const contactResult = await this.syncContacts(userId);
      this.mergeResults(result, contactResult);

      // Sync Cases
      const caseResult = await this.syncCases(userId);
      this.mergeResults(result, caseResult);

      // Process pending queue items
      await this.processPendingQueue(userId);

      this.logger.log(`Full sync completed for user ${userId}. Synced: ${result.synced}, Conflicts: ${result.conflicts}, Errors: ${result.errors}`);

    } catch (error) {
      this.logger.error(`Full sync failed for user ${userId}:`, error.message);
      result.success = false;
      result.details.errors.push(error.message);
      result.errors++;
    }

    return result;
  }

  /**
   * Sync leads bidirectionally
   */
  async syncLeads(userId: string): Promise<SyncResult> {
    this.logger.log(`Syncing leads for user ${userId}`);

    const result: SyncResult = {
      success: true,
      synced: 0,
      conflicts: 0,
      errors: 0,
      details: { created: 0, updated: 0, deleted: 0, conflicts: [], errors: [] }
    };

    try {
      // Get recent Salesforce leads (last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const salesforceLeads = await this.salesforceApiService.searchLeads(userId, {
        limit: 200
      });

      // Get local leads that need sync
      const localLeads = await this.getLocalLeadsForSync(userId);

      // Sync from Salesforce to local
      for (const sfLead of salesforceLeads.records || []) {
        try {
          const localLead = await this.findLocalLeadByEmail(sfLead.Email);
          
          if (localLead) {
            // Check for conflicts
            const conflicts = this.detectLeadConflicts(sfLead, localLead);
            if (conflicts.length > 0) {
              await this.logSyncConflict(userId, 'Lead', sfLead.Id, localLead.id, sfLead, localLead, conflicts);
              result.conflicts++;
              result.details.conflicts.push({
                objectType: 'Lead',
                objectId: sfLead.Id,
                salesforceData: sfLead,
                localData: localLead,
                conflictFields: conflicts
              });
              continue;
            }

            // Update local lead
            await this.updateLocalLead(localLead.id, sfLead);
            await this.logSyncSuccess(userId, 'Lead', sfLead.Id, localLead.id, 'UPDATE', 'INBOUND');
            result.details.updated++;
            result.synced++;
          } else {
            // Create local lead
            const newLocalLead = await this.createLocalLead(sfLead);
            await this.logSyncSuccess(userId, 'Lead', sfLead.Id, newLocalLead.id, 'CREATE', 'INBOUND');
            result.details.created++;
            result.synced++;
          }
        } catch (error) {
          this.logger.error(`Failed to sync lead ${sfLead.Id}:`, error.message);
          result.details.errors.push(`Lead ${sfLead.Id}: ${error.message}`);
          result.errors++;
        }
      }

      // Sync from local to Salesforce
      for (const localLead of localLeads) {
        try {
          if (!localLead.salesforceId) {
            // Create in Salesforce
            const createData = this.mapLocalLeadToSalesforce(localLead);
            const sfResult = await this.salesforceApiService.createLead(userId, createData);
            
            // Update local record with Salesforce ID
            await this.updateLocalLeadSalesforceId(localLead.id, sfResult.id);
            await this.logSyncSuccess(userId, 'Lead', sfResult.id, localLead.id, 'CREATE', 'OUTBOUND');
            result.details.created++;
            result.synced++;
          } else {
            // Update in Salesforce
            const updateData = this.mapLocalLeadToSalesforce(localLead);
            await this.salesforceApiService.updateLead(userId, localLead.salesforceId, updateData);
            await this.logSyncSuccess(userId, 'Lead', localLead.salesforceId, localLead.id, 'UPDATE', 'OUTBOUND');
            result.details.updated++;
            result.synced++;
          }
        } catch (error) {
          this.logger.error(`Failed to sync local lead ${localLead.id}:`, error.message);
          result.details.errors.push(`Local Lead ${localLead.id}: ${error.message}`);
          result.errors++;
        }
      }

    } catch (error) {
      this.logger.error(`Lead sync failed for user ${userId}:`, error.message);
      result.success = false;
      result.details.errors.push(error.message);
      result.errors++;
    }

    return result;
  }

  /**
   * Sync contacts bidirectionally
   */
  async syncContacts(userId: string): Promise<SyncResult> {
    this.logger.log(`Syncing contacts for user ${userId}`);

    const result: SyncResult = {
      success: true,
      synced: 0,
      conflicts: 0,
      errors: 0,
      details: { created: 0, updated: 0, deleted: 0, conflicts: [], errors: [] }
    };

    try {
      // Similar logic to syncLeads but for contacts
      const salesforceContacts = await this.salesforceApiService.searchContacts(userId, {
        limit: 200
      });

      const localContacts = await this.getLocalContactsForSync(userId);

      // Sync from Salesforce to local
      for (const sfContact of salesforceContacts.records || []) {
        try {
          const localContact = await this.findLocalContactByEmail(sfContact.Email);
          
          if (localContact) {
            const conflicts = this.detectContactConflicts(sfContact, localContact);
            if (conflicts.length > 0) {
              await this.logSyncConflict(userId, 'Contact', sfContact.Id, localContact.id, sfContact, localContact, conflicts);
              result.conflicts++;
              result.details.conflicts.push({
                objectType: 'Contact',
                objectId: sfContact.Id,
                salesforceData: sfContact,
                localData: localContact,
                conflictFields: conflicts
              });
              continue;
            }

            await this.updateLocalContact(localContact.id, sfContact);
            await this.logSyncSuccess(userId, 'Contact', sfContact.Id, localContact.id, 'UPDATE', 'INBOUND');
            result.details.updated++;
            result.synced++;
          } else {
            const newLocalContact = await this.createLocalContact(sfContact);
            await this.logSyncSuccess(userId, 'Contact', sfContact.Id, newLocalContact.id, 'CREATE', 'INBOUND');
            result.details.created++;
            result.synced++;
          }
        } catch (error) {
          this.logger.error(`Failed to sync contact ${sfContact.Id}:`, error.message);
          result.details.errors.push(`Contact ${sfContact.Id}: ${error.message}`);
          result.errors++;
        }
      }

      // Sync from local to Salesforce
      for (const localContact of localContacts) {
        try {
          if (!localContact.salesforceId) {
            const createData = this.mapLocalContactToSalesforce(localContact);
            const sfResult = await this.salesforceApiService.createContact(userId, createData);
            
            await this.updateLocalContactSalesforceId(localContact.id, sfResult.id);
            await this.logSyncSuccess(userId, 'Contact', sfResult.id, localContact.id, 'CREATE', 'OUTBOUND');
            result.details.created++;
            result.synced++;
          } else {
            const updateData = this.mapLocalContactToSalesforce(localContact);
            await this.salesforceApiService.updateContact(userId, localContact.salesforceId, updateData);
            await this.logSyncSuccess(userId, 'Contact', localContact.salesforceId, localContact.id, 'UPDATE', 'OUTBOUND');
            result.details.updated++;
            result.synced++;
          }
        } catch (error) {
          this.logger.error(`Failed to sync local contact ${localContact.id}:`, error.message);
          result.details.errors.push(`Local Contact ${localContact.id}: ${error.message}`);
          result.errors++;
        }
      }

    } catch (error) {
      this.logger.error(`Contact sync failed for user ${userId}:`, error.message);
      result.success = false;
      result.details.errors.push(error.message);
      result.errors++;
    }

    return result;
  }

  /**
   * Sync cases bidirectionally
   */
  async syncCases(userId: string): Promise<SyncResult> {
    this.logger.log(`Syncing cases for user ${userId}`);

    const result: SyncResult = {
      success: true,
      synced: 0,
      conflicts: 0,
      errors: 0,
      details: { created: 0, updated: 0, deleted: 0, conflicts: [], errors: [] }
    };

    try {
      const salesforceCases = await this.salesforceApiService.searchCases(userId, {
        limit: 100
      });

      const localCases = await this.getLocalCasesForSync(userId);

      // Sync logic similar to leads and contacts
      // Implementation would follow same pattern

    } catch (error) {
      this.logger.error(`Case sync failed for user ${userId}:`, error.message);
      result.success = false;
      result.details.errors.push(error.message);
      result.errors++;
    }

    return result;
  }

  /**
   * Queue item for offline sync
   */
  async queueForSync(userId: string, operation: string, objectType: string, data: any): Promise<void> {
    const queueKey = `${userId}:${objectType}`;
    
    if (!this.syncQueues.has(queueKey)) {
      this.syncQueues.set(queueKey, []);
    }

    this.syncQueues.get(queueKey).push({
      operation,
      objectType,
      data,
      timestamp: new Date(),
    });

    this.logger.log(`Queued ${operation} ${objectType} for user ${userId}`);
  }

  /**
   * Process pending queue items
   */
  async processPendingQueue(userId: string): Promise<void> {
    this.logger.log(`Processing pending queue for user ${userId}`);

    const objectTypes = ['Lead', 'Contact', 'Case'];
    
    for (const objectType of objectTypes) {
      const queueKey = `${userId}:${objectType}`;
      const queueItems = this.syncQueues.get(queueKey) || [];

      for (const item of queueItems) {
        try {
          await this.processQueueItem(userId, item);
        } catch (error) {
          this.logger.error(`Failed to process queue item for ${objectType}:`, error.message);
        }
      }

      // Clear processed items
      this.syncQueues.delete(queueKey);
    }
  }

  /**
   * Resolve sync conflict
   */
  async resolveConflict(
    conflictId: string, 
    resolution: 'USE_SALESFORCE' | 'USE_LOCAL' | 'MERGE',
    mergeData?: any
  ): Promise<void> {
    const conflict = await this.syncLogRepository.findOne({
      where: { id: conflictId, status: 'CONFLICT' }
    });

    if (!conflict) {
      throw new Error('Conflict not found');
    }

    try {
      let resolvedData: any;

      switch (resolution) {
        case 'USE_SALESFORCE':
          resolvedData = conflict.conflictData.salesforceData;
          await this.updateLocalObject(conflict.objectType, conflict.localObjectId, resolvedData);
          break;

        case 'USE_LOCAL':
          resolvedData = conflict.conflictData.localData;
          await this.updateSalesforceObject(conflict.userId, conflict.objectType, conflict.objectId, resolvedData);
          break;

        case 'MERGE':
          resolvedData = mergeData || this.mergeConflictData(
            conflict.conflictData.salesforceData,
            conflict.conflictData.localData
          );
          await this.updateLocalObject(conflict.objectType, conflict.localObjectId, resolvedData);
          await this.updateSalesforceObject(conflict.userId, conflict.objectType, conflict.objectId, resolvedData);
          break;
      }

      // Mark conflict as resolved
      conflict.status = 'SUCCESS';
      conflict.metadata = {
        ...conflict.metadata,
        resolvedBy: 'manual',
        resolutionStrategy: resolution,
      };
      conflict.processedAt = new Date();

      await this.syncLogRepository.save(conflict);

      this.logger.log(`Resolved conflict ${conflictId} using strategy: ${resolution}`);

    } catch (error) {
      this.logger.error(`Failed to resolve conflict ${conflictId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get sync conflicts for user
   */
  async getSyncConflicts(userId: string): Promise<SalesforceSyncLog[]> {
    return this.syncLogRepository.find({
      where: { userId, status: 'CONFLICT' },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get sync logs for user
   */
  async getSyncLogs(userId: string, limit: number = 50): Promise<SalesforceSyncLog[]> {
    return this.syncLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  /**
   * Automatic sync job (runs every 15 minutes)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAutomaticSync(): Promise<void> {
    this.logger.log('Running automatic sync job');

    try {
      // Get all users with active Salesforce connections
      const activeUsers = await this.getActiveUsers();

      for (const userId of activeUsers) {
        try {
          await this.performIncrementalSync(userId);
        } catch (error) {
          this.logger.error(`Automatic sync failed for user ${userId}:`, error.message);
        }
      }

    } catch (error) {
      this.logger.error('Automatic sync job failed:', error.message);
    }
  }

  /**
   * Perform incremental sync (only recent changes)
   */
  async performIncrementalSync(userId: string): Promise<SyncResult> {
    this.logger.log(`Performing incremental sync for user ${userId}`);

    // Get last sync timestamp
    const lastSync = await this.getLastSyncTimestamp(userId);
    const since = lastSync || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

    // Perform targeted sync for recent changes only
    // Implementation would filter by LastModifiedDate
    
    return this.performFullSync(userId);
  }

  // Helper methods (these would typically interact with your local database)
  private async getLocalLeadsForSync(userId: string): Promise<any[]> {
    // Implementation depends on your local lead storage
    return [];
  }

  private async findLocalLeadByEmail(email: string): Promise<any> {
    // Implementation depends on your local lead storage
    return null;
  }

  private detectLeadConflicts(salesforceLead: any, localLead: any): string[] {
    const conflicts: string[] = [];
    
    const fields = ['FirstName', 'LastName', 'Company', 'Phone', 'Status'];
    
    for (const field of fields) {
      if (salesforceLead[field] !== localLead[field] && 
          salesforceLead[field] && localLead[field]) {
        conflicts.push(field);
      }
    }
    
    return conflicts;
  }

  private detectContactConflicts(salesforceContact: any, localContact: any): string[] {
    const conflicts: string[] = [];
    
    const fields = ['FirstName', 'LastName', 'Phone', 'Title'];
    
    for (const field of fields) {
      if (salesforceContact[field] !== localContact[field] && 
          salesforceContact[field] && localContact[field]) {
        conflicts.push(field);
      }
    }
    
    return conflicts;
  }

  private mergeResults(target: SyncResult, source: SyncResult): void {
    target.synced += source.synced;
    target.conflicts += source.conflicts;
    target.errors += source.errors;
    target.details.created += source.details.created;
    target.details.updated += source.details.updated;
    target.details.deleted += source.details.deleted;
    target.details.conflicts.push(...source.details.conflicts);
    target.details.errors.push(...source.details.errors);
    
    if (!source.success) {
      target.success = false;
    }
  }

  private async logSyncSuccess(
    userId: string,
    objectType: string,
    salesforceId: string,
    localId: string,
    operation: string,
    direction: string
  ): Promise<void> {
    const log = this.syncLogRepository.create({
      userId,
      objectType,
      objectId: salesforceId,
      localObjectId: localId,
      operation: operation as any,
      direction: direction as any,
      status: 'SUCCESS',
      processedAt: new Date(),
    });

    await this.syncLogRepository.save(log);
  }

  private async logSyncConflict(
    userId: string,
    objectType: string,
    salesforceId: string,
    localId: string,
    salesforceData: any,
    localData: any,
    conflictFields: string[]
  ): Promise<void> {
    const log = this.syncLogRepository.create({
      userId,
      objectType,
      objectId: salesforceId,
      localObjectId: localId,
      operation: 'SYNC',
      direction: 'BIDIRECTIONAL',
      status: 'CONFLICT',
      conflictData: {
        salesforceData,
        localData,
        conflictFields,
      },
    });

    await this.syncLogRepository.save(log);
  }

  // Additional helper methods would be implemented based on your specific data models
  private async createLocalLead(salesforceLead: any): Promise<any> {
    // Implementation depends on your local lead storage
    return { id: 'local-id' };
  }

  private async updateLocalLead(localId: string, salesforceLead: any): Promise<void> {
    // Implementation depends on your local lead storage
  }

  private async updateLocalLeadSalesforceId(localId: string, salesforceId: string): Promise<void> {
    // Implementation depends on your local lead storage
  }

  private mapLocalLeadToSalesforce(localLead: any): any {
    // Map your local lead format to Salesforce format
    return {
      FirstName: localLead.firstName,
      LastName: localLead.lastName,
      Company: localLead.company,
      Email: localLead.email,
      Phone: localLead.phone,
      // ... other mappings
    };
  }

  private async getLocalContactsForSync(userId: string): Promise<any[]> {
    return [];
  }

  private async findLocalContactByEmail(email: string): Promise<any> {
    return null;
  }

  private async createLocalContact(salesforceContact: any): Promise<any> {
    return { id: 'local-contact-id' };
  }

  private async updateLocalContact(localId: string, salesforceContact: any): Promise<void> {
    // Implementation
  }

  private async updateLocalContactSalesforceId(localId: string, salesforceId: string): Promise<void> {
    // Implementation
  }

  private mapLocalContactToSalesforce(localContact: any): any {
    return {
      FirstName: localContact.firstName,
      LastName: localContact.lastName,
      Email: localContact.email,
      Phone: localContact.phone,
      // ... other mappings
    };
  }

  private async getLocalCasesForSync(userId: string): Promise<any[]> {
    return [];
  }

  private async processQueueItem(userId: string, item: any): Promise<void> {
    // Process queued sync item
  }

  private async updateLocalObject(objectType: string, localId: string, data: any): Promise<void> {
    // Update local object
  }

  private async updateSalesforceObject(userId: string, objectType: string, salesforceId: string, data: any): Promise<void> {
    // Update Salesforce object
  }

  private mergeConflictData(salesforceData: any, localData: any): any {
    // Intelligent merge strategy
    return { ...localData, ...salesforceData };
  }

  private async getActiveUsers(): Promise<string[]> {
    const activeTokens = await this.syncLogRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.userId')
      .where('log.createdAt > :since', { since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })
      .getRawMany();

    return activeTokens.map(token => token.userId);
  }

  private async getLastSyncTimestamp(userId: string): Promise<Date | null> {
    const lastLog = await this.syncLogRepository.findOne({
      where: { userId, status: 'SUCCESS' },
      order: { processedAt: 'DESC' }
    });

    return lastLog?.processedAt || null;
  }
}