import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('refresh_tokens')
@Index(['userId', 'expiresAt'])
@Index(['tokenHash'])
export class RefreshToken {
  @ApiProperty({ example: 'uuid', description: 'Unique token ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({ example: 'hashed-token', description: 'Hashed refresh token' })
  @Column()
  @Index()
  tokenHash: string;

  @ApiProperty({ example: '2024-08-30T10:00:00.000Z', description: 'Token expiration date' })
  @Column()
  @Index()
  expiresAt: Date;

  @ApiProperty({ example: false, description: 'Whether token is blacklisted' })
  @Column({ default: false })
  isBlacklisted: boolean;

  @ApiProperty({ example: '192.168.1.1', description: 'IP address of token creation' })
  @Column({ nullable: true })
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...', description: 'User agent of token creation' })
  @Column({ nullable: true })
  userAgent: string;

  @ApiProperty({ example: '2024-07-30T10:00:00.000Z', description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;
} 