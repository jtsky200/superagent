import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TcoController } from './tco.controller';
import { TcoService } from './tco.service';
import { TcoCalculation } from './entities/tco-calculation.entity';
import { TcoComponent } from './entities/tco-component.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TcoCalculation, TcoComponent])],
  controllers: [TcoController],
  providers: [TcoService],
  exports: [TcoService],
})
export class TcoModule {}

