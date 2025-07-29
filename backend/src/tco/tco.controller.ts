import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TcoService } from './tco.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tco')
@Controller('tco')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TcoController {
  constructor(private readonly tcoService: TcoService) {}

  @Get()
  @ApiOperation({ summary: 'Get all TCO calculations' })
  @ApiResponse({ status: 200, description: 'TCO calculations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.tcoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a TCO calculation by ID' })
  @ApiResponse({ status: 200, description: 'TCO calculation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'TCO calculation not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tcoService.findOne(id);
  }
}

