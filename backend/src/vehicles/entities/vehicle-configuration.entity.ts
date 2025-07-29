import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { VehicleOption } from './vehicle-option.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { TcoCalculation } from '../../tco/entities/tco-calculation.entity';

@Entity('vehicle_configurations')
export class VehicleConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column()
  currency: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.configurations)
  @JoinColumn()
  vehicle: Vehicle;

  @ManyToMany(() => VehicleOption)
  @JoinTable({
    name: 'configuration_options',
    joinColumn: { name: 'configurationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'optionId', referencedColumnName: 'id' },
  })
  selectedOptions: VehicleOption[];

  @ManyToOne(() => Customer, (customer) => customer.vehicleConfigurations)
  @JoinColumn()
  customer: Customer;

  @OneToMany(() => TcoCalculation, (tco) => tco.vehicleConfiguration)
  tcoCalculations: TcoCalculation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

