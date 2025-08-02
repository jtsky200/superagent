import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  tags?: string[];
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Compress large objects
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry<any>>();
  private accessOrder = new Map<string, number>(); // LRU tracking
  private readonly maxSize: number;
  private readonly defaultTTL: number;

  constructor(private configService: ConfigService) {
    this.maxSize = this.configService.get<number>('CACHE_MAX_SIZE', 1000);
    this.defaultTTL = this.configService.get<number>('CACHE_DEFAULT_TTL', 300000); // 5 minutes
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    const { ttl = this.defaultTTL, tags = [], compress = false } = options;
    
    try {
      // Implement LRU eviction if cache is full
      if (this.cache.size >= this.maxSize) {
        await this.evictLRU();
      }

      let processedData = data;
      
      // Compress large objects if requested
      if (compress && this.shouldCompress(data)) {
        processedData = await this.compressData(data);
      }

      const entry: CacheEntry<T> = {
        data: processedData,
        timestamp: Date.now(),
        ttl,
        tags: tags.length > 0 ? tags : undefined
      };

      this.cache.set(key, entry);
      this.accessOrder.set(key, Date.now());
      
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}ms)`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.cache.get(key);
      if (!entry) {
        this.logger.debug(`Cache MISS: ${key}`);
        return null;
      }

      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        this.logger.debug(`Cache EXPIRED: ${key}`);
        return null;
      }

      // Update access time for LRU
      this.accessOrder.set(key, Date.now());
      
      let data = entry.data;
      
      // Decompress if needed
      if (this.isCompressed(data)) {
        data = await this.decompressData(data);
      }
      
      this.logger.debug(`Cache HIT: ${key}`);
      return data;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return false;
    }
    
    return true;
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    this.accessOrder.delete(key);
    
    if (deleted) {
      this.logger.debug(`Cache DELETE: ${key}`);
    }
    
    return deleted;
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        invalidated++;
      }
    }
    
    this.logger.debug(`Cache INVALIDATE by tags [${tags.join(', ')}]: ${invalidated} entries`);
    return invalidated;
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern);
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        invalidated++;
      }
    }
    
    this.logger.debug(`Cache INVALIDATE by pattern ${pattern}: ${invalidated} entries`);
    return invalidated;
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.accessOrder.clear();
    this.logger.debug(`Cache CLEAR: ${size} entries removed`);
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    // Calculate approximate memory usage
    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      memoryUsage += this.estimateSize(entry);
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage
    };
  }

  private async evictLRU(): Promise<void> {
    // Find the least recently used entry
    const oldestEntry = Array.from(this.accessOrder.entries())
      .sort(([, a], [, b]) => a - b)[0];
    
    if (oldestEntry) {
      const [key] = oldestEntry;
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this.logger.debug(`Cache LRU EVICT: ${key}`);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.logger.debug(`Cache CLEANUP: ${cleaned} expired entries removed`);
    }
  }

  private shouldCompress(data: any): boolean {
    const size = this.estimateSize(data);
    return size > 1024; // Compress objects larger than 1KB
  }

  private async compressData(data: any): Promise<any> {
    // Simple compression simulation (in production, use actual compression)
    return {
      __compressed: true,
      data: JSON.stringify(data)
    };
  }

  private async decompressData(data: any): Promise<any> {
    if (data.__compressed) {
      return JSON.parse(data.data);
    }
    return data;
  }

  private isCompressed(data: any): boolean {
    return data && data.__compressed === true;
  }

  private estimateSize(obj: any): number {
    // Rough estimation of object size in bytes
    return JSON.stringify(obj).length * 2; // UTF-16 characters are 2 bytes
  }

  private calculateHitRate(): number {
    // This is a simplified hit rate calculation
    // In production, you'd track hits and misses separately
    return this.cache.size > 0 ? 0.8 : 0; // Placeholder
  }
}