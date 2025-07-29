import { Module } from '@nestjs/common';
import { SwissDataController } from './swiss-data.controller';
import { SwissDataService } from './swiss-data.service';

@Module({
  controllers: [SwissDataController],
  providers: [SwissDataService],
  exports: [SwissDataService],
})
export class SwissDataModule {}

