// ===== CUSTOMER TYPES =====

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  canton?: SwissCanton;
  country: string;
  customerType: CustomerType;
  createdAt: Date;
  updatedAt: Date;
}

export enum CustomerType {
  PRIVATE = 'private',
  BUSINESS = 'business'
}

export interface Company {
  id: string;
  customerId: string;
  companyName: string;
  uidNumber?: string; // UID/HR-Nummer
  vatNumber?: string; // MwSt-Nummer
  legalForm?: LegalForm;
  foundingDate?: Date;
  employeesCount?: number;
  annualRevenue?: number;
  industryCode?: string; // NOGA-Code
  industryDescription?: string;
  creditRating?: CreditRating;
  createdAt: Date;
  updatedAt: Date;
}

export enum LegalForm {
  AG = 'AG',
  GMBH = 'GmbH',
  SARL = 'Sàrl',
  SA = 'SA',
  EINZELFIRMA = 'Einzelfirma',
  KOLLEKTIVGESELLSCHAFT = 'Kollektivgesellschaft',
  KOMMANDITGESELLSCHAFT = 'Kommanditgesellschaft',
  GENOSSENSCHAFT = 'Genossenschaft',
  VEREIN = 'Verein',
  STIFTUNG = 'Stiftung'
}

export enum CreditRating {
  AAA = 'AAA',
  AA = 'AA',
  A = 'A',
  BBB = 'BBB',
  BB = 'BB',
  B = 'B',
  CCC = 'CCC',
  CC = 'CC',
  C = 'C',
  D = 'D'
}

export interface CompanyContact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  position?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  isDecisionMaker: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== VEHICLE TYPES =====

export interface Vehicle {
  id: string;
  modelName: string;
  modelYear: number;
  modelVariant: VehicleVariant;
  batteryCapacityKwh: number;
  wltpRangeKm: number;
  powerKw: number;
  torqueNm: number;
  weightKg: number;
  basePriceChf: number;
  energyConsumptionKwh100km: number;
  chargingPowerAcKw: number;
  chargingPowerDcKw: number;
  acceleration0To100Sec?: number;
  topSpeedKmh?: number;
  cargoCapacityLiters?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum VehicleVariant {
  LUXURY = 'Luxury',
  PREMIUM = 'Premium',
  SPORT = 'Sport',
  STANDARD = 'Standard'
}

export interface VehicleConfiguration {
  id: string;
  vehicleId: string;
  customerId: string;
  exteriorColor?: string;
  interiorColor?: string;
  wheelSize?: number;
  options: VehicleOption[];
  totalPriceChf: number;
  configurationDate: Date;
  status: ConfigurationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleOption {
  id: string;
  name: string;
  description?: string;
  priceChf: number;
  category: OptionCategory;
}

export enum OptionCategory {
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  TECHNOLOGY = 'technology',
  PERFORMANCE = 'performance',
  SAFETY = 'safety',
  COMFORT = 'comfort'
}

export enum ConfigurationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ORDERED = 'ordered'
}

// ===== SWISS DATA TYPES =====

export enum SwissCanton {
  AG = 'AG', // Aargau
  AI = 'AI', // Appenzell Innerrhoden
  AR = 'AR', // Appenzell Ausserrhoden
  BE = 'BE', // Bern
  BL = 'BL', // Basel-Landschaft
  BS = 'BS', // Basel-Stadt
  FR = 'FR', // Freiburg
  GE = 'GE', // Genf
  GL = 'GL', // Glarus
  GR = 'GR', // Graubünden
  JU = 'JU', // Jura
  LU = 'LU', // Luzern
  NE = 'NE', // Neuenburg
  NW = 'NW', // Nidwalden
  OW = 'OW', // Obwalden
  SG = 'SG', // St. Gallen
  SH = 'SH', // Schaffhausen
  SO = 'SO', // Solothurn
  SZ = 'SZ', // Schwyz
  TG = 'TG', // Thurgau
  TI = 'TI', // Tessin
  UR = 'UR', // Uri
  VD = 'VD', // Waadt
  VS = 'VS', // Wallis
  ZG = 'ZG', // Zug
  ZH = 'ZH'  // Zürich
}

export interface Canton {
  id: string;
  name: string;
  abbreviation: SwissCanton;
  vehicleTaxCalculationMethod: TaxCalculationMethod;
  vehicleTaxFactorPower?: number;
  vehicleTaxFactorWeight?: number;
  vehicleTaxBaseFee?: number;
  evTaxDiscount: number; // Percentage discount for electric vehicles
  evTaxDiscountYears?: number; // Years the discount applies
  registrationFee: number;
  licensePlateFee: number;
  averageElectricityPricePerKwh: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaxCalculationMethod {
  POWER = 'POWER',
  WEIGHT = 'WEIGHT',
  COMBINED = 'COMBINED',
  FLAT_RATE = 'FLAT_RATE'
}

// ===== TCO CALCULATION TYPES =====

export interface TcoCalculation {
  id: string;
  customerId: string;
  vehicleId: string;
  canton: SwissCanton;
  durationYears: number;
  annualKilometers: number;
  chargingMix: ChargingMix;
  oneTimeCosts: OneTimeCosts;
  annualCosts: AnnualCosts;
  energyCosts: EnergyCosts;
  depreciation: Depreciation;
  totalTco: number;
  tcoPerMonth: number;
  tcoPerKilometer: number;
  calculationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChargingMix {
  homeCharging: number; // Percentage
  publicCharging: number; // Percentage
  fastCharging: number; // Percentage
}

export interface OneTimeCosts {
  purchasePrice: number;
  vat: number; // 7.7% in Switzerland
  registrationFee: number;
  licensePlateFee: number;
  wallboxInstallation: number;
  total: number;
}

export interface AnnualCosts {
  vehicleTax: number;
  insurance: number;
  maintenance: number;
  tires: number;
  total: number;
}

export interface EnergyCosts {
  homeChargingCosts: number;
  publicChargingCosts: number;
  fastChargingCosts: number;
  totalAnnual: number;
}

export interface Depreciation {
  initialValue: number;
  residualValue: number;
  totalDepreciation: number;
  annualDepreciation: number;
}

// ===== AI ANALYSIS TYPES =====

export interface CustomerAnalysis {
  id: string;
  customerId: string;
  analysisType: AnalysisType;
  confidence: number; // 0-1
  insights: CustomerInsight[];
  recommendations: Recommendation[];
  riskAssessment: RiskAssessment;
  salesStrategy: SalesStrategy;
  createdAt: Date;
  updatedAt: Date;
}

export enum AnalysisType {
  FINANCIAL = 'financial',
  BEHAVIORAL = 'behavioral',
  PREDICTIVE = 'predictive',
  COMPREHENSIVE = 'comprehensive'
}

export interface CustomerInsight {
  category: InsightCategory;
  title: string;
  description: string;
  confidence: number;
  impact: ImpactLevel;
  source: string;
}

export enum InsightCategory {
  FINANCIAL_CAPACITY = 'financial_capacity',
  PURCHASE_INTENT = 'purchase_intent',
  BRAND_AFFINITY = 'brand_affinity',
  LIFESTYLE = 'lifestyle',
  BUSINESS_NEEDS = 'business_needs'
}

export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
  expectedImpact: string;
  actionItems: string[];
}

export enum RecommendationType {
  VEHICLE_RECOMMENDATION = 'vehicle_recommendation',
  FINANCING_OPTION = 'financing_option',
  SALES_APPROACH = 'sales_approach',
  TIMING = 'timing',
  PRICING_STRATEGY = 'pricing_strategy'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  financialRisk: RiskLevel;
  creditRisk: RiskLevel;
  businessRisk: RiskLevel;
  factors: RiskFactor[];
}

export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface RiskFactor {
  factor: string;
  impact: RiskLevel;
  description: string;
  mitigation?: string;
}

export interface SalesStrategy {
  approach: SalesApproach;
  keyMessages: string[];
  objectionHandling: ObjectionHandling[];
  nextSteps: string[];
  timeline: SalesTimeline;
}

export enum SalesApproach {
  CONSULTATIVE = 'consultative',
  RELATIONSHIP = 'relationship',
  SOLUTION = 'solution',
  VALUE = 'value',
  TECHNICAL = 'technical'
}

export interface ObjectionHandling {
  objection: string;
  response: string;
  supportingData?: string;
}

export interface SalesTimeline {
  phase: SalesPhase;
  estimatedDuration: string;
  keyMilestones: string[];
  criticalFactors: string[];
}

export enum SalesPhase {
  AWARENESS = 'awareness',
  INTEREST = 'interest',
  CONSIDERATION = 'consideration',
  INTENT = 'intent',
  EVALUATION = 'evaluation',
  PURCHASE = 'purchase'
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== SEARCH AND FILTER TYPES =====

export interface SearchFilters {
  query?: string;
  customerType?: CustomerType;
  canton?: SwissCanton;
  vehicleModel?: string;
  priceRange?: PriceRange;
  dateRange?: DateRange;
  status?: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ===== EXTERNAL API TYPES =====

export interface HandelsregisterData {
  uid: string;
  name: string;
  legalForm: string;
  status: string;
  address: Address;
  registrationDate: Date;
  capital?: number;
  purpose?: string;
  signatories: Signatory[];
}

export interface Address {
  street: string;
  houseNumber?: string;
  postalCode: string;
  city: string;
  canton: SwissCanton;
  country: string;
}

export interface Signatory {
  name: string;
  role: string;
  signingRights: string;
}

export interface ZekData {
  creditScore: number;
  riskCategory: RiskLevel;
  openCredits: number;
  creditHistory: CreditHistoryEntry[];
  recommendations: string[];
}

export interface CreditHistoryEntry {
  date: Date;
  type: string;
  amount: number;
  status: string;
  creditor: string;
}

// ===== NOTIFICATION TYPES =====

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system'
}

// ===== AUDIT TYPES =====

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// ===== EXPORT TYPES =====

export * from './types';

