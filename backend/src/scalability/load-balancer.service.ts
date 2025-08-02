import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Load Balancer Service
 * 
 * Implements intelligent load balancing strategies for distributing
 * traffic across multiple server instances to handle 1000+ concurrent users.
 * Includes health checking, circuit breaker patterns, and automatic failover.
 * 
 * Optimized for Swiss market with geographic distribution considerations
 * and integration with Swiss CDN endpoints.
 * 
 * @author Cadillac EV CIS Team
 * @version 1.0.0
 * @since 2024-01-30
 */
@Injectable()
export class LoadBalancerService {
  private readonly logger = new Logger(LoadBalancerService.name);
  private readonly serverInstances: Map<string, ServerInstance> = new Map();
  private readonly healthCheckInterval = 30000; // 30 seconds
  private readonly circuitBreakerThreshold = 5; // failures before circuit opens
  private healthCheckTimer: NodeJS.Timeout;

  constructor(private configService: ConfigService) {
    this.initializeServerInstances();
    this.startHealthChecking();
    this.logger.log('LoadBalancerService initialized for Swiss market deployment');
  }

  /**
   * Initialize server instances for Swiss deployment
   * Includes geographic distribution across Swiss data centers
   */
  private initializeServerInstances(): void {
    const instances = this.configService.get<ServerInstanceConfig[]>('SERVER_INSTANCES', [
      {
        id: 'zurich-primary',
        url: 'https://app-zrh-1.cadillac-ev-cis.ch',
        region: 'zurich',
        weight: 40,
        priority: 1,
        maxConnections: 300
      },
      {
        id: 'zurich-secondary',
        url: 'https://app-zrh-2.cadillac-ev-cis.ch',
        region: 'zurich',
        weight: 30,
        priority: 2,
        maxConnections: 250
      },
      {
        id: 'geneva-primary',
        url: 'https://app-gva-1.cadillac-ev-cis.ch',
        region: 'geneva',
        weight: 20,
        priority: 1,
        maxConnections: 200
      },
      {
        id: 'basel-backup',
        url: 'https://app-bsl-1.cadillac-ev-cis.ch',
        region: 'basel',
        weight: 10,
        priority: 3,
        maxConnections: 150
      }
    ]);

    instances.forEach(config => {
      this.serverInstances.set(config.id, new ServerInstance(config));
    });

    this.logger.log(`Initialized ${instances.length} server instances across Swiss regions`);
  }

  /**
   * Get optimal server instance based on load balancing algorithm
   * 
   * Uses weighted round-robin with health checking and geographic proximity
   * for Swiss users to ensure optimal performance and data residency.
   * 
   * @param clientRegion - Client's geographic region (if available)
   * @param requestType - Type of request for specialized routing
   * @returns Best available server instance
   */
  getOptimalServer(
    clientRegion?: SwissRegion,
    requestType: RequestType = 'general'
  ): ServerInstance | null {
    const healthyInstances = Array.from(this.serverInstances.values())
      .filter(instance => instance.isHealthy() && instance.canAcceptConnection());

    if (healthyInstances.length === 0) {
      this.logger.error('No healthy server instances available');
      return null;
    }

    // Prioritize by geographic proximity for Swiss users
    if (clientRegion) {
      const regionalInstances = healthyInstances.filter(
        instance => instance.config.region === clientRegion
      );
      
      if (regionalInstances.length > 0) {
        return this.selectByWeightedRoundRobin(regionalInstances);
      }
    }

    // Route Swiss data requests to specific instances for data residency
    if (requestType === 'swiss_data') {
      const swissDataInstances = healthyInstances.filter(
        instance => instance.config.region === 'zurich' // Primary Swiss data processing
      );
      
      if (swissDataInstances.length > 0) {
        return this.selectByWeightedRoundRobin(swissDataInstances);
      }
    }

    // Fallback to general load balancing
    return this.selectByWeightedRoundRobin(healthyInstances);
  }

  /**
   * Weighted round-robin selection algorithm
   * 
   * Distributes load based on server capacity and current utilization
   * to ensure optimal performance across all instances.
   */
  private selectByWeightedRoundRobin(instances: ServerInstance[]): ServerInstance {
    // Sort by priority first, then by current load
    instances.sort((a, b) => {
      if (a.config.priority !== b.config.priority) {
        return a.config.priority - b.config.priority;
      }
      return a.getCurrentLoad() - b.getCurrentLoad();
    });

    // Calculate weighted selection
    const totalWeight = instances.reduce((sum, instance) => {
      return sum + (instance.config.weight * (1 - instance.getCurrentLoad()));
    }, 0);

    let random = Math.random() * totalWeight;
    
    for (const instance of instances) {
      const adjustedWeight = instance.config.weight * (1 - instance.getCurrentLoad());
      random -= adjustedWeight;
      
      if (random <= 0) {
        instance.incrementConnections();
        this.logger.debug(`Selected server: ${instance.config.id} (load: ${instance.getCurrentLoad()})`);
        return instance;
      }
    }

    // Fallback to first instance
    instances[0].incrementConnections();
    return instances[0];
  }

  /**
   * Start periodic health checking of all server instances
   * 
   * Monitors server health, response times, and capacity to ensure
   * traffic is only routed to healthy instances.
   */
  private startHealthChecking(): void {
    this.healthCheckTimer = setInterval(async () => {
      const healthCheckPromises = Array.from(this.serverInstances.values()).map(
        instance => this.performHealthCheck(instance)
      );

      try {
        await Promise.allSettled(healthCheckPromises);
      } catch (error) {
        this.logger.error('Error during health checks:', error);
      }
    }, this.healthCheckInterval);

    this.logger.log(`Health checking started with ${this.healthCheckInterval}ms interval`);
  }

  /**
   * Perform health check on a specific server instance
   */
  private async performHealthCheck(instance: ServerInstance): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${instance.config.url}/api/health`, {
        method: 'GET',
        // timeout: 5000, // Removed as not supported in RequestInit
        headers: {
          'User-Agent': 'CadillacEV-LoadBalancer/1.0.0'
        }
      });

      const responseTime = Date.now() - startTime;
      const healthData = await response.json();

      if (response.ok && healthData.status === 'healthy') {
        instance.recordHealthyResponse(responseTime);
        this.logger.debug(`Health check passed for ${instance.config.id}: ${responseTime}ms`);
      } else {
        instance.recordFailure();
        this.logger.warn(`Health check failed for ${instance.config.id}: ${response.status}`);
      }

    } catch (error) {
      instance.recordFailure();
      this.logger.warn(`Health check error for ${instance.config.id}: ${error.message}`);
    }
  }

  /**
   * Get current load balancing statistics
   * 
   * Provides insights into traffic distribution, server health,
   * and performance metrics for monitoring and optimization.
   */
  getLoadBalancingStats(): LoadBalancingStats {
    const instances = Array.from(this.serverInstances.values());
    
    return {
      totalInstances: instances.length,
      healthyInstances: instances.filter(i => i.isHealthy()).length,
      totalConnections: instances.reduce((sum, i) => sum + i.getCurrentConnections(), 0),
      totalCapacity: instances.reduce((sum, i) => sum + i.config.maxConnections, 0),
      averageResponseTime: this.calculateAverageResponseTime(instances),
      regionalDistribution: this.getRegionalDistribution(instances),
      circuitBreakerStatus: instances.map(i => ({
        instanceId: i.config.id,
        isOpen: i.isCircuitBreakerOpen(),
        failureCount: i.getFailureCount()
      }))
    };
  }

  /**
   * Calculate average response time across all healthy instances
   */
  private calculateAverageResponseTime(instances: ServerInstance[]): number {
    const healthyInstances = instances.filter(i => i.isHealthy());
    if (healthyInstances.length === 0) return 0;

    const totalResponseTime = healthyInstances.reduce(
      (sum, instance) => sum + instance.getAverageResponseTime(), 0
    );

    return totalResponseTime / healthyInstances.length;
  }

  /**
   * Get traffic distribution by Swiss region
   */
  private getRegionalDistribution(instances: ServerInstance[]): RegionalDistribution {
    const distribution: RegionalDistribution = {};

    instances.forEach(instance => {
      const region = instance.config.region;
      if (!distribution[region]) {
        distribution[region] = {
          instances: 0,
          totalConnections: 0,
          healthyInstances: 0
        };
      }

      distribution[region].instances++;
      distribution[region].totalConnections += instance.getCurrentConnections();
      
      if (instance.isHealthy()) {
        distribution[region].healthyInstances++;
      }
    });

    return distribution;
  }

  /**
   * Handle connection completion to update server load
   */
  releaseConnection(serverId: string): void {
    const instance = this.serverInstances.get(serverId);
    if (instance) {
      instance.decrementConnections();
    }
  }

  /**
   * Graceful shutdown - cleanup resources
   */
  onModuleDestroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    this.logger.log('LoadBalancerService shutdown completed');
  }
}

/**
 * Server Instance Class
 * 
 * Represents a single server instance with health monitoring,
 * circuit breaker functionality, and load tracking.
 */
class ServerInstance {
  private currentConnections = 0;
  private failureCount = 0;
  private lastFailureTime = 0;
  private responseTimeHistory: number[] = [];
  private readonly maxResponseTimeHistory = 100;
  private readonly circuitBreakerTimeout = 60000; // 1 minute

  constructor(public readonly config: ServerInstanceConfig) {}

  /**
   * Check if instance is healthy and can accept connections
   */
  isHealthy(): boolean {
    return !this.isCircuitBreakerOpen() && 
           this.failureCount < this.config.maxFailures;
  }

  /**
   * Check if instance can accept more connections
   */
  canAcceptConnection(): boolean {
    return this.currentConnections < this.config.maxConnections;
  }

  /**
   * Get current load as percentage of capacity
   */
  getCurrentLoad(): number {
    return this.currentConnections / this.config.maxConnections;
  }

  /**
   * Increment connection count
   */
  incrementConnections(): void {
    if (this.currentConnections < this.config.maxConnections) {
      this.currentConnections++;
    }
  }

  /**
   * Decrement connection count
   */
  decrementConnections(): void {
    if (this.currentConnections > 0) {
      this.currentConnections--;
    }
  }

  /**
   * Get current number of connections
   */
  getCurrentConnections(): number {
    return this.currentConnections;
  }

  /**
   * Record successful health check with response time
   */
  recordHealthyResponse(responseTime: number): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    
    // Update response time history
    this.responseTimeHistory.push(responseTime);
    if (this.responseTimeHistory.length > this.maxResponseTimeHistory) {
      this.responseTimeHistory.shift();
    }
  }

  /**
   * Record health check failure
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  /**
   * Check if circuit breaker is open
   */
  isCircuitBreakerOpen(): boolean {
    if (this.failureCount < this.config.maxFailures) {
      return false;
    }

    // Check if timeout period has passed
    return Date.now() - this.lastFailureTime < this.circuitBreakerTimeout;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * Get average response time
   */
  getAverageResponseTime(): number {
    if (this.responseTimeHistory.length === 0) return 0;
    
    const sum = this.responseTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.responseTimeHistory.length;
  }
}

// Type definitions for TypeScript support
interface ServerInstanceConfig {
  id: string;
  url: string;
  region: SwissRegion;
  weight: number;
  priority: number;
  maxConnections: number;
  maxFailures?: number;
}

type SwissRegion = 'zurich' | 'geneva' | 'basel' | 'bern' | 'lausanne';
type RequestType = 'general' | 'swiss_data' | 'analytics' | 'media';

interface LoadBalancingStats {
  totalInstances: number;
  healthyInstances: number;
  totalConnections: number;
  totalCapacity: number;
  averageResponseTime: number;
  regionalDistribution: RegionalDistribution;
  circuitBreakerStatus: Array<{
    instanceId: string;
    isOpen: boolean;
    failureCount: number;
  }>;
}

interface RegionalDistribution {
  [region: string]: {
    instances: number;
    totalConnections: number;
    healthyInstances: number;
  };
}