import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipIf?: (request: Request) => boolean;
  keyGenerator?: (request: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_KEY = 'rateLimit';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly store = new Map<string, RateLimitRecord>();
  private readonly defaultOptions: RateLimitOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req) => req.ip || 'unknown',
  };

  constructor(private reflector: Reflector) {
    // Cleanup expired records every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // Get rate limit options from decorator or use defaults
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler()
    ) || this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getClass()
    ) || this.defaultOptions;

    // Skip rate limiting if condition is met
    if (options.skipIf && options.skipIf(request)) {
      return true;
    }

    const key = options.keyGenerator ? options.keyGenerator(request) : this.defaultOptions.keyGenerator!(request);
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Get or create rate limit record
    let record = this.store.get(key);
    if (!record || record.resetTime <= now) {
      record = {
        count: 0,
        resetTime: now + options.windowMs,
      };
      this.store.set(key, record);
    }

    // Increment request count
    record.count++;

    // Set rate limit headers
    const remaining = Math.max(0, options.maxRequests - record.count);
    const resetTime = Math.ceil(record.resetTime / 1000);

    response.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
    response.setHeader('X-RateLimit-Remaining', remaining.toString());
    response.setHeader('X-RateLimit-Reset', resetTime.toString());
    response.setHeader('X-RateLimit-Window', options.windowMs.toString());

    // Check if rate limit exceeded
    if (record.count > options.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      response.setHeader('Retry-After', retryAfter.toString());

      this.logger.warn(
        `Rate limit exceeded for ${key}: ${record.count}/${options.maxRequests} requests in window`
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          error: 'Rate limit exceeded',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of this.store.entries()) {
      if (record.resetTime <= now) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired rate limit records`);
    }
  }

  // Get current rate limit stats
  getRateLimitStats(): {
    totalKeys: number;
    activeRecords: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let activeRecords = 0;

    for (const record of this.store.values()) {
      if (record.resetTime > now) {
        activeRecords++;
      }
    }

    return {
      totalKeys: this.store.size,
      activeRecords,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    return this.store.size * 100; // Approximate bytes per record
  }
}

// Decorator to set rate limit options
export const RateLimit = (options: Partial<RateLimitOptions>) => {
  // Note: Using metadata decorator instead of Reflector.prototype.set
  return SetMetadata(RATE_LIMIT_KEY, options);
};

// Common rate limit presets
export const RateLimitPresets = {
  // Strict rate limiting for sensitive endpoints
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  // Standard rate limiting for API endpoints
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  // Relaxed rate limiting for public endpoints
  relaxed: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
  },
  // Short burst protection
  burst: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },
};