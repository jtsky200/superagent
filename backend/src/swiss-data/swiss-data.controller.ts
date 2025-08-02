import { Controller, Get, Post, Query, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SwissDataService } from './swiss-data.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyLookupDto } from './dto/company-lookup.dto';
import { PostalCodeValidationDto } from './dto/postal-code-validation.dto';
import { ChargingStationQueryDto } from './dto/charging-station-query.dto';
import { EVIncentivesCalculationDto } from './dto/ev-incentives-calculation.dto';
import { EVIncentivesComparisonDto } from './dto/ev-incentives-comparison.dto';

@ApiTags('swiss-data')
@Controller('swiss-data')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SwissDataController {
  constructor(private readonly swissDataService: SwissDataService) {}

  @Get('cantons')
  @ApiOperation({ summary: 'Get Swiss cantons data' })
  @ApiResponse({ status: 200, description: 'Cantons data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCantons() {
    return this.swissDataService.getCantons();
  }

  @Get('postal-codes')
  @ApiOperation({ summary: 'Get Swiss postal codes and location data' })
  @ApiResponse({ status: 200, description: 'Postal codes data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'canton', required: false, description: 'Filter by canton code (e.g., ZH)' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city name' })
  @ApiQuery({ name: 'postal_code', required: false, description: 'Filter by specific postal code' })
  getPostalCodes(
    @Query('canton') canton?: string,
    @Query('city') city?: string,
    @Query('postal_code') postal_code?: string,
  ) {
    const query = { code: postal_code, city, canton };
    return this.swissDataService.getPostalCodes(query);
  }

  @Post('postal-codes/validate')
  @ApiOperation({ summary: 'Validate Swiss postal code' })
  @ApiResponse({ status: 200, description: 'Postal code validation result' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: PostalCodeValidationDto, description: 'Postal code validation data' })
  validatePostalCode(@Body(ValidationPipe) validationData: PostalCodeValidationDto) {
    return this.swissDataService.validatePostalCode(validationData.postal_code);
  }

  @Post('company-lookup')
  @ApiOperation({ summary: 'Look up company information from Swiss Handelsregister (ZEFIX)' })
  @ApiResponse({ status: 200, description: 'Company data retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CompanyLookupDto, description: 'Company lookup data (uid_number or company_name required)' })
  lookupCompany(@Body(ValidationPipe) lookupData: CompanyLookupDto) {
    return this.swissDataService.lookupCompany(lookupData.company_name || lookupData.uid_number);
  }

  @Get('charging-stations')
  @ApiOperation({ summary: 'Get EV charging stations in Switzerland' })
  @ApiResponse({ status: 200, description: 'Charging stations data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'canton', required: false, description: 'Filter by canton code' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city name' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by charging type (fast, normal, tesla, all)' })
  @ApiQuery({ name: 'power_min', required: false, description: 'Minimum power in kW' })
  @ApiQuery({ name: 'available_only', required: false, description: 'Show only available stations' })
  @ApiQuery({ name: 'lat', required: false, description: 'Latitude for distance calculation' })
  @ApiQuery({ name: 'lng', required: false, description: 'Longitude for distance calculation' })
  @ApiQuery({ name: 'radius', required: false, description: 'Search radius in km (default: 50)' })
  getChargingStations(
    @Query('canton') canton?: string,
    @Query('city') city?: string,
    @Query('type') type?: string,
    @Query('power_min') power_min?: number,
    @Query('available_only') available_only?: boolean,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number,
  ) {
    const query = { canton, city, type, power_min, available_only, lat, lng, radius };
    const filters = { connectorType: type, powerMin: power_min, availableOnly: available_only };
    return this.swissDataService.getChargingStations(lat || 47.3769, lng || 8.5417, radius, filters);
  }

  @Get('charging-stations/networks')
  @ApiOperation({ summary: 'Get information about Swiss charging networks and operators' })
  @ApiResponse({ status: 200, description: 'Charging networks data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getChargingNetworks() {
    return this.swissDataService.getChargingNetworks();
  }

  @Post('ev-incentives/calculate')
  @ApiOperation({ summary: 'Calculate EV incentives and costs for Swiss cantons' })
  @ApiResponse({ status: 200, description: 'EV incentives calculation completed' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Canton not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: EVIncentivesCalculationDto, description: 'EV incentives calculation data' })
  calculateEVIncentives(@Body(ValidationPipe) calculationData: EVIncentivesCalculationDto) {
    // Convert DTO to service expected format
    const vehicleData = {
      purchase_price: calculationData.vehicle.purchase_price || 50000,
      power_kw: calculationData.vehicle.power_kw || 150,
      weight_kg: calculationData.vehicle.weight_kg || 1800,
      battery_capacity_kwh: calculationData.vehicle.battery_capacity_kwh || 75,
      efficiency_kwh_100km: calculationData.vehicle.efficiency_kwh_100km || 20
    };
    const customerData = {
      annual_mileage: calculationData.customer.annual_mileage || 15000,
      years_ownership: calculationData.customer.years_ownership || 5,
      business_use: calculationData.customer.business_use || false
    };
    return this.swissDataService.calculateEVIncentives(calculationData.canton, vehicleData, customerData);
  }

  @Post('ev-incentives/compare')
  @ApiOperation({ summary: 'Compare EV incentives across multiple Swiss cantons' })
  @ApiResponse({ status: 200, description: 'EV incentives comparison completed' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: EVIncentivesComparisonDto, description: 'EV incentives comparison data' })
  compareEVIncentives(@Body(ValidationPipe) comparisonData: EVIncentivesComparisonDto) {
    // Convert DTO to service expected format
    const vehicleData = {
      purchase_price: comparisonData.vehicle.purchase_price || 50000,
      power_kw: comparisonData.vehicle.power_kw || 150,
      weight_kg: comparisonData.vehicle.weight_kg || 1800,
      battery_capacity_kwh: comparisonData.vehicle.battery_capacity_kwh || 75,
      efficiency_kwh_100km: comparisonData.vehicle.efficiency_kwh_100km || 20
    };
    const customerData = {
      annual_mileage: comparisonData.customer.annual_mileage || 15000,
      years_ownership: comparisonData.customer.years_ownership || 5,
      business_use: comparisonData.customer.business_use || false
    };
    return this.swissDataService.compareEVIncentives(comparisonData.cantons, vehicleData, customerData);
  }

  @Get('ev-incentives/cantons')
  @ApiOperation({ summary: 'Get EV incentive information for all Swiss cantons' })
  @ApiResponse({ status: 200, description: 'Canton incentives data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCantonIncentives() {
    return this.swissDataService.getCantonIncentives('all');
  }
}

