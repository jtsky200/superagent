import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CompanyLookupDto {
  @ApiPropertyOptional({
    description: 'Swiss UID number (CHE-XXX.XXX.XXX format)',
    example: 'CHE-123.456.789'
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  uid_number?: string;

  @ApiPropertyOptional({
    description: 'Company name to search for',
    example: 'TechCorp AG'
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  company_name?: string;
}