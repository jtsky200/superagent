import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../auth/entities/user.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Company } from '../customers/entities/company.entity';
import { CustomerNote } from '../customers/entities/customer-note.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleConfiguration } from '../vehicles/entities/vehicle-configuration.entity';
import { VehicleOption } from '../vehicles/entities/vehicle-option.entity';
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
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'cadillac_ev_cis'),
        entities: [
          User,
          RefreshToken,
          Customer,
          Company,
          CustomerNote,
          Vehicle,
          VehicleConfiguration,
          VehicleOption,
          TcoCalculation,
          TcoComponent,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

