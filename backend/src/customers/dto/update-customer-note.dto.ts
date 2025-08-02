import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCustomerNoteDto {
  @ApiPropertyOptional({ example: 'Neuer Notiztext.', description: 'Updated note content' })
  @IsString()
  @IsOptional()
  content?: string;
}