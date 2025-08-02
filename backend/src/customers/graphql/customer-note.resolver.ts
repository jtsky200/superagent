import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CustomerNotesService } from '../customer-notes.service';
import { CustomerNote } from '../entities/customer-note.entity';
import { CreateCustomerNoteInput } from './customer-note.input';
import { UpdateCustomerNoteInput } from './customer-note.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Resolver(() => CustomerNote)
@UseGuards(JwtAuthGuard)
export class CustomerNoteResolver {
  constructor(private readonly notesService: CustomerNotesService) {}

  @Query(() => [CustomerNote], { description: 'Get all customer notes' })
  async customerNotes(): Promise<CustomerNote[]> {
    return this.notesService.findAll();
  }

  @Query(() => CustomerNote, { description: 'Get a single customer note by ID' })
  async customerNote(@Args('id', { type: () => ID }) id: string): Promise<CustomerNote> {
    return this.notesService.findOne(id);
  }

  @Query(() => [CustomerNote], { description: 'Get notes for a specific customer' })
  async customerNotesByCustomer(
    @Args('customerId', { type: () => ID }) customerId: string
  ): Promise<CustomerNote[]> {
    return this.notesService.findByCustomer(customerId);
  }

  @Mutation(() => CustomerNote, { description: 'Create a new customer note' })
  async createCustomerNote(
    @Args('input') input: CreateCustomerNoteInput
  ): Promise<CustomerNote> {
    return this.notesService.create(input);
  }

  @Mutation(() => CustomerNote, { description: 'Update an existing customer note' })
  async updateCustomerNote(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCustomerNoteInput
  ): Promise<CustomerNote> {
    return this.notesService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Delete a customer note' })
  async deleteCustomerNote(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.notesService.remove(id);
    return true;
  }
} 