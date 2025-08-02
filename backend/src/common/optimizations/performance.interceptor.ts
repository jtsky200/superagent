import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Request, Response } from 'express';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: number;
  memoryUsage?: NodeJS.MemoryUsage;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 requests

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    // Add performance headers
    response.setHeader('X-Request-ID', this.generateRequestId());
    response.setHeader('X-Response-Time', '0'); // Will be updated later

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        
        // Update response time header
        response.setHeader('X-Response-Time', `${duration}ms`);
        
        // Collect metrics
        const metric: PerformanceMetrics = {
          endpoint: request.route?.path || request.path,
          method: request.method,
          duration,
          statusCode: response.statusCode,
          timestamp: startTime,
          memoryUsage: {
            rss: endMemory.rss - startMemory.rss,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external,
            arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
          },
          userAgent: request.headers['user-agent'],
          ip: request.ip,
        };

        this.recordMetric(metric);
        
        // Log slow requests
        if (duration > 1000) {
          this.logger.warn(
            `Slow request: ${request.method} ${request.path} took ${duration}ms`
          );
        }

        // Log high memory usage
        if (metric.memoryUsage.heapUsed > 50 * 1024 * 1024) { // 50MB
          this.logger.warn(
            `High memory usage: ${request.method} ${request.path} used ${
              metric.memoryUsage.heapUsed / 1024 / 1024
            }MB`
          );
        }
      }),
      map((data) => {
        // Add performance metadata to response in development
        if (process.env.NODE_ENV === 'development') {
          const duration = Date.now() - startTime;
          return {
            ...data,
            _performance: {
              responseTime: `${duration}ms`,
              memoryUsage: process.memoryUsage(),
            },
          };
        }
        return data;
      })
    );
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const totalTime = relevantMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalTime / relevantMetrics.length;
  }

  getSlowRequests(threshold: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.duration > threshold);
  }

  getMemoryHeavyRequests(threshold: number = 50 * 1024 * 1024): PerformanceMetrics[] {
    return this.metrics.filter(
      metric => metric.memoryUsage && metric.memoryUsage.heapUsed > threshold
    );
  }

  getEndpointStats(): Record<string, {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    slowRequestCount: number;
  }> {
    const stats: Record<string, any> = {};

    for (const metric of this.metrics) {
      if (!stats[metric.endpoint]) {
        stats[metric.endpoint] = {
          totalRequests: 0,
          totalTime: 0,
          errorCount: 0,
          slowRequestCount: 0,
        };
      }

      const endpointStats = stats[metric.endpoint];
      endpointStats.totalRequests++;
      endpointStats.totalTime += metric.duration;

      if (metric.statusCode >= 400) {
        endpointStats.errorCount++;
      }

      if (metric.duration > 1000) {
        endpointStats.slowRequestCount++;
      }
    }

    // Calculate derived metrics
    for (const endpoint in stats) {
      const endpointStats = stats[endpoint];
      endpointStats.avgResponseTime = endpointStats.totalTime / endpointStats.totalRequests;
      endpointStats.errorRate = (endpointStats.errorCount / endpointStats.totalRequests) * 100;
      delete endpointStats.totalTime;
      delete endpointStats.errorCount;
    }

    return stats;
  }

  clearMetrics(): void {
    this.metrics = [];
    this.logger.debug('Performance metrics cleared');
  }

  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the last N metrics to prevent memory issues
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}