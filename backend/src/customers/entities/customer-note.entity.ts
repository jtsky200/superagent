import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Entity('customer_notes')
@Index(['customerId', 'createdAt'])
@ObjectType()
export class CustomerNote {
  @ApiProperty({ example: 'uuid', description: 'Unique note ID' })
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid', description: 'Customer ID' })
  @Field()
  @Column()
  @Index()
  customerId: string;

  @ApiProperty({ example: 'Besonderer Wunsch: Probefahrt am Samstag.', description: 'Note content' })
  @Field()
  @Column('text')
  content: string;

  @ApiProperty({ example: '2024-07-30T10:00:00.000Z', description: 'Creation timestamp' })
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-07-30T10:00:00.000Z', description: 'Last update timestamp' })
  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}