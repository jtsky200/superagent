import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface VehicleData {
  extraction_date: string;
  source: string;
  currency: string;
  market: string;
  LYRIQ_2025: {
    name: string;
    basePrice: {
      inclVat: number;
      exclVat: number;
    };
    variants: Array<{
      id: string;
      name: string;
      trim: string;
      description: string;
      mileageOptions: Array<{
        annualKm: number;
        residualPercent: number;
        residualValue: number;
        baseMonthlyRate: number;
        services: {
          comfortPlus: number;
          gap: number;
          legalProtection: number;
        };
      }>;
    }>;
  };
  VISTIQ: {
    name: string;
    variants: Array<{
      id: string;
      name: string;
      trim: string;
      description: string;
      basePrice: {
        inclVat: number;
        exclVat: number;
      };
      mileageOptions: Array<{
        annualKm: number;
        residualPercent: number;
        residualValue: number;
        baseMonthlyRate: number;
        services: {
          comfortPlus: number;
          gap: number;
          legalProtection: number;
        };
      }>;
    }>;
  };
  leasingParameters: {
    standardDuration: number;
    availableDurations: number[];
    interestRateNominal: number;
    interestRateEffective: number;
    excessMileageCost: number;
    downPaymentOptions: number[];
  };
  tcoData: {
    energyCosts: {
      electric: {
        pricePerKwh: number;
        consumptionPer100km: number;
        costPer100km: number;
      };
      gasoline: {
        pricePerLiter: number;
        consumptionPer100km: number;
        costPer100km: number;
      };
    };
    maintenanceCosts: {
      electric: {
        annualCost: number;
      };
      gasoline: {
        annualCost: number;
      };
    };
    swissTaxBenefits: {
      motorVehicleTax: number;
      co2Tax: number;
      cantonalIncentives: number;
      companyCarTaxReduction: number;
    };
    environmentalImpact: {
      co2SavingsPerYear: number;
      equivalentTrees: number;
    };
  };
}

export interface LeasingCalculationRequest {
  vehicleId: string;
  variantId: string;
  annualMileage: number;
  leasingDuration: number;
  downPaymentPercent: number;
  selectedServices: {
    comfortPlus: boolean;
    gap: boolean;
    legalProtection: boolean;
  };
}

export interface LeasingCalculationResult {
  vehicleName: string;
  basePrice: number;
  downPaymentAmount: number;
  financingAmount: number;
  residualValue: number;
  residualPercent: number;
  baseMonthlyRate: number;
  serviceRates: {
    comfortPlus: number;
    gap: number;
    legalProtection: number;
  };
  totalServiceCosts: number;
  totalMonthlyRate: number;
  totalLeasingCost: number;
  totalServiceCost: number;
  leasingDuration: number;
  annualMileage: number;
}

export interface TcoCalculationRequest {
  vehicleId: string;
  variantId: string;
  annualMileage: number;
  leasingDuration: number;
  energyCosts: {
    electric: number;
    gasoline: number;
  };
  maintenanceCosts: {
    electric: number;
    gasoline: number;
  };
}

export interface TcoCalculationResult {
  vehicleName: string;
  totalCostOfOwnership: number;
  monthlyCost: number;
  costPerKm: number;
  energyCosts: number;
  maintenanceCosts: number;
  insuranceCosts: number;
  depreciationCosts: number;
  taxBenefits: number;
  environmentalSavings: {
    co2Savings: number;
    equivalentTrees: number;
  };
  comparison: {
    electric: number;
    gasoline: number;
    savings: number;
  };
}

@Injectable()
export class LeasingService {
  private readonly logger = new Logger(LeasingService.name);
  private vehicleData: VehicleData | null = null;

  constructor() {
    this.loadVehicleData();
  }

  private loadVehicleData(): void {
    try {
      const dataPath = path.join(__dirname, 'vehicle_data.json');
      const data = fs.readFileSync(dataPath, 'utf8');
      this.vehicleData = JSON.parse(data);
      this.logger.log('Vehicle data loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load vehicle data:', error);
      // Fallback data
      this.vehicleData = {
        extraction_date: '2025-01-01',
        source: 'CA Auto Finance Easyfin',
        currency: 'CHF',
        market: 'Switzerland',
        LYRIQ_2025: {
          name: 'CADILLAC LYRIQ 2025',
          basePrice: { inclVat: 89100.00, exclVat: 82423.68 },
          variants: [{
            id: 'lyriq_2025_base',
            name: 'Base',
            trim: '001',
            description: 'CADILLAC Lyriq 2025 Base',
            mileageOptions: [{
              annualKm: 15000,
              residualPercent: 31.72,
              residualValue: 28262.52,
              baseMonthlyRate: 1222.45,
              services: { comfortPlus: 60.20, gap: 43.95, legalProtection: 6.25 }
            }]
          }]
        },
        VISTIQ: {
          name: 'CADILLAC VISTIQ',
          variants: []
        },
        leasingParameters: {
          standardDuration: 48,
          availableDurations: [24, 36, 48, 60],
          interestRateNominal: 0.00,
          interestRateEffective: 0.00,
          excessMileageCost: 0.50,
          downPaymentOptions: [0, 5, 10, 15, 20, 25, 30]
        },
        tcoData: {
          energyCosts: {
            electric: { pricePerKwh: 0.20, consumptionPer100km: 20, costPer100km: 4.00 },
            gasoline: { pricePerLiter: 1.65, consumptionPer100km: 8, costPer100km: 13.20 }
          },
          maintenanceCosts: {
            electric: { annualCost: 400 },
            gasoline: { annualCost: 1000 }
          },
          swissTaxBenefits: {
            motorVehicleTax: 0,
            co2Tax: 0,
            cantonalIncentives: 5000,
            companyCarTaxReduction: 0.5
          },
          environmentalImpact: {
            co2SavingsPerYear: 2.3,
            equivalentTrees: 10000
          }
        }
      };
    }
  }

  getVehicles(): VehicleData {
    if (!this.vehicleData) {
      throw new Error('Vehicle data not loaded');
    }
    return this.vehicleData;
  }

  calculateLeasing(request: LeasingCalculationRequest): LeasingCalculationResult {
    if (!this.vehicleData) {
      throw new Error('Vehicle data not loaded');
    }

    const { vehicleId, variantId, annualMileage, leasingDuration, downPaymentPercent, selectedServices } = request;

    // Get vehicle data
    let vehicle;
    let variant;
    let basePrice;
    
    if (vehicleId === 'LYRIQ_2025') {
      vehicle = this.vehicleData.LYRIQ_2025;
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      variant = vehicle.variants.find(v => v.id === variantId);
      basePrice = vehicle.basePrice;
    } else if (vehicleId === 'VISTIQ') {
      vehicle = this.vehicleData.VISTIQ;
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      variant = vehicle.variants.find(v => v.id === variantId);
      basePrice = variant?.basePrice;
    } else {
      throw new Error('Vehicle not found');
    }

    if (!variant || !basePrice) {
      throw new Error('Variant not found');
    }

    // Find mileage option
    const mileageOption = variant.mileageOptions.find(m => m.annualKm === annualMileage);
    if (!mileageOption) {
      throw new Error('Mileage option not found');
    }

    // Calculate down payment amount
    const downPaymentAmount = (basePrice.inclVat * downPaymentPercent) / 100;
    const financingAmount = basePrice.inclVat - downPaymentAmount;

    // Adjust base rate for different durations
    const durationFactor = 48 / leasingDuration;
    const adjustedBaseRate = mileageOption.baseMonthlyRate * durationFactor;

    // Adjust for down payment
    const downPaymentReduction = downPaymentAmount / leasingDuration;
    const baseMonthlyRate = adjustedBaseRate - downPaymentReduction;

    // Calculate service costs
    const financingFactor = financingAmount / basePrice.inclVat;
    const comfortPlusRate = selectedServices.comfortPlus ? 
      mileageOption.services.comfortPlus * financingFactor : 0;
    const gapRate = selectedServices.gap ? mileageOption.services.gap : 0;
    const legalProtectionRate = selectedServices.legalProtection ? 
      mileageOption.services.legalProtection : 0;

    const totalServiceCosts = comfortPlusRate + gapRate + legalProtectionRate;
    const totalMonthlyRate = baseMonthlyRate + totalServiceCosts;

    // Calculate totals
    const totalLeasingCost = (totalMonthlyRate * leasingDuration) + downPaymentAmount;
    const totalServiceCost = totalServiceCosts * leasingDuration;

    return {
      vehicleName: `${vehicle.name} ${variant.name}`,
      basePrice: basePrice.inclVat,
      downPaymentAmount,
      financingAmount,
      residualValue: mileageOption.residualValue,
      residualPercent: mileageOption.residualPercent,
      baseMonthlyRate,
      serviceRates: {
        comfortPlus: comfortPlusRate,
        gap: gapRate,
        legalProtection: legalProtectionRate
      },
      totalServiceCosts,
      totalMonthlyRate,
      totalLeasingCost,
      totalServiceCost,
      leasingDuration,
      annualMileage
    };
  }

  calculateTCO(request: TcoCalculationRequest): TcoCalculationResult {
    if (!this.vehicleData) {
      throw new Error('Vehicle data not loaded');
    }

    const { vehicleId, variantId, annualMileage, leasingDuration, energyCosts, maintenanceCosts } = request;

    // Get vehicle data
    let vehicle;
    let variant;
    let basePrice;
    
    if (vehicleId === 'LYRIQ_2025') {
      vehicle = this.vehicleData.LYRIQ_2025;
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      variant = vehicle.variants.find(v => v.id === variantId);
      basePrice = vehicle.basePrice;
    } else if (vehicleId === 'VISTIQ') {
      vehicle = this.vehicleData.VISTIQ;
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      variant = vehicle.variants.find(v => v.id === variantId);
      basePrice = variant?.basePrice;
    } else {
      throw new Error('Vehicle not found');
    }

    if (!variant || !basePrice) {
      throw new Error('Variant not found');
    }

    // Calculate TCO components
    const energyCostsTotal = (energyCosts.electric * annualMileage * leasingDuration) / 100;
    const maintenanceCostsTotal = maintenanceCosts.electric * leasingDuration;
    const insuranceCostsTotal = 1800 * leasingDuration; // Estimated annual insurance
    const depreciationCostsTotal = basePrice.inclVat * 0.35; // 35% depreciation over 4 years
    const taxBenefitsTotal = this.vehicleData.tcoData.swissTaxBenefits.cantonalIncentives;

    const totalCostOfOwnership = basePrice.inclVat + energyCostsTotal + maintenanceCostsTotal + 
                                insuranceCostsTotal + depreciationCostsTotal - taxBenefitsTotal;
    const monthlyCost = totalCostOfOwnership / leasingDuration;
    const costPerKm = totalCostOfOwnership / (annualMileage * leasingDuration);

    // Calculate gasoline comparison
    const gasolineEnergyCosts = (energyCosts.gasoline * annualMileage * leasingDuration) / 100;
    const gasolineMaintenanceCosts = maintenanceCosts.gasoline * leasingDuration;
    const gasolineTotal = basePrice.inclVat + gasolineEnergyCosts + gasolineMaintenanceCosts + 
                         insuranceCostsTotal + depreciationCostsTotal;
    const savings = gasolineTotal - totalCostOfOwnership;

    return {
      vehicleName: `${vehicle.name} ${variant.name}`,
      totalCostOfOwnership,
      monthlyCost,
      costPerKm,
      energyCosts: energyCostsTotal,
      maintenanceCosts: maintenanceCostsTotal,
      insuranceCosts: insuranceCostsTotal,
      depreciationCosts: depreciationCostsTotal,
      taxBenefits: taxBenefitsTotal,
      environmentalSavings: {
        co2Savings: this.vehicleData.tcoData.environmentalImpact.co2SavingsPerYear * leasingDuration,
        equivalentTrees: this.vehicleData.tcoData.environmentalImpact.equivalentTrees
      },
      comparison: {
        electric: totalCostOfOwnership,
        gasoline: gasolineTotal,
        savings
      }
    };
  }

  getCurrentRates(): any {
    if (!this.vehicleData) {
      throw new Error('Vehicle data not loaded');
    }

    return {
      leasingParameters: this.vehicleData.leasingParameters,
      tcoData: this.vehicleData.tcoData
    };
  }
} 