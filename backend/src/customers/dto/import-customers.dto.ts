// 📊 CADILLAC EV CIS - Customer Import DTOs
// Swiss market customer CSV import validation

import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsPhoneNumber, Length, Matches, ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Swiss market specific enums
export enum SwissCanton {
  AG = 'AG', AI = 'AI', AR = 'AR', BE = 'BE', BL = 'BL', BS = 'BS',
  FR = 'FR', GE = 'GE', GL = 'GL', GR = 'GR', JU = 'JU', LU = 'LU',
  NE = 'NE', NW = 'NW', OW = 'OW', SG = 'SG', SH = 'SH', SO = 'SO',
  SZ = 'SZ', TG = 'TG', TI = 'TI', UR = 'UR', VD = 'VD', VS = 'VS',
  ZG = 'ZG', ZH = 'ZH'
}

export enum SwissLanguage {
  DE = 'de',
  FR = 'fr',
  IT = 'it',
  EN = 'en'
}

export enum CustomerTitle {
  HERR = 'Herr',
  FRAU = 'Frau',
  DR = 'Dr.',
  PROF = 'Prof.',
  PROF_DR = 'Prof. Dr.'
}

export enum CustomerStatus {
  LEAD = 'lead',
  PROSPECT = 'prospect',
  CUSTOMER = 'customer',
  INACTIVE = 'inactive'
}

export enum VehicleInterest {
  LYRIQ = 'LYRIQ',
  VISTIQ = 'VISTIQ',
  BOTH = 'both',
  UNKNOWN = 'unknown'
}

// Single customer import DTO
export class ImportCustomerDto {
  @IsOptional()
  @IsString()
  @Length(1, 10)
  title?: string;

  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsOptional()
  @IsPhoneNumber('CH')
  @Transform(({ value }) => value?.replace(/\s/g, ''))
  phone?: string;

  @IsOptional()
  @IsPhoneNumber('CH')
  @Transform(({ value }) => value?.replace(/\s/g, ''))
  mobile?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  company?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  position?: string;

  // Swiss address fields
  @IsString()
  @Length(1, 200)
  street: string;

  @IsString()
  @Matches(/^\d{4}$/, { message: 'Schweizer PLZ muss 4-stellig sein' })
  postalCode: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsEnum(SwissCanton, { message: 'Ungültiger Schweizer Kanton' })
  canton: SwissCanton;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country: string = 'CH';

  // Personal preferences
  @IsEnum(SwissLanguage)
  preferredLanguage: SwissLanguage;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus = CustomerStatus.LEAD;

  // CADILLAC EV specific fields
  @IsOptional()
  @IsEnum(VehicleInterest)
  vehicleInterest?: VehicleInterest;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;

  @IsOptional()
  @IsString()
  source?: string; // Marketing source

  @IsOptional()
  @IsString()
  campaign?: string; // Marketing campaign

  @IsOptional()
  @IsDateString()
  contactDate?: string;

  @IsOptional()
  @IsString()
  assignedSalesperson?: string;

  // DSGVO compliance
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1' || value === 'ja' || value === 'yes')
  dsgvoConsent?: boolean = false;

  @IsOptional()
  @IsDateString()
  dsgvoConsentDate?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1' || value === 'ja' || value === 'yes')
  marketingConsent?: boolean = false;

  // Financial information (optional)
  @IsOptional()
  @IsString()
  estimatedBudget?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1' || value === 'ja' || value === 'yes')
  financingInterest?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1' || value === 'ja' || value === 'yes')
  leasingInterest?: boolean;

  // Additional Swiss market fields
  @IsOptional()
  @IsString()
  currentVehicle?: string;

  @IsOptional()
  @IsString()
  evExperience?: 'none' | 'beginner' | 'experienced' | 'expert';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1' || value === 'ja' || value === 'yes')
  homeChargingAvailable?: boolean;

  @IsOptional()
  @IsString()
  preferredContactMethod?: 'email' | 'phone' | 'mobile' | 'letter';

  @IsOptional()
  @IsString()
  preferredContactTime?: 'morning' | 'afternoon' | 'evening' | 'weekend';
}

// Bulk import DTO
export class BulkImportCustomersDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Mindestens ein Kunde muss importiert werden' })
  @ValidateNested({ each: true })
  @Type(() => ImportCustomerDto)
  customers: ImportCustomerDto[];

  @IsOptional()
  @IsString()
  importSource?: string = 'csv_upload';

  @IsOptional()
  @IsString()
  importBatch?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  skipDuplicates?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  updateExisting?: boolean = false;

  @IsOptional()
  @IsString()
  importedBy?: string;
}

// Import validation result
export class ImportValidationResult {
  success: boolean;
  validCustomers: ImportCustomerDto[];
  invalidCustomers: Array<{
    rowNumber: number;
    customer: Partial<ImportCustomerDto>;
    errors: string[];
  }>;
  duplicates: Array<{
    rowNumber: number;
    customer: ImportCustomerDto;
    existingCustomerId: string;
    matchField: 'email' | 'phone';
  }>;
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
    importedRows?: number;
  };
}

// CSV mapping configuration
export class CsvMappingDto {
  // Field mappings
  @IsOptional()
  @IsString()
  titleColumn?: string;

  @IsString()
  firstNameColumn: string;

  @IsString()
  lastNameColumn: string;

  @IsString()
  emailColumn: string;

  @IsOptional()
  @IsString()
  phoneColumn?: string;

  @IsOptional()
  @IsString()
  mobileColumn?: string;

  @IsOptional()
  @IsString()
  companyColumn?: string;

  @IsOptional()
  @IsString()
  positionColumn?: string;

  @IsString()
  streetColumn: string;

  @IsString()
  postalCodeColumn: string;

  @IsString()
  cityColumn: string;

  @IsString()
  cantonColumn: string;

  @IsOptional()
  @IsString()
  countryColumn?: string;

  @IsString()
  preferredLanguageColumn: string;

  @IsOptional()
  @IsString()
  birthDateColumn?: string;

  @IsOptional()
  @IsString()
  statusColumn?: string;

  @IsOptional()
  @IsString()
  vehicleInterestColumn?: string;

  @IsOptional()
  @IsString()
  notesColumn?: string;

  @IsOptional()
  @IsString()
  sourceColumn?: string;

  @IsOptional()
  @IsString()
  campaignColumn?: string;

  @IsOptional()
  @IsString()
  contactDateColumn?: string;

  @IsOptional()
  @IsString()
  assignedSalespersonColumn?: string;

  @IsOptional()
  @IsString()
  dsgvoConsentColumn?: string;

  @IsOptional()
  @IsString()
  marketingConsentColumn?: string;

  @IsOptional()
  @IsString()
  estimatedBudgetColumn?: string;

  @IsOptional()
  @IsString()
  currentVehicleColumn?: string;

  @IsOptional()
  @IsString()
  evExperienceColumn?: string;

  // CSV parsing options
  @IsOptional()
  @IsString()
  delimiter?: string = ',';

  @IsOptional()
  @IsString()
  encoding?: string = 'utf-8';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  hasHeader?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 0)
  skipRows?: number = 0;
}

// Import progress tracking
export class ImportProgressDto {
  importId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  processedRows: number;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  importedRows: number;
  startTime: Date;
  endTime?: Date;
  errors?: string[];
  warnings?: string[];
}

// Swiss market specific validation messages
export const SwissValidationMessages = {
  de: {
    invalidCanton: 'Ungültiger Schweizer Kanton',
    invalidPostalCode: 'Schweizer PLZ muss 4-stellig sein',
    invalidPhoneNumber: 'Ungültiges Schweizer Telefonnummer-Format',
    invalidEmail: 'Ungültige E-Mail-Adresse',
    requiredField: 'Dieses Feld ist erforderlich',
    duplicateCustomer: 'Kunde bereits vorhanden',
    dsgvoRequired: 'DSGVO-Zustimmung erforderlich'
  },
  fr: {
    invalidCanton: 'Canton suisse invalide',
    invalidPostalCode: 'Le NPA suisse doit comporter 4 chiffres',
    invalidPhoneNumber: 'Format de numéro de téléphone suisse invalide',
    invalidEmail: 'Adresse e-mail invalide',
    requiredField: 'Ce champ est obligatoire',
    duplicateCustomer: 'Client déjà existant',
    dsgvoRequired: 'Consentement RGPD requis'
  },
  it: {
    invalidCanton: 'Cantone svizzero non valido',
    invalidPostalCode: 'Il CAP svizzero deve essere di 4 cifre',
    invalidPhoneNumber: 'Formato numero di telefono svizzero non valido',
    invalidEmail: 'Indirizzo email non valido',
    requiredField: 'Questo campo è obbligatorio',
    duplicateCustomer: 'Cliente già esistente',
    dsgvoRequired: 'Consenso GDPR richiesto'
  }
};