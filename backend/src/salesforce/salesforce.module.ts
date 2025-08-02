import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { SalesforceController } from './controllers/salesforce.controller';
import { SalesforceWebhookController } from './controllers/salesforce-webhook.controller';
import { SalesforceAuthService } from './services/salesforce-auth.service';
import { SalesforceApiService } from './services/salesforce-api.service';
import { SalesforceSyncService } from './services/salesforce-sync.service';
import { SalesforceWebhookService } from './services/salesforce-webhook.service';

import { SalesforceToken } from './entities/salesforce-token.entity';
import { SalesforceSyncLog } from './entities/salesforce-sync-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesforceToken,
      SalesforceSyncLog,
    ]),
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [SalesforceController, SalesforceWebhookController],
  providers: [
    SalesforceAuthService,
    SalesforceApiService,
    SalesforceSyncService,
    SalesforceWebhookService,
  ],
  exports: [
    SalesforceAuthService,
    SalesforceApiService,
    SalesforceSyncService,
    SalesforceWebhookService,
  ],
})
export class SalesforceModule {}