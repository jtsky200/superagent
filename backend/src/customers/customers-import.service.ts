// 📊 CADILLAC EV CIS - Customer Import Service
// Swiss market CSV import with DSGVO compliance

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as csv from 'csv-parser';

import * as iconv from 'iconv-lite';

import { Readable } from 'stream';

import { validate } from 'class-validator';

import { plainToClass } from 'class-transformer';

import { v4 as uuidv4 } from 'uuid';

import { 
  ImportCustomerDto, 
  BulkImportCustomersDto, 
  ImportValidationResult, 
  CsvMappingDto, 
  ImportProgressDto,
  SwissValidationMessages 
} from './dto/import-customers.dto';
import { Company } from './entities/company.entity';
import { Customer, CustomerType } from './entities/customer.entity';

@Injectable()
export class CustomersImportService {
  private readonly logger = new Logger(CustomersImportService.name);
  private importProgress = new Map<string, ImportProgressDto>();

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  /**
   * Parse CSV file and validate Swiss market customer data
   */
  async parseCsvFile(
    fileBuffer: Buffer,
    mapping: CsvMappingDto,
    language: 'de' | 'fr' | 'it' = 'de'
  ): Promise<ImportValidationResult> {
    try {
      this.logger.log('Starting CSV parsing for Swiss market customer import');

      // Convert buffer to readable stream with proper encoding
      const readable = new Readable();
      readable.push(iconv.decode(fileBuffer, mapping.encoding || 'utf-8'));
      readable.push(null);

      const csvData: any[] = [];
      
      // Parse CSV data
      await new Promise((resolve, reject) => {
        readable
          .pipe(csv({
            separator: mapping.delimiter || ',',
            headers: mapping.hasHeader !== false,
            // skipEmptyLines: true, // Not supported in this version
            // skipLinesWithError: false, // Not supported in this version
          }))
          .on('data', (data) => {
            csvData.push(data);
          })
          .on('end', resolve)
          .on('error', reject);
      });

      this.logger.log(`Parsed ${csvData.length} rows from CSV`);

      // Skip initial rows if specified
      const dataToProcess = mapping.skipRows ? csvData.slice(mapping.skipRows) : csvData;

      // Map CSV columns to customer DTOs
      const mappedCustomers = dataToProcess.map((row, index) => 
        this.mapCsvRowToCustomer(row, mapping, index + 1 + (mapping.skipRows || 0))
      );

      // Validate mapped customers
      const validationResult = await this.validateCustomers(mappedCustomers, language);

      this.logger.log(`Validation complete: ${validationResult.validCustomers.length} valid, ${validationResult.invalidCustomers.length} invalid`);

      return validationResult;

    } catch (error) {
      this.logger.error('CSV parsing failed', error.stack);
      throw new BadRequestException(`CSV parsing failed: ${error.message}`);
    }
  }

  /**
   * Map CSV row to customer DTO based on field mapping
   */
  private mapCsvRowToCustomer(row: any, mapping: CsvMappingDto, rowNumber: number): { rowNumber: number, customer: ImportCustomerDto } {
    const customer = new ImportCustomerDto();

    try {
      // Basic fields
      customer.title = this.getFieldValue(row, mapping.titleColumn);
      customer.firstName = this.getFieldValue(row, mapping.firstNameColumn);
      customer.lastName = this.getFieldValue(row, mapping.lastNameColumn);
      customer.email = this.getFieldValue(row, mapping.emailColumn);
      customer.phone = this.getFieldValue(row, mapping.phoneColumn);
      customer.mobile = this.getFieldValue(row, mapping.mobileColumn);
      customer.company = this.getFieldValue(row, mapping.companyColumn);
      customer.position = this.getFieldValue(row, mapping.positionColumn);

      // Address fields
      customer.street = this.getFieldValue(row, mapping.streetColumn);
      customer.postalCode = this.getFieldValue(row, mapping.postalCodeColumn);
      customer.city = this.getFieldValue(row, mapping.cityColumn);
      customer.canton = this.getFieldValue(row, mapping.cantonColumn) as any;
      customer.country = this.getFieldValue(row, mapping.countryColumn) || 'CH';

      // Preferences
      customer.preferredLanguage = this.getFieldValue(row, mapping.preferredLanguageColumn) as any;
      customer.birthDate = this.getFieldValue(row, mapping.birthDateColumn);
      customer.status = this.getFieldValue(row, mapping.statusColumn) as any;
      customer.vehicleInterest = this.getFieldValue(row, mapping.vehicleInterestColumn) as any;

      // Notes and tracking
      customer.notes = this.getFieldValue(row, mapping.notesColumn);
      customer.source = this.getFieldValue(row, mapping.sourceColumn);
      customer.campaign = this.getFieldValue(row, mapping.campaignColumn);
      customer.contactDate = this.getFieldValue(row, mapping.contactDateColumn);
      customer.assignedSalesperson = this.getFieldValue(row, mapping.assignedSalespersonColumn);

      // DSGVO compliance
      customer.dsgvoConsent = this.parseBooleanField(this.getFieldValue(row, mapping.dsgvoConsentColumn));
      customer.marketingConsent = this.parseBooleanField(this.getFieldValue(row, mapping.marketingConsentColumn));
      customer.dsgvoConsentDate = customer.dsgvoConsent ? new Date().toISOString() : undefined;

      // Additional fields
      customer.estimatedBudget = this.getFieldValue(row, mapping.estimatedBudgetColumn);
      customer.currentVehicle = this.getFieldValue(row, mapping.currentVehicleColumn);
      customer.evExperience = this.getFieldValue(row, mapping.evExperienceColumn) as any;

      return { rowNumber, customer };

    } catch (error) {
      this.logger.warn(`Error mapping row ${rowNumber}: ${error.message}`);
      return { rowNumber, customer };
    }
  }

  /**
   * Get field value from CSV row based on column mapping
   */
  private getFieldValue(row: any, columnName?: string): string | undefined {
    if (!columnName) return undefined;
    
    const value = row[columnName];
    if (value === null || value === undefined || value === '') return undefined;
    
    return String(value).trim();
  }

  /**
   * Parse boolean field from various string representations
   */
  private parseBooleanField(value?: string): boolean {
    if (!value) return false;
    
    const lowerValue = value.toLowerCase();
    return ['true', '1', 'ja', 'yes', 'oui', 'si', 'wahr'].includes(lowerValue);
  }

  /**
   * Validate customer data for Swiss market compliance
   */
  async validateCustomers(
    mappedCustomers: Array<{ rowNumber: number, customer: ImportCustomerDto }>,
    language: 'de' | 'fr' | 'it' = 'de'
  ): Promise<ImportValidationResult> {
    const validCustomers: ImportCustomerDto[] = [];
    const invalidCustomers: Array<{
      rowNumber: number;
      customer: Partial<ImportCustomerDto>;
      errors: string[];
    }> = [];
    const duplicates: Array<{
      rowNumber: number;
      customer: ImportCustomerDto;
      existingCustomerId: string;
      matchField: 'email' | 'phone';
    }> = [];

    const messages = SwissValidationMessages[language];

    for (const { rowNumber, customer } of mappedCustomers) {
      try {
        // Transform to class instance for validation
        const customerInstance = plainToClass(ImportCustomerDto, customer);
        
        // Validate with class-validator
        const validationErrors = await validate(customerInstance);
        
        if (validationErrors.length > 0) {
          const errorMessages = validationErrors.map(error => 
            Object.values(error.constraints || {}).join(', ')
          );
          
          invalidCustomers.push({
            rowNumber,
            customer,
            errors: errorMessages
          });
          continue;
        }

        // Check for duplicates
        const duplicateCheck = await this.checkForDuplicates(customerInstance);
        if (duplicateCheck) {
          duplicates.push({
            rowNumber,
            customer: customerInstance,
            existingCustomerId: duplicateCheck.customerId,
            matchField: duplicateCheck.matchField
          });
          continue;
        }

        // Swiss market specific validations
        const swissValidationErrors = this.validateSwissMarketFields(customerInstance, messages);
        if (swissValidationErrors.length > 0) {
          invalidCustomers.push({
            rowNumber,
            customer,
            errors: swissValidationErrors
          });
          continue;
        }

        validCustomers.push(customerInstance);

      } catch (error) {
        this.logger.error(`Validation error for row ${rowNumber}:`, error.stack);
        invalidCustomers.push({
          rowNumber,
          customer,
          errors: [`Validation error: ${error.message}`]
        });
      }
    }

    return {
      success: invalidCustomers.length === 0,
      validCustomers,
      invalidCustomers,
      duplicates,
      summary: {
        totalRows: mappedCustomers.length,
        validRows: validCustomers.length,
        invalidRows: invalidCustomers.length,
        duplicateRows: duplicates.length
      }
    };
  }

  /**
   * Check for duplicate customers by email or phone
   */
  private async checkForDuplicates(customer: ImportCustomerDto): Promise<{ customerId: string, matchField: 'email' | 'phone' } | null> {
    // Check email duplicate
    if (customer.email) {
      const existingByEmail = await this.customerRepository.findOne({
        where: { email: customer.email }
      });
      
      if (existingByEmail) {
        return { customerId: existingByEmail.id, matchField: 'email' };
      }
    }

    // Check phone duplicate
    if (customer.phone) {
      const existingByPhone = await this.customerRepository.findOne({
        where: { phone: customer.phone }
      });
      
      if (existingByPhone) {
        return { customerId: existingByPhone.id, matchField: 'phone' };
      }
    }

    return null;
  }

  /**
   * Swiss market specific field validations
   */
  private validateSwissMarketFields(customer: ImportCustomerDto, messages: any): string[] {
    const errors: string[] = [];

    // Swiss postal code validation (4 digits)
    if (customer.postalCode && !/^\d{4}$/.test(customer.postalCode)) {
      errors.push(messages.invalidPostalCode);
    }

    // Swiss phone number validation
    if (customer.phone && !this.isValidSwissPhoneNumber(customer.phone)) {
      errors.push(messages.invalidPhoneNumber);
    }

    // DSGVO consent validation for Swiss market
    if (!customer.dsgvoConsent) {
      errors.push(messages.dsgvoRequired);
    }

    return errors;
  }

  /**
   * Validate Swiss phone number format
   */
  private isValidSwissPhoneNumber(phone: string): boolean {
    // Swiss phone number patterns
    const swissPatterns = [
      /^\+41\d{9}$/,           // +41xxxxxxxxx
      /^0\d{9}$/,              // 0xxxxxxxxx
      /^\+41\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, // +41 xx xxx xx xx
      /^0\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/        // 0xx xxx xx xx
    ];

    const cleanPhone = phone.replace(/\s/g, '');
    return swissPatterns.some(pattern => pattern.test(cleanPhone));
  }

  /**
   * Import validated customers with progress tracking
   */
  async importCustomers(
    bulkImportDto: BulkImportCustomersDto,
    userId?: string
  ): Promise<{ importId: string, progress: ImportProgressDto }> {
    const importId = uuidv4();
    const startTime = new Date();

    // Initialize progress tracking
    const progress: ImportProgressDto = {
      importId,
      status: 'processing',
      progress: 0,
      processedRows: 0,
      totalRows: bulkImportDto.customers.length,
      validRows: 0,
      invalidRows: 0,
      duplicateRows: 0,
      importedRows: 0,
      startTime,
      errors: [],
      warnings: []
    };

    this.importProgress.set(importId, progress);

    try {
      this.logger.log(`Starting import ${importId} with ${bulkImportDto.customers.length} customers`);

      // Process customers in batches
      const batchSize = 50;
      let importedCount = 0;

      for (let i = 0; i < bulkImportDto.customers.length; i += batchSize) {
        const batch = bulkImportDto.customers.slice(i, i + batchSize);
        
        for (const customerDto of batch) {
          try {
            // Check for duplicates if skipDuplicates is enabled
            if (bulkImportDto.skipDuplicates) {
              const duplicate = await this.checkForDuplicates(customerDto);
              if (duplicate) {
                progress.duplicateRows++;
                progress.warnings?.push(`Row ${i + 1}: Duplicate customer skipped (${duplicate.matchField}: ${customerDto[duplicate.matchField]})`);
                continue;
              }
            }

            // Create or update customer
            let customer: Customer;
            
            if (bulkImportDto.updateExisting) {
              const existing = await this.customerRepository.findOne({
                where: { email: customerDto.email }
              });
              
              if (existing) {
                // Update existing customer
                Object.assign(existing, this.mapDtoToEntity(customerDto));
                existing.updatedAt = new Date();
                customer = await this.customerRepository.save(existing);
              } else {
                // Create new customer
                customer = await this.createCustomerFromDto(customerDto, bulkImportDto.importSource);
              }
            } else {
              // Create new customer
              customer = await this.createCustomerFromDto(customerDto, bulkImportDto.importSource);
            }

            importedCount++;
            progress.importedRows++;
            progress.validRows++;

          } catch (error) {
            this.logger.error(`Import error for customer ${customerDto.email}:`, error.stack);
            progress.invalidRows++;
            progress.errors?.push(`Customer ${customerDto.email}: ${error.message}`);
          }

          progress.processedRows++;
          progress.progress = Math.round((progress.processedRows / progress.totalRows) * 100);
          
          // Update progress
          this.importProgress.set(importId, { ...progress });
        }

        // Small delay between batches to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Mark import as completed
      progress.status = 'completed';
      progress.endTime = new Date();
      progress.progress = 100;
      
      this.importProgress.set(importId, progress);

      this.logger.log(`Import ${importId} completed: ${importedCount}/${bulkImportDto.customers.length} customers imported`);

      return { importId, progress };

    } catch (error) {
      this.logger.error(`Import ${importId} failed:`, error.stack);
      
      progress.status = 'failed';
      progress.endTime = new Date();
      progress.errors?.push(`Import failed: ${error.message}`);
      
      this.importProgress.set(importId, progress);
      
      throw new BadRequestException(`Import failed: ${error.message}`);
    }
  }

  /**
   * Create customer entity from DTO
   */
  private async createCustomerFromDto(dto: ImportCustomerDto, source?: string): Promise<Customer> {
    const customer = new Customer();
    
    Object.assign(customer, this.mapDtoToEntity(dto));
    
    // Set import metadata
    // customer.source = source || 'csv_import'; // Property doesn't exist on Customer entity
    customer.createdAt = new Date();
    customer.updatedAt = new Date();

    // Handle company creation if specified
    if (dto.company) {
      let company = await this.companyRepository.findOne({
        where: { companyName: dto.company } as any
      });

      if (!company) {
        company = this.companyRepository.create({
          companyName: dto.company,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        company = await this.companyRepository.save(company);
      }

      customer.company = company;
    }

    return await this.customerRepository.save(customer);
  }

  /**
   * Map DTO to entity fields
   */
  private mapDtoToEntity(dto: ImportCustomerDto): Partial<Customer> {
    return {
      // title: dto.title, // Title field not defined in Customer entity
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      // mobile: dto.mobile, // Mobile field not defined in Customer entity
      // position: dto.position, // Position field not defined in Customer entity
      street: dto.street,
      postalCode: dto.postalCode,
      city: dto.city,
      canton: dto.canton as any,
      customerType: CustomerType.PRIVATE, // Default to private
      dateOfBirth: dto.birthDate ? new Date(dto.birthDate) : undefined,
      nationality: 'Swiss', // Default nationality
      notes: dto.notes
      // Fields commented out as they don't exist in Customer entity:
      // country: dto.country || 'CH',
      // preferredLanguage: dto.preferredLanguage,
      // status: dto.status,
      // vehicleInterest: dto.vehicleInterest,
      // source: dto.source,
      // campaign: dto.campaign,
      // contactDate: dto.contactDate,
      // assignedSalesperson: dto.assignedSalesperson,
      // dsgvoConsent: dto.dsgvoConsent,
      // dsgvoConsentDate: dto.dsgvoConsentDate,
      // marketingConsent: dto.marketingConsent,
      // estimatedBudget: dto.estimatedBudget,
      // financingInterest: dto.financingInterest,
      // leasingInterest: dto.leasingInterest,
      // currentVehicle: dto.currentVehicle,
      // evExperience: dto.evExperience,
      // homeChargingAvailable: dto.homeChargingAvailable,
      // preferredContactMethod: dto.preferredContactMethod,
      // preferredContactTime: dto.preferredContactTime
    };
  }

  /**
   * Get import progress by ID
   */
  getImportProgress(importId: string): ImportProgressDto {
    const progress = this.importProgress.get(importId);
    if (!progress) {
      throw new NotFoundException(`Import ${importId} not found`);
    }
    return progress;
  }

  /**
   * Clean up old import progress records
   */
  cleanupOldImports(): void {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const [importId, progress] of this.importProgress.entries()) {
      if (progress.startTime < twentyFourHoursAgo) {
        this.importProgress.delete(importId);
      }
    }
  }

  /**
   * Generate CSV template for Swiss market customers
   */
  generateCsvTemplate(language: 'de' | 'fr' | 'it' = 'de'): string {
    const headers = {
      de: [
        'Anrede', 'Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Mobile',
        'Firma', 'Position', 'Strasse', 'PLZ', 'Ort', 'Kanton',
        'Sprache', 'Geburtsdatum', 'Status', 'Fahrzeuginteresse',
        'Notizen', 'Quelle', 'Kampagne', 'Kontaktdatum',
        'Verkäufer', 'DSGVO-Zustimmung', 'Marketing-Zustimmung',
        'Budget', 'Aktuelles Fahrzeug', 'EV-Erfahrung'
      ],
      fr: [
        'Titre', 'Prénom', 'Nom', 'E-mail', 'Téléphone', 'Mobile',
        'Entreprise', 'Position', 'Rue', 'NPA', 'Ville', 'Canton',
        'Langue', 'Date naissance', 'Statut', 'Intérêt véhicule',
        'Notes', 'Source', 'Campagne', 'Date contact',
        'Vendeur', 'Consentement RGPD', 'Consentement marketing',
        'Budget', 'Véhicule actuel', 'Expérience VE'
      ],
      it: [
        'Titolo', 'Nome', 'Cognome', 'E-mail', 'Telefono', 'Mobile',
        'Azienda', 'Posizione', 'Via', 'CAP', 'Città', 'Cantone',
        'Lingua', 'Data nascita', 'Stato', 'Interesse veicolo',
        'Note', 'Fonte', 'Campagna', 'Data contatto',
        'Venditore', 'Consenso GDPR', 'Consenso marketing',
        'Budget', 'Veicolo attuale', 'Esperienza EV'
      ]
    };

    const exampleRow = {
      de: [
        'Herr', 'Max', 'Mustermann', 'max.mustermann@example.ch', '+41441234567', '+41791234567',
        'Mustermann AG', 'Geschäftsführer', 'Musterstrasse 123', '8001', 'Zürich', 'ZH',
        'de', '1980-01-15', 'lead', 'LYRIQ',
        'Interessiert an Elektrofahrzeugen', 'Website', 'Summer2024', '2024-01-15',
        'Hans Müller', 'ja', 'ja',
        '80000-100000', 'BMW X5', 'beginner'
      ],
      fr: [
        'M.', 'Jean', 'Dupont', 'jean.dupont@example.ch', '+41221234567', '+41791234567',
        'Dupont SA', 'Directeur', 'Rue Exemple 123', '1201', 'Genève', 'GE',
        'fr', '1980-01-15', 'prospect', 'VISTIQ',
        'Intéressé par les véhicules électriques', 'Site web', 'Été2024', '2024-01-15',
        'Marie Martin', 'oui', 'oui',
        '80000-100000', 'Audi Q7', 'experienced'
      ],
      it: [
        'Sig.', 'Mario', 'Rossi', 'mario.rossi@example.ch', '+41911234567', '+41791234567',
        'Rossi SA', 'Direttore', 'Via Esempio 123', '6900', 'Lugano', 'TI',
        'it', '1980-01-15', 'customer', 'both',
        'Interessato ai veicoli elettrici', 'Sito web', 'Estate2024', '2024-01-15',
        'Anna Bianchi', 'si', 'si',
        '80000-100000', 'Mercedes GLE', 'expert'
      ]
    };

    return [
      headers[language].join(','),
      exampleRow[language].join(',')
    ].join('\n');
  }
}