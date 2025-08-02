import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateCustomerNoteInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;
}

@InputType()
export class UpdateCustomerNoteInput {
  @Field()
  @IsString()
  @IsOptional()
  content?: string;
} 