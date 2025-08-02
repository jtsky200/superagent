import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('salesforce_tokens')
export class SalesforceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column('text')
  accessToken: string;

  @Column('text')
  refreshToken: string;

  @Column()
  instanceUrl: string;

  @Column()
  salesforceUserId: string;

  @Column()
  tokenType: string;

  @Column()
  issuedAt: string;

  @Column('text')
  signature: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Additional metadata
  @Column({ type: 'json', nullable: true })
  userInfo: {
    username: string;
    display_name: string;
    email: string;
    organization_id: string;
  };

  @Column({ default: 'sandbox' })
  environment: 'sandbox' | 'production';

  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;
}