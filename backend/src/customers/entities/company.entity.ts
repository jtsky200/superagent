import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LegalForm {
  AG = 'AG', // Aktiengesellschaft
  GMBH = 'GmbH', // Gesellschaft mit beschränkter Haftung
  SARL = 'Sàrl', // Société à responsabilité limitée
  SA = 'SA', // Société Anonyme
  EINZELFIRMA = 'Einzelfirma',
  KOLLEKTIVGESELLSCHAFT = 'Kollektivgesellschaft',
  KOMMANDITGESELLSCHAFT = 'Kommanditgesellschaft',
  GENOSSENSCHAFT = 'Genossenschaft',
  VEREIN = 'Verein',
  STIFTUNG = 'Stiftung',
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @Column({ unique: true })
  uidNumber: string; // Swiss UID (Unternehmens-Identifikationsnummer)

  @Column({
    type: 'enum',
    enum: LegalForm,
  })
  legalForm: LegalForm;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  vatNumber: string;

  @Column({ type: 'int', nullable: true })
  employeeCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

