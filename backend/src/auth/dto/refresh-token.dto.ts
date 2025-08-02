import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh-token-here', description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
} 