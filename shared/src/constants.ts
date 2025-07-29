import { SwissCanton } from './types';

// ===== CADILLAC EV MODELS =====

export const CADILLAC_EV_MODELS = {
  LYRIQ_LUXURY: {
    id: 'lyriq-luxury',
    modelName: 'CADILLAC LYRIQ',
    modelVariant: 'Luxury',
    modelYear: 2024,
    batteryCapacityKwh: 100,
    wltpRangeKm: 502,
    powerKw: 250,
    powerPs: 340,
    torqueNm: 440,
    weightKg: 2235,
    basePriceChf: 82900,
    energyConsumptionKwh100km: 19.8,
    chargingPowerAcKw: 11.5,
    chargingPowerDcKw: 190,
    acceleration0To100Sec: 6.0,
    topSpeedKmh: 190,
    cargoCapacityLiters: 793
  },
  LYRIQ_PREMIUM: {
    id: 'lyriq-premium',
    modelName: 'CADILLAC LYRIQ',
    modelVariant: 'Premium',
    modelYear: 2024,
    batteryCapacityKwh: 100,
    wltpRangeKm: 500,
    powerKw: 250,
    powerPs: 340,
    torqueNm: 440,
    weightKg: 2245,
    basePriceChf: 89900,
    energyConsumptionKwh100km: 20.0,
    chargingPowerAcKw: 11.5,
    chargingPowerDcKw: 190,
    acceleration0To100Sec: 6.0,
    topSpeedKmh: 190,
    cargoCapacityLiters: 793
  },
  LYRIQ_SPORT: {
    id: 'lyriq-sport',
    modelName: 'CADILLAC LYRIQ',
    modelVariant: 'Sport',
    modelYear: 2024,
    batteryCapacityKwh: 100,
    wltpRangeKm: 495,
    powerKw: 280,
    powerPs: 380,
    torqueNm: 460,
    weightKg: 2255,
    basePriceChf: 96900,
    energyConsumptionKwh100km: 20.2,
    chargingPowerAcKw: 11.5,
    chargingPowerDcKw: 190,
    acceleration0To100Sec: 5.7,
    topSpeedKmh: 200,
    cargoCapacityLiters: 793
  },
  CELESTIQ: {
    id: 'celestiq',
    modelName: 'CADILLAC CELESTIQ',
    modelVariant: 'Standard',
    modelYear: 2024,
    batteryCapacityKwh: 111,
    wltpRangeKm: 480,
    powerKw: 447,
    powerPs: 608,
    torqueNm: 785,
    weightKg: 2745,
    basePriceChf: 340000,
    energyConsumptionKwh100km: 23.1,
    chargingPowerAcKw: 11.5,
    chargingPowerDcKw: 200,
    acceleration0To100Sec: 3.8,
    topSpeedKmh: 250,
    cargoCapacityLiters: 410
  },
  OPTIQ: {
    id: 'optiq',
    modelName: 'CADILLAC OPTIQ',
    modelVariant: 'Standard',
    modelYear: 2024,
    batteryCapacityKwh: 85,
    wltpRangeKm: 480,
    powerKw: 220,
    powerPs: 299,
    torqueNm: 365,
    weightKg: 2050,
    basePriceChf: 72900,
    energyConsumptionKwh100km: 17.7,
    chargingPowerAcKw: 11.5,
    chargingPowerDcKw: 150,
    acceleration0To100Sec: 7.0,
    topSpeedKmh: 180,
    cargoCapacityLiters: 635
  },
  ESCALADE_IQ: {
    id: 'escalade-iq',
    modelName: 'CADILLAC ESCALADE IQ',
    modelVariant: 'Standard',
    modelYear: 2024,
    batteryCapacityKwh: 200,
    wltpRangeKm: 724,
    powerKw: 560,
    powerPs: 762,
    torqueNm: 1064,
    weightKg: 4103,
    basePriceChf: 179000,
    energyConsumptionKwh100km: 27.6,
    chargingPowerAcKw: 19.2,
    chargingPowerDcKw: 350,
    acceleration0To100Sec: 4.9,
    topSpeedKmh: 200,
    cargoCapacityLiters: 3374
  }
} as const;

// ===== SWISS CANTON DATA =====

export const SWISS_CANTONS = {
  [SwissCanton.ZH]: {
    name: 'Zürich',
    abbreviation: SwissCanton.ZH,
    vehicleTaxCalculationMethod: 'COMBINED',
    vehicleTaxFactorPower: 0.0,
    vehicleTaxFactorWeight: 0.0,
    vehicleTaxBaseFee: 0,
    evTaxDiscount: 100, // 100% discount
    evTaxDiscountYears: 8,
    registrationFee: 50,
    licensePlateFee: 25,
    averageElectricityPricePerKwh: 0.21
  },
  [SwissCanton.BE]: {
    name: 'Bern',
    abbreviation: SwissCanton.BE,
    vehicleTaxCalculationMethod: 'WEIGHT',
    vehicleTaxFactorWeight: 0.11,
    vehicleTaxBaseFee: 0,
    evTaxDiscount: 90,
    evTaxDiscountYears: 5,
    registrationFee: 45,
    licensePlateFee: 30,
    averageElectricityPricePerKwh: 0.19
  },
  [SwissCanton.LU]: {
    name: 'Luzern',
    abbreviation: SwissCanton.LU,
    vehicleTaxCalculationMethod: 'POWER',
    vehicleTaxFactorPower: 2.32,
    vehicleTaxBaseFee: 0,
    evTaxDiscount: 50,
    evTaxDiscountYears: 0,
    registrationFee: 40,
    licensePlateFee: 25,
    averageElectricityPricePerKwh: 0.18
  },
  [SwissCanton.BS]: {
    name: 'Basel-Stadt',
    abbreviation: SwissCanton.BS,
    vehicleTaxCalculationMethod: 'COMBINED',
    vehicleTaxFactorPower: 1.5,
    vehicleTaxFactorWeight: 0.05,
    vehicleTaxBaseFee: 0,
    evTaxDiscount: 100,
    evTaxDiscountYears: 5,
    registrationFee: 55,
    licensePlateFee: 35,
    averageElectricityPricePerKwh: 0.22
  },
  [SwissCanton.GE]: {
    name: 'Genf',
    abbreviation: SwissCanton.GE,
    vehicleTaxCalculationMethod: 'COMBINED',
    vehicleTaxFactorPower: 1.2,
    vehicleTaxFactorWeight: 0.08,
    vehicleTaxBaseFee: 0,
    evTaxDiscount: 75,
    evTaxDiscountYears: 0,
    registrationFee: 60,
    licensePlateFee: 40,
    averageElectricityPricePerKwh: 0.20
  },
  [SwissCanton.TI]: {
    name: 'Tessin',
    abbreviation: SwissCanton.TI,
    vehicleTaxCalculationMethod: 'COMBINED',
    vehicleTaxFactorPower: 1.8,
    vehicleTaxFactorWeight: 0.06,
    vehicleTaxBaseFee: 0,
    evTaxDiscount: 50,
    evTaxDiscountYears: 0,
    registrationFee: 35,
    licensePlateFee: 20,
    averageElectricityPricePerKwh: 0.17
  },
  [SwissCanton.VD]: {
    name: 'Waadt',
    abbreviation: SwissCanton.VD,
    vehicleTaxCalculationMethod: 'COMBINED',
    vehicleTaxFactorPower: 1.4,
    vehicleTaxFactorWeight: 0.07,
    vehicleTaxBaseFee: 0,
    evTaxDiscount: 80,
    evTaxDiscountYears: 0,
    registrationFee: 50,
    licensePlateFee: 30,
    averageElectricityPricePerKwh: 0.19
  },
  [SwissCanton.SG]: {
    name: 'St. Gallen',
    abbreviation: SwissCanton.SG,
    vehicleTaxCalculationMethod: 'POWER',
    vehicleTaxFactorPower: 2.0,
    vehicleTaxBaseFee: 0,
    evTaxDiscount: 60,
    evTaxDiscountYears: 0,
    registrationFee: 40,
    licensePlateFee: 25,
    averageElectricityPricePerKwh: 0.18
  }
} as const;

// ===== CHARGING COSTS =====

export const CHARGING_COSTS_CHF_PER_KWH = {
  HOME_CHARGING: 0.20, // Average home electricity price
  PUBLIC_CHARGING: 0.45, // Public AC charging
  FAST_CHARGING: 0.65 // DC fast charging
} as const;

// ===== INSURANCE COSTS =====

export const INSURANCE_BASE_COSTS_CHF_PER_YEAR = {
  LIABILITY_ONLY: 800,
  PARTIAL_COVERAGE: 1200,
  FULL_COVERAGE: 1800
} as const;

// ===== MAINTENANCE COSTS =====

export const MAINTENANCE_COSTS_CHF_PER_YEAR = {
  BASIC_SERVICE: 400,
  EXTENDED_SERVICE: 600,
  PREMIUM_SERVICE: 800
} as const;

// ===== TIRE COSTS =====

export const TIRE_COSTS_CHF_PER_SET = {
  STANDARD: 800,
  PREMIUM: 1200,
  PERFORMANCE: 1600
} as const;

// ===== WALLBOX INSTALLATION =====

export const WALLBOX_INSTALLATION_COST_CHF = 2500;

// ===== SWISS VAT RATE =====

export const SWISS_VAT_RATE = 0.077; // 7.7%

// ===== DEPRECIATION RATES =====

export const DEPRECIATION_RATES = {
  YEAR_1: 0.20, // 20% in first year
  YEAR_2: 0.15, // 15% in second year
  YEAR_3: 0.12, // 12% in third year
  YEAR_4: 0.10, // 10% in fourth year
  YEAR_5_PLUS: 0.08 // 8% from fifth year onwards
} as const;

// ===== API ENDPOINTS =====

export const API_ENDPOINTS = {
  HANDELSREGISTER: 'https://www.zefix.ch/ZefixREST/api/v1',
  ZEK: 'https://api.zek.ch/v1',
  CRIF: 'https://api.crif.ch/v1',
  ASTRA: 'https://api.astra.admin.ch/v1',
  SFOE: 'https://api.bfe.admin.ch/v1',
  ELCOM: 'https://api.elcom.admin.ch/v1'
} as const;

// ===== VALIDATION RULES =====

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+41|0041|0)[1-9]\d{8}$/,
  POSTAL_CODE_REGEX: /^\d{4}$/,
  UID_REGEX: /^CHE-\d{3}\.\d{3}\.\d{3}$/,
  VAT_REGEX: /^CHE-\d{3}\.\d{3}\.\d{3} MWST$/
} as const;

// ===== UI CONSTANTS =====

export const UI_CONSTANTS = {
  ITEMS_PER_PAGE: 20,
  MAX_SEARCH_RESULTS: 100,
  DEBOUNCE_DELAY_MS: 300,
  TOAST_DURATION_MS: 5000,
  SESSION_TIMEOUT_MS: 30 * 60 * 1000 // 30 minutes
} as const;

// ===== MONOCHROME COLORS =====

export const MONOCHROME_COLORS = {
  BLACK: '#000000',
  GRAY_900: '#1a1a1a',
  GRAY_800: '#333333',
  GRAY_700: '#4d4d4d',
  GRAY_600: '#666666',
  GRAY_500: '#808080',
  GRAY_400: '#999999',
  GRAY_300: '#b3b3b3',
  GRAY_200: '#cccccc',
  GRAY_100: '#e6e6e6',
  WHITE: '#ffffff'
} as const;

