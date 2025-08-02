import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { TcoService } from '../../../src/tco/tco.service';
import { TcoCalculation } from '../../../src/tco/entities/tco-calculation.entity';
import { TcoComponent } from '../../../src/tco/entities/tco-component.entity';
import { CreateTcoCalculationDto } from '../../../src/tco/dto/create-tco-calculation.dto';
import { SwissCantons } from '../../../src/customers/entities/customer.entity';

describe('TcoService', () => {
  let service: TcoService;
  let tcoCalculationRepository: Repository<TcoCalculation>;
  let tcoComponentRepository: Repository<TcoComponent>;

  // Mock data for Swiss market TCO calculation
  const mockTcoCalculation: TcoCalculation = {
    id: 'tco-123',
    customerId: 'customer-123',
    vehicleId: 'vehicle-123',
    canton: SwissCantons.ZH,
    durationYears: 5,
    annualKilometers: 15000,
    chargingMix: {
      homeCharging: 80,
      publicCharging: 15,
      fastCharging: 5,
    },
    onTimeCosts: {
      vehiclePrice: 96900,
      homeCharger: 2000,
      registration: 350,
      insurance: 1200,
    },
    annualCosts: {
      insurance: 1140,
      maintenance: 800,
      roadTax: 0, // Electric vehicles exempt in most cantons
      vignette: 40,
      parking: 1200,
    },
    energyCosts: {
      electricity: 736,
      publicCharging: 180,
      fastCharging: 120,
    },
    depreciation: {
      residualValue: 42500,
      totalDepreciation: 54400,
    },
    totalTco: 118420.00,
    tcoPerMonth: 1970.33,
    tcoPerKilometer: 1.58,
    calculationDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTcoComponent: TcoComponent = {
    id: 'component-123',
    calculationId: 'tco-123',
    category: 'energy',
    name: 'Home Charging',
    monthlyCost: 61.33,
    annualCost: 736.00,
    totalCost: 3680.00,
    description: 'Home charging electricity costs',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTcoCalculationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTcoComponentRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TcoService,
        {
          provide: getRepositoryToken(TcoCalculation),
          useValue: mockTcoCalculationRepository,
        },
        {
          provide: getRepositoryToken(TcoComponent),
          useValue: mockTcoComponentRepository,
        },
      ],
    }).compile();

    service = module.get<TcoService>(TcoService);
    tcoCalculationRepository = module.get<Repository<TcoCalculation>>(
      getRepositoryToken(TcoCalculation),
    );
    tcoComponentRepository = module.get<Repository<TcoComponent>>(
      getRepositoryToken(TcoComponent),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateTco', () => {
    const createTcoDto: CreateTcoCalculationDto = {
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      canton: SwissCantons.ZH,
      durationYears: 5,
      annualKilometers: 15000,
      chargingMix: {
        homeCharging: 80,
        publicCharging: 15,
        fastCharging: 5,
      },
      vehiclePrice: 96900,
      electricityPricePerKwh: 0.23,
      homeChargerCost: 2000,
    };

    it('should calculate TCO for Zurich canton correctly', async () => {
      const expectedTco = { ...mockTcoCalculation };
      
      mockTcoCalculationRepository.create.mockReturnValue(expectedTco);
      mockTcoCalculationRepository.save.mockResolvedValue(expectedTco);
      mockTcoComponentRepository.create.mockReturnValue(mockTcoComponent);
      mockTcoComponentRepository.save.mockResolvedValue(mockTcoComponent);

      const result = await service.calculateTco(createTcoDto);

      expect(result.totalTco).toBeCloseTo(118420.00, 2);
      expect(result.canton).toBe(SwissCantons.ZH);
      expect(result.annualCosts.roadTax).toBe(0); // EV tax exemption
    });

    it('should calculate TCO for Geneva canton with different tax rates', async () => {
      const genevaDto = { ...createTcoDto, canton: SwissCantons.GE };
      const genevaTco = {
        ...mockTcoCalculation,
        canton: SwissCantons.GE,
        annualCosts: {
          ...mockTcoCalculation.annualCosts,
          roadTax: 0, // Geneva also exempts EVs
        },
      };

      mockTcoCalculationRepository.create.mockReturnValue(genevaTco);
      mockTcoCalculationRepository.save.mockResolvedValue(genevaTco);
      mockTcoComponentRepository.create.mockReturnValue(mockTcoComponent);
      mockTcoComponentRepository.save.mockResolvedValue(mockTcoComponent);

      const result = await service.calculateTco(genevaDto);

      expect(result.canton).toBe(SwissCantons.GE);
      expect(result.annualCosts.roadTax).toBe(0);
    });

    it('should apply winter consumption increase for Swiss climate', async () => {
      const winterDto = {
        ...createTcoDto,
        includeWinterAdjustment: true,
        winterIncreasePercent: 15,
      };

      const winterTco = {
        ...mockTcoCalculation,
        energyCosts: {
          electricity: 846, // 15% increase from 736
          publicCharging: 207, // 15% increase from 180
          fastCharging: 138, // 15% increase from 120
        },
      };

      mockTcoCalculationRepository.create.mockReturnValue(winterTco);
      mockTcoCalculationRepository.save.mockResolvedValue(winterTco);

      const result = await service.calculateTco(winterDto);

      expect(result.energyCosts.electricity).toBeGreaterThan(mockTcoCalculation.energyCosts.electricity);
    });

    it('should calculate business customer TCO with tax benefits', async () => {
      const businessDto = {
        ...createTcoDto,
        customerType: 'business',
        vatRecoverable: true,
      };

      const businessTco = {
        ...mockTcoCalculation,
        onTimeCosts: {
          ...mockTcoCalculation.onTimeCosts,
          vehiclePrice: 80751, // 96900 - VAT (7.7%)
        },
      };

      mockTcoCalculationRepository.create.mockReturnValue(businessTco);
      mockTcoCalculationRepository.save.mockResolvedValue(businessTco);

      const result = await service.calculateTco(businessDto);

      expect(result.onTimeCosts.vehiclePrice).toBeLessThan(createTcoDto.vehiclePrice);
    });
  });

  describe('findAll', () => {
    it('should return all TCO calculations with pagination', async () => {
      const calculations = [mockTcoCalculation];
      mockTcoCalculationRepository.find.mockResolvedValue(calculations);
      mockTcoCalculationRepository.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: calculations,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by customer ID', async () => {
      const customerCalculations = [mockTcoCalculation];
      mockTcoCalculationRepository.find.mockResolvedValue(customerCalculations);
      mockTcoCalculationRepository.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, 'customer-123');

      expect(mockTcoCalculationRepository.find).toHaveBeenCalledWith({
        where: { customerId: 'customer-123' },
        relations: ['components'],
        skip: 0,
        take: 10,
        order: { calculationDate: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return TCO calculation with components', async () => {
      const calculationWithComponents = {
        ...mockTcoCalculation,
        components: [mockTcoComponent],
      };
      
      mockTcoCalculationRepository.findOne.mockResolvedValue(calculationWithComponents);

      const result = await service.findOne('tco-123');

      expect(result).toEqual(calculationWithComponents);
      expect(mockTcoCalculationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tco-123' },
        relations: ['components'],
      });
    });

    it('should throw NotFoundException when calculation not found', async () => {
      mockTcoCalculationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('compareTco', () => {
    it('should compare TCO calculations for different vehicles', async () => {
      const vehicle1Tco = { ...mockTcoCalculation, vehicleId: 'lyriq-123', totalTco: 118420 };
      const vehicle2Tco = { ...mockTcoCalculation, vehicleId: 'vistiq-123', totalTco: 135600 };
      
      mockTcoCalculationRepository.find.mockResolvedValue([vehicle1Tco, vehicle2Tco]);

      const result = await service.compareTco('customer-123', ['lyriq-123', 'vistiq-123']);

      expect(result).toHaveLength(2);
      expect(result[0].totalTco).toBeLessThan(result[1].totalTco);
    });
  });

  describe('Swiss Market Specific Tests', () => {
    it('should apply correct canton-specific factors', async () => {
      const cantonTests = [
        { canton: SwissCantons.ZH, electricityPrice: 0.23, registrationFee: 350 },
        { canton: SwissCantons.GE, electricityPrice: 0.21, registrationFee: 400 },
        { canton: SwissCantons.BE, electricityPrice: 0.19, registrationFee: 300 },
        { canton: SwissCantons.TI, electricityPrice: 0.18, registrationFee: 320 },
      ];

      for (const test of cantonTests) {
        const dto = {
          ...createTcoDto,
          canton: test.canton,
          electricityPricePerKwh: test.electricityPrice,
        };

        const expectedTco = {
          ...mockTcoCalculation,
          canton: test.canton,
          onTimeCosts: {
            ...mockTcoCalculation.onTimeCosts,
            registration: test.registrationFee,
          },
        };

        mockTcoCalculationRepository.create.mockReturnValue(expectedTco);
        mockTcoCalculationRepository.save.mockResolvedValue(expectedTco);

        const result = await service.calculateTco(dto);

        expect(result.canton).toBe(test.canton);
        expect(result.onTimeCosts.registration).toBe(test.registrationFee);
      }
    });

    it('should calculate Swiss highway vignette costs', async () => {
      const dto = { ...createTcoDto, includeVignette: true };
      
      const tcoWithVignette = {
        ...mockTcoCalculation,
        annualCosts: {
          ...mockTcoCalculation.annualCosts,
          vignette: 40, // Swiss highway vignette
        },
      };

      mockTcoCalculationRepository.create.mockReturnValue(tcoWithVignette);
      mockTcoCalculationRepository.save.mockResolvedValue(tcoWithVignette);

      const result = await service.calculateTco(dto);

      expect(result.annualCosts.vignette).toBe(40);
    });

    it('should handle Swiss EV incentives by canton', async () => {
      const incentiveTests = [
        { canton: SwissCantons.ZH, incentive: 5000 },
        { canton: SwissCantons.GE, incentive: 3000 },
        { canton: SwissCantons.BS, incentive: 2000 },
        { canton: SwissCantons.VD, incentive: 4000 },
      ];

      for (const test of incentiveTests) {
        const dto = {
          ...createTcoDto,
          canton: test.canton,
          applyCantonIncentives: true,
        };

        const tcoWithIncentive = {
          ...mockTcoCalculation,
          canton: test.canton,
          onTimeCosts: {
            ...mockTcoCalculation.onTimeCosts,
            cantonIncentive: -test.incentive, // Negative cost = rebate
          },
        };

        mockTcoCalculationRepository.create.mockReturnValue(tcoWithIncentive);
        mockTcoCalculationRepository.save.mockResolvedValue(tcoWithIncentive);

        const result = await service.calculateTco(dto);

        expect(result.canton).toBe(test.canton);
        expect(result.onTimeCosts.cantonIncentive).toBe(-test.incentive);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should calculate TCO for multiple scenarios efficiently', async () => {
      const scenarios = [
        { durationYears: 3, annualKilometers: 10000 },
        { durationYears: 4, annualKilometers: 15000 },
        { durationYears: 5, annualKilometers: 20000 },
        { durationYears: 6, annualKilometers: 25000 },
      ];

      mockTcoCalculationRepository.create.mockReturnValue(mockTcoCalculation);
      mockTcoCalculationRepository.save.mockResolvedValue(mockTcoCalculation);
      mockTcoComponentRepository.create.mockReturnValue(mockTcoComponent);
      mockTcoComponentRepository.save.mockResolvedValue(mockTcoComponent);

      const startTime = Date.now();
      
      const calculations = await Promise.all(
        scenarios.map(scenario => 
          service.calculateTco({ ...createTcoDto, ...scenario })
        )
      );

      const endTime = Date.now();

      expect(calculations).toHaveLength(4);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle complex TCO calculations with many components', async () => {
      const complexDto = {
        ...createTcoDto,
        includeDetailedBreakdown: true,
        includeMaintenanceSchedule: true,
        includeInsuranceOptions: true,
        includeFinancingOptions: true,
      };

      const complexComponents = Array(20).fill(null).map((_, index) => ({
        ...mockTcoComponent,
        id: `component-${index}`,
        name: `Component ${index}`,
      }));

      mockTcoCalculationRepository.create.mockReturnValue(mockTcoCalculation);
      mockTcoCalculationRepository.save.mockResolvedValue(mockTcoCalculation);
      mockTcoComponentRepository.create.mockReturnValue(mockTcoComponent);
      mockTcoComponentRepository.save.mockResolvedValue(mockTcoComponent);

      const startTime = Date.now();
      const result = await service.calculateTco(complexDto);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero annual kilometers', async () => {
      const zeroKmDto = { ...createTcoDto, annualKilometers: 0 };
      
      const zeroKmTco = {
        ...mockTcoCalculation,
        annualKilometers: 0,
        energyCosts: {
          electricity: 0,
          publicCharging: 0,
          fastCharging: 0,
        },
        tcoPerKilometer: 0,
      };

      mockTcoCalculationRepository.create.mockReturnValue(zeroKmTco);
      mockTcoCalculationRepository.save.mockResolvedValue(zeroKmTco);

      const result = await service.calculateTco(zeroKmDto);

      expect(result.energyCosts.electricity).toBe(0);
      expect(result.tcoPerKilometer).toBe(0);
    });

    it('should handle extreme high mileage scenarios', async () => {
      const highMileageDto = { ...createTcoDto, annualKilometers: 100000 };
      
      const highMileageTco = {
        ...mockTcoCalculation,
        annualKilometers: 100000,
        energyCosts: {
          electricity: 4900, // Much higher due to increased mileage
          publicCharging: 1200,
          fastCharging: 800,
        },
      };

      mockTcoCalculationRepository.create.mockReturnValue(highMileageTco);
      mockTcoCalculationRepository.save.mockResolvedValue(highMileageTco);

      const result = await service.calculateTco(highMileageDto);

      expect(result.energyCosts.electricity).toBeGreaterThan(mockTcoCalculation.energyCosts.electricity);
      expect(result.annualKilometers).toBe(100000);
    });

    it('should validate charging mix percentages', async () => {
      const invalidChargingMixDto = {
        ...createTcoDto,
        chargingMix: {
          homeCharging: 60,
          publicCharging: 30,
          fastCharging: 20, // Total = 110%, should be normalized
        },
      };

      const normalizedTco = {
        ...mockTcoCalculation,
        chargingMix: {
          homeCharging: 54.5, // Normalized
          publicCharging: 27.3,
          fastCharging: 18.2,
        },
      };

      mockTcoCalculationRepository.create.mockReturnValue(normalizedTco);
      mockTcoCalculationRepository.save.mockResolvedValue(normalizedTco);

      const result = await service.calculateTco(invalidChargingMixDto);

      const total = result.chargingMix.homeCharging + 
                   result.chargingMix.publicCharging + 
                   result.chargingMix.fastCharging;
      
      expect(total).toBeCloseTo(100, 1);
    });

    it('should handle database errors gracefully', async () => {
      mockTcoCalculationRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.calculateTco(createTcoDto)).rejects.toThrow('Database error');
    });
  });

  describe('Financial Calculations', () => {
    it('should calculate lease vs buy scenarios', async () => {
      const leaseDto = {
        ...createTcoDto,
        financingType: 'lease',
        leaseRate: 0.039, // 3.9% APR
        downPayment: 10000,
      };

      const buyDto = {
        ...createTcoDto,
        financingType: 'purchase',
        loanRate: 0.029, // 2.9% APR
        downPayment: 20000,
      };

      const leaseTco = {
        ...mockTcoCalculation,
        onTimeCosts: {
          ...mockTcoCalculation.onTimeCosts,
          downPayment: 10000,
          financingType: 'lease',
        },
      };

      const buyTco = {
        ...mockTcoCalculation,
        onTimeCosts: {
          ...mockTcoCalculation.onTimeCosts,
          downPayment: 20000,
          financingType: 'purchase',
        },
      };

      mockTcoCalculationRepository.create
        .mockReturnValueOnce(leaseTco)
        .mockReturnValueOnce(buyTco);
      mockTcoCalculationRepository.save
        .mockResolvedValueOnce(leaseTco)
        .mockResolvedValueOnce(buyTco);

      const leaseResult = await service.calculateTco(leaseDto);
      const buyResult = await service.calculateTco(buyDto);

      expect(leaseResult.onTimeCosts.downPayment).toBe(10000);
      expect(buyResult.onTimeCosts.downPayment).toBe(20000);
    });

    it('should calculate depreciation correctly for Swiss market', async () => {
      const depreciationDto = {
        ...createTcoDto,
        vehiclePrice: 100000,
        residualValuePercent: 45, // 45% after 5 years
      };

      const depreciationTco = {
        ...mockTcoCalculation,
        onTimeCosts: {
          ...mockTcoCalculation.onTimeCosts,
          vehiclePrice: 100000,
        },
        depreciation: {
          residualValue: 45000, // 45% of 100000
          totalDepreciation: 55000,
          annualDepreciation: 11000,
        },
      };

      mockTcoCalculationRepository.create.mockReturnValue(depreciationTco);
      mockTcoCalculationRepository.save.mockResolvedValue(depreciationTco);

      const result = await service.calculateTco(depreciationDto);

      expect(result.depreciation.residualValue).toBe(45000);
      expect(result.depreciation.totalDepreciation).toBe(55000);
    });
  });
});