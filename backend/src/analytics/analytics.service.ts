import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  async getDashboardStats() {
    return {
      message: 'Analytics service placeholder',
      timestamp: new Date().toISOString(),
    };
  }
}

