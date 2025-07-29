import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TcoCalculation } from './entities/tco-calculation.entity';
import { TcoComponent } from './entities/tco-component.entity';

@Injectable()
export class TcoService {
  constructor(
    @InjectRepository(TcoCalculation)
    private tcoCalculationRepository: Repository<TcoCalculation>,
    @InjectRepository(TcoComponent)
    private tcoComponentRepository: Repository<TcoComponent>,
  ) {}

  async findAll(): Promise<TcoCalculation[]> {
    return this.tcoCalculationRepository.find({
      relations: ['customer', 'vehicleConfiguration', 'components'],
    });
  }

  async findOne(id: string): Promise<TcoCalculation> {
    return this.tcoCalculationRepository.findOne({
      where: { id },
      relations: ['customer', 'vehicleConfiguration', 'components'],
    });
  }
}

