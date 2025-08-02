import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

// Reuse the DTOs from the calculation file
class VehicleDataDto {
  @ApiPropertyOptional({
    description: 'Vehicle purchase price in CHF',
    example: 70000
  })
  @IsOptional()
  purchase_price?: number;

  @ApiPropertyOptional({
    description: 'Vehicle power in kW',
    example: 255
  })
  @IsOptional()
  power_kw?: number;

  @ApiPropertyOptional({
    description: 'Vehicle weight in kg',
    example: 2234
  })
  @IsOptional()
  weight_kg?: number;

  @ApiPropertyOptional({
    description: 'Battery capacity in kWh',
    example: 102
  })
  @IsOptional()
  battery_capacity_kwh?: number;

  @ApiPropertyOptional({
    description: 'Energy efficiency in kWh per 100km',
    example: 22
  })
  @IsOptional()
  efficiency_kwh_100km?: number;
}

class CustomerDataDto {
  @ApiPropertyOptional({
    description: 'Annual mileage in km',
    example: 15000
  })
  @IsOptional()
  annual_mileage?: number;

  @ApiPropertyOptional({
    description: 'Years of ownership',
    example: 5
  })
  @IsOptional()
  years_ownership?: number;

  @ApiPropertyOptional({
    description: 'Business use of vehicle',
    example: false
  })
  @IsOptional()
  business_use?: boolean;
}

export class EVIncentivesComparisonDto {
  @ApiPropertyOptional({
    description: 'List of canton codes to compare (if empty, major cantons will be used)',
    example: ['ZH', 'BE', 'GE', 'VD', 'BS'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cantons?: string[];

  @ApiProperty({
    description: 'Vehicle specifications',
    type: VehicleDataDto
  })
  @IsObject()
  @ValidateNested()
  @Type(() => VehicleDataDto)
  vehicle: VehicleDataDto;

  @ApiProperty({
    description: 'Customer information',
    type: CustomerDataDto
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customer: CustomerDataDto;
}