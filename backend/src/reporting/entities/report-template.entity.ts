// 📊 CADILLAC EV CIS - Report Template Entity
// Predefined Swiss market report templates

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TemplateType {
  SALES_SUMMARY = 'sales_summary',
  CUSTOMER_ANALYTICS = 'customer_analytics',
  VEHICLE_PERFORMANCE = 'vehicle_performance',
  CANTON_ANALYSIS = 'canton_analysis',
  TCO_INSIGHTS = 'tco_insights',
  MARKETING_ROI = 'marketing_roi',
  DSGVO_COMPLIANCE = 'dsgvo_compliance',
  EXECUTIVE_DASHBOARD = 'executive_dashboard'
}

export enum TemplateFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  POWERPOINT = 'powerpoint'
}

@Entity('report_templates')
@Index(['type'])
@Index(['isActive'])
export class ReportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TemplateType })
  type: TemplateType;

  @Column({ type: 'enum', enum: TemplateFormat, default: TemplateFormat.PDF })
  defaultFormat: TemplateFormat;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isSystemTemplate: boolean; // System vs user-created templates

  // Template configuration
  @Column({ type: 'json' })
  config: {
    // Data sources
    dataSources: string[]; // customers, vehicles, tco_calculations, etc.
    
    // Swiss market specific settings
    swissMarketSettings: {
      includeCantonBreakdown: boolean;
      includeLanguageAnalysis: boolean;
      includeDsgvoMetrics: boolean;
      defaultCanton?: string;
    };
    
    // Chart configurations
    charts: Array<{
      type: 'bar' | 'line' | 'pie' | 'area' | 'table';
      title: string;
      dataSource: string;
      xAxis?: string;
      yAxis?: string;
      groupBy?: string;
      filters?: any[];
    }>;
    
    // Metrics to include
    metrics: string[]; // totalSales, revenue, conversionRate, etc.
    
    // Filters
    filters: {
      dateRange: boolean;
      canton: boolean;
      vehicleModel: boolean;
      salesperson: boolean;
      customerStatus: boolean;
      source: boolean;
      campaign: boolean;
    };
    
    // Layout settings
    layout: {
      orientation: 'portrait' | 'landscape';
      pageSize: 'A4' | 'A3' | 'Letter';
      includeHeader: boolean;
      includeFooter: boolean;
      includeTOC: boolean;
      includeSummary: boolean;
    };
    
    // Branding
    branding: {
      logo: boolean;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
      fonts: {
        heading: string;
        body: string;
      };
    };
    
    // Automation settings
    automation: {
      canBeScheduled: boolean;
      defaultSchedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      autoEmail: boolean;
      emailRecipients?: string[];
    };
  };

  // Multilingual support
  @Column({ type: 'json', nullable: true })
  translations?: {
    de: {
      name: string;
      description: string;
      sectionTitles: { [key: string]: string };
      labels: { [key: string]: string };
    };
    fr: {
      name: string;
      description: string;
      sectionTitles: { [key: string]: string };
      labels: { [key: string]: string };
    };
    it: {
      name: string;
      description: string;
      sectionTitles: { [key: string]: string };
      labels: { [key: string]: string };
    };
  };

  // Template SQL queries for data extraction
  @Column({ type: 'json', nullable: true })
  queries?: {
    [dataSource: string]: {
      sql: string;
      parameters: string[];
      description: string;
    };
  };

  // Template validation rules
  @Column({ type: 'json', nullable: true })
  validationRules?: {
    requiredFilters: string[];
    dateRangeLimit: number; // in days
    minimumDataPoints: number;
    accessLevel: 'public' | 'internal' | 'restricted' | 'confidential';
  };

  // Usage statistics
  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsed?: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  // Version control
  @Column({ type: 'varchar', length: 20, default: '1.0.0' })
  version: string;

  @Column({ type: 'uuid', nullable: true })
  parentTemplateId?: string; // For template inheritance

  @Column({ type: 'text', nullable: true })
  changeLog?: string;

  // Creator information
  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}