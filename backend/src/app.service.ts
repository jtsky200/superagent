import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      message: 'CADILLAC EV CIS Backend API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      name: 'CADILLAC EV CIS Backend',
      description: 'Customer Intelligence System API for CADILLAC Electric Vehicles in Switzerland',
      author: 'CADILLAC Switzerland',
    };
  }
}

