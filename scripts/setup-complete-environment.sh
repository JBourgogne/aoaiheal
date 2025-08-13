# ===== scripts/setup-complete-environment.sh =====
#!/bin/bash

set -e

echo "🚀 Complete HEALio Environment Setup"
echo "This script will set up everything needed for HEALio CI/CD"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

REQUIRED_TOOLS=("az" "azd" "git" "jq" "python3" "node")
for tool in "${REQUIRED_TOOLS[@]}"; do
    if ! command -v $tool &> /dev/null; then
        echo "❌ $tool is required but not installed"
        exit 1
    fi
done

echo "✅ All required tools found"

# Verify Azure login
if ! az account show &> /dev/null; then
    echo "Please log in to Azure:"
    az login
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Using subscription: $SUBSCRIPTION_ID"

# Step 1: Setup local development environment
echo ""
echo "📦 Step 1: Setting up local development environment..."
if [[ -f "scripts/setup-local-dev.sh" ]]; then
    ./scripts/setup-local-dev.sh
else
    echo "⚠️  Local dev setup script not found, skipping..."
fi

# Step 2: Create service principals
echo ""
echo "🔐 Step 2: Creating service principals..."
if [[ -f "scripts/create-service-principals.sh" ]]; then
    ./scripts/create-service-principals.sh
else
    echo "⚠️  Service principal script not found, creating manually..."
    
    echo "Creating development service principal..."
    DEV_SP=$(az ad sp create-for-rbac \
        --name "healio-dev-cicd-$(date +%s)" \
        --role "Contributor" \
        --scopes "/subscriptions/$SUBSCRIPTION_ID" \
        --sdk-auth)
    
    echo "Creating production service principal..."
    PROD_SP=$(az ad sp create-for-rbac \
        --name "healio-prod-cicd-$(date +%s)" \
        --role "Contributor" \
        --scopes "/subscriptions/$SUBSCRIPTION_ID" \
        --sdk-auth)
    
    echo ""
    echo "Service principals created. Add these to GitHub secrets:"
    echo "AZURE_CREDENTIALS (Dev): $DEV_SP"
    echo "AZURE_CREDENTIALS_PROD (Prod): $PROD_SP"
fi

# Step 3: Setup Azure AD app registrations
echo ""
echo "🏢 Step 3: Setting up Azure AD app registrations..."
if [[ -f "scripts/setup-azure-ad.sh" ]]; then
    ./scripts/setup-azure-ad.sh
else
    echo "⚠️  Azure AD setup script not found, skipping..."
fi

# Step 4: Setup environments
echo ""
echo "🌍 Step 4: Setting up Azure environments..."
if [[ -f "scripts/setup-environments.sh" ]]; then
    ./scripts/setup-environments.sh
else
    echo "Creating environments manually..."
    
    # Create dev environment
    if ! azd env list | grep -q "healio-dev"; then
        azd env new healio-dev --location eastus2 --subscription $SUBSCRIPTION_ID
    fi
    
    # Create prod environment
    if ! azd env list | grep -q "healio-prod"; then
        azd env new healio-prod --location eastus --subscription $SUBSCRIPTION_ID
    fi
fi

# Step 5: Run initial tests
echo ""
echo "🧪 Step 5: Running initial tests..."
if [[ -f "requirements-dev.txt" && -d "tests" ]]; then
    python -m pytest tests/unit/ -v || echo "⚠️  Some tests failed, but continuing..."
else
    echo "⚠️  Tests not found, skipping..."
fi

echo ""
echo "🎉 Complete environment setup finished!"
echo ""
echo "Next steps:"
echo "1. Add the generated secrets to your GitHub repository"
echo "2. Configure your .env file with Azure service credentials"
echo "3. Test local deployment: ./scripts/deploy.sh dev"
echo "4. Create your first release to trigger production deployment"
echo ""
echo "GitHub repository setup:"
echo "- Go to Settings → Secrets and variables → Actions"
echo "- Add all the secrets shown above"
echo "- Enable GitHub Actions if not already enabled"
echo ""
echo "Documentation: See README-CICD.md for detailed instructions"
