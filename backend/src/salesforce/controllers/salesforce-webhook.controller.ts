import { 
  Controller, 
  Post, 
  Body, 
  Headers, 
  HttpStatus, 
  HttpCode,
  BadRequestException,
  Logger,
  Get,
  UseGuards,
  Req
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SalesforceWebhookService, SalesforceWebhookPayload } from '../services/salesforce-webhook.service';

@ApiTags('Salesforce Webhooks')
@Controller('salesforce/webhooks')
export class SalesforceWebhookController {
  private readonly logger = new Logger(SalesforceWebhookController.name);

  constructor(
    private salesforceWebhookService: SalesforceWebhookService,
  ) {}

  /**
   * Receive webhook notifications from Salesforce
   * This endpoint is called by Salesforce when objects change
   */
  @Post('receive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Receive Salesforce webhook notifications',
    description: 'Endpoint for receiving real-time updates from Salesforce when objects change'
  })
  @ApiHeader({
    name: 'X-Salesforce-Signature',
    description: 'HMAC signature for webhook verification',
    required: true
  })
  @ApiHeader({
    name: 'X-Salesforce-Timestamp',
    description: 'Timestamp when webhook was sent',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature or payload' })
  async receiveWebhook(
    @Body() payload: SalesforceWebhookPayload,
    @Headers('x-salesforce-signature') signature: string,
    @Headers('x-salesforce-timestamp') timestamp: string,
    @Headers('content-length') contentLength: string
  ) {
    try {
      this.logger.log(`Received webhook: ${payload.changeType} for ${payload.sobject?.Id}`);

      // Verify webhook signature
      const rawPayload = JSON.stringify(payload);
      const verification = this.salesforceWebhookService.verifyWebhookSignature(
        rawPayload,
        signature,
        timestamp
      );

      if (!verification.isValid) {
        this.logger.warn(`Webhook verification failed: ${verification.error}`);
        throw new BadRequestException(`Webhook verification failed: ${verification.error}`);
      }

      // Process the webhook
      await this.salesforceWebhookService.processWebhook(payload);

      this.logger.log(`Successfully processed webhook for ${payload.sobject?.Id}`);

      return {
        success: true,
        message: 'Webhook processed successfully',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Webhook processing failed:', error.message);
      
      // Don't throw error to avoid Salesforce retries for application errors
      // Only throw for actual validation/security issues
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log error but return success to prevent Salesforce retries
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Webhook health check endpoint
   */
  @Get('health')
  @ApiOperation({ 
    summary: 'Webhook endpoint health check',
    description: 'Check if the webhook endpoint is operational'
  })
  @ApiResponse({ status: 200, description: 'Webhook endpoint is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'salesforce-webhooks',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Setup webhook subscriptions for authenticated user
   */
  @Post('setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Setup webhook subscriptions',
    description: 'Configure webhook subscriptions in Salesforce for the authenticated user'
  })
  @ApiResponse({ status: 201, description: 'Webhook subscriptions created successfully' })
  async setupWebhooks(@Req() req: Request) {
    const userId = req.user['sub'];
    
    try {
      const objectTypes = ['Lead', 'Contact', 'Case', 'Account'];
      await this.salesforceWebhookService.setupWebhookSubscription(userId, objectTypes);

      return {
        success: true,
        message: 'Webhook subscriptions configured successfully',
        objectTypes,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Failed to setup webhooks for user ${userId}:`, error.message);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Remove webhook subscriptions for authenticated user
   */
  @Post('remove')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Remove webhook subscriptions',
    description: 'Remove webhook subscriptions from Salesforce for the authenticated user'
  })
  @ApiResponse({ status: 200, description: 'Webhook subscriptions removed successfully' })
  async removeWebhooks(@Req() req: Request) {
    const userId = req.user['sub'];
    
    try {
      await this.salesforceWebhookService.removeWebhookSubscription(userId);

      return {
        success: true,
        message: 'Webhook subscriptions removed successfully',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Failed to remove webhooks for user ${userId}:`, error.message);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Test webhook endpoint (for development)
   */
  @Post('test')
  @ApiOperation({ 
    summary: 'Test webhook endpoint',
    description: 'Test endpoint for webhook development and debugging'
  })
  @ApiResponse({ status: 200, description: 'Test webhook processed' })
  async testWebhook(@Body() payload: any) {
    this.logger.log('Received test webhook:', JSON.stringify(payload, null, 2));

    // Create a test payload format
    const testPayload: SalesforceWebhookPayload = {
      event: {
        type: 'created',
        createdDate: new Date().toISOString(),
        replayId: 1
      },
      sobject: {
        Id: payload.Id || '00Q000000000001',
        ...payload
      },
      changeType: payload.changeType || 'UPDATE',
      changedFields: payload.changedFields || ['Email', 'Phone']
    };

    try {
      await this.salesforceWebhookService.processWebhook(testPayload);
      
      return {
        success: true,
        message: 'Test webhook processed successfully',
        payload: testPayload,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Test webhook processing failed:', error.message);
      
      return {
        success: false,
        error: error.message,
        payload: testPayload,
        timestamp: new Date().toISOString()
      };
    }
  }
}