import { Controller, Get, Post, Body, Query, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './schemas/analytics.schema';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @ApiOperation({ summary: 'Track analytics event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  @ApiResponse({ status: 503, description: 'Analytics service unavailable' })
  async trackEvent(@Body() event: AnalyticsEvent) {
    try {
      return await this.analyticsService.trackEvent(event);
    } catch (error) {
      this.logger.error(`Failed to track event: ${error.message}`);
      throw new HttpException(
        'Analytics event tracking service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Get('customer-journeys')
  @ApiOperation({ summary: 'Get customer journey data' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Customer journeys retrieved successfully' })
  @ApiResponse({ status: 503, description: 'Customer journey analytics service unavailable' })
  async getCustomerJourneys(
    @Query('status') status?: string,
    @Query('limit') limit?: number
  ) {
    try {
      const filters = { status, limit };
      return await this.analyticsService.getCustomerJourneys(filters);
    } catch (error) {
      this.logger.error(`Failed to fetch customer journeys: ${error.message}`);
      throw new HttpException(
        error.message || 'Customer journey analytics service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Get('sales-funnel')
  @ApiOperation({ summary: 'Get sales funnel analysis' })
  @ApiQuery({ name: 'period', required: false })
  @ApiResponse({ status: 200, description: 'Sales funnel data retrieved successfully' })
  @ApiResponse({ status: 503, description: 'Sales funnel analytics service unavailable' })
  async getSalesFunnelData(@Query('period') period?: string) {
    try {
      return await this.analyticsService.getSalesFunnelData(period);
    } catch (error) {
      this.logger.error(`Failed to fetch sales funnel data: ${error.message}`);
      throw new HttpException(
        error.message || 'Sales funnel analytics service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Get('campaigns-roi')
  @ApiOperation({ summary: 'Get campaign ROI analysis' })
  @ApiResponse({ status: 200, description: 'Campaign ROI data retrieved successfully' })
  @ApiResponse({ status: 503, description: 'Campaign ROI analytics service unavailable' })
  async getCampaignROI() {
    try {
      // This would typically return multiple campaigns and their ROI calculations
      // For now, return error since we removed mock data
      throw new Error('Campaign ROI analytics database connections are currently unavailable');
    } catch (error) {
      this.logger.error(`Failed to fetch campaign ROI data: ${error.message}`);
      throw new HttpException(
        error.message || 'Campaign ROI analytics service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Get('campaigns-roi/:campaignId')
  @ApiOperation({ summary: 'Calculate ROI for specific campaign' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign ROI calculated successfully' })
  @ApiResponse({ status: 503, description: 'ROI calculation service unavailable' })
  async calculateCampaignROI(@Param('campaignId') campaignId: string) {
    try {
      return await this.analyticsService.calculateCampaignROI(campaignId);
    } catch (error) {
      this.logger.error(`Failed to calculate campaign ROI: ${error.message}`);
      throw new HttpException(
        error.message || 'ROI calculation service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Get predictive analytics data' })
  @ApiQuery({ name: 'model', required: true })
  @ApiQuery({ name: 'horizon', required: false })
  @ApiResponse({ status: 200, description: 'Predictions retrieved successfully' })
  @ApiResponse({ status: 503, description: 'Predictive analytics service unavailable' })
  async getPredictiveAnalytics(
    @Query('model') modelType: string,
    @Query('horizon') timeHorizon?: string
  ) {
    try {
      return await this.analyticsService.getPredictiveAnalytics(modelType, timeHorizon);
    } catch (error) {
      this.logger.error(`Failed to fetch predictive analytics: ${error.message}`);
      throw new HttpException(
        error.message || 'Predictive analytics service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Get('kpi-metrics')
  @ApiOperation({ summary: 'Get KPI metrics' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'period', required: false })
  @ApiResponse({ status: 200, description: 'KPI metrics retrieved successfully' })
  @ApiResponse({ status: 503, description: 'KPI metrics service unavailable' })
  async getKPIMetrics(
    @Query('category') category?: string,
    @Query('period') period?: string
  ) {
    try {
      return await this.analyticsService.getKPIMetrics(category, period);
    } catch (error) {
      this.logger.error(`Failed to fetch KPI metrics: ${error.message}`);
      throw new HttpException(
        error.message || 'KPI metrics service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Get('insights/:type')
  @ApiOperation({ summary: 'Generate analytics insights' })
  @ApiParam({ name: 'type', enum: ['performance', 'opportunities', 'predictions'] })
  @ApiResponse({ status: 200, description: 'Insights generated successfully' })
  @ApiResponse({ status: 503, description: 'Insights generation service unavailable' })
  async generateInsights(@Param('type') type: 'performance' | 'opportunities' | 'predictions') {
    try {
      return await this.analyticsService.generateInsights(type);
    } catch (error) {
      this.logger.error(`Failed to generate insights: ${error.message}`);
      throw new HttpException(
        error.message || 'Insights generation service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}