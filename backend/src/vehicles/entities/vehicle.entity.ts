import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VehicleConfiguration } from './vehicle-configuration.entity';
import { VehicleOption } from './vehicle-option.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  model: string;

  @Column()
  variant: string;

  @Column()
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column()
  currency: string;

  @Column({ type: 'int' })
  range: number; // km

  @Column({ type: 'int' })
  power: number; // PS

  @Column({ type: 'int' })
  torque: number; // Nm

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  acceleration: number; // 0-100 km/h

  @Column({ type: 'int' })
  topSpeed: number; // km/h

  @Column({ type: 'int' })
  batteryCapacity: number; // kWh

  @Column({ type: 'int' })
  chargingSpeed: number; // kW

  @Column({ type: 'int' })
  trunkCapacity: number; // liters

  @Column({ type: 'int' })
  seats: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(() => VehicleOption, (option) => option.vehicle)
  options: VehicleOption[];

  @OneToMany(() => VehicleConfiguration, (config) => config.vehicle)
  configurations: VehicleConfiguration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.model} ${this.variant}`;
  }
}

