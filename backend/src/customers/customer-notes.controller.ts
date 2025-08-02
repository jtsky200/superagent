import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CustomerNotesService } from './customer-notes.service';
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto';
import { UpdateCustomerNoteDto } from './dto/update-customer-note.dto';
import { CustomerNote } from './entities/customer-note.entity';

@ApiTags('customer-notes')
@Controller('customer-notes')
export class CustomerNotesController {
  constructor(private readonly notesService: CustomerNotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer note' })
  @ApiBody({ type: CreateCustomerNoteDto, examples: { example: { value: { customerId: 'uuid', content: 'Besonderer Wunsch: Probefahrt am Samstag.' } } } })
  @ApiResponse({ status: 201, description: 'Note created', type: CustomerNote })
  create(@Body() dto: CreateCustomerNoteDto) {
    return this.notesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customer notes' })
  @ApiResponse({ status: 200, description: 'List of notes', type: [CustomerNote] })
  findAll() {
    return this.notesService.findAll();
  }

  @Get('by-customer')
  @ApiOperation({ summary: 'Get notes for a specific customer' })
  @ApiQuery({ name: 'customerId', required: true, example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Notes for customer', type: [CustomerNote] })
  findByCustomer(@Query('customerId') customerId: string) {
    return this.notesService.findByCustomer(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single note by ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Single note', type: CustomerNote })
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a note by ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({ type: UpdateCustomerNoteDto, examples: { example: { value: { content: 'Neuer Notiztext.' } } } })
  @ApiResponse({ status: 200, description: 'Updated note', type: CustomerNote })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerNoteDto) {
    return this.notesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note by ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 204, description: 'Note deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}