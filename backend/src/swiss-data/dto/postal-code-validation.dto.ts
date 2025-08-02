import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsOptional, Matches } from 'class-validator';

export class PostalCodeValidationDto {
  @ApiProperty({
    description: 'Swiss postal code (4 digits)',
    example: '8001'
  })
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'Swiss postal codes must be exactly 4 digits' })
  postal_code: string;

  @ApiPropertyOptional({
    description: 'City name for additional validation',
    example: 'Zürich'
  })
  @IsOptional()
  @IsString()
  city?: string;
}