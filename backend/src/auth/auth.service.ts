import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (user && await user.validatePassword(password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async createRefreshToken(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
    const refreshToken = this.generateRefreshToken();
    const tokenHash = this.hashToken(refreshToken);
    
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn.replace('d', '')));

    await this.refreshTokenRepository.save({
      userId,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return refreshToken;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id, ipAddress, userAgent);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: this.configService.get<string>('JWT_EXPIRES_IN', '24h'),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      ...registerDto,
      role: UserRole.USER,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const accessToken = this.generateAccessToken(savedUser);
    const refreshToken = await this.createRefreshToken(savedUser.id, ipAddress, userAgent);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: this.configService.get<string>('JWT_EXPIRES_IN', '24h'),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
      },
    };
  }

  private generateAccessToken(user: any): string {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };
    return this.jwtService.sign(payload);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto, ipAddress?: string, userAgent?: string) {
    const { refreshToken } = refreshTokenDto;
    const tokenHash = this.hashToken(refreshToken);

    // Find and validate refresh token
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash, isBlacklisted: false },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Get user
    const user = await this.userRepository.findOne({ where: { id: storedToken.userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Blacklist old token
    await this.refreshTokenRepository.update(storedToken.id, { isBlacklisted: true });

    // Generate new tokens
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.createRefreshToken(user.id, ipAddress, userAgent);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: this.configService.get<string>('JWT_EXPIRES_IN', '24h'),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    
    await this.refreshTokenRepository.update(
      { tokenHash, isBlacklisted: false },
      { isBlacklisted: true }
    );
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isBlacklisted: false },
      { isBlacklisted: true }
    );
  }

  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    const tokenHash = this.hashToken(refreshToken);
    
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash, isBlacklisted: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: new Date(),
    });
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }
}

