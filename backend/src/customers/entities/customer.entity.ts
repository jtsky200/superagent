import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Company } from './company.entity';
import { VehicleConfiguration } from '../../vehicles/entities/vehicle-configuration.entity';
import { TcoCalculation } from '../../tco/entities/tco-calculation.entity';

export enum CustomerType {
  PRIVATE = 'private',
  BUSINESS = 'business',
}

export enum SwissCantons {
  AG = 'AG', // Aargau
  AI = 'AI', // Appenzell Innerrhoden
  AR = 'AR', // Appenzell Ausserrhoden
  BE = 'BE', // Bern
  BL = 'BL', // Basel-Landschaft
  BS = 'BS', // Basel-Stadt
  FR = 'FR', // Fribourg
  GE = 'GE', // Geneva
  GL = 'GL', // Glarus
  GR = 'GR', // Graubünden
  JU = 'JU', // Jura
  LU = 'LU', // Lucerne
  NE = 'NE', // Neuchâtel
  NW = 'NW', // Nidwalden
  OW = 'OW', // Obwalden
  SG = 'SG', // St. Gallen
  SH = 'SH', // Schaffhausen
  SO = 'SO', // Solothurn
  SZ = 'SZ', // Schwyz
  TG = 'TG', // Thurgau
  TI = 'TI', // Ticino
  UR = 'UR', // Uri
  VD = 'VD', // Vaud
  VS = 'VS', // Valais
  ZG = 'ZG', // Zug
  ZH = 'ZH', // Zurich
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  postalCode: string;

  @Column({
    type: 'enum',
    enum: SwissCantons,
  })
  canton: SwissCantons;

  @Column({
    type: 'enum',
    enum: CustomerType,
  })
  customerType: CustomerType;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  nationality: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  notes: string;

  // Company relationship (for business customers)
  @OneToOne(() => Company, { nullable: true, cascade: true })
  @JoinColumn()
  company: Company;

  // Vehicle configurations
  @OneToMany(() => VehicleConfiguration, (config) => config.customer)
  vehicleConfigurations: VehicleConfiguration[];

  // TCO calculations
  @OneToMany(() => TcoCalculation, (tco) => tco.customer)
  tcoCalculations: TcoCalculation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get fullAddress(): string {
    return `${this.street}, ${this.postalCode} ${this.city}, ${this.canton}`;
  }
}

