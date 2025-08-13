# ===== scripts/setup-azure-ad.sh =====
#!/bin/bash

set -e

echo "🔐 Setting up Azure AD App Registrations for HEALio..."

# Get current user and tenant info
TENANT_ID=$(az account show --query tenantId -o tsv)
USER_ID=$(az ad signed-in-user show --query id -o tsv)

echo "Tenant ID: $TENANT_ID"

# Create development app registration
echo ""
echo "Creating development app registration..."
DEV_APP=$(az ad app create \
    --display-name "HEALio Development" \
    --homepage "https://app-backend-healio-dev.azurewebsites.net" \
    --reply-urls "https://app-backend-healio-dev.azurewebsites.net/.auth/login/aad/callback" \
    --available-to-other-tenants false)

DEV_APP_ID=$(echo $DEV_APP | jq -r '.appId')
DEV_OBJECT_ID=$(echo $DEV_APP | jq -r '.id')

# Create client secret for development
DEV_SECRET=$(az ad app credential reset --id $DEV_APP_ID --query password -o tsv)

echo "Development App ID: $DEV_APP_ID"

# Create production app registration  
echo ""
echo "Creating production app registration..."
PROD_APP=$(az ad app create \
    --display-name "HEALio Production" \
    --homepage "https://app-backend-healio-prod.azurewebsites.net" \
    --reply-urls "https://app-backend-healio-prod.azurewebsites.net/.auth/login/aad/callback" \
    --available-to-other-tenants false)

PROD_APP_ID=$(echo $PROD_APP | jq -r '.appId')
PROD_OBJECT_ID=$(echo $PROD_APP | jq -r '.id')

# Create client secret for production
PROD_SECRET=$(az ad app credential reset --id $PROD_APP_ID --query password -o tsv)

echo "Production App ID: $PROD_APP_ID"

# Configure API permissions (optional - for Microsoft Graph access)
echo ""
echo "Configuring API permissions..."

# Microsoft Graph User.Read permission
az ad app permission add --id $DEV_APP_ID --api 00000003-0000-0000-c000-000000000000 --api-permissions e1fe6dd8-ba31-4d61-89e7-88639da4683d=Scope
az ad app permission add --id $PROD_APP_ID --api 00000003-0000-0000-c000-000000000000 --api-permissions e1fe6dd8-ba31-4d61-89e7-88639da4683d=Scope

echo ""
echo "✅ Azure AD setup complete!"
echo ""
echo "🔑 GitHub Secrets to add:"
echo ""
echo "DEV_AUTH_CLIENT_ID: $DEV_APP_ID"
echo "DEV_AUTH_CLIENT_SECRET: $DEV_SECRET"
echo ""
echo "PROD_AUTH_CLIENT_ID: $PROD_APP_ID" 
echo "PROD_AUTH_CLIENT_SECRET: $PROD_SECRET"
echo ""
echo "AUTH_ISSUER_URI: https://login.microsoftonline.com/$TENANT_ID/v2.0"
echo ""
echo "⚠️  Important: Store these secrets securely!"
