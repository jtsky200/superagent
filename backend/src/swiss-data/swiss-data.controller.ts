import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SwissDataService } from './swiss-data.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('swiss-data')
@Controller('swiss-data')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SwissDataController {
  constructor(private readonly swissDataService: SwissDataService) {}

  @Get('cantons')
  @ApiOperation({ summary: 'Get Swiss cantons data' })
  @ApiResponse({ status: 200, description: 'Cantons data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCantons() {
    return this.swissDataService.getCantons();
  }

  @Get('postal-codes')
  @ApiOperation({ summary: 'Get Swiss postal codes data' })
  @ApiResponse({ status: 200, description: 'Postal codes data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getPostalCodes() {
    return this.swissDataService.getPostalCodes();
  }
}

