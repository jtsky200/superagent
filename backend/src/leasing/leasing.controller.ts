import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { LeasingService, LeasingCalculationRequest, TcoCalculationRequest } from './leasing.service';

@Controller('api/leasing')
export class LeasingController {
  constructor(private readonly leasingService: LeasingService) {}

  @Get('vehicles')
  async getVehicles() {
    try {
      const vehicles = this.leasingService.getVehicles();
      return {
        success: true,
        data: vehicles
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('calculate-leasing')
  async calculateLeasing(@Body() request: LeasingCalculationRequest) {
    try {
      const result = this.leasingService.calculateLeasing(request);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: error.message
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('calculate-tco')
  async calculateTCO(@Body() request: TcoCalculationRequest) {
    try {
      const result = this.leasingService.calculateTCO(request);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: error.message
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('current-rates')
  async getCurrentRates() {
    try {
      const rates = this.leasingService.getCurrentRates();
      return {
        success: true,
        data: rates
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 