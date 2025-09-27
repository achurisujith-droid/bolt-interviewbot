# 🚀 Azure App Service Deployment Guide

## 📋 Prerequisites

1. **Azure Account** with active subscription
2. **Azure CLI** installed locally
3. **Node.js 18.x** or higher
4. **OpenAI API Keys** (2-3 keys recommended for load balancing)

## 🏗️ Azure Resources Setup

### 1. Create Resource Group
```bash
az group create --name ai-interview-rg --location eastus
```

### 2. Create App Service Plan
```bash
az appservice plan create \
  --name ai-interview-plan \
  --resource-group ai-interview-rg \
  --sku S1 \
  --is-linux
```

### 3. Create Web App
```bash
az webapp create \
  --resource-group ai-interview-rg \
  --plan ai-interview-plan \
  --name ai-interview-bot-app \
  --runtime "NODE|18-lts"
```

## ⚙️ Configuration for 200-300 Concurrent Users

### 1. App Service Settings
```bash
# Set Node.js version
az webapp config appsettings set \
  --resource-group ai-interview-rg \
  --name ai-interview-bot-app \
  --settings WEBSITE_NODE_DEFAULT_VERSION="18.x"

# Performance settings
az webapp config appsettings set \
  --resource-group ai-interview-rg \
  --name ai-interview-bot-app \
  --settings \
    NODE_ENV="production" \
    MAX_CONCURRENT_INTERVIEWS="300" \
    REQUEST_TIMEOUT="30000" \
    CACHE_ENABLED="true" \
    WEBSITE_HTTPLOGGING_RETENTION_DAYS="7"
```

### 2. OpenAI API Keys (Load Balancing)
```bash
# Add multiple API keys for load distribution
az webapp config appsettings set \
  --resource-group ai-interview-rg \
  --name ai-interview-bot-app \
  --settings \
    VITE_OPENAI_API_KEY="sk-your-primary-key" \
    VITE_OPENAI_API_KEY_2="sk-your-secondary-key" \
    VITE_OPENAI_API_KEY_3="sk-your-tertiary-key"
```

### 3. Auto-Scaling Configuration
```bash
# Enable auto-scaling (2-10 instances)
az monitor autoscale create \
  --resource-group ai-interview-rg \
  --resource ai-interview-bot-app \
  --resource-type Microsoft.Web/sites \
  --name ai-interview-autoscale \
  --min-count 2 \
  --max-count 10 \
  --count 2

# Scale out rule (CPU > 70%)
az monitor autoscale rule create \
  --resource-group ai-interview-rg \
  --autoscale-name ai-interview-autoscale \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 2

# Scale in rule (CPU < 30%)
az monitor autoscale rule create \
  --resource-group ai-interview-rg \
  --autoscale-name ai-interview-autoscale \
  --condition "Percentage CPU < 30 avg 10m" \
  --scale in 1
```

## 📊 Application Insights (Monitoring)

### 1. Create Application Insights
```bash
az extension add --name application-insights

az monitor app-insights component create \
  --app ai-interview-insights \
  --location eastus \
  --resource-group ai-interview-rg \
  --application-type web
```

### 2. Get Instrumentation Key
```bash
az monitor app-insights component show \
  --app ai-interview-insights \
  --resource-group ai-interview-rg \
  --query instrumentationKey
```

### 3. Configure App Insights
```bash
az webapp config appsettings set \
  --resource-group ai-interview-rg \
  --name ai-interview-bot-app \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="your-instrumentation-key"
```

## 🚀 Deployment Process

### 1. Build for Production
```bash
npm run build
```

### 2. Deploy to Azure
```bash
# Using Azure CLI
az webapp deployment source config-zip \
  --resource-group ai-interview-rg \
  --name ai-interview-bot-app \
  --src dist.zip
```

### 3. Alternative: GitHub Actions Deployment
Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18.x'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'ai-interview-bot-app'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: dist
```

## 🔧 Performance Optimization

### 1. CDN Setup (Optional)
```bash
# Create CDN profile
az cdn profile create \
  --resource-group ai-interview-rg \
  --name ai-interview-cdn \
  --sku Standard_Microsoft

# Create CDN endpoint
az cdn endpoint create \
  --resource-group ai-interview-rg \
  --profile-name ai-interview-cdn \
  --name ai-interview-endpoint \
  --origin ai-interview-bot-app.azurewebsites.net
```

### 2. Redis Cache (For High Scale)
```bash
# Create Redis cache for session management
az redis create \
  --resource-group ai-interview-rg \
  --name ai-interview-cache \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

## 📈 Monitoring & Alerts

### 1. Set Up Alerts
```bash
# High CPU alert
az monitor metrics alert create \
  --name "High CPU Usage" \
  --resource-group ai-interview-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/ai-interview-rg/providers/Microsoft.Web/sites/ai-interview-bot-app \
  --condition "avg Percentage CPU > 80" \
  --description "Alert when CPU usage is high"

# High response time alert
az monitor metrics alert create \
  --name "High Response Time" \
  --resource-group ai-interview-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/ai-interview-rg/providers/Microsoft.Web/sites/ai-interview-bot-app \
  --condition "avg AverageResponseTime > 5000" \
  --description "Alert when response time is high"
```

## 💰 Cost Optimization

### Estimated Monthly Costs (300 concurrent users):
- **App Service Plan (S1)**: ~$73/month
- **Auto-scaling (2-10 instances)**: ~$146-730/month
- **Application Insights**: ~$20/month
- **OpenAI API Usage**: ~$900/month (300 interviews/day)
- **Total**: ~$1,139-1,723/month

### Cost Reduction Tips:
1. **Use B2 plan** for development/testing (~$35/month)
2. **Implement smart caching** to reduce API calls
3. **Set up budget alerts** in Azure
4. **Monitor API usage** and optimize prompts

## 🔒 Security Best Practices

### 1. Key Vault Integration
```bash
# Create Key Vault
az keyvault create \
  --name ai-interview-vault \
  --resource-group ai-interview-rg \
  --location eastus

# Store OpenAI keys securely
az keyvault secret set \
  --vault-name ai-interview-vault \
  --name "openai-api-key-1" \
  --value "sk-your-api-key"
```

### 2. Managed Identity
```bash
# Enable system-assigned managed identity
az webapp identity assign \
  --resource-group ai-interview-rg \
  --name ai-interview-bot-app
```

## 📋 Post-Deployment Checklist

- [ ] **Health Check**: Verify app is running at `https://ai-interview-bot-app.azurewebsites.net`
- [ ] **Performance Test**: Test with 50+ concurrent users
- [ ] **Monitor Metrics**: Check CPU, memory, response times
- [ ] **API Key Rotation**: Set up regular key rotation
- [ ] **Backup Strategy**: Configure automated backups
- [ ] **SSL Certificate**: Ensure HTTPS is working
- [ ] **Custom Domain**: Configure if needed
- [ ] **Error Monitoring**: Verify Application Insights is working

## 🚨 Troubleshooting

### Common Issues:

1. **High Memory Usage**
   ```bash
   # Increase memory limit
   az webapp config appsettings set \
     --resource-group ai-interview-rg \
     --name ai-interview-bot-app \
     --settings WEBSITE_MEMORY_LIMIT_MB="2048"
   ```

2. **Slow Cold Starts**
   ```bash
   # Enable Always On
   az webapp config set \
     --resource-group ai-interview-rg \
     --name ai-interview-bot-app \
     --always-on true
   ```

3. **OpenAI Rate Limits**
   - Add more API keys
   - Implement exponential backoff
   - Use caching aggressively

## 📞 Support & Monitoring

### Key Metrics to Monitor:
- **Response Time**: < 3 seconds average
- **Error Rate**: < 1%
- **CPU Usage**: < 70% average
- **Memory Usage**: < 80%
- **Concurrent Users**: Track peak usage
- **API Costs**: Monitor OpenAI spending

### Performance Dashboard:
Access at: `https://ai-interview-bot-app.azurewebsites.net/admin/performance`

This deployment configuration will handle 200-300 concurrent interviews with proper auto-scaling and monitoring in place.