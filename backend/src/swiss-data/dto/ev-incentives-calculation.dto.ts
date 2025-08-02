import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class VehicleDataDto {
  @ApiPropertyOptional({
    description: 'Vehicle purchase price in CHF',
    example: 70000
  })
  @IsOptional()
  @IsNumber()
  @Min(10000)
  @Max(500000)
  purchase_price?: number;

  @ApiPropertyOptional({
    description: 'Vehicle power in kW',
    example: 255
  })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1000)
  power_kw?: number;

  @ApiPropertyOptional({
    description: 'Vehicle weight in kg',
    example: 2234
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(5000)
  weight_kg?: number;

  @ApiPropertyOptional({
    description: 'Battery capacity in kWh',
    example: 102
  })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  battery_capacity_kwh?: number;

  @ApiPropertyOptional({
    description: 'Energy efficiency in kWh per 100km',
    example: 22
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(50)
  efficiency_kwh_100km?: number;
}

class CustomerDataDto {
  @ApiPropertyOptional({
    description: 'Annual mileage in km',
    example: 15000
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(100000)
  annual_mileage?: number;

  @ApiPropertyOptional({
    description: 'Years of ownership',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  years_ownership?: number;

  @ApiPropertyOptional({
    description: 'Business use of vehicle',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  business_use?: boolean;
}

export class EVIncentivesCalculationDto {
  @ApiProperty({
    description: 'Swiss canton code',
    example: 'ZH'
  })
  @IsString()
  canton: string;

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