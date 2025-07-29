import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'API is running successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        version: { type: 'string' },
        timestamp: { type: 'string' },
        environment: { type: 'string' }
      }
    }
  })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('version')
  @ApiOperation({ summary: 'Get API version information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Version information',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        author: { type: 'string' }
      }
    }
  })
  getVersion() {
    return this.appService.getVersion();
  }
}

