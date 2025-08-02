import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer } from './entities/customer.entity';
import { Company } from './entities/company.entity';
import { CustomerNote } from './entities/customer-note.entity';
import { CustomerNotesService } from './customer-notes.service';
import { CustomerNotesController } from './customer-notes.controller';
import { CustomerNoteResolver } from './graphql/customer-note.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Company, CustomerNote])],
  controllers: [CustomersController, CustomerNotesController],
  providers: [CustomersService, CustomerNotesService, CustomerNoteResolver],
  exports: [CustomersService, CustomerNotesService],
})
export class CustomersModule {}

