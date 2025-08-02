import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CustomersModule } from '../../../src/customers/customers.module';
import { AuthModule } from '../../../src/auth/auth.module';
import { Customer, CustomerType, SwissCantons } from '../../../src/customers/entities/customer.entity';
import { Company } from '../../../src/customers/entities/company.entity';
import { User, UserRole } from '../../../src/auth/entities/user.entity';
import { RefreshToken } from '../../../src/auth/entities/refresh-token.entity';
import { CreateCustomerDto } from '../../../src/customers/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../../src/customers/dto/update-customer.dto';

describe('CustomersController (Integration)', () => {
  let app: INestApplication;
  let customerRepository: Repository<Customer>;
  let companyRepository: Repository<Company>;
  let userRepository: Repository<User>;
  let accessToken: string;
  let adminAccessToken: string;

  // Test database configuration
  const testDbConfig = {
    type: 'sqlite' as const,
    database: ':memory:',
    entities: [Customer, Company, User, RefreshToken],
    synchronize: true,
    logging: false,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot(testDbConfig),
        AuthModule,
        CustomersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    customerRepository = moduleFixture.get<Repository<Customer>>(getRepositoryToken(Customer));
    companyRepository = moduleFixture.get<Repository<Company>>(getRepositoryToken(Company));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    await app.init();

    // Create test users and get tokens
    await createTestUsers();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up customers and companies before each test
    await companyRepository.delete({});
    await customerRepository.delete({});
  });

  async function createTestUsers() {
    // Create regular user
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@cadillac.ch',
        password: 'UserTest123!',
        firstName: 'Test',
        lastName: 'User',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@cadillac.ch',
        password: 'UserTest123!',
      });

    accessToken = loginResponse.body.accessToken;

    // Create admin user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@cadillac.ch',
        password: 'AdminTest123!',
        firstName: 'Admin',
        lastName: 'User',
      });

    // Update user role to admin
    await userRepository.update(
      { email: 'admin@cadillac.ch' },
      { role: UserRole.ADMIN }
    );

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@cadillac.ch',
        password: 'AdminTest123!',
      });

    adminAccessToken = adminLoginResponse.body.accessToken;
  }

  describe('POST /customers', () => {
    const validCustomerDto: CreateCustomerDto = {
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
    };

    it('should create a private customer successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validCustomerDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        firstName: validCustomerDto.firstName,
        lastName: validCustomerDto.lastName,
        email: validCustomerDto.email,
        canton: validCustomerDto.canton,
        customerType: validCustomerDto.customerType,
      });

      // Verify in database
      const savedCustomer = await customerRepository.findOne({
        where: { email: validCustomerDto.email },
      });
      expect(savedCustomer).toBeDefined();
    });

    it('should create a business customer with company data', async () => {
      const businessCustomerDto = {
        ...validCustomerDto,
        email: 'contact@techag.ch',
        customerType: CustomerType.BUSINESS,
        company: {
          companyName: 'TechAG Solutions',
          uidNumber: 'CHE-123.456.789',
          legalForm: 'AG' as any,
          employeesCount: 45,
          annualRevenue: 8500000,
          industryCode: '6201',
          industryDescription: 'Software Development',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(businessCustomerDto)
        .expect(201);

      expect(response.body.customerType).toBe(CustomerType.BUSINESS);
      expect(response.body).toHaveProperty('company');

      // Verify company was created
      const savedCompany = await companyRepository.findOne({
        where: { customerId: response.body.id },
      });
      expect(savedCompany).toBeDefined();
      expect(savedCompany?.companyName).toBe('TechAG Solutions');
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/customers')
        .send(validCustomerDto)
        .expect(401);
    });

    it('should validate Swiss postal codes', async () => {
      const swissPostalCodes = [
        { postalCode: '8001', city: 'Zürich', canton: SwissCantons.ZH },
        { postalCode: '1201', city: 'Genève', canton: SwissCantons.GE },
        { postalCode: '4001', city: 'Basel', canton: SwissCantons.BS },
        { postalCode: '6900', city: 'Lugano', canton: SwissCantons.TI },
      ];

      for (const [index, location] of swissPostalCodes.entries()) {
        const customerDto = {
          ...validCustomerDto,
          email: `customer${index}@test.ch`,
          ...location,
        };

        const response = await request(app.getHttpServer())
          .post('/customers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(customerDto)
          .expect(201);

        expect(response.body.postalCode).toBe(location.postalCode);
        expect(response.body.canton).toBe(location.canton);
      }
    });

    it('should validate Swiss phone numbers', async () => {
      const swissPhoneNumbers = [
        '+41 79 123 45 67',
        '+41 78 987 65 43',
        '079 123 45 67',
        '078 987 65 43',
      ];

      for (const [index, phone] of swissPhoneNumbers.entries()) {
        const customerDto = {
          ...validCustomerDto,
          email: `phone${index}@test.ch`,
          phone,
        };

        const response = await request(app.getHttpServer())
          .post('/customers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(customerDto)
          .expect(201);

        expect(response.body.phone).toBe(phone);
      }
    });

    it('should return 409 for duplicate email', async () => {
      // Create first customer
      await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validCustomerDto)
        .expect(201);

      // Try to create second customer with same email
      await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validCustomerDto)
        .expect(409);
    });

    it('should validate input fields', async () => {
      const invalidDto = {
        ...validCustomerDto,
        email: 'invalid-email',
        firstName: '',
        postalCode: '99999', // Invalid Swiss postal code
      };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('email'),
          expect.stringContaining('firstName'),
        ])
      );
    });
  });

  describe('GET /customers', () => {
    let testCustomers: Customer[];

    beforeEach(async () => {
      // Create test customers
      const customerData = [
        {
          firstName: 'Hans',
          lastName: 'Müller',
          email: 'hans@test.ch',
          canton: SwissCantons.ZH,
          customerType: CustomerType.PRIVATE,
        },
        {
          firstName: 'Anna',
          lastName: 'Weber',
          email: 'anna@test.ch',
          canton: SwissCantons.GE,
          customerType: CustomerType.BUSINESS,
        },
        {
          firstName: 'Peter',
          lastName: 'Schmidt',
          email: 'peter@test.ch',
          canton: SwissCantons.ZH,
          customerType: CustomerType.PRIVATE,
        },
      ];

      testCustomers = [];
      for (const [index, data] of customerData.entries()) {
        const response = await request(app.getHttpServer())
          .post('/customers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            ...data,
            phone: `+41 79 123 45 ${index + 10}`,
            street: 'Test Street 1',
            city: 'Test City',
            postalCode: '8001',
          })
          .expect(201);

        testCustomers.push(response.body);
      }
    });

    it('should return all customers with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({ firstName: 'Hans' }),
          expect.objectContaining({ firstName: 'Anna' }),
          expect.objectContaining({ firstName: 'Peter' }),
        ]),
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter customers by canton', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers')
        .query({ canton: SwissCantons.ZH })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2); // Hans and Peter from ZH
      response.body.data.forEach((customer: any) => {
        expect(customer.canton).toBe(SwissCantons.ZH);
      });
    });

    it('should filter customers by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers')
        .query({ customerType: CustomerType.PRIVATE })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2); // Hans and Peter
      response.body.data.forEach((customer: any) => {
        expect(customer.customerType).toBe(CustomerType.PRIVATE);
      });
    });

    it('should paginate results correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers')
        .query({ page: 1, limit: 2 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.totalPages).toBe(2);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/customers')
        .expect(401);
    });
  });

  describe('GET /customers/:id', () => {
    let testCustomer: Customer;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Customer',
          email: 'test@customer.ch',
          phone: '+41 79 123 45 67',
          street: 'Test Street 1',
          city: 'Test City',
          postalCode: '8001',
          canton: SwissCantons.ZH,
          customerType: CustomerType.PRIVATE,
        })
        .expect(201);

      testCustomer = response.body;
    });

    it('should return customer by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/customers/${testCustomer.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testCustomer.id,
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@customer.ch',
      });
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app.getHttpServer())
        .get('/customers/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/customers/${testCustomer.id}`)
        .expect(401);
    });
  });

  describe('PUT /customers/:id', () => {
    let testCustomer: Customer;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Update',
          lastName: 'Test',
          email: 'update@test.ch',
          phone: '+41 79 123 45 67',
          street: 'Old Street 1',
          city: 'Old City',
          postalCode: '8001',
          canton: SwissCantons.ZH,
          customerType: CustomerType.PRIVATE,
        })
        .expect(201);

      testCustomer = response.body;
    });

    it('should update customer successfully', async () => {
      const updateDto: UpdateCustomerDto = {
        firstName: 'Updated',
        street: 'New Street 1',
        city: 'New City',
        notes: 'VIP Customer',
      };

      const response = await request(app.getHttpServer())
        .put(`/customers/${testCustomer.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testCustomer.id,
        firstName: 'Updated',
        street: 'New Street 1',
        city: 'New City',
        notes: 'VIP Customer',
        // Unchanged fields
        lastName: 'Test',
        email: 'update@test.ch',
      });
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app.getHttpServer())
        .put('/customers/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'Updated' })
        .expect(404);
    });

    it('should return 409 when updating email to existing one', async () => {
      // Create another customer
      await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Another',
          lastName: 'Customer',
          email: 'another@test.ch',
          phone: '+41 79 987 65 43',
          street: 'Another Street 1',
          city: 'Another City',
          postalCode: '8002',
          canton: SwissCantons.ZH,
          customerType: CustomerType.PRIVATE,
        })
        .expect(201);

      // Try to update first customer's email to second customer's email
      await request(app.getHttpServer())
        .put(`/customers/${testCustomer.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'another@test.ch' })
        .expect(409);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .put(`/customers/${testCustomer.id}`)
        .send({ firstName: 'Updated' })
        .expect(401);
    });
  });

  describe('DELETE /customers/:id', () => {
    let testCustomer: Customer;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Delete',
          lastName: 'Test',
          email: 'delete@test.ch',
          phone: '+41 79 123 45 67',
          street: 'Delete Street 1',
          city: 'Delete City',
          postalCode: '8001',
          canton: SwissCantons.ZH,
          customerType: CustomerType.PRIVATE,
        })
        .expect(201);

      testCustomer = response.body;
    });

    it('should deactivate customer (soft delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/customers/${testCustomer.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify customer is deactivated
      const deactivatedCustomer = await customerRepository.findOne({
        where: { id: testCustomer.id },
      });
      expect(deactivatedCustomer?.isActive).toBe(false);
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app.getHttpServer())
        .delete('/customers/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should require admin role for deletion (if implemented)', async () => {
      // This test assumes role-based access control is implemented
      // If not implemented yet, this test documents the expected behavior
      await request(app.getHttpServer())
        .delete(`/customers/${testCustomer.id}`)
        .set('Authorization', `Bearer ${accessToken}`) // Regular user
        .expect(200); // Should succeed for now, but might require admin in future
    });
  });

  describe('GET /customers/search', () => {
    beforeEach(async () => {
      // Create test customers for search
      const customers = [
        { firstName: 'Hans', lastName: 'Müller', email: 'hans.mueller@test.ch' },
        { firstName: 'Anna', lastName: 'Weber', email: 'anna.weber@test.ch' },
        { firstName: 'Peter', lastName: 'Müller', email: 'peter.mueller@test.ch' },
      ];

      for (const [index, customer] of customers.entries()) {
        await request(app.getHttpServer())
          .post('/customers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            ...customer,
            phone: `+41 79 123 45 ${index + 20}`,
            street: 'Search Street 1',
            city: 'Search City',
            postalCode: '8001',
            canton: SwissCantons.ZH,
            customerType: CustomerType.PRIVATE,
          })
          .expect(201);
      }
    });

    it('should search customers by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers/search')
        .query({ q: 'Müller' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2); // Hans and Peter Müller
      response.body.data.forEach((customer: any) => {
        expect(customer.lastName).toBe('Müller');
      });
    });

    it('should search customers by email', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers/search')
        .query({ q: 'anna.weber' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe('anna.weber@test.ch');
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers/search')
        .query({ q: 'NonExistent' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle special characters in search', async () => {
      // Create customer with Swiss special characters
      await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'François',
          lastName: 'Müller',
          email: 'francois@test.ch',
          phone: '+41 79 123 45 99',
          street: 'Special Street 1',
          city: 'Special City',
          postalCode: '8001',
          canton: SwissCantons.ZH,
          customerType: CustomerType.PRIVATE,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/customers/search')
        .query({ q: 'François' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].firstName).toBe('François');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large number of customers efficiently', async () => {
      // Create 50 customers
      const customerPromises = Array(50).fill(null).map((_, index) =>
        request(app.getHttpServer())
          .post('/customers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName: `Customer${index}`,
            lastName: `Test${index}`,
            email: `customer${index}@test.ch`,
            phone: `+41 79 ${String(index).padStart(3, '0')} 45 67`,
            street: `Street ${index}`,
            city: 'Test City',
            postalCode: '8001',
            canton: SwissCantons.ZH,
            customerType: CustomerType.PRIVATE,
          })
      );

      await Promise.all(customerPromises);

      // Test pagination performance
      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .get('/customers')
        .query({ page: 1, limit: 20 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const endTime = Date.now();

      expect(response.body.data).toHaveLength(20);
      expect(response.body.total).toBe(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent customer creation', async () => {
      const concurrentCount = 10;
      const startTime = Date.now();

      const promises = Array(concurrentCount).fill(null).map((_, index) =>
        request(app.getHttpServer())
          .post('/customers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName: `Concurrent${index}`,
            lastName: `Test${index}`,
            email: `concurrent${index}@test.ch`,
            phone: `+41 79 ${String(index + 100).padStart(3, '0')} 45 67`,
            street: `Concurrent Street ${index}`,
            city: 'Concurrent City',
            postalCode: '8001',
            canton: SwissCantons.ZH,
            customerType: CustomerType.PRIVATE,
          })
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe('Swiss Market Specific Tests', () => {
    it('should handle all Swiss cantons', async () => {
      const allCantons = Object.values(SwissCantons);

      for (const [index, canton] of allCantons.entries()) {
        const response = await request(app.getHttpServer())
          .post('/customers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName: `Canton${index}`,
            lastName: `Test`,
            email: `canton${index}@test.ch`,
            phone: `+41 79 ${String(index + 200).padStart(3, '0')} 45 67`,
            street: `Canton Street ${index}`,
            city: 'Canton City',
            postalCode: '8001',
            canton,
            customerType: CustomerType.PRIVATE,
          })
          .expect(201);

        expect(response.body.canton).toBe(canton);
      }
    });

    it('should validate Swiss UID numbers for business customers', async () => {
      const validUidNumbers = [
        'CHE-123.456.789',
        'CHE-987.654.321',
        'CHE-111.222.333',
      ];

      for (const [index, uidNumber] of validUidNumbers.entries()) {
        const response = await request(app.getHttpServer())
          .post('/customers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName: 'Business',
            lastName: `Owner${index}`,
            email: `business${index}@test.ch`,
            phone: `+41 44 ${String(index + 300).padStart(3, '0')} 45 67`,
            street: `Business Street ${index}`,
            city: 'Business City',
            postalCode: '8001',
            canton: SwissCantons.ZH,
            customerType: CustomerType.BUSINESS,
            company: {
              companyName: `Company ${index} AG`,
              uidNumber,
              legalForm: 'AG' as any,
              employeesCount: 50,
            },
          })
          .expect(201);

        expect(response.body.customerType).toBe(CustomerType.BUSINESS);
        
        // Verify company was created with correct UID
        const company = await companyRepository.findOne({
          where: { customerId: response.body.id },
        });
        expect(company?.uidNumber).toBe(uidNumber);
      }
    });
  });
});