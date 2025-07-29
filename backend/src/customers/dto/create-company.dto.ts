import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LegalForm } from '../entities/company.entity';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name', example: 'TechCorp AG' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ description: 'Swiss UID number', example: 'CHE-123.456.789' })
  @IsString()
  @IsNotEmpty()
  uidNumber: string;

  @ApiProperty({ description: 'Legal form', enum: LegalForm, example: LegalForm.AG })
  @IsEnum(LegalForm)
  legalForm: LegalForm;

  @ApiPropertyOptional({ description: 'Industry sector', example: 'Technology' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ description: 'Company website', example: 'https://techcorp.ch' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'VAT number', example: 'CHE-123.456.789 MWST' })
  @IsString()
  @IsOptional()
  vatNumber?: string;

  @ApiPropertyOptional({ description: 'Number of employees', example: 50 })
  @IsNumber()
  @IsOptional()
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Annual revenue in CHF', example: 5000000 })
  @IsNumber()
  @IsOptional()
  annualRevenue?: number;

  @ApiPropertyOptional({ description: 'Company description' })
  @IsString()
  @IsOptional()
  description?: string;
}

