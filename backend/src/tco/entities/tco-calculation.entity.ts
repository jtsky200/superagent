import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { VehicleConfiguration } from '../../vehicles/entities/vehicle-configuration.entity';
import { TcoComponent } from './tco-component.entity';

@Entity('tco_calculations')
export class TcoCalculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int' })
  calculationPeriodYears: number;

  @Column({ type: 'int' })
  annualMileage: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costPerKm: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costPerYear: number;

  @Column()
  currency: string;

  @Column({ type: 'json', nullable: true })
  assumptions: Record<string, any>;

  @ManyToOne(() => Customer, (customer) => customer.tcoCalculations)
  @JoinColumn()
  customer: Customer;

  @ManyToOne(() => VehicleConfiguration, (config) => config.tcoCalculations)
  @JoinColumn()
  vehicleConfiguration: VehicleConfiguration;

  @OneToMany(() => TcoComponent, (component) => component.tcoCalculation)
  components: TcoComponent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

