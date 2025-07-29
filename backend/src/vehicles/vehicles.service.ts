import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleOption } from './entities/vehicle-option.entity';
import { VehicleConfiguration } from './entities/vehicle-configuration.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(VehicleOption)
    private vehicleOptionRepository: Repository<VehicleOption>,
    @InjectRepository(VehicleConfiguration)
    private vehicleConfigurationRepository: Repository<VehicleConfiguration>,
  ) {}

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      relations: ['options'],
      where: { isAvailable: true },
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    return this.vehicleRepository.findOne({
      where: { id },
      relations: ['options', 'configurations'],
    });
  }
}

