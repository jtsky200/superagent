import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { DatabaseModule } from './database/database.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportingModule } from './reporting/reporting.module';
import { SalesforceModule } from './salesforce/salesforce.module';
import { SwissDataModule } from './swiss-data/swiss-data.module';
import { TcoModule } from './tco/tco.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { LeasingModule } from './leasing/leasing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    AnalyticsModule,
    CustomersModule,
    NotificationsModule,
    ReportingModule,
    VehiclesModule,
    TcoModule,
    SwissDataModule,
    SalesforceModule,
    LeasingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

