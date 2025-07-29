import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType, SwissCantons } from '../entities/customer.entity';
import { CreateCompanyDto } from './create-company.dto';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer first name', example: 'Hans' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Customer last name', example: 'Müller' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Customer email address', example: 'hans.mueller@email.ch' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Customer phone number', example: '+41 79 123 45 67' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Street address', example: 'Bahnhofstrasse 1' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City', example: 'Zürich' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Postal code', example: '8001' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Swiss canton', enum: SwissCantons, example: SwissCantons.ZH })
  @IsEnum(SwissCantons)
  canton: SwissCantons;

  @ApiProperty({ description: 'Customer type', enum: CustomerType, example: CustomerType.PRIVATE })
  @IsEnum(CustomerType)
  customerType: CustomerType;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1980-01-01' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'Nationality', example: 'Swiss' })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Customer notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Company information (for business customers)' })
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  @IsOptional()
  company?: CreateCompanyDto;
}

