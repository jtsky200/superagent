import { z } from 'zod';

// Base Analytics Event Schema
export const AnalyticsEventSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'page_view',
    'button_click',
    'form_submission',
    'test_drive_booking',
    'brochure_download',
    'configurator_use',
    'phone_call',
    'email_open',
    'email_click',
    'showroom_visit',
    'purchase_completed'
  ]),
  customerId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.date(),
  properties: z.record(z.string(), z.any()),
  source: z.enum(['website', 'email', 'phone', 'showroom', 'social', 'ads']),
  campaign: z.string().optional(),
  value: z.number().optional()
});

// Customer Journey Schema
export const CustomerJourneySchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(['prospect', 'qualified', 'negotiation', 'closed', 'lost']),
  totalValue: z.number(),
  journeyStart: z.date(),
  lastActivity: z.date(),
  conversionProbability: z.number().min(0).max(100),
  stageProgress: z.object({
    awareness: z.number().min(0).max(100),
    interest: z.number().min(0).max(100),
    consideration: z.number().min(0).max(100),
    purchase: z.number().min(0).max(100)
  }),
  touchPoints: z.array(z.object({
    id: z.string(),
    type: z.enum(['website', 'email', 'phone', 'showroom', 'test_drive', 'consultation', 'purchase']),
    timestamp: z.date(),
    duration: z.number().optional(),
    details: z.record(z.string(), z.string()),
    value: z.number().optional()
  }))
});

// Sales Funnel Stage Schema
export const FunnelStageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  prospects: z.number(),
  conversionRate: z.number(),
  avgDealSize: z.number(),
  avgTimeInStage: z.number(),
  dropOffRate: z.number(),
  previousPeriodProspects: z.number().optional(),
  previousPeriodConversion: z.number().optional()
});

// Marketing Campaign Schema
export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['digital', 'traditional', 'events', 'content', 'social']),
  status: z.enum(['active', 'paused', 'completed']),
  budget: z.number(),
  spent: z.number(),
  startDate: z.date(),
  endDate: z.date(),
  metrics: z.object({
    impressions: z.number(),
    clicks: z.number(),
    leads: z.number(),
    qualifiedLeads: z.number(),
    testDrives: z.number(),
    sales: z.number(),
    revenue: z.number()
  })
});

// ROI Calculation Schema
export const ROICalculationSchema = z.object({
  campaignId: z.string(),
  totalInvestment: z.number(),
  totalRevenue: z.number(),
  roi: z.number(),
  roas: z.number(),
  costPerLead: z.number(),
  costPerAcquisition: z.number(),
  customerLifetimeValue: z.number(),
  paybackPeriod: z.number(),
  profitMargin: z.number(),
  efficiency: z.object({
    ctr: z.number(),
    conversionRate: z.number(),
    leadQuality: z.number(),
    salesConversion: z.number()
  })
});

// Prediction Model Schema
export const PredictionModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['sales_forecast', 'customer_scoring', 'churn_prediction', 'demand_forecast']),
  accuracy: z.number().min(0).max(100),
  lastTrained: z.date(),
  status: z.enum(['active', 'training', 'outdated']),
  parameters: z.record(z.string(), z.any()),
  features: z.array(z.string()),
  trainingData: z.object({
    size: z.number(),
    period: z.string(),
    quality: z.number()
  })
});

// Sales Forecast Schema
export const SalesForecastSchema = z.object({
  period: z.string(),
  predicted: z.number(),
  confidence: z.number().min(0).max(100),
  factors: z.array(z.object({
    factor: z.string(),
    impact: z.number(),
    trend: z.enum(['positive', 'negative', 'neutral'])
  })),
  modelId: z.string(),
  generatedAt: z.date()
});

// Customer Score Schema
export const CustomerScoreSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  score: z.number().min(0).max(100),
  tier: z.enum(['high', 'medium', 'low']),
  probability: z.number().min(0).max(100),
  factors: z.object({
    engagement: z.number().min(0).max(100),
    financial: z.number().min(0).max(100),
    behavioral: z.number().min(0).max(100),
    demographic: z.number().min(0).max(100)
  }),
  recommendedActions: z.array(z.string()),
  projectedValue: z.number(),
  lastUpdated: z.date(),
  modelId: z.string()
});

// Churn Risk Schema
export const ChurnRiskSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  riskLevel: z.enum(['high', 'medium', 'low']),
  probability: z.number().min(0).max(100),
  daysToChurn: z.number(),
  retentionValue: z.number(),
  riskFactors: z.array(z.string()),
  interventions: z.array(z.string()),
  lastUpdated: z.date(),
  modelId: z.string()
});

// KPI Metric Schema
export const KPIMetricSchema = z.object({
  id: z.string(),
  title: z.string(),
  value: z.union([z.string(), z.number()]),
  change: z.object({
    value: z.number(),
    isPositive: z.boolean(),
    period: z.string()
  }),
  category: z.enum(['overview', 'customer', 'sales', 'marketing', 'operational']),
  target: z.number().optional(),
  unit: z.string().optional(),
  trend: z.array(z.number()).optional(),
  timestamp: z.date()
});

// Dashboard Configuration Schema
export const DashboardConfigSchema = z.object({
  userId: z.string(),
  layout: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number()
    }),
    config: z.record(z.string(), z.any())
  })),
  filters: z.record(z.string(), z.any()),
  refreshInterval: z.number(),
  lastModified: z.date()
});

// Export types
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export type CustomerJourney = z.infer<typeof CustomerJourneySchema>;
export type FunnelStage = z.infer<typeof FunnelStageSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type ROICalculation = z.infer<typeof ROICalculationSchema>;
export type PredictionModel = z.infer<typeof PredictionModelSchema>;
export type SalesForecast = z.infer<typeof SalesForecastSchema>;
export type CustomerScore = z.infer<typeof CustomerScoreSchema>;
export type ChurnRisk = z.infer<typeof ChurnRiskSchema>;
export type KPIMetric = z.infer<typeof KPIMetricSchema>;
export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;