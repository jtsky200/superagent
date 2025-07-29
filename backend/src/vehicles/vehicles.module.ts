import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleOption } from './entities/vehicle-option.entity';
import { VehicleConfiguration } from './entities/vehicle-configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleOption, VehicleConfiguration])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}

