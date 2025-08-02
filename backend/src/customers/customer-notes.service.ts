import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerNote } from './entities/customer-note.entity';
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto';
import { UpdateCustomerNoteDto } from './dto/update-customer-note.dto';

@Injectable()
export class CustomerNotesService {
  constructor(
    @InjectRepository(CustomerNote)
    private readonly noteRepo: Repository<CustomerNote>,
  ) {}

  async create(dto: CreateCustomerNoteDto): Promise<CustomerNote> {
    const note = this.noteRepo.create(dto);
    return this.noteRepo.save(note);
  }

  async findAll(): Promise<CustomerNote[]> {
    return this.noteRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CustomerNote> {
    const note = await this.noteRepo.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async update(id: string, dto: UpdateCustomerNoteDto): Promise<CustomerNote> {
    const note = await this.findOne(id);
    Object.assign(note, dto);
    return this.noteRepo.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.findOne(id);
    await this.noteRepo.remove(note);
  }

  async findByCustomer(customerId: string): Promise<CustomerNote[]> {
    return this.noteRepo.find({ where: { customerId }, order: { createdAt: 'DESC' } });
  }
}