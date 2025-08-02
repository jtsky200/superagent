import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { SalesforceSyncLog } from '../entities/salesforce-sync-log.entity';
import { SalesforceSyncService } from './salesforce-sync.service';

export interface SalesforceWebhookPayload {
  event: {
    type: string;
    createdDate: string;
    replayId: number;
  };
  sobject: {
    Id: string;
    [key: string]: any;
  };
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'UNDELETE';
  changedFields?: string[];
}

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
}

@Injectable()
export class SalesforceWebhookService {
  private readonly logger = new Logger(SalesforceWebhookService.name);

  constructor(
    @InjectRepository(SalesforceSyncLog)
    private syncLogRepository: Repository<SalesforceSyncLog>,
    private salesforceSyncService: SalesforceSyncService,
    private configService: ConfigService,
  ) {}

  /**
   * Verify webhook signature from Salesforce
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string
  ): WebhookVerificationResult {
    try {
      const webhookSecret = this.configService.get<string>('SALESFORCE_WEBHOOK_SECRET');
      
      if (!webhookSecret) {
        this.logger.error('Webhook secret not configured');
        return { isValid: false, error: 'Webhook secret not configured' };
      }

      // Salesforce uses HMAC-SHA256
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload + timestamp)
        .digest('base64');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expectedSignature, 'base64')
      );

      if (!isValid) {
        this.logger.warn('Invalid webhook signature received');
        return { isValid: false, error: 'Invalid signature' };
      }

      // Check timestamp to prevent replay attacks (within 5 minutes)
      const webhookTime = parseInt(timestamp);
      const currentTime = Date.now();
      const timeDiff = Math.abs(currentTime - webhookTime);
      const maxAge = 5 * 60 * 1000; // 5 minutes

      if (timeDiff > maxAge) {
        this.logger.warn(`Webhook timestamp too old: ${timeDiff}ms`);
        return { isValid: false, error: 'Timestamp too old' };
      }

      return { isValid: true };

    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error.message);
      return { isValid: false, error: 'Signature verification failed' };
    }
  }

  /**
   * Process incoming webhook from Salesforce
   */
  async processWebhook(payload: SalesforceWebhookPayload): Promise<void> {
    this.logger.log(`Processing webhook: ${payload.changeType} ${payload.sobject.Id}`);

    try {
      // Determine the object type from the sobject data
      const objectType = this.extractObjectType(payload.sobject);
      
      if (!this.isSupportedObjectType(objectType)) {
        this.logger.log(`Ignoring webhook for unsupported object type: ${objectType}`);
        return;
      }

      // Find affected users (those who have this object in their local system)
      const affectedUsers = await this.findAffectedUsers(payload.sobject.Id, objectType);

      if (affectedUsers.length === 0) {
        this.logger.log(`No local users affected by ${objectType} ${payload.sobject.Id}`);
        return;
      }

      // Process webhook for each affected user
      for (const userId of affectedUsers) {
        await this.processWebhookForUser(userId, payload, objectType);
      }

    } catch (error) {
      this.logger.error('Error processing webhook:', error.message);
      throw error;
    }
  }

  /**
   * Process webhook for a specific user
   */
  private async processWebhookForUser(
    userId: string,
    payload: SalesforceWebhookPayload,
    objectType: string
  ): Promise<void> {
    try {
      switch (payload.changeType) {
        case 'CREATE':
          await this.handleCreateWebhook(userId, payload, objectType);
          break;
        case 'UPDATE':
          await this.handleUpdateWebhook(userId, payload, objectType);
          break;
        case 'DELETE':
          await this.handleDeleteWebhook(userId, payload, objectType);
          break;
        case 'UNDELETE':
          await this.handleUndeleteWebhook(userId, payload, objectType);
          break;
        default:
          this.logger.warn(`Unsupported change type: ${payload.changeType}`);
      }

    } catch (error) {
      this.logger.error(`Error processing webhook for user ${userId}:`, error.message);
      
      // Log the error but don't throw - we don't want to fail other users
      await this.logWebhookError(userId, payload, objectType, error.message);
    }
  }

  /**
   * Handle CREATE webhook events
   */
  private async handleCreateWebhook(
    userId: string,
    payload: SalesforceWebhookPayload,
    objectType: string
  ): Promise<void> {
    this.logger.log(`Handling CREATE webhook for ${objectType} ${payload.sobject.Id}`);

    // Check if we already have this object locally
    const existsLocally = await this.checkObjectExistsLocally(payload.sobject.Id, objectType);
    
    if (existsLocally) {
      this.logger.log(`Object ${payload.sobject.Id} already exists locally, skipping create`);
      return;
    }

    // Create local record from Salesforce data
    await this.createLocalObjectFromSalesforce(userId, payload.sobject, objectType);

    // Log successful sync
    await this.logWebhookSuccess(userId, payload, objectType, 'CREATE', 'INBOUND');
  }

  /**
   * Handle UPDATE webhook events
   */
  private async handleUpdateWebhook(
    userId: string,
    payload: SalesforceWebhookPayload,
    objectType: string
  ): Promise<void> {
    this.logger.log(`Handling UPDATE webhook for ${objectType} ${payload.sobject.Id}`);

    // Get local object
    const localObject = await this.getLocalObject(payload.sobject.Id, objectType);
    
    if (!localObject) {
      // Object doesn't exist locally, create it
      await this.handleCreateWebhook(userId, payload, objectType);
      return;
    }

    // Check for conflicts with local changes
    const hasLocalChanges = await this.checkForLocalChanges(localObject, payload.sobject);
    
    if (hasLocalChanges) {
      // Log conflict for manual resolution
      await this.logSyncConflict(
        userId,
        objectType,
        payload.sobject.Id,
        localObject.id,
        payload.sobject,
        localObject,
        payload.changedFields || []
      );
      return;
    }

    // Update local object with Salesforce data
    await this.updateLocalObjectFromSalesforce(localObject.id, payload.sobject, objectType);

    // Log successful sync
    await this.logWebhookSuccess(userId, payload, objectType, 'UPDATE', 'INBOUND');
  }

  /**
   * Handle DELETE webhook events
   */
  private async handleDeleteWebhook(
    userId: string,
    payload: SalesforceWebhookPayload,
    objectType: string
  ): Promise<void> {
    this.logger.log(`Handling DELETE webhook for ${objectType} ${payload.sobject.Id}`);

    // Get local object
    const localObject = await this.getLocalObject(payload.sobject.Id, objectType);
    
    if (!localObject) {
      this.logger.log(`Object ${payload.sobject.Id} not found locally, skipping delete`);
      return;
    }

    // Soft delete or mark as deleted (depending on your business logic)
    await this.markLocalObjectAsDeleted(localObject.id, objectType);

    // Log successful sync
    await this.logWebhookSuccess(userId, payload, objectType, 'DELETE', 'INBOUND');
  }

  /**
   * Handle UNDELETE webhook events
   */
  private async handleUndeleteWebhook(
    userId: string,
    payload: SalesforceWebhookPayload,
    objectType: string
  ): Promise<void> {
    this.logger.log(`Handling UNDELETE webhook for ${objectType} ${payload.sobject.Id}`);

    // Restore local object or create if it doesn't exist
    const localObject = await this.getLocalObject(payload.sobject.Id, objectType);
    
    if (localObject) {
      await this.restoreLocalObject(localObject.id, objectType);
    } else {
      await this.createLocalObjectFromSalesforce(userId, payload.sobject, objectType);
    }

    // Log successful sync
    await this.logWebhookSuccess(userId, payload, objectType, 'SYNC', 'INBOUND');
  }

  /**
   * Setup webhook subscription in Salesforce
   */
  async setupWebhookSubscription(userId: string, objectTypes: string[]): Promise<void> {
    this.logger.log(`Setting up webhook subscription for user ${userId}`);

    try {
      // This would typically involve:
      // 1. Creating a PushTopic or Platform Event subscription in Salesforce
      // 2. Configuring the webhook endpoint URL
      // 3. Setting up the appropriate SOQL queries

      // Example PushTopic creation (this would be done via Salesforce API)
      for (const objectType of objectTypes) {
        const pushTopicName = `CadillacEV_${objectType}_Changes`;
        const query = this.buildSOQLQueryForWebhook(objectType);
        
        // This would create a PushTopic in Salesforce
        // await this.salesforceApiService.createPushTopic(userId, {
        //   Name: pushTopicName,
        //   Query: query,
        //   ApiVersion: 60.0,
        //   NotifyForOperationCreate: true,
        //   NotifyForOperationUpdate: true,
        //   NotifyForOperationDelete: true,
        //   NotifyForOperationUndelete: true,
        //   NotifyForFields: 'All'
        // });

        this.logger.log(`Created webhook subscription for ${objectType}`);
      }

    } catch (error) {
      this.logger.error(`Failed to setup webhook subscription for user ${userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Remove webhook subscription
   */
  async removeWebhookSubscription(userId: string): Promise<void> {
    this.logger.log(`Removing webhook subscription for user ${userId}`);

    try {
      // Remove PushTopics or Platform Event subscriptions
      // This would query and delete the relevant subscriptions in Salesforce

    } catch (error) {
      this.logger.error(`Failed to remove webhook subscription for user ${userId}:`, error.message);
      throw error;
    }
  }

  // Helper methods

  private extractObjectType(sobject: any): string {
    // Extract object type from Salesforce object data
    // This could be from the sobject attributes or inferred from the Id prefix
    if (sobject.attributes?.type) {
      return sobject.attributes.type;
    }
    
    // Fallback: infer from ID prefix
    const idPrefix = sobject.Id?.substring(0, 3);
    const objectTypeMap: Record<string, string> = {
      '00Q': 'Lead',
      '003': 'Contact',
      '001': 'Account',
      '500': 'Case',
      '006': 'Opportunity',
      '00T': 'Task',
      '00U': 'Event',
    };
    
    return objectTypeMap[idPrefix] || 'Unknown';
  }

  private isSupportedObjectType(objectType: string): boolean {
    const supportedTypes = ['Lead', 'Contact', 'Account', 'Case', 'Task', 'Event'];
    return supportedTypes.includes(objectType);
  }

  private async findAffectedUsers(salesforceId: string, objectType: string): Promise<string[]> {
    // Query sync logs to find users who have this object
    const logs = await this.syncLogRepository.find({
      where: { objectId: salesforceId, objectType },
      select: ['userId']
    });

    return [...new Set(logs.map(log => log.userId))];
  }

  private buildSOQLQueryForWebhook(objectType: string): string {
    const fieldMaps: Record<string, string[]> = {
      'Lead': ['Id', 'FirstName', 'LastName', 'Company', 'Email', 'Phone', 'Status', 'LastModifiedDate'],
      'Contact': ['Id', 'FirstName', 'LastName', 'Email', 'Phone', 'AccountId', 'LastModifiedDate'],
      'Case': ['Id', 'Subject', 'Status', 'Priority', 'ContactId', 'AccountId', 'LastModifiedDate'],
      'Account': ['Id', 'Name', 'Type', 'Industry', 'LastModifiedDate'],
    };

    const fields = fieldMaps[objectType] || ['Id', 'LastModifiedDate'];
    return `SELECT ${fields.join(', ')} FROM ${objectType}`;
  }

  private async checkObjectExistsLocally(salesforceId: string, objectType: string): Promise<boolean> {
    // This would check your local database for the object
    // Implementation depends on your local data model
    return false;
  }

  private async createLocalObjectFromSalesforce(userId: string, salesforceObject: any, objectType: string): Promise<void> {
    // Create local object from Salesforce data
    // Implementation depends on your local data model
    this.logger.log(`Creating local ${objectType} from Salesforce data`);
  }

  private async getLocalObject(salesforceId: string, objectType: string): Promise<any> {
    // Get local object by Salesforce ID
    // Implementation depends on your local data model
    return null;
  }

  private async checkForLocalChanges(localObject: any, salesforceObject: any): Promise<boolean> {
    // Check if local object has been modified since last sync
    // This could compare timestamps or use a dirty flag
    return false;
  }

  private async updateLocalObjectFromSalesforce(localId: string, salesforceObject: any, objectType: string): Promise<void> {
    // Update local object with Salesforce data
    // Implementation depends on your local data model
    this.logger.log(`Updating local ${objectType} ${localId} from Salesforce`);
  }

  private async markLocalObjectAsDeleted(localId: string, objectType: string): Promise<void> {
    // Mark local object as deleted (soft delete)
    // Implementation depends on your local data model
    this.logger.log(`Marking local ${objectType} ${localId} as deleted`);
  }

  private async restoreLocalObject(localId: string, objectType: string): Promise<void> {
    // Restore previously deleted local object
    // Implementation depends on your local data model
    this.logger.log(`Restoring local ${objectType} ${localId}`);
  }

  private async logWebhookSuccess(
    userId: string,
    payload: SalesforceWebhookPayload,
    objectType: string,
    operation: string,
    direction: string
  ): Promise<void> {
    const log = this.syncLogRepository.create({
      userId,
      objectType,
      objectId: payload.sobject.Id,
      localObjectId: 'webhook-generated', // Would be actual local ID
      operation: operation as any,
      direction: direction as any,
      status: 'SUCCESS',
      syncData: payload,
      processedAt: new Date(),
    });

    await this.syncLogRepository.save(log);
  }

  private async logWebhookError(
    userId: string,
    payload: SalesforceWebhookPayload,
    objectType: string,
    error: string
  ): Promise<void> {
    const log = this.syncLogRepository.create({
      userId,
      objectType,
      objectId: payload.sobject.Id,
      localObjectId: 'webhook-error',
      operation: 'SYNC',
      direction: 'INBOUND',
      status: 'FAILED',
      errorMessage: error,
      syncData: payload,
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
}