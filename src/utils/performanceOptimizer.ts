import { azureConfig, apiKeyBalancer, interviewQueue } from './azureConfig';

// Performance monitoring and optimization
export class PerformanceOptimizer {
  private metrics: {
    requestCount: number;
    averageResponseTime: number;
    errorRate: number;
    concurrentUsers: number;
    lastReset: Date;
  } = {
    requestCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
    concurrentUsers: 0,
    lastReset: new Date()
  };

  private responseTimes: number[] = [];
  private errors: number = 0;

  // Track API request performance
  async trackRequest<T>(
    requestName: string,
    request: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.requestCount++;

    try {
      const result = await request();
      const responseTime = Date.now() - startTime;
      
      this.responseTimes.push(responseTime);
      this.updateAverageResponseTime();
      
      // Log slow requests
      if (responseTime > 5000) {
        console.warn(`⚠️ Slow request detected: ${requestName} took ${responseTime}ms`);
      }
      
      return result;
    } catch (error) {
      this.errors++;
      this.updateErrorRate();
      
      console.error(`❌ Request failed: ${requestName}`, error);
      throw error;
    }
  }

  // Optimize OpenAI API calls with retry and load balancing
  async optimizedOpenAIRequest<T>(
    requestFn: (apiKey: string) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const apiKey = apiKeyBalancer.getNextApiKey();
        
        return await this.trackRequest(
          `OpenAI-attempt-${attempt}`,
          () => requestFn(apiKey)
        );
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof Error && error.message.includes('401')) {
          throw error; // Invalid API key
        }
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`🔄 Retrying OpenAI request in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }

  // Memory management for large concurrent loads
  optimizeMemoryUsage(): void {
    // Clear old response times (keep only last 100)
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Clear caches periodically
    if (Date.now() - this.metrics.lastReset.getTime() > 300000) { // 5 minutes
      this.resetMetrics();
    }
  }

  // Adaptive rate limiting based on performance
  shouldThrottleRequest(): boolean {
    const queueStats = interviewQueue.getStats();
    
    // Throttle if queue is too long
    if (queueStats.queueLength > 50) {
      console.warn('⚠️ Request queue is full, throttling new requests');
      return true;
    }
    
    // Throttle if error rate is too high
    if (this.metrics.errorRate > 0.1) { // 10% error rate
      console.warn('⚠️ High error rate detected, throttling requests');
      return true;
    }
    
    // Throttle if response time is too slow
    if (this.metrics.averageResponseTime > 10000) { // 10 seconds
      console.warn('⚠️ Slow response times detected, throttling requests');
      return true;
    }
    
    return false;
  }

  // Get performance metrics
  getMetrics(): typeof this.metrics & {
    queueStats: ReturnType<typeof interviewQueue.getStats>;
    apiKeyUsage: ReturnType<typeof apiKeyBalancer.getUsageStats>;
  } {
    return {
      ...this.metrics,
      queueStats: interviewQueue.getStats(),
      apiKeyUsage: apiKeyBalancer.getUsageStats()
    };
  }

  // Update metrics
  private updateAverageResponseTime(): void {
    if (this.responseTimes.length > 0) {
      const sum = this.responseTimes.reduce((a, b) => a + b, 0);
      this.metrics.averageResponseTime = sum / this.responseTimes.length;
    }
  }

  private updateErrorRate(): void {
    this.metrics.errorRate = this.errors / this.metrics.requestCount;
  }

  private resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      concurrentUsers: 0,
      lastReset: new Date()
    };
    this.responseTimes = [];
    this.errors = 0;
    
    // Reset API key usage stats
    apiKeyBalancer.resetUsage();
  }
}

// Caching system for improved performance
export class SmartCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly defaultTTL = azureConfig.cache.ttl.evaluations;

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
    
    // Clean up expired entries periodically
    if (this.cache.size > 1000) {
      this.cleanup();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired entries`);
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85 // Placeholder - would track actual hits/misses in production
    };
  }
}

// Global instances
export const performanceOptimizer = new PerformanceOptimizer();
export const smartCache = new SmartCache();

// Batch processing for multiple interviews
export class BatchProcessor {
  private batches = new Map<string, any[]>();
  private readonly batchSize = azureConfig.performance.batchSize;
  private readonly batchTimeout = 5000; // 5 seconds

  addToBatch(batchKey: string, item: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
        
        // Auto-process batch after timeout
        setTimeout(() => {
          this.processBatch(batchKey);
        }, this.batchTimeout);
      }
      
      const batch = this.batches.get(batchKey)!;
      batch.push({ item, resolve, reject });
      
      // Process batch if it's full
      if (batch.length >= this.batchSize) {
        this.processBatch(batchKey);
      }
    });
  }

  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) {
      return;
    }
    
    this.batches.delete(batchKey);
    
    try {
      console.log(`📦 Processing batch: ${batchKey} with ${batch.length} items`);
      
      // Process all items in the batch
      const results = await Promise.allSettled(
        batch.map(({ item }) => this.processItem(batchKey, item))
      );
      
      // Resolve/reject individual promises
      results.forEach((result, index) => {
        const { resolve, reject } = batch[index];
        
        if (result.status === 'fulfilled') {
          resolve(result.value);
        } else {
          reject(result.reason);
        }
      });
      
    } catch (error) {
      // Reject all promises in the batch
      batch.forEach(({ reject }) => reject(error));
    }
  }

  private async processItem(batchKey: string, item: any): Promise<any> {
    // Implement batch-specific processing logic
    switch (batchKey) {
      case 'evaluations':
        return this.processEvaluation(item);
      case 'transcriptions':
        return this.processTranscription(item);
      default:
        throw new Error(`Unknown batch type: ${batchKey}`);
    }
  }

  private async processEvaluation(item: any): Promise<any> {
    // Batch evaluation processing
    return performanceOptimizer.optimizedOpenAIRequest(async (apiKey) => {
      // Evaluation logic here
      return { score: 85, feedback: 'Good response' };
    });
  }

  private async processTranscription(item: any): Promise<any> {
    // Batch transcription processing
    return performanceOptimizer.optimizedOpenAIRequest(async (apiKey) => {
      // Transcription logic here
      return { transcript: 'Sample transcript' };
    });
  }
}

export const batchProcessor = new BatchProcessor();

// Performance monitoring dashboard data
export const getPerformanceDashboard = () => {
  const metrics = performanceOptimizer.getMetrics();
  const cacheStats = smartCache.getStats();
  
  return {
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    },
    performance: metrics,
    cache: cacheStats,
    azure: {
      isAzure: azureConfig.isAzure,
      siteName: azureConfig.azure.siteName,
      region: azureConfig.azure.region
    },
    recommendations: generatePerformanceRecommendations(metrics)
  };
};

function generatePerformanceRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];
  
  if (metrics.averageResponseTime > 5000) {
    recommendations.push('Consider adding more OpenAI API keys for load distribution');
  }
  
  if (metrics.errorRate > 0.05) {
    recommendations.push('High error rate detected - check API key validity and rate limits');
  }
  
  if (metrics.queueStats.queueLength > 20) {
    recommendations.push('Consider scaling up Azure App Service instances');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('System performance is optimal');
  }
  
  return recommendations;
}