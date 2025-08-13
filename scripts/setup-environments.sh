#!/bin/bash

set -e

echo "Setting up HEALio multi-environment CI/CD..."

# Create development environment
echo "Creating development environment..."
azd env new healio-dev --location eastus2

# Set development-specific variables
azd env set AZURE_OPENAI_MODEL_NAME "gpt-35-turbo-16k"
azd env set DEBUG "true"

# Create production environment
echo "Creating production environment..."
azd env new healio-prod --location eastus

# Set production-specific variables
azd env set AZURE_OPENAI_MODEL_NAME "gpt-4-32k"
azd env set DEBUG "false"

echo "Environment setup complete!"
echo "Next steps:"
echo "1. Set up GitHub secrets"
echo "2. Configure Azure credentials"
echo "3. Run initial deployments"
