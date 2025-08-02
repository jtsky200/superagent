// 📊 CADILLAC EV CIS - Sales Report Entity
// Swiss market sales statistics tracking

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Entity('sales_reports')
@Index(['period', 'startDate', 'endDate'])
@Index(['canton'])
@Index(['status'])
export class SalesReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ReportPeriod })
  period: ReportPeriod;

  @Column({ type: 'date' })
  @Index()
  startDate: Date;

  @Column({ type: 'date' })
  @Index()
  endDate: Date;

  @Column({ type: 'varchar', length: 2, nullable: true })
  canton?: string; // Swiss canton filter

  @Column({ type: 'varchar', length: 10, nullable: true })
  vehicleModel?: string; // LYRIQ, VISTIQ, etc.

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  // Sales metrics
  @Column({ type: 'int', default: 0 })
  totalLeads: number;

  @Column({ type: 'int', default: 0 })
  totalProspects: number;

  @Column({ type: 'int', default: 0 })
  totalCustomers: number;

  @Column({ type: 'int', default: 0 })
  totalSales: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number; // Lead to customer conversion %

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  averageOrderValue: number;

  @Column({ type: 'int', default: 0 })
  tcoCalculations: number;

  // Swiss market specific metrics
  @Column({ type: 'json', nullable: true })
  cantonBreakdown?: {
    [canton: string]: {
      leads: number;
      prospects: number;
      customers: number;
      sales: number;
      revenue: number;
    };
  };

  @Column({ type: 'json', nullable: true })
  vehicleBreakdown?: {
    [model: string]: {
      interest: number;
      sales: number;
      revenue: number;
    };
  };

  @Column({ type: 'json', nullable: true })
  languageBreakdown?: {
    de: number;
    fr: number;
    it: number;
    en: number;
  };

  // Performance metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics?: {
    topPerformingCantons: string[];
    topPerformingVehicles: string[];
    averageLeadResponseTime: number; // in hours
    customerSatisfactionScore?: number;
    marketingROI?: number;
  };

  // DSGVO compliance tracking
  @Column({ type: 'int', default: 0 })
  dsgvoCompliantLeads: number;

  @Column({ type: 'int', default: 0 })
  marketingConsentRate: number;

  @Column({ type: 'json', nullable: true })
  dataComplianceMetrics?: {
    consentRate: number;
    optOutRate: number;
    dataRetentionCompliance: number;
  };

  // Report metadata
  @Column({ type: 'varchar', length: 100, nullable: true })
  generatedBy?: string; // User ID or system

  @Column({ type: 'varchar', length: 255, nullable: true })
  filePath?: string; // Path to generated report file

  @Column({ type: 'varchar', length: 50, nullable: true })
  fileFormat?: string; // PDF, Excel, CSV, etc.

  @Column({ type: 'int', nullable: true })
  fileSize?: number; // File size in bytes

  @Column({ type: 'timestamp', nullable: true })
  generatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date; // Report expiration date

  @Column({ type: 'json', nullable: true })
  filters?: {
    salesperson?: string;
    source?: string;
    campaign?: string;
    vehicleInterest?: string;
    status?: string[];
    ageRange?: string;
    budgetRange?: string;
  };

  @Column({ type: 'json', nullable: true })
  chartData?: {
    salesTrend: Array<{ date: string; value: number }>;
    cantonDistribution: Array<{ canton: string; value: number }>;
    vehiclePreferences: Array<{ model: string; value: number }>;
    conversionFunnel: Array<{ stage: string; count: number }>;
    monthlyComparison: Array<{ month: string; current: number; previous: number }>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}