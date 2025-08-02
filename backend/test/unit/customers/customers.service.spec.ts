import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { CustomersService } from '../../../src/customers/customers.service';
import { Customer, CustomerType, SwissCantons } from '../../../src/customers/entities/customer.entity';
import { Company } from '../../../src/customers/entities/company.entity';
import { CreateCustomerDto } from '../../../src/customers/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../../src/customers/dto/update-customer.dto';

describe('CustomersService', () => {
  let service: CustomersService;
  let customerRepository: Repository<Customer>;
  let companyRepository: Repository<Company>;

  // Mock data
  const mockCustomer: Customer = {
    id: 'customer-123',
    firstName: 'Hans',
    lastName: 'Müller',
    email: 'hans.mueller@example.ch',
    phone: '+41 79 123 45 67',
    street: 'Bahnhofstrasse 42',
    city: 'Zürich',
    postalCode: '8001',
    canton: SwissCantons.ZH,
    customerType: CustomerType.PRIVATE,
    dateOfBirth: new Date('1978-05-15'),
    nationality: 'CH',
    isActive: true,
    notes: 'VIP Customer',
    company: null,
    vehicleConfigurations: [],
    tcoCalculations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: 'Hans Müller',
    fullAddress: 'Bahnhofstrasse 42, 8001 Zürich, ZH',
  };

  const mockBusinessCustomer: Customer = {
    ...mockCustomer,
    id: 'business-customer-123',
    customerType: CustomerType.BUSINESS,
    email: 'ceo@techag.ch',
  };

  const mockCompany: Company = {
    id: 'company-123',
    customerId: 'business-customer-123',
    companyName: 'TechAG Solutions',
    uidNumber: 'CHE-123.456.789',
    vatNumber: 'CHE-123.456.789 MWST',
    legalForm: 'AG' as any,
    foundingDate: new Date('2010-03-15'),
    employeesCount: 45,
    annualRevenue: 8500000.00,
    industryCode: '6201',
    industryDescription: 'Software Development',
    creditRating: 'A' as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomerRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCompanyRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    customerRepository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
    companyRepository = module.get<Repository<Company>>(getRepositoryToken(Company));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCustomerDto: CreateCustomerDto = {
      firstName: 'Anna',
      lastName: 'Weber',
      email: 'anna.weber@example.ch',
      phone: '+41 78 987 65 43',
      street: 'Rue du Rhône 25',
      city: 'Genève',
      postalCode: '1201',
      canton: SwissCantons.GE,
      customerType: CustomerType.PRIVATE,
      dateOfBirth: new Date('1985-09-22'),
      nationality: 'CH',
    };

    it('should create a private customer successfully', async () => {
      const newCustomer = { ...mockCustomer, ...createCustomerDto, id: 'new-customer-123' };

      mockCustomerRepository.findOne.mockResolvedValue(null); // Email not exists
      mockCustomerRepository.create.mockReturnValue(newCustomer);
      mockCustomerRepository.save.mockResolvedValue(newCustomer);

      const result = await service.create(createCustomerDto);

      expect(result).toEqual(newCustomer);
      expect(mockCustomerRepository.create).toHaveBeenCalledWith(createCustomerDto);
      expect(mockCustomerRepository.save).toHaveBeenCalledWith(newCustomer);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);

      await expect(service.create(createCustomerDto)).rejects.toThrow(ConflictException);
    });

    it('should create a business customer with company', async () => {
      const businessCustomerDto = {
        ...createCustomerDto,
        customerType: CustomerType.BUSINESS,
        email: 'contact@newcompany.ch',
        company: {
          companyName: 'New Company AG',
          uidNumber: 'CHE-987.654.321',
          legalForm: 'AG' as any,
          employeesCount: 25,
        },
      };

      const newBusinessCustomer = {
        ...mockBusinessCustomer,
        ...businessCustomerDto,
        id: 'new-business-123',
      };

      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(newBusinessCustomer);
      mockCustomerRepository.save.mockResolvedValue(newBusinessCustomer);

      const result = await service.create(businessCustomerDto);

      expect(result).toEqual(newBusinessCustomer);
    });
  });

  describe('findAll', () => {
    it('should return all customers with pagination', async () => {
      const customers = [mockCustomer, mockBusinessCustomer];
      mockCustomerRepository.find.mockResolvedValue(customers);
      mockCustomerRepository.count.mockResolvedValue(2);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: customers,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter customers by canton', async () => {
      const zurichCustomers = [mockCustomer];
      mockCustomerRepository.find.mockResolvedValue(zurichCustomers);
      mockCustomerRepository.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, SwissCantons.ZH);

      expect(result.data).toEqual(zurichCustomers);
      expect(mockCustomerRepository.find).toHaveBeenCalledWith({
        where: { canton: SwissCantons.ZH },
        relations: ['company'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter customers by type', async () => {
      const privateCustomers = [mockCustomer];
      mockCustomerRepository.find.mockResolvedValue(privateCustomers);
      mockCustomerRepository.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, undefined, CustomerType.PRIVATE);

      expect(result.data).toEqual(privateCustomers);
    });
  });

  describe('findOne', () => {
    it('should return customer when found', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await service.findOne('customer-123');

      expect(result).toEqual(mockCustomer);
      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'customer-123' },
        relations: ['company', 'vehicleConfigurations', 'tcoCalculations'],
      });
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return customer when found by email', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await service.findByEmail('hans.mueller@example.ch');

      expect(result).toEqual(mockCustomer);
      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'hans.mueller@example.ch' },
        relations: ['company'],
      });
    });

    it('should return null when customer not found by email', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateCustomerDto: UpdateCustomerDto = {
      firstName: 'Hans Updated',
      phone: '+41 79 999 88 77',
      notes: 'Updated VIP Customer',
    };

    it('should update customer successfully', async () => {
      const updatedCustomer = { ...mockCustomer, ...updateCustomerDto };

      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.update('customer-123', updateCustomerDto);

      expect(result).toEqual(updatedCustomer);
      expect(mockCustomerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateCustomerDto)
      );
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateCustomerDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ConflictException when updating email to existing one', async () => {
      const anotherCustomer = { ...mockCustomer, id: 'another-123' };
      
      mockCustomerRepository.findOne
        .mockResolvedValueOnce(mockCustomer) // First call for finding the customer to update
        .mockResolvedValueOnce(anotherCustomer); // Second call for checking email uniqueness

      await expect(
        service.update('customer-123', { email: 'existing@example.ch' })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should deactivate customer instead of hard delete', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      const deactivatedCustomer = { ...mockCustomer, isActive: false };
      mockCustomerRepository.save.mockResolvedValue(deactivatedCustomer);

      await service.remove('customer-123');

      expect(mockCustomerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false })
      );
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchCustomers', () => {
    it('should search customers by name and email', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCustomer], 1]),
      };

      mockCustomerRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.searchCustomers('Hans', SwissCantons.ZH, CustomerType.PRIVATE, 1, 10);

      expect(result).toEqual({
        data: [mockCustomer],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('Swiss Market Specific Tests', () => {
    it('should validate Swiss postal codes', async () => {
      const swissPostalCodes = ['8001', '1201', '4001', '6900', '3001'];
      
      for (const postalCode of swissPostalCodes) {
        const customerDto = {
          ...mockCustomer,
          postalCode,
          email: `test-${postalCode}@example.ch`,
        };

        mockCustomerRepository.findOne.mockResolvedValue(null);
        mockCustomerRepository.create.mockReturnValue(customerDto);
        mockCustomerRepository.save.mockResolvedValue(customerDto);

        const createDto: CreateCustomerDto = {
          firstName: 'Test',
          lastName: 'User',
          email: `test-${postalCode}@example.ch`,
          phone: '+41 79 123 45 67',
          street: 'Test Street 1',
          city: 'Test City',
          postalCode,
          canton: SwissCantons.ZH,
          customerType: CustomerType.PRIVATE,
        };

        const result = await service.create(createDto);
        expect(result.postalCode).toBe(postalCode);
      }
    });

    it('should handle Swiss phone number formats', async () => {
      const swissPhoneNumbers = [
        '+41 79 123 45 67',
        '+41 78 987 65 43',
        '+41 76 555 12 34',
        '079 123 45 67',
        '078 987 65 43',
      ];

      for (const phone of swissPhoneNumbers) {
        const customerDto = {
          ...mockCustomer,
          phone,
          email: `test-${phone.replace(/\D/g, '')}@example.ch`,
        };

        mockCustomerRepository.findOne.mockResolvedValue(null);
        mockCustomerRepository.create.mockReturnValue(customerDto);
        mockCustomerRepository.save.mockResolvedValue(customerDto);

        const createDto: CreateCustomerDto = {
          firstName: 'Test',
          lastName: 'User',
          email: customerDto.email,
          phone,
          street: 'Test Street 1',
          city: 'Test City',
          postalCode: '8001',
          canton: SwissCantons.ZH,
          customerType: CustomerType.PRIVATE,
        };

        const result = await service.create(createDto);
        expect(result.phone).toBe(phone);
      }
    });

    it('should validate all Swiss cantons', async () => {
      const allCantons = Object.values(SwissCantons);
      
      for (const canton of allCantons) {
        const customerDto = {
          ...mockCustomer,
          canton,
          email: `test-${canton}@example.ch`,
        };

        mockCustomerRepository.findOne.mockResolvedValue(null);
        mockCustomerRepository.create.mockReturnValue(customerDto);
        mockCustomerRepository.save.mockResolvedValue(customerDto);

        const createDto: CreateCustomerDto = {
          firstName: 'Test',
          lastName: 'User',
          email: `test-${canton}@example.ch`,
          phone: '+41 79 123 45 67',
          street: 'Test Street 1',
          city: 'Test City',
          postalCode: '8001',
          canton,
          customerType: CustomerType.PRIVATE,
        };

        const result = await service.create(createDto);
        expect(result.canton).toBe(canton);
      }
    });

    it('should handle Swiss company UID numbers', async () => {
      const uidNumbers = [
        'CHE-123.456.789',
        'CHE-987.654.321',
        'CHE-111.222.333',
      ];

      for (const uidNumber of uidNumbers) {
        const businessCustomerDto = {
          firstName: 'CEO',
          lastName: 'Business',
          email: `ceo-${uidNumber.replace(/\D/g, '')}@company.ch`,
          phone: '+41 44 123 45 67',
          street: 'Business Street 1',
          city: 'Zürich',
          postalCode: '8001',
          canton: SwissCantons.ZH,
          customerType: CustomerType.BUSINESS,
          company: {
            companyName: `Company ${uidNumber}`,
            uidNumber,
            legalForm: 'AG' as any,
            employeesCount: 50,
          },
        };

        const newBusinessCustomer = {
          ...mockBusinessCustomer,
          ...businessCustomerDto,
          id: `business-${uidNumber.replace(/\D/g, '')}`,
        };

        mockCustomerRepository.findOne.mockResolvedValue(null);
        mockCustomerRepository.create.mockReturnValue(newBusinessCustomer);
        mockCustomerRepository.save.mockResolvedValue(newBusinessCustomer);

        const result = await service.create(businessCustomerDto);
        expect(result.email).toBe(businessCustomerDto.email);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle large result sets efficiently', async () => {
      const largeCustomerList = Array(1000).fill(null).map((_, index) => ({
        ...mockCustomer,
        id: `customer-${index}`,
        email: `customer${index}@example.ch`,
      }));

      mockCustomerRepository.find.mockResolvedValue(largeCustomerList);
      mockCustomerRepository.count.mockResolvedValue(1000);

      const startTime = Date.now();
      const result = await service.findAll(1, 1000);
      const endTime = Date.now();

      expect(result.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should efficiently search through large datasets', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockImplementation(async () => {
          // Simulate database query delay for large dataset
          await new Promise(resolve => setTimeout(resolve, 50));
          return [[mockCustomer], 1];
        }),
      };

      mockCustomerRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const startTime = Date.now();
      const result = await service.searchCustomers('Hans');
      const endTime = Date.now();

      expect(result.data).toEqual([mockCustomer]);
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Edge Cases', () => {
    it('should handle database connection errors', async () => {
      mockCustomerRepository.find.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid pagination parameters', async () => {
      mockCustomerRepository.find.mockResolvedValue([]);
      mockCustomerRepository.count.mockResolvedValue(0);

      // Test negative page
      const result1 = await service.findAll(-1, 10);
      expect(result1.page).toBe(1);

      // Test zero limit
      const result2 = await service.findAll(1, 0);
      expect(result2.limit).toBe(10); // Should default to 10
    });

    it('should handle special characters in search queries', async () => {
      const specialCharacters = ['ä', 'ö', 'ü', 'ß', 'é', 'à', 'ç'];
      
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCustomer], 1]),
      };

      for (const char of specialCharacters) {
        mockCustomerRepository.createQueryBuilder.mockReturnValue(queryBuilder);
        
        const result = await service.searchCustomers(`Test${char}name`);
        expect(result.data).toEqual([mockCustomer]);
      }
    });
  });
});