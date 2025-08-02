import { IsString, IsNotEmpty, IsOptional, IsEmail, IsPhoneNumber, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Lead DTOs
export class CreateLeadDto {
  @ApiProperty({ description: 'Lead first name' })
  @IsString()
  @IsNotEmpty()
  FirstName: string;

  @ApiProperty({ description: 'Lead last name' })
  @IsString()
  @IsNotEmpty()
  LastName: string;

  @ApiProperty({ description: 'Lead company' })
  @IsString()
  @IsNotEmpty()
  Company: string;

  @ApiProperty({ description: 'Lead email address' })
  @IsEmail()
  @IsNotEmpty()
  Email: string;

  @ApiPropertyOptional({ description: 'Lead phone number' })
  @IsPhoneNumber('CH', { message: 'Please provide a valid Swiss phone number' })
  @IsOptional()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Lead status' })
  @IsString()
  @IsOptional()
  Status?: string;

  @ApiPropertyOptional({ description: 'Lead source' })
  @IsString()
  @IsOptional()
  LeadSource?: string;

  @ApiPropertyOptional({ description: 'Street address' })
  @IsString()
  @IsOptional()
  Street?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsString()
  @IsOptional()
  City?: string;

  @ApiPropertyOptional({ description: 'State/Canton' })
  @IsString()
  @IsOptional()
  State?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsString()
  @IsOptional()
  PostalCode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsString()
  @IsOptional()
  Country?: string;

  @ApiPropertyOptional({ description: 'Industry' })
  @IsString()
  @IsOptional()
  Industry?: string;

  @ApiPropertyOptional({ description: 'Annual revenue' })
  @IsOptional()
  AnnualRevenue?: number;

  @ApiPropertyOptional({ description: 'Number of employees' })
  @IsOptional()
  NumberOfEmployees?: number;

  @ApiPropertyOptional({ description: 'Description/Notes' })
  @IsString()
  @IsOptional()
  Description?: string;
}

export class UpdateLeadDto extends CreateLeadDto {
  @ApiProperty({ description: 'Salesforce Lead ID' })
  @IsString()
  @IsNotEmpty()
  Id: string;
}

// Contact DTOs
export class CreateContactDto {
  @ApiProperty({ description: 'Contact first name' })
  @IsString()
  @IsNotEmpty()
  FirstName: string;

  @ApiProperty({ description: 'Contact last name' })
  @IsString()
  @IsNotEmpty()
  LastName: string;

  @ApiPropertyOptional({ description: 'Contact email address' })
  @IsEmail()
  @IsOptional()
  Email?: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsPhoneNumber('CH')
  @IsOptional()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Account ID this contact belongs to' })
  @IsString()
  @IsOptional()
  AccountId?: string;

  @ApiPropertyOptional({ description: 'Contact title/position' })
  @IsString()
  @IsOptional()
  Title?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsString()
  @IsOptional()
  Department?: string;

  @ApiPropertyOptional({ description: 'Mailing street' })
  @IsString()
  @IsOptional()
  MailingStreet?: string;

  @ApiPropertyOptional({ description: 'Mailing city' })
  @IsString()
  @IsOptional()
  MailingCity?: string;

  @ApiPropertyOptional({ description: 'Mailing state' })
  @IsString()
  @IsOptional()
  MailingState?: string;

  @ApiPropertyOptional({ description: 'Mailing postal code' })
  @IsString()
  @IsOptional()
  MailingPostalCode?: string;

  @ApiPropertyOptional({ description: 'Mailing country' })
  @IsString()
  @IsOptional()
  MailingCountry?: string;
}

export class UpdateContactDto extends CreateContactDto {
  @ApiProperty({ description: 'Salesforce Contact ID' })
  @IsString()
  @IsNotEmpty()
  Id: string;
}

// Case DTOs
export class CreateCaseDto {
  @ApiProperty({ description: 'Case subject' })
  @IsString()
  @IsNotEmpty()
  Subject: string;

  @ApiPropertyOptional({ description: 'Case description' })
  @IsString()
  @IsOptional()
  Description?: string;

  @ApiPropertyOptional({ description: 'Case status' })
  @IsString()
  @IsOptional()
  Status?: string;

  @ApiPropertyOptional({ description: 'Case priority' })
  @IsString()
  @IsOptional()
  Priority?: string;

  @ApiPropertyOptional({ description: 'Case origin' })
  @IsString()
  @IsOptional()
  Origin?: string;

  @ApiPropertyOptional({ description: 'Account ID associated with case' })
  @IsString()
  @IsOptional()
  AccountId?: string;

  @ApiPropertyOptional({ description: 'Contact ID associated with case' })
  @IsString()
  @IsOptional()
  ContactId?: string;

  @ApiPropertyOptional({ description: 'Case type' })
  @IsString()
  @IsOptional()
  Type?: string;

  @ApiPropertyOptional({ description: 'Case reason' })
  @IsString()
  @IsOptional()
  Reason?: string;
}

export class UpdateCaseDto extends CreateCaseDto {
  @ApiProperty({ description: 'Salesforce Case ID' })
  @IsString()
  @IsNotEmpty()
  Id: string;
}

// Activity/Task DTOs
export class CreateActivityDto {
  @ApiProperty({ description: 'Activity subject' })
  @IsString()
  @IsNotEmpty()
  Subject: string;

  @ApiPropertyOptional({ description: 'Activity description' })
  @IsString()
  @IsOptional()
  Description?: string;

  @ApiPropertyOptional({ description: 'Activity type' })
  @IsString()
  @IsOptional()
  Type?: string;

  @ApiPropertyOptional({ description: 'Activity status' })
  @IsString()
  @IsOptional()
  Status?: string;

  @ApiPropertyOptional({ description: 'Activity priority' })
  @IsString()
  @IsOptional()
  Priority?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsDateString()
  @IsOptional()
  ActivityDate?: string;

  @ApiPropertyOptional({ description: 'Related Lead ID' })
  @IsString()
  @IsOptional()
  WhoId?: string;

  @ApiPropertyOptional({ description: 'Related Account/Opportunity ID' })
  @IsString()
  @IsOptional()
  WhatId?: string;

  @ApiPropertyOptional({ description: 'Is task completed' })
  @IsBoolean()
  @IsOptional()
  IsCompleted?: boolean;
}

// Search DTOs
export class SalesforceSearchDto {
  @ApiProperty({ description: 'Search query (SOSL format)' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({ description: 'Object types to search in' })
  @IsOptional()
  objectTypes?: string[];

  @ApiPropertyOptional({ description: 'Maximum number of results' })
  @IsOptional()
  limit?: number;
}

// Generic API Request DTO
export class SalesforceApiRequestDto {
  @ApiProperty({ description: 'HTTP method' })
  @IsString()
  @IsNotEmpty()
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';

  @ApiProperty({ description: 'API endpoint path (relative to instance URL)' })
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @ApiPropertyOptional({ description: 'Request body for POST/PATCH requests' })
  @IsOptional()
  body?: any;

  @ApiPropertyOptional({ description: 'Query parameters' })
  @IsOptional()
  params?: Record<string, any>;
}