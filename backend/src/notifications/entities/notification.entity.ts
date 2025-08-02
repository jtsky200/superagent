// 🔔 CADILLAC EV CIS - Notification Entity
// Swiss market notification tracking and management

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum NotificationType {
  // Customer events
  NEW_CUSTOMER = 'new_customer',
  CUSTOMER_UPDATED = 'customer_updated',
  CUSTOMER_STATUS_CHANGED = 'customer_status_changed',
  
  // Sales events
  NEW_LEAD = 'new_lead',
  LEAD_QUALIFIED = 'lead_qualified',
  SALE_COMPLETED = 'sale_completed',
  FOLLOW_UP_REQUIRED = 'follow_up_required',
  
  // Vehicle events
  TEST_DRIVE_REQUESTED = 'test_drive_requested',
  TEST_DRIVE_COMPLETED = 'test_drive_completed',
  VEHICLE_DELIVERED = 'vehicle_delivered',
  
  // TCO events
  TCO_CALCULATION_REQUESTED = 'tco_calculation_requested',
  TCO_CALCULATION_COMPLETED = 'tco_calculation_completed',
  
  // Marketing events
  CAMPAIGN_STARTED = 'campaign_started',
  CAMPAIGN_COMPLETED = 'campaign_completed',
  
  // System events
  REPORT_GENERATED = 'report_generated',
  DATA_EXPORT_READY = 'data_export_ready',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  
  // Swiss compliance events
  DSGVO_CONSENT_REQUIRED = 'dsgvo_consent_required',
  DSGVO_DATA_REQUEST = 'dsgvo_data_request',
  COMPLIANCE_AUDIT = 'compliance_audit',
  
  // Service events
  SERVICE_REMINDER = 'service_reminder',
  WARRANTY_EXPIRING = 'warranty_expiring',
  RECALL_NOTICE = 'recall_notice'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook'
}

@Entity('notifications')
@Index(['type', 'status'])
@Index(['recipientUserId', 'status'])
@Index(['recipientCustomerId'])
@Index(['priority', 'createdAt'])
@Index(['scheduledAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationType })
  @Index()
  type: NotificationType;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  htmlMessage?: string;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.NORMAL })
  @Index()
  priority: NotificationPriority;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  @Index()
  status: NotificationStatus;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  // Recipients
  @Column({ type: 'uuid', nullable: true })
  @Index()
  recipientUserId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recipientUserId' })
  recipientUser?: User;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  recipientCustomerId?: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'recipientCustomerId' })
  recipientCustomer?: Customer;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recipientEmail?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  recipientPhone?: string;

  // Swiss market specific fields
  @Column({ type: 'varchar', length: 2, nullable: true })
  canton?: string;

  @Column({ type: 'varchar', length: 5, default: 'de' })
  language: string; // de, fr, it, en

  // Scheduling
  @Column({ type: 'timestamp', nullable: true })
  @Index()
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  // Metadata and context
  @Column({ type: 'json', nullable: true })
  metadata?: {
    // Related entity information
    entityType?: string; // customer, vehicle, tco_calculation, etc.
    entityId?: string;
    
    // Swiss market context
    vehicleModel?: string; // LYRIQ, VISTIQ
    dealerLocation?: string;
    serviceCenter?: string;
    
    // Marketing context
    campaignId?: string;
    sourceChannel?: string;
    
    // Compliance context
    dsgvoReference?: string;
    dataRetentionDays?: number;
    
    // Custom data
    customData?: any;
  };

  // Template information
  @Column({ type: 'uuid', nullable: true })
  templateId?: string;

  @Column({ type: 'json', nullable: true })
  templateVariables?: { [key: string]: any };

  // Delivery tracking
  @Column({ type: 'json', nullable: true })
  deliveryInfo?: {
    // Email delivery
    emailProvider?: string;
    emailMessageId?: string;
    
    // SMS delivery
    smsProvider?: string;
    smsMessageId?: string;
    
    // Push notification
    pushProvider?: string;
    pushMessageId?: string;
    
    // Delivery attempts
    attemptCount?: number;
    lastAttemptAt?: Date;
    nextRetryAt?: Date;
    
    // Error information
    errorMessage?: string;
    errorCode?: string;
  };

  // User interaction tracking
  @Column({ type: 'json', nullable: true })
  interactionInfo?: {
    openedAt?: Date;
    clickedAt?: Date;
    clickedUrls?: string[];
    unsubscribedAt?: Date;
    reportedSpam?: boolean;
    deviceInfo?: {
      userAgent?: string;
      ipAddress?: string;
      deviceType?: string;
    };
  };

  // Retry and error handling
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt?: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  errorCode?: string;

  // Swiss compliance tracking
  @Column({ type: 'boolean', default: false })
  dsgvoProcessed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  dataRetentionExpiresAt?: Date;

  @Column({ type: 'boolean', default: false })
  consentRequired: boolean;

  @Column({ type: 'boolean', default: false })
  consentObtained: boolean;

  @Column({ type: 'timestamp', nullable: true })
  consentObtainedAt?: Date;

  // Audit trail
  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  triggeredBy?: string; // Event or user that triggered the notification

  @Column({ type: 'varchar', length: 200, nullable: true })
  triggerEvent?: string; // Specific event that triggered this notification

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}