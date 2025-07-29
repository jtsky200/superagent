import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer, CustomerType } from './entities/customer.entity';
import { Company } from './entities/company.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    let company = null;

    // If business customer, create company
    if (createCustomerDto.customerType === CustomerType.BUSINESS && createCustomerDto.company) {
      company = this.companyRepository.create(createCustomerDto.company);
      company = await this.companyRepository.save(company);
    }

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      company,
    });

    return this.customerRepository.save(customer);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    customerType?: CustomerType,
  ): Promise<{ customers: Customer[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.company', 'company')
      .orderBy('customer.createdAt', 'DESC');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR company.companyName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply customer type filter
    if (customerType) {
      queryBuilder.andWhere('customer.customerType = :customerType', { customerType });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [customers, total] = await queryBuilder.getManyAndCount();

    return {
      customers,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['company', 'vehicleConfigurations', 'tcoCalculations'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    // Update company if provided
    if (updateCustomerDto.company && customer.company) {
      await this.companyRepository.update(customer.company.id, updateCustomerDto.company);
    } else if (updateCustomerDto.company && !customer.company) {
      const company = this.companyRepository.create(updateCustomerDto.company);
      customer.company = await this.companyRepository.save(company);
    }

    // Update customer
    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    
    // Delete company if exists
    if (customer.company) {
      await this.companyRepository.delete(customer.company.id);
    }

    await this.customerRepository.delete(id);
  }

  async getStatistics(): Promise<{
    total: number;
    private: number;
    business: number;
    byCantons: Record<string, number>;
  }> {
    const total = await this.customerRepository.count();
    const privateCount = await this.customerRepository.count({
      where: { customerType: CustomerType.PRIVATE },
    });
    const businessCount = await this.customerRepository.count({
      where: { customerType: CustomerType.BUSINESS },
    });

    // Get customers by cantons
    const cantonStats = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.canton', 'canton')
      .addSelect('COUNT(*)', 'count')
      .groupBy('customer.canton')
      .getRawMany();

    const byCantons = cantonStats.reduce((acc, stat) => {
      acc[stat.canton] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total,
      private: privateCount,
      business: businessCount,
      byCantons,
    };
  }
}

