import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

/**
 * Swiss Data Service
 * 
 * Provides integration with Swiss-specific data sources including:
 * - ZEFIX (Swiss Federal Commercial Registry)
 * - Swiss Post API for postal code validation
 * - EV charging stations from ich-tanke-strom.ch
 * - Cantonal EV incentives and tax calculations
 * 
 * Important: This service adheres to the no-mock-data principle.
 * When external APIs are unavailable, it returns HTTP 503 errors
 * with clear messages rather than fallback mock data to ensure
 * data integrity and prevent incorrect business decisions.
 * 
 * @author Cadillac EV CIS Team
 * @version 1.0.0
 * @since 2024-01-30
 */
@Injectable()
export class SwissDataService {
  private readonly logger = new Logger(SwissDataService.name);
  private readonly aiServiceBaseUrl: string;
  private readonly defaultTimeout = 10000; // 10 seconds

  constructor(private configService: ConfigService) {
    // AI services base URL for Swiss data processing
    this.aiServiceBaseUrl = this.configService.get<string>(
      'AI_SERVICES_BASE_URL', 
      'http://localhost:5000'
    );
    
    this.logger.log('SwissDataService initialized');
    this.logger.log(`AI Services URL: ${this.aiServiceBaseUrl}`);
  }

  /**
   * Lookup company information via ZEFIX (Swiss Federal Commercial Registry)
   * 
   * This method provides real-time access to official Swiss company data.
   * It does not provide mock data when the service is unavailable to ensure
   * that customer information filed is accurate and reliable.
   * 
   * @param query - Company name or UID to search for
   * @param canton - Optional canton filter (ZH, BE, etc.)
   * @param exactMatch - Whether to perform exact name matching
   * @returns Promise<ZEFIXCompanyData> Company information from ZEFIX
   * @throws HttpException(503) When ZEFIX service is unavailable
   * @throws HttpException(404) When no companies are found
   * @throws HttpException(400) When query parameters are invalid
   * 
   * @example
   * ```typescript
   * const companies = await this.lookupCompany('Cadillac Schweiz AG', 'ZH', false);
   * ```
   */
  async lookupCompany(query: string, canton?: string, exactMatch = false) {
    this.logger.log(`Looking up company: ${query} in canton: ${canton || 'all'}`);
    
    try {
      // Validate input parameters
      if (!query || query.trim().length < 2) {
        throw new HttpException(
          'Query must be at least 2 characters long',
          HttpStatus.BAD_REQUEST
        );
      }

      // Make request to AI service for ZEFIX integration
      const response: AxiosResponse = await axios.post(
        `${this.aiServiceBaseUrl}/swiss-data/company-lookup`,
        {
          query: query.trim(),
          canton,
          exactMatch
        },
        {
          timeout: this.defaultTimeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'CadillacEV-CIS/1.0.0'
          }
        }
      );

      this.logger.log(`ZEFIX lookup successful for: ${query}`);
      return response.data;

    } catch (error) {
      this.logger.error(`Company lookup failed: ${error.message}`);
      
      // Handle specific HTTP error codes from AI service
      if (error.response?.status === 404) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      
      // Propagate service unavailable status (503) from AI service
      // This maintains the no-mock-data principle by clearly indicating
      // when the ZEFIX service is unavailable
      if (error.response?.status === 503) {
        throw new HttpException(
          error.response.data?.error || 'Swiss Federal Commercial Registry (ZEFIX) is currently unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      // Handle timeout and network errors
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new HttpException(
          'ZEFIX service request timed out. Please try again.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      // Default to service unavailable to prevent mock data usage
      throw new HttpException(
        'Company lookup service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Get Swiss postal codes with city and canton information
   * 
   * Integrates with Swiss Post API to provide accurate postal code data.
   * This ensures address validation for customer profiles and delivery
   * addresses is based on official Swiss postal data.
   * 
   * @param filters - Optional filters for postal code search
   * @returns Promise<PostalCodeData[]> Array of postal code information
   * @throws HttpException(503) When Swiss Post API is unavailable
   * 
   * @example
   * ```typescript
   * const postalCodes = await this.getPostalCodes({ canton: 'ZH', city: 'Zürich' });
   * ```
   */
  async getPostalCodes(filters?: { 
    code?: string; 
    city?: string; 
    canton?: string; 
  }) {
    this.logger.log(`Fetching postal codes with filters: ${JSON.stringify(filters)}`);
    
    try {
      const response: AxiosResponse = await axios.get(
        `${this.aiServiceBaseUrl}/swiss-data/postal-codes`,
        {
          params: filters,
          timeout: this.defaultTimeout,
          headers: {
            'User-Agent': 'CadillacEV-CIS/1.0.0'
          }
        }
      );

      this.logger.log('Postal codes fetched successfully');
      return response.data;

    } catch (error) {
      this.logger.error(`Postal codes fetch failed: ${error.message}`);
      
      // Propagate service unavailable status
      if (error.response?.status === 503) {
        throw new HttpException(
          error.response.data?.error || 'Swiss Post API is currently unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      throw new HttpException(
        'Postal code service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Validate specific postal code and address combination
   * 
   * Performs detailed validation of Swiss addresses using official
   * postal data to ensure accurate customer address information.
   * 
   * @param postalCode - Swiss postal code (4 digits)
   * @param city - City name
   * @param street - Optional street name for detailed validation
   * @returns Promise<AddressValidationResult> Validation result with details
   * @throws HttpException(400) When postal code format is invalid
   * @throws HttpException(503) When validation service is unavailable
   */
  async validatePostalCode(postalCode: string, city?: string, street?: string) {
    this.logger.log(`Validating postal code: ${postalCode} for city: ${city || 'N/A'}`);
    
    try {
      // Validate postal code format (4 digits for Switzerland)
      if (!/^\d{4}$/.test(postalCode)) {
        throw new HttpException(
          'Swiss postal codes must be exactly 4 digits',
          HttpStatus.BAD_REQUEST
        );
      }

      const response: AxiosResponse = await axios.post(
        `${this.aiServiceBaseUrl}/swiss-data/postal-codes/validate`,
        {
          postalCode,
          city,
          street
        },
        {
          timeout: this.defaultTimeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'CadillacEV-CIS/1.0.0'
          }
        }
      );

      this.logger.log(`Postal code validation successful: ${postalCode}`);
      return response.data;

    } catch (error) {
      this.logger.error(`Postal code validation failed: ${error.message}`);
      
      if (error.response?.status === 503) {
        throw new HttpException(
          error.response.data?.error || 'Address validation service is currently unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      if (error.status === HttpStatus.BAD_REQUEST) {
        throw error; // Re-throw validation errors
      }

      throw new HttpException(
        'Address validation service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Find EV charging stations in Switzerland
   * 
   * Integrates with ich-tanke-strom.ch API to provide real-time
   * charging station data including availability, pricing, and
   * technical specifications for customer trip planning.
   * 
   * @param latitude - Search center latitude
   * @param longitude - Search center longitude
   * @param radius - Search radius in kilometers (default: 10)
   * @param filters - Optional filters for charging stations
   * @returns Promise<ChargingStationData[]> Array of charging stations
   * @throws HttpException(503) When charging stations API is unavailable
   * 
   * @example
   * ```typescript
   * const stations = await this.getChargingStations(47.3769, 8.5417, 5, {
   *   powerMin: 50,
   *   connectorType: 'CCS'
   * });
   * ```
   */
  async getChargingStations(
    latitude: number, 
    longitude: number, 
    radius = 10,
    filters?: {
      connectorType?: string;
      powerMin?: number;
      networkId?: string;
      availableOnly?: boolean;
    }
  ) {
    this.logger.log(
      `Searching charging stations at ${latitude}, ${longitude} within ${radius}km`
    );
    
    try {
      // Validate coordinates for Switzerland (approximate bounds)
      if (latitude < 45.8 || latitude > 47.9 || longitude < 5.9 || longitude > 10.6) {
        this.logger.warn(`Coordinates outside Switzerland: ${latitude}, ${longitude}`);
      }

      const response: AxiosResponse = await axios.post(
        `${this.aiServiceBaseUrl}/swiss-data/charging-stations`,
        {
          latitude,
          longitude,
          radius,
          filters
        },
        {
          timeout: this.defaultTimeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'CadillacEV-CIS/1.0.0'
          }
        }
      );

      this.logger.log(`Found ${response.data.data?.stations?.length || 0} charging stations`);
      return response.data;

    } catch (error) {
      this.logger.error(`Charging stations search failed: ${error.message}`);
      
      if (error.response?.status === 503) {
        throw new HttpException(
          error.response.data?.error || 'Charging stations service is currently unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      throw new HttpException(
        'Charging stations service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Get available charging networks in Switzerland
   * 
   * Provides information about major EV charging networks
   * operating in Switzerland for customer reference.
   * 
   * @returns Promise<ChargingNetworkData[]> List of charging networks
   */
  async getChargingNetworks() {
    this.logger.log('Fetching charging networks');
    
    try {
      const response: AxiosResponse = await axios.get(
        `${this.aiServiceBaseUrl}/swiss-data/charging-networks`,
        {
          timeout: this.defaultTimeout,
          headers: {
            'User-Agent': 'CadillacEV-CIS/1.0.0'
          }
        }
      );

      return response.data;

    } catch (error) {
      this.logger.error(`Charging networks fetch failed: ${error.message}`);
      
      if (error.response?.status === 503) {
        throw new HttpException(
          'Charging networks data is currently unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      throw new HttpException(
        'Charging networks service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Calculate EV incentives for a specific Swiss canton
   * 
   * Computes available financial incentives, tax reductions, and
   * total cost of ownership for electric vehicles based on
   * canton-specific regulations and customer profile.
   * 
   * @param canton - Swiss canton code (ZH, BE, etc.)
   * @param vehicleData - Vehicle specifications
   * @param customerData - Customer profile and usage patterns
   * @returns Promise<EVIncentiveCalculation> Detailed incentive breakdown
   * @throws HttpException(400) When canton is not supported
   * @throws HttpException(503) When incentives service is unavailable
   * 
   * @example
   * ```typescript
   * const incentives = await this.calculateEVIncentives('ZH', {
   *   purchase_price: 65000,
   *   power_kw: 150,
   *   efficiency_kwh_100km: 18
   * }, {
   *   annual_mileage: 15000,
   *   business_use: false
   * });
   * ```
   */
  async calculateEVIncentives(
    canton: string, 
    vehicleData: {
      purchase_price: number;
      power_kw: number;
      weight_kg: number;
      battery_capacity_kwh: number;
      efficiency_kwh_100km: number;
    },
    customerData: {
      annual_mileage: number;
      years_ownership: number;
      business_use: boolean;
    }
  ) {
    this.logger.log(`Calculating EV incentives for canton ${canton}`);
    
    try {
      // Validate canton code format
      if (!/^[A-Z]{2}$/.test(canton)) {
        throw new HttpException(
          'Canton code must be 2 uppercase letters (e.g., ZH, BE)',
          HttpStatus.BAD_REQUEST
        );
      }

      const response: AxiosResponse = await axios.post(
        `${this.aiServiceBaseUrl}/swiss-data/ev-incentives/calculate`,
        {
          canton,
          vehicle: vehicleData,
          customer: customerData
        },
        {
          timeout: this.defaultTimeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'CadillacEV-CIS/1.0.0'
          }
        }
      );

      this.logger.log(`EV incentives calculated for canton ${canton}`);
      return response.data;

    } catch (error) {
      this.logger.error(`EV incentives calculation failed: ${error.message}`);
      
      if (error.response?.status === 400) {
        throw new HttpException(
          error.response.data?.error || 'Invalid calculation parameters',
          HttpStatus.BAD_REQUEST
        );
      }

      if (error.response?.status === 503) {
        throw new HttpException(
          error.response.data?.error || 'EV incentives calculation service is currently unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      throw new HttpException(
        'EV incentives service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Compare EV incentives across multiple Swiss cantons
   * 
   * Provides comparative analysis of EV incentives across
   * different cantons to help customers make informed decisions.
   * 
   * @param cantons - Array of canton codes to compare
   * @param vehicleData - Vehicle specifications
   * @param customerData - Customer profile
   * @returns Promise<EVIncentiveComparison> Comparative analysis
   */
  async compareEVIncentives(
    cantons: string[], 
    vehicleData: any, 
    customerData: any
  ) {
    this.logger.log(`Comparing EV incentives across cantons: ${cantons.join(', ')}`);
    
    try {
      const response: AxiosResponse = await axios.post(
        `${this.aiServiceBaseUrl}/swiss-data/ev-incentives/compare`,
        {
          cantons,
          vehicle: vehicleData,
          customer: customerData
        },
        {
          timeout: this.defaultTimeout * 2, // Longer timeout for multiple calculations
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'CadillacEV-CIS/1.0.0'
          }
        }
      );

      return response.data;

    } catch (error) {
      this.logger.error(`EV incentives comparison failed: ${error.message}`);
      
      if (error.response?.status === 503) {
        throw new HttpException(
          'EV incentives comparison service is currently unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      throw new HttpException(
        'EV incentives comparison service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Get canton-specific EV incentive information
   * 
   * Retrieves detailed information about EV incentives
   * and regulations for a specific Swiss canton.
   * 
   * @param canton - Canton code
   * @returns Promise<CantonIncentiveInfo> Canton incentive details
   */
  async getCantonIncentives(canton: string) {
    this.logger.log(`Fetching canton incentives for: ${canton}`);
    
    try {
      const response: AxiosResponse = await axios.get(
        `${this.aiServiceBaseUrl}/swiss-data/canton-incentives/${canton}`,
        {
          timeout: this.defaultTimeout,
          headers: {
            'User-Agent': 'CadillacEV-CIS/1.0.0'
          }
        }
      );

      return response.data;

    } catch (error) {
      this.logger.error(`Canton incentives fetch failed: ${error.message}`);
      
      if (error.response?.status === 503) {
        throw new HttpException(
          `Canton ${canton} incentive data is currently unavailable`,
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      throw new HttpException(
        'Canton incentives service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Get list of Swiss cantons with basic information
   * 
   * Provides reference data for Swiss cantons. This method
   * includes a fallback to static data as canton information
   * is considered stable reference data that doesn't change frequently.
   * 
   * @returns Promise<CantonData[]> List of Swiss cantons
   */
  async getCantons() {
    this.logger.log('Fetching Swiss cantons');
    
    try {
      const response: AxiosResponse = await axios.get(
        `${this.aiServiceBaseUrl}/swiss-data/cantons`,
        {
          timeout: this.defaultTimeout,
          headers: {
            'User-Agent': 'CadillacEV-CIS/1.0.0'
          }
        }
      );

      return response.data;

    } catch (error) {
      this.logger.error(`Cantons fetch failed: ${error.message}`);
      
      // For canton data, provide static fallback as this is stable reference data
      // This is an exception to the no-mock-data principle as canton codes
      // and names are official, stable government data
      this.logger.warn('Using static canton data fallback');
      return this.getStaticCantons();
    }
  }

  /**
   * Static canton data fallback
   * 
   * Provides official Swiss canton reference data when the
   * dynamic service is unavailable. This is considered acceptable
   * as canton codes and names are stable government reference data.
   * 
   * @private
   * @returns Static canton data
   */
  private getStaticCantons() {
    return {
      success: true,
      data: {
        cantons: [
          { code: 'ZH', name: 'Zürich', germanName: 'Zürich' },
          { code: 'BE', name: 'Bern', germanName: 'Bern' },
          { code: 'LU', name: 'Luzern', germanName: 'Luzern' },
          { code: 'UR', name: 'Uri', germanName: 'Uri' },
          { code: 'SZ', name: 'Schwyz', germanName: 'Schwyz' },
          { code: 'OW', name: 'Obwalden', germanName: 'Obwalden' },
          { code: 'NW', name: 'Nidwalden', germanName: 'Nidwalden' },
          { code: 'GL', name: 'Glarus', germanName: 'Glarus' },
          { code: 'ZG', name: 'Zug', germanName: 'Zug' },
          { code: 'FR', name: 'Freiburg', germanName: 'Freiburg' },
          { code: 'SO', name: 'Solothurn', germanName: 'Solothurn' },
          { code: 'BS', name: 'Basel-Stadt', germanName: 'Basel-Stadt' },
          { code: 'BL', name: 'Basel-Landschaft', germanName: 'Basel-Landschaft' },
          { code: 'SH', name: 'Schaffhausen', germanName: 'Schaffhausen' },
          { code: 'AR', name: 'Appenzell Ausserrhoden', germanName: 'Appenzell Ausserrhoden' },
          { code: 'AI', name: 'Appenzell Innerrhoden', germanName: 'Appenzell Innerrhoden' },
          { code: 'SG', name: 'St. Gallen', germanName: 'St. Gallen' },
          { code: 'GR', name: 'Graubünden', germanName: 'Graubünden' },
          { code: 'AG', name: 'Aargau', germanName: 'Aargau' },
          { code: 'TG', name: 'Thurgau', germanName: 'Thurgau' },
          { code: 'TI', name: 'Ticino', germanName: 'Tessin' },
          { code: 'VD', name: 'Vaud', germanName: 'Waadt' },
          { code: 'VS', name: 'Valais', germanName: 'Wallis' },
          { code: 'NE', name: 'Neuchâtel', germanName: 'Neuenburg' },
          { code: 'GE', name: 'Geneva', germanName: 'Genf' },
          { code: 'JU', name: 'Jura', germanName: 'Jura' }
        ],
        source: 'static_reference',
        lastUpdated: '2024-01-30T10:00:00Z'
      }
    };
  }
}