import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('salesforce_sync_logs')
export class SalesforceSyncLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  objectType: string; // Lead, Contact, Case, etc.

  @Column()
  objectId: string; // Salesforce object ID

  @Column()
  localObjectId: string; // Local system object ID

  @Column()
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC';

  @Column()
  direction: 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';

  @Column()
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CONFLICT';

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'json', nullable: true })
  conflictData: {
    salesforceData: any;
    localData: any;
    conflictFields: string[];
  };

  @Column({ type: 'json', nullable: true })
  syncData: any;

  @Column({ type: 'json', nullable: true })
  metadata: {
    retryCount?: number;
    lastRetryAt?: Date;
    resolvedBy?: string;
    resolutionStrategy?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;
}