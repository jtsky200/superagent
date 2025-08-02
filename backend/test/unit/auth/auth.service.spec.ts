import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AuthService } from '../../../src/auth/auth.service';
import { User, UserRole } from '../../../src/auth/entities/user.entity';
import { RefreshToken } from '../../../src/auth/entities/refresh-token.entity';
import { LoginDto } from '../../../src/auth/dto/login.dto';
import { RegisterDto } from '../../../src/auth/dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let jwtService: JwtService;
  let configService: ConfigService;

  // Mock data
  const mockUser: User = {
    id: 'user-123',
    email: 'test@cadillac.ch',
    firstName: 'Hans',
    lastName: 'Müller',
    password: 'hashedPassword123',
    role: UserRole.USER,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
    fullName: 'Hans Müller',
  };

  const mockRefreshToken: RefreshToken = {
    id: 'token-123',
    userId: 'user-123',
    tokenHash: 'hashedToken123',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    isBlacklisted: false,
    ipAddress: '192.168.1.1',
    userAgent: 'Jest Test Agent',
    createdAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    refreshTokenRepository = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Setup default mock returns
    mockConfigService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'test-secret';
        case 'JWT_EXPIRES_IN':
          return '15m';
        case 'JWT_REFRESH_EXPIRES_IN':
          return '7d';
        default:
          return undefined;
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const email = 'test@cadillac.ch';
      const password = 'password123';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser('test@cadillac.ch', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findOne.mockResolvedValue(inactiveUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('test@cadillac.ch', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@cadillac.ch',
      password: 'password123',
    };

    const mockRequest = {
      ip: '192.168.1.1',
      get: jest.fn().mockReturnValue('Jest Test Agent'),
    };

    it('should return tokens when login is successful', async () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-123';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValueOnce(accessToken);
      jest.spyOn(service, 'generateRefreshToken').mockResolvedValue(refreshToken);

      const result = await service.login(loginDto, mockRequest as any);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto, mockRequest as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should update lastLoginAt on successful login', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('token');
      jest.spyOn(service, 'generateRefreshToken').mockResolvedValue('refresh-token');

      await service.login(loginDto, mockRequest as any);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        { lastLoginAt: expect.any(Date) },
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@cadillac.ch',
      password: 'password123',
      firstName: 'Anna',
      lastName: 'Weber',
    };

    it('should create new user successfully', async () => {
      const newUser = {
        ...mockUser,
        id: 'new-user-123',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      };

      mockUserRepository.findOne.mockResolvedValue(null); // Email not exists
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(registerDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = { refreshToken: 'refresh-token-123' };

    it('should return new tokens when refresh token is valid', async () => {
      const hashedToken = 'hashed-refresh-token';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      jest.spyOn(service as any, 'hashToken').mockReturnValue(hashedToken);
      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(newAccessToken);
      jest.spyOn(service, 'generateRefreshToken').mockResolvedValue(newRefreshToken);

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      jest.spyOn(service as any, 'hashToken').mockReturnValue('invalid-hash');
      mockRefreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      };

      jest.spyOn(service as any, 'hashToken').mockReturnValue('hash');
      mockRefreshTokenRepository.findOne.mockResolvedValue(expiredToken);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is blacklisted', async () => {
      const blacklistedToken = {
        ...mockRefreshToken,
        isBlacklisted: true,
      };

      jest.spyOn(service as any, 'hashToken').mockReturnValue('hash');
      mockRefreshTokenRepository.findOne.mockResolvedValue(blacklistedToken);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should blacklist refresh token on logout', async () => {
      const refreshToken = 'refresh-token-123';
      const hashedToken = 'hashed-token';

      jest.spyOn(service as any, 'hashToken').mockReturnValue(hashedToken);
      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);

      await service.logout(refreshToken);

      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        { tokenHash: hashedToken },
        { isBlacklisted: true },
      );
    });

    it('should not throw error when refresh token not found', async () => {
      jest.spyOn(service as any, 'hashToken').mockReturnValue('hash');
      mockRefreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.logout('invalid-token')).resolves.not.toThrow();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 'user-123' });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate and save refresh token', async () => {
      const mockRequest = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Jest Test Agent'),
      };

      mockRefreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshToken);
      jest.spyOn(service as any, 'generateRandomToken').mockReturnValue('random-token');
      jest.spyOn(service as any, 'hashToken').mockReturnValue('hashed-token');

      const result = await service.generateRefreshToken('user-123', mockRequest as any);

      expect(result).toBe('random-token');
      expect(mockRefreshTokenRepository.create).toHaveBeenCalled();
      expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle JWT service errors', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      const loginDto: LoginDto = {
        email: 'test@cadillac.ch',
        password: 'password123',
      };

      await expect(
        service.login(loginDto, { ip: '127.0.0.1', get: () => 'test' } as any),
      ).rejects.toThrow('JWT signing failed');
    });
  });

  describe('Swiss Market Specific Tests', () => {
    it('should accept Swiss email formats', async () => {
      const swissEmails = [
        'test@example.ch',
        'user@company.swiss',
        'admin@cadillac.li', // Liechtenstein
      ];

      for (const email of swissEmails) {
        mockUserRepository.findOne.mockResolvedValue(null);
        mockUserRepository.create.mockReturnValue({ ...mockUser, email });
        mockUserRepository.save.mockResolvedValue({ ...mockUser, email });

        const registerDto: RegisterDto = {
          email,
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        };

        const result = await service.register(registerDto);
        expect(result.email).toBe(email);
      }
    });

    it('should handle Swiss special characters in names', async () => {
      const swissNames = [
        { firstName: 'François', lastName: 'Müller' },
        { firstName: 'Jörg', lastName: 'Käser' },
        { firstName: 'Anaïs', lastName: 'Züger' },
      ];

      for (const name of swissNames) {
        mockUserRepository.findOne.mockResolvedValue(null);
        const user = { ...mockUser, ...name };
        mockUserRepository.create.mockReturnValue(user);
        mockUserRepository.save.mockResolvedValue(user);

        const registerDto: RegisterDto = {
          email: `${name.firstName.toLowerCase()}@test.ch`,
          password: 'password123',
          ...name,
        };

        const result = await service.register(registerDto);
        expect(result.firstName).toBe(name.firstName);
        expect(result.lastName).toBe(name.lastName);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent login requests', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('token');
      jest.spyOn(service, 'generateRefreshToken').mockResolvedValue('refresh-token');

      const loginDto: LoginDto = {
        email: 'test@cadillac.ch',
        password: 'password123',
      };

      const mockRequest = { ip: '127.0.0.1', get: () => 'test' } as any;

      // Simulate 10 concurrent login requests
      const loginPromises = Array(10)
        .fill(null)
        .map(() => service.login(loginDto, mockRequest));

      const results = await Promise.all(loginPromises);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
        expect(result).toHaveProperty('user');
      });
    });

    it('should validate performance with large user dataset simulation', async () => {
      const startTime = Date.now();

      // Simulate finding user in large dataset
      mockUserRepository.findOne.mockImplementation(async () => {
        // Simulate database query delay
        await new Promise((resolve) => setTimeout(resolve, 10));
        return mockUser;
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await service.validateUser('test@cadillac.ch', 'password123');

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time (< 1000ms for tests)
      expect(executionTime).toBeLessThan(1000);
    });
  });
});