export interface CreateReportDto {
  name: string;
  type: string;
  period: string;
  format: string;
  templateId?: string;
}

// Basic types to prevent import errors
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type TemplateType = 'sales' | 'customer' | 'vehicle' | 'analytics';
export type TemplateFormat = 'pdf' | 'excel' | 'csv' | 'json';