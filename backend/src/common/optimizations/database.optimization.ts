import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface QueryStats {
  query: string;
  executionTime: number;
  rowsAffected: number;
  timestamp: number;
}

interface ConnectionPoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
}

@Injectable()
export class DatabaseOptimizationService {
  private readonly logger = new Logger(DatabaseOptimizationService.name);
  private queryStats: QueryStats[] = [];
  private readonly maxQueryStats = 1000;

  constructor(private configService: ConfigService) {}

  // Query performance monitoring
  trackQuery(query: string, executionTime: number, rowsAffected: number = 0): void {
    const stat: QueryStats = {
      query: this.sanitizeQuery(query),
      executionTime,
      rowsAffected,
      timestamp: Date.now(),
    };

    this.queryStats.push(stat);

    // Keep only recent stats
    if (this.queryStats.length > this.maxQueryStats) {
      this.queryStats = this.queryStats.slice(-this.maxQueryStats);
    }

    // Log slow queries
    const slowQueryThreshold = this.configService.get<number>('DB_SLOW_QUERY_THRESHOLD', 1000);
    if (executionTime > slowQueryThreshold) {
      this.logger.warn(`Slow query detected (${executionTime}ms): ${this.truncateQuery(query)}`);
    }
  }

  // Get slow queries
  getSlowQueries(threshold: number = 1000): QueryStats[] {
    return this.queryStats.filter(stat => stat.executionTime > threshold);
  }

  // Get most frequent queries
  getMostFrequentQueries(limit: number = 10): Array<{
    query: string;
    count: number;
    avgExecutionTime: number;
    totalExecutionTime: number;
  }> {
    const queryMap = new Map<string, {
      count: number;
      totalTime: number;
      executions: number[];
    }>();

    // Group queries
    for (const stat of this.queryStats) {
      const key = stat.query;
      if (!queryMap.has(key)) {
        queryMap.set(key, { count: 0, totalTime: 0, executions: [] });
      }
      
      const group = queryMap.get(key)!;
      group.count++;
      group.totalTime += stat.executionTime;
      group.executions.push(stat.executionTime);
    }

    // Convert to result format and sort by frequency
    return Array.from(queryMap.entries())
      .map(([query, data]) => ({
        query,
        count: data.count,
        avgExecutionTime: data.totalTime / data.count,
        totalExecutionTime: data.totalTime,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Database connection pool optimization
  optimizeConnectionPool(): {
    recommended: {
      poolSize: number;
      maxConnections: number;
      idleTimeout: number;
      connectionTimeout: number;
    };
    current: ConnectionPoolStats;
  } {
    // Mock current stats (in production, get from actual DB driver)
    const currentStats: ConnectionPoolStats = {
      totalConnections: 10,
      activeConnections: 7,
      idleConnections: 3,
      waitingRequests: 2,
    };

    // Calculate recommendations based on usage patterns
    const avgConcurrentQueries = this.calculateAverageConcurrentQueries();
    const peakConcurrentQueries = this.calculatePeakConcurrentQueries();

    const recommended = {
      poolSize: Math.max(10, Math.ceil(avgConcurrentQueries * 1.5)),
      maxConnections: Math.max(20, Math.ceil(peakConcurrentQueries * 2)),
      idleTimeout: 30000, // 30 seconds
      connectionTimeout: 10000, // 10 seconds
    };

    return { recommended, current: currentStats };
  }

  // Query optimization suggestions
  analyzeQueryPerformance(): Array<{
    issue: string;
    description: string;
    suggestion: string;
    affectedQueries: number;
    severity: 'high' | 'medium' | 'low';
  }> {
    const issues = [];

    // Check for N+1 query problems
    const n1Queries = this.detectN1Queries();
    if (n1Queries.length > 0) {
      issues.push({
        issue: 'N+1 Query Problem',
        description: 'Multiple similar queries detected that could be optimized with joins or bulk loading',
        suggestion: 'Use joins, subqueries, or batch loading to reduce query count',
        affectedQueries: n1Queries.length,
        severity: 'high' as const,
      });
    }

    // Check for missing indexes (simulated)
    const slowSelectQueries = this.queryStats.filter(
      stat => stat.query.toLowerCase().includes('select') && stat.executionTime > 500
    );
    if (slowSelectQueries.length > 10) {
      issues.push({
        issue: 'Slow SELECT Queries',
        description: 'Multiple slow SELECT queries detected, possibly missing indexes',
        suggestion: 'Add appropriate indexes for frequently queried columns',
        affectedQueries: slowSelectQueries.length,
        severity: 'medium' as const,
      });
    }

    // Check for large result sets
    const largeResultQueries = this.queryStats.filter(
      stat => stat.rowsAffected > 1000
    );
    if (largeResultQueries.length > 0) {
      issues.push({
        issue: 'Large Result Sets',
        description: 'Queries returning large numbers of rows detected',
        suggestion: 'Implement pagination or add LIMIT clauses to reduce memory usage',
        affectedQueries: largeResultQueries.length,
        severity: 'medium' as const,
      });
    }

    return issues;
  }

  // Index usage analysis (simulated)
  analyzeIndexUsage(): Array<{
    table: string;
    index: string;
    usage: number;
    effectiveness: number;
    recommendation: string;
  }> {
    // In production, this would query the database's index usage statistics
    return [
      {
        table: 'customers',
        index: 'idx_email',
        usage: 85,
        effectiveness: 92,
        recommendation: 'Well-utilized index, keep as is',
      },
      {
        table: 'analytics_events',
        index: 'idx_timestamp',
        usage: 12,
        effectiveness: 45,
        recommendation: 'Consider dropping or rebuilding this index',
      },
      {
        table: 'campaigns',
        index: 'idx_status_created',
        usage: 78,
        effectiveness: 88,
        recommendation: 'Good performance, consider adding to composite index',
      },
    ];
  }

  // Database maintenance recommendations
  getMaintenanceRecommendations(): Array<{
    task: string;
    frequency: string;
    lastRun?: string;
    urgency: 'high' | 'medium' | 'low';
    description: string;
  }> {
    return [
      {
        task: 'Update Statistics',
        frequency: 'Weekly',
        urgency: 'medium',
        description: 'Update query planner statistics for optimal query execution plans',
      },
      {
        task: 'Rebuild Indexes',
        frequency: 'Monthly',
        urgency: 'low',
        description: 'Rebuild fragmented indexes to improve query performance',
      },
      {
        task: 'Vacuum/Cleanup',
        frequency: 'Daily',
        urgency: 'medium',
        description: 'Clean up dead rows and reclaim storage space',
      },
      {
        task: 'Check Constraints',
        frequency: 'Weekly',
        urgency: 'low',
        description: 'Verify data integrity and constraint violations',
      },
    ];
  }

  // Clear query statistics
  clearStats(): void {
    this.queryStats = [];
    this.logger.debug('Query statistics cleared');
  }

  private sanitizeQuery(query: string): string {
    // Remove sensitive data and normalize query for grouping
    return query
      .replace(/\$\d+/g, '?') // Replace parameterized values
      .replace(/['"][^'"]*['"]/g, '?') // Replace string literals
      .replace(/\b\d+\b/g, '?') // Replace numbers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private truncateQuery(query: string): string {
    return query.length > 100 ? query.substring(0, 100) + '...' : query;
  }

  private calculateAverageConcurrentQueries(): number {
    // Simplified calculation based on query frequency
    const recentQueries = this.queryStats.filter(
      stat => Date.now() - stat.timestamp < 60000 // Last minute
    );
    return Math.ceil(recentQueries.length / 60); // Queries per second
  }

  private calculatePeakConcurrentQueries(): number {
    // Simplified peak calculation
    return this.calculateAverageConcurrentQueries() * 3;
  }

  private detectN1Queries(): QueryStats[] {
    // Detect patterns that might indicate N+1 queries
    const queryGroups = new Map<string, QueryStats[]>();
    
    for (const stat of this.queryStats) {
      const pattern = this.extractQueryPattern(stat.query);
      if (!queryGroups.has(pattern)) {
        queryGroups.set(pattern, []);
      }
      queryGroups.get(pattern)!.push(stat);
    }

    const n1Candidates = [];
    for (const [pattern, queries] of queryGroups.entries()) {
      if (queries.length > 10 && pattern.includes('select')) {
        n1Candidates.push(...queries);
      }
    }

    return n1Candidates;
  }

  private extractQueryPattern(query: string): string {
    // Extract the basic pattern of the query for grouping
    return query
      .toLowerCase()
      .replace(/\?/g, 'PARAM')
      .replace(/\s+/g, ' ')
      .substring(0, 50);
  }
}