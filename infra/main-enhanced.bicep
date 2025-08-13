// ===== infra/main-enhanced.bicep =====
// Enhanced main.bicep with monitoring and environment-specific configurations
targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment (dev, prod, staging)')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Resource group name override')
param resourceGroupName string = ''

@description('App Service Plan configuration')
param appServicePlan object = {
  name: ''
  sku: environmentName == 'prod' ? {
    name: 'P1v3'
    capacity: 2
  } : {
    name: 'B1'
    capacity: 1
  }
}

@description('Azure OpenAI configuration')
param openAiConfig object = {
  resourceName: ''
  resourceGroupName: ''
  skuName: 'S0'
  modelName: environmentName == 'prod' ? 'gpt-4' : 'gpt-35-turbo-16k'
  temperature: environmentName == 'prod' ? 0 : 0.1
  maxTokens: 1000
  systemMessage: 'You are HEALio, an AI health assistant that helps people find health information.'
}

@description('CosmosDB configuration')
param cosmosConfig object = {
  accountName: ''
  databaseName: 'healio_${environmentName}'
  containerName: 'conversations'
}

@description('Monitoring configuration')
param monitoringConfig object = {
  enabled: environmentName == 'prod'
  retentionDays: environmentName == 'prod' ? 90 : 30
  alertsEnabled: true
}

@description('Authentication configuration')
param authConfig object = {
  clientId: ''
  issuerUri: '${environment().authentication.loginEndpoint}${tenant().tenantId}/v2.0'
}

@description('Principal ID for role assignments')
param principalId string = ''

@description('Feature flags')
param featureFlags object = {
  chatHistoryEnabled: true
  feedbackEnabled: environmentName == 'prod'
  analyticsEnabled: environmentName == 'prod'
  debugMode: environmentName != 'prod'
}

var abbrs = loadJsonContent('abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 
  'azd-env-name': environmentName
  'environment': environmentName
  'application': 'healio'
}

// Resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}healio-${environmentName}'
  location: location
  tags: tags
}

// App Service Plan
module appServicePlanModule 'core/host/appserviceplan.bicep' = {
  name: 'appserviceplan'
  scope: resourceGroup
  params: {
    name: !empty(appServicePlan.name) ? appServicePlan.name : '${abbrs.webServerFarms}healio-${environmentName}-${resourceToken}'
    location: location
    tags: tags
    sku: appServicePlan.sku
    kind: 'linux'
  }
}

// Monitoring (if enabled)
module monitoring 'modules/monitoring.bicep' = if (monitoringConfig.enabled) {
  name: 'monitoring'
  scope: resourceGroup
  params: {
    environmentName: environmentName
    location: location
    tags: tags
    appServiceId: backend.outputs.id
    workspaceId: ''
  }
}

// Backend App Service
module backend 'core/host/appservice.bicep' = {
  name: 'backend'
  scope: resourceGroup
  params: {
    name: '${abbrs.webSitesAppService}backend-healio-${environmentName}-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'backend' })
    appServicePlanId: appServicePlanModule.outputs.id
    runtimeName: 'python'
    runtimeVersion: '3.11'
    scmDoBuildDuringDeployment: true
    managedIdentity: true
    authClientId: authConfig.clientId
    authIssuerUri: authConfig.issuerUri
    appSettings: union({
      // Environment
      ENVIRONMENT: environmentName
      DEBUG: string(featureFlags.debugMode)
      LOG_LEVEL: featureFlags.debugMode ? 'DEBUG' : 'INFO'
      
      // UI Configuration
      UI_TITLE: environmentName == 'prod' ? 'HEALio' : 'HEALio ${toUpper(environmentName)}'
      UI_CHAT_TITLE: 'Start chatting with HEAL'
      UI_CHAT_DESCRIPTION: 'This chatbot is configured to guide you on your health journey'
      UI_SHOW_SHARE_BUTTON: string(featureFlags.chatHistoryEnabled)
      
      // OpenAI Configuration
      AZURE_OPENAI_RESOURCE: openAi.outputs.name
      AZURE_OPENAI_MODEL: openAiConfig.modelName
      AZURE_OPENAI_MODEL_NAME: openAiConfig.modelName
      AZURE_OPENAI_TEMPERATURE: string(openAiConfig.temperature)
      AZURE_OPENAI_MAX_TOKENS: string(openAiConfig.maxTokens)
      AZURE_OPENAI_SYSTEM_MESSAGE: openAiConfig.systemMessage
      AZURE_OPENAI_STREAM: 'true'
      
      // Features
      AZURE_COSMOSDB_ENABLE_FEEDBACK: string(featureFlags.feedbackEnabled)
      SANITIZE_ANSWER: string(environmentName == 'prod')
      AUTH_ENABLED: string(environmentName == 'prod')
    }, 
    monitoringConfig.enabled ? {
      APPLICATIONINSIGHTS_CONNECTION_STRING: monitoring.outputs.applicationInsightsConnectionString
    } : {},
    featureFlags.chatHistoryEnabled ? {
      AZURE_COSMOSDB_ACCOUNT: cosmos.outputs.accountName
      AZURE_COSMOSDB_DATABASE: cosmos.outputs.databaseName
      AZURE_COSMOSDB_CONVERSATIONS_CONTAINER: cosmos.outputs.containerName
    } : {})
  }
}

// Azure OpenAI
module openAi 'core/ai/cognitiveservices.bicep' = {
  name: 'openai'
  scope: resourceGroup
  params: {
    name: !empty(openAiConfig.resourceName) ? openAiConfig.resourceName : '${abbrs.cognitiveServicesAccounts}healio-${environmentName}-${resourceToken}'
    location: location
    tags: tags
    sku: {
      name: openAiConfig.skuName
    }
    deployments: [
      {
        name: openAiConfig.modelName
        model: {
          format: 'OpenAI'
          name: openAiConfig.modelName
          version: startsWith(openAiConfig.modelName, 'gpt-4') ? '0613' : '0613'
        }
        capacity: environmentName == 'prod' ? 50 : 30
      }
      {
        name: 'embedding'
        model: {
          format: 'OpenAI'
          name: 'text-embedding-ada-002'
          version: '2'
        }
        capacity: 30
      }
    ]
  }
}

// CosmosDB (if chat history enabled)
module cosmos 'db.bicep' = if (featureFlags.chatHistoryEnabled) {
  name: 'cosmos'
  scope: resourceGroup
  params: {
    accountName: !empty(cosmosConfig.accountName) ? cosmosConfig.accountName : '${abbrs.documentDBDatabaseAccounts}healio-${environmentName}-${resourceToken}'
    location: location
    tags: tags
    databaseName: cosmosConfig.databaseName
    collectionName: cosmosConfig.containerName
    principalIds: [principalId, backend.outputs.identityPrincipalId]
  }
}

// Role assignments for the backend service
module backendOpenAiRole 'core/security/role.bicep' = {
  scope: resourceGroup
  name: 'backend-openai-role'
  params: {
    principalId: backend.outputs.identityPrincipalId
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd' // Cognitive Services OpenAI User
    principalType: 'ServicePrincipal'
  }
}

// Outputs
output backendUri string = backend.outputs.uri
output environmentName string = environmentName
output resourceGroupName string = resourceGroup.name

// OpenAI outputs
output openAiEndpoint string = openAi.outputs.endpoint
output openAiResourceName string = openAi.outputs.name

// CosmosDB outputs (conditional)
output cosmosAccountName string = featureFlags.chatHistoryEnabled ? cosmos.outputs.accountName : ''
output cosmosDatabaseName string = featureFlags.chatHistoryEnabled ? cosmos.outputs.databaseName : ''
output cosmosContainerName string = featureFlags.chatHistoryEnabled ? cosmos.outputs.containerName : ''

// Monitoring outputs (conditional)
output applicationInsightsName string = monitoringConfig.enabled ? monitoring.outputs.applicationInsightsName : ''
output logAnalyticsWorkspaceId string = monitoringConfig.enabled ? monitoring.outputs.logAnalyticsWorkspaceId : ''
