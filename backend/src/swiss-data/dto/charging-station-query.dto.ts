import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChargingStationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by canton code',
    example: 'ZH'
  })
  @IsOptional()
  @IsString()
  canton?: string;

  @ApiPropertyOptional({
    description: 'Filter by city name',
    example: 'Zürich'
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by charging type',
    enum: ['fast', 'normal', 'tesla', 'all'],
    example: 'fast'
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Minimum power in kW',
    example: 50
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  power_min?: number;

  @ApiPropertyOptional({
    description: 'Show only available stations',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  available_only?: boolean;

  @ApiPropertyOptional({
    description: 'Latitude for distance calculation',
    example: 47.3769
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitude for distance calculation',
    example: 8.5417
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @ApiPropertyOptional({
    description: 'Search radius in km',
    example: 50,
    default: 50
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(500)
  radius?: number;
}