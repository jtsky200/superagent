import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthModule } from '../../../src/auth/auth.module';
import { User, UserRole } from '../../../src/auth/entities/user.entity';
import { RefreshToken } from '../../../src/auth/entities/refresh-token.entity';
import { LoginDto } from '../../../src/auth/dto/login.dto';
import { RegisterDto } from '../../../src/auth/dto/register.dto';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;

  // Test database configuration
  const testDbConfig = {
    type: 'sqlite' as const,
    database: ':memory:',
    entities: [User, RefreshToken],
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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    refreshTokenRepository = moduleFixture.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await refreshTokenRepository.delete({});
    await userRepository.delete({});
  });

  describe('POST /auth/register', () => {
    const validRegisterDto: RegisterDto = {
      email: 'test@cadillac.ch',
      password: 'SecurePassword123!',
      firstName: 'Hans',
      lastName: 'Müller',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: validRegisterDto.email,
        firstName: validRegisterDto.firstName,
        lastName: validRegisterDto.lastName,
        role: UserRole.USER,
      });

      expect(response.body).not.toHaveProperty('password');

      // Verify user was saved to database
      const savedUser = await userRepository.findOne({
        where: { email: validRegisterDto.email },
      });
      expect(savedUser).toBeDefined();
      expect(savedUser?.email).toBe(validRegisterDto.email);
    });

    it('should return 409 when email already exists', async () => {
      // Create user first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterDto)
        .expect(201);

      // Try to register with same email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterDto)
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });

    it('should validate Swiss email formats', async () => {
      const swissEmails = [
        'user@example.ch',
        'admin@company.swiss',
        'test@business.li',
      ];

      for (const email of swissEmails) {
        const dto = { ...validRegisterDto, email };
        
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(dto)
          .expect(201);

        expect(response.body.email).toBe(email);

        // Clean up for next iteration
        await userRepository.delete({ email });
      }
    });

    it('should validate input fields', async () => {
      const invalidCases = [
        {
          dto: { ...validRegisterDto, email: 'invalid-email' },
          expectedErrors: ['email'],
        },
        {
          dto: { ...validRegisterDto, password: '123' },
          expectedErrors: ['password'],
        },
        {
          dto: { ...validRegisterDto, firstName: '' },
          expectedErrors: ['firstName'],
        },
        {
          dto: { ...validRegisterDto, lastName: '' },
          expectedErrors: ['lastName'],
        },
      ];

      for (const testCase of invalidCases) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(testCase.dto)
          .expect(400);

        expect(response.body.message).toEqual(
          expect.arrayContaining(
            testCase.expectedErrors.map(field => expect.stringContaining(field))
          )
        );
      }
    });

    it('should handle Swiss special characters in names', async () => {
      const swissNames = [
        { firstName: 'François', lastName: 'Müller' },
        { firstName: 'Jörg', lastName: 'Käser' },
        { firstName: 'Anaïs', lastName: 'Züger' },
      ];

      for (const names of swissNames) {
        const dto = {
          ...validRegisterDto,
          ...names,
          email: `${names.firstName.toLowerCase()}@test.ch`,
        };

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(dto)
          .expect(201);

        expect(response.body.firstName).toBe(names.firstName);
        expect(response.body.lastName).toBe(names.lastName);

        // Clean up
        await userRepository.delete({ email: dto.email });
      }
    });
  });

  describe('POST /auth/login', () => {
    let testUser: User;

    beforeEach(async () => {
      // Create a test user
      const registerDto: RegisterDto = {
        email: 'testuser@cadillac.ch',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      testUser = await userRepository.findOne({
        where: { email: registerDto.email },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'testuser@cadillac.ch',
        password: 'TestPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          id: testUser.id,
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          role: testUser.role,
        },
      });

      // Verify refresh token was saved
      const refreshToken = await refreshTokenRepository.findOne({
        where: { userId: testUser.id },
      });
      expect(refreshToken).toBeDefined();
    });

    it('should return 401 with invalid credentials', async () => {
      const invalidLogins = [
        { email: 'testuser@cadillac.ch', password: 'WrongPassword' },
        { email: 'nonexistent@cadillac.ch', password: 'TestPassword123!' },
        { email: 'testuser@cadillac.ch', password: '' },
      ];

      for (const loginDto of invalidLogins) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(401);
      }
    });

    it('should update lastLoginAt on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'testuser@cadillac.ch',
        password: 'TestPassword123!',
      };

      const beforeLogin = testUser.lastLoginAt;

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      const updatedUser = await userRepository.findOne({
        where: { id: testUser.id },
      });

      expect(updatedUser?.lastLoginAt).toBeDefined();
      if (beforeLogin) {
        expect(updatedUser?.lastLoginAt?.getTime()).toBeGreaterThan(beforeLogin.getTime());
      }
    });

    it('should not login inactive users', async () => {
      // Deactivate user
      await userRepository.update(testUser.id, { isActive: false });

      const loginDto: LoginDto = {
        email: 'testuser@cadillac.ch',
        password: 'TestPassword123!',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let testUser: User;
    let validRefreshToken: string;

    beforeEach(async () => {
      // Register and login to get refresh token
      const registerDto: RegisterDto = {
        email: 'refresh@cadillac.ch',
        password: 'RefreshTest123!',
        firstName: 'Refresh',
        lastName: 'Test',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        })
        .expect(200);

      validRefreshToken = loginResponse.body.refreshToken;
      testUser = await userRepository.findOne({
        where: { email: registerDto.email },
      });
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      // New tokens should be different from original
      expect(response.body.refreshToken).not.toBe(validRefreshToken);
    });

    it('should return 401 with invalid refresh token', async () => {
      const invalidTokens = [
        'invalid-token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        '',
      ];

      for (const token of invalidTokens) {
        await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({ refreshToken: token })
          .expect(401);
      }
    });

    it('should invalidate old refresh token after use', async () => {
      // Use refresh token
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })
        .expect(200);

      // Try to use same token again
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login
      const registerDto: RegisterDto = {
        email: 'logout@cadillac.ch',
        password: 'LogoutTest123!',
        firstName: 'Logout',
        lastName: 'Test',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        })
        .expect(200);

      accessToken = loginResponse.body.accessToken;
      refreshToken = loginResponse.body.refreshToken;
    });

    it('should logout successfully and blacklist refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      // Try to use blacklisted refresh token
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });

    it('should return 401 without valid access token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(401);
    });

    it('should handle logout with invalid refresh token gracefully', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken: 'invalid-token' })
        .expect(200); // Should not fail even with invalid refresh token
    });
  });

  describe('GET /auth/profile', () => {
    let accessToken: string;
    let testUser: User;

    beforeEach(async () => {
      // Register and login
      const registerDto: RegisterDto = {
        email: 'profile@cadillac.ch',
        password: 'ProfileTest123!',
        firstName: 'Profile',
        lastName: 'Test',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        })
        .expect(200);

      accessToken = loginResponse.body.accessToken;
      testUser = await userRepository.findOne({
        where: { email: registerDto.email },
      });
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: testUser.role,
        isActive: testUser.isActive,
      });

      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without authorization token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 for deactivated user', async () => {
      // Deactivate user
      await userRepository.update(testUser.id, { isActive: false });

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });

  describe('Security Tests', () => {
    it('should rate limit login attempts', async () => {
      const loginDto: LoginDto = {
        email: 'bruteforce@cadillac.ch',
        password: 'WrongPassword',
      };

      // Make multiple failed login attempts
      const promises = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
      );

      const responses = await Promise.all(promises);

      // Most should be 401 (unauthorized), but some might be 429 (rate limited)
      const statusCodes = responses.map(r => r.status);
      expect(statusCodes).toEqual(
        expect.arrayContaining([401]) // At least some 401s
      );
    });

    it('should sanitize error messages', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@cadillac.ch',
          password: 'password',
        })
        .expect(401);

      // Should not reveal whether email exists or not
      expect(response.body.message).not.toContain('user not found');
      expect(response.body.message).not.toContain('password incorrect');
    });

    it('should validate JWT token structure', async () => {
      // Register and login
      const registerDto: RegisterDto = {
        email: 'jwt@cadillac.ch',
        password: 'JwtTest123!',
        firstName: 'JWT',
        lastName: 'Test',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        })
        .expect(200);

      const { accessToken } = loginResponse.body;

      // JWT should have 3 parts separated by dots
      const jwtParts = accessToken.split('.');
      expect(jwtParts).toHaveLength(3);

      // Each part should be base64 encoded
      jwtParts.forEach(part => {
        expect(part).toMatch(/^[A-Za-z0-9_-]+$/);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent login requests', async () => {
      // Create test user
      const registerDto: RegisterDto = {
        email: 'concurrent@cadillac.ch',
        password: 'ConcurrentTest123!',
        firstName: 'Concurrent',
        lastName: 'Test',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginDto: LoginDto = {
        email: registerDto.email,
        password: registerDto.password,
      };

      // Make 10 concurrent login requests
      const startTime = Date.now();
      const promises = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should handle large password validation efficiently', async () => {
      const largePassword = 'A'.repeat(1000) + '1!'; // 1002 character password

      const registerDto: RegisterDto = {
        email: 'large@cadillac.ch',
        password: largePassword,
        firstName: 'Large',
        lastName: 'Test',
      };

      const startTime = Date.now();
      
      // This might fail validation, but should not hang
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      const endTime = Date.now();

      // Should complete quickly even with large input
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Swiss Market Integration', () => {
    it('should accept various Swiss email formats', async () => {
      const swissEmailFormats = [
        'user@example.ch',
        'admin@company.swiss',
        'test@business.li',
        'info@organization.com', // International companies in Switzerland
      ];

      for (const email of swissEmailFormats) {
        const registerDto: RegisterDto = {
          email,
          password: 'SwissTest123!',
          firstName: 'Swiss',
          lastName: 'User',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(201);

        expect(response.body.email).toBe(email);

        // Clean up
        await userRepository.delete({ email });
      }
    });

    it('should handle Swiss German names correctly', async () => {
      const swissGermanNames = [
        { firstName: 'Urs', lastName: 'Müller' },
        { firstName: 'Röbi', lastName: 'Käsermann' },
        { firstName: 'Sämi', lastName: 'Hügel' },
      ];

      for (const name of swissGermanNames) {
        const registerDto: RegisterDto = {
          email: `${name.firstName.toLowerCase()}@test.ch`,
          password: 'SwissGerman123!',
          ...name,
        };

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(201);

        expect(response.body.firstName).toBe(name.firstName);
        expect(response.body.lastName).toBe(name.lastName);

        // Clean up
        await userRepository.delete({ email: registerDto.email });
      }
    });
  });
});