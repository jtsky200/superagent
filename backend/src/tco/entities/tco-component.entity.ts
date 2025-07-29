import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TcoCalculation } from './tco-calculation.entity';

@Entity('tco_components')
export class TcoComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  yearlyAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column()
  currency: string;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @ManyToOne(() => TcoCalculation, (calculation) => calculation.components)
  @JoinColumn()
  tcoCalculation: TcoCalculation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

