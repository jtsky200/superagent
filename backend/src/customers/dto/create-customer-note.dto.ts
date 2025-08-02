import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerNoteDto {
  @ApiProperty({ example: 'uuid', description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 'Besonderer Wunsch: Probefahrt am Samstag.', description: 'Note content' })
  @IsString()
  @IsNotEmpty()
  content: string;
}