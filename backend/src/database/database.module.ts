import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// Entities
import { User } from '../auth/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Company } from '../customers/entities/company.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleOption } from '../vehicles/entities/vehicle-option.entity';
import { VehicleConfiguration } from '../vehicles/entities/vehicle-configuration.entity';
import { TcoCalculation } from '../tco/entities/tco-calculation.entity';
import { TcoComponent } from '../tco/entities/tco-component.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'cadillac_ev_cis'),
        entities: [
          User,
          Customer,
          Company,
          Vehicle,
          VehicleOption,
          VehicleConfiguration,
          TcoCalculation,
          TcoComponent,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

