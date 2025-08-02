import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SalesforceAuthDto {
  @ApiProperty({ description: 'Authorization code from Salesforce OAuth flow' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'State parameter for CSRF protection' })
  @IsString()
  @IsOptional()
  state?: string;
}

export class SalesforceTokenDto {
  @ApiProperty({ description: 'Access token for Salesforce API' })
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({ description: 'Refresh token for token renewal' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;

  @ApiProperty({ description: 'Salesforce instance URL' })
  @IsUrl()
  @IsNotEmpty()
  instance_url: string;

  @ApiProperty({ description: 'Token ID for user identification' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Token type (usually Bearer)' })
  @IsString()
  @IsNotEmpty()
  token_type: string;

  @ApiProperty({ description: 'Issued timestamp' })
  @IsString()
  @IsNotEmpty()
  issued_at: string;

  @ApiProperty({ description: 'Signature for token validation' })
  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class SalesforceConfigDto {
  @ApiProperty({ description: 'Salesforce environment (sandbox/production)' })
  @IsString()
  @IsNotEmpty()
  environment: 'sandbox' | 'production';

  @ApiProperty({ description: 'Salesforce instance URL' })
  @IsUrl()
  @IsNotEmpty()
  instanceUrl: string;

  @ApiProperty({ description: 'OAuth connection status' })
  isConnected: boolean;

  @ApiPropertyOptional({ description: 'Connected user information' })
  userInfo?: {
    id: string;
    username: string;
    display_name: string;
    email: string;
    organization_id: string;
  };
}