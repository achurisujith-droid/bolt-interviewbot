// Azure App Service Configuration
export const azureConfig = {
  // Environment detection
  isProduction: import.meta.env.MODE === 'production',
  isAzure: !!import.meta.env.VITE_WEBSITE_SITE_NAME, // Azure App Service specific env var
  
  // API Configuration for Azure
  apiBaseUrl: import.meta.env.MODE === 'production' 
    ? `https://${import.meta.env.VITE_WEBSITE_SITE_NAME}.azurewebsites.net/api`
    : 'http://localhost:3001/api',
  
  // Azure-specific settings
  azure: {
    siteName: import.meta.env.VITE_WEBSITE_SITE_NAME,
    resourceGroup: import.meta.env.VITE_WEBSITE_RESOURCE_GROUP,
    subscriptionId: import.meta.env.VITE_WEBSITE_OWNER_NAME,
    region: import.meta.env.VITE_WEBSITE_SITE_NAME?.includes('eastus') ? 'eastus' : 'westus2'
  },
  
  // Performance settings for concurrent users
  performance: {
    maxConcurrentInterviews: 300,
    requestTimeout: 30000, // 30 seconds
    retryAttempts: 3,
    batchSize: 10, // For processing multiple requests
    cacheTimeout: 300000 // 5 minutes
  },
  
  // OpenAI API configuration for scale
  openai: {
    maxRetries: 3,
    timeout: 30000,
    // Multiple API keys for load distribution (set in Azure App Settings)
    apiKeys: [
      import.meta.env.VITE_OPENAI_API_KEY,
      import.meta.env.VITE_OPENAI_API_KEY_2,
      import.meta.env.VITE_OPENAI_API_KEY_3
    ].filter(Boolean),
    
    // Rate limiting per key
    rateLimits: {
      gpt4o: 10000, // requests per minute
      whisper: 50,   // requests per minute  
      tts: 500       // requests per minute
    }
  },
  
  // Caching strategy
  cache: {
    enabled: true,
    provider: 'memory', // Can be upgraded to Redis for Azure
    ttl: {
      questions: 3600,      // 1 hour
      evaluations: 1800,    // 30 minutes
      userSessions: 7200    // 2 hours
    }
  },
  
  // Monitoring and logging
  monitoring: {
    enabled: import.meta.env.MODE === 'production',
    applicationInsights: import.meta.env.VITE_APPINSIGHTS_INSTRUMENTATIONKEY,
    logLevel: import.meta.env.MODE === 'production' ? 'error' : 'debug'
  }
};

// Azure App Service health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    // Check if running on Azure
    if (azureConfig.isAzure) {
      console.log(`✅ Running on Azure App Service: ${azureConfig.azure.siteName}`);
    }
    
    // Check OpenAI API availability
    const apiKeyCount = azureConfig.openai.apiKeys.length;
    console.log(`🔑 OpenAI API Keys configured: ${apiKeyCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
};

// Load balancer for API keys
export class APIKeyLoadBalancer {
  private currentIndex = 0;
  private readonly apiKeys: string[];
  private readonly usage: Map<string, number> = new Map();
  
  constructor() {
    this.apiKeys = azureConfig.openai.apiKeys;
    this.apiKeys.forEach(key => this.usage.set(key, 0));
  }
  
  getNextApiKey(): string {
    if (this.apiKeys.length === 0) {
      throw new Error('No OpenAI API keys configured');
    }
    
    // Round-robin with usage tracking
    const key = this.apiKeys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
    
    // Track usage
    const currentUsage = this.usage.get(key) || 0;
    this.usage.set(key, currentUsage + 1);
    
    return key;
  }
  
  getUsageStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.usage.forEach((count, key) => {
      const maskedKey = key.substring(0, 7) + '...';
      stats[maskedKey] = count;
    });
    return stats;
  }
  
  resetUsage(): void {
    this.usage.clear();
    this.apiKeys.forEach(key => this.usage.set(key, 0));
  }
}

// Request queue for handling concurrent interviews
export class InterviewQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private concurrentLimit = azureConfig.performance.maxConcurrentInterviews;
  private activeRequests = 0;
  
  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.activeRequests++;
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
        }
      });
      
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.processing || this.activeRequests >= this.concurrentLimit) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0 && this.activeRequests < this.concurrentLimit) {
      const request = this.queue.shift();
      if (request) {
        request().catch(console.error);
      }
    }
    
    this.processing = false;
  }
  
  getStats(): { queueLength: number; activeRequests: number; concurrentLimit: number } {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      concurrentLimit: this.concurrentLimit
    };
  }
}

// Global instances
export const apiKeyBalancer = new APIKeyLoadBalancer();
export const interviewQueue = new InterviewQueue();

// Azure deployment configuration
export const azureDeploymentConfig = {
  // App Service Plan settings
  appServicePlan: {
    tier: 'Standard', // S1 or higher for production
    instances: 2,     // Auto-scale between 2-10 instances
    autoScale: {
      minInstances: 2,
      maxInstances: 10,
      scaleOutCpuThreshold: 70,
      scaleInCpuThreshold: 30
    }
  },
  
  // Application settings for Azure
  appSettings: {
    'MODE': 'production',
    'WEBSITE_NODE_DEFAULT_VERSION': '18.x',
    'SCM_DO_BUILD_DURING_DEPLOYMENT': 'true',
    'WEBSITE_RUN_FROM_PACKAGE': '1',
    
    // Performance settings
    'WEBSITE_HTTPLOGGING_RETENTION_DAYS': '7',
    'WEBSITE_LOAD_CERTIFICATES': '*',
    'WEBSITES_ENABLE_APP_SERVICE_STORAGE': 'false',
    
    // Custom settings
    'MAX_CONCURRENT_INTERVIEWS': '300',
    'REQUEST_TIMEOUT': '30000',
    'CACHE_ENABLED': 'true'
  },
  
  // Recommended Azure services
  recommendedServices: [
    'Azure App Service (Standard S1 or higher)',
    'Azure Application Insights (monitoring)',
    'Azure CDN (static assets)',
    'Azure Key Vault (API keys)',
    'Azure Redis Cache (optional, for scaling)',
    'Azure Storage Account (file uploads)'
  ]
};

export default azureConfig;