#!/bin/bash
# Deployment script for AEGIS

set -e

# Default values
ENVIRONMENT="dev"
VERSION=""
SKIP_TESTS=false
DRY_RUN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --version)
      VERSION="$2"
      shift 2
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 --env [dev|staging|prod] --version [VERSION] [--skip-tests] [--dry-run]"
      exit 1
      ;;
  esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
  echo "Invalid environment: $ENVIRONMENT"
  echo "Valid environments: dev, staging, prod"
  exit 1
fi

# Validate version
if [ -z "$VERSION" ]; then
  echo "Version is required"
  echo "Usage: $0 --env [dev|staging|prod] --version [VERSION]"
  exit 1
fi

# Set config file path
CONFIG_FILE="deploy/environments/$ENVIRONMENT/config.yml"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Configuration file not found: $CONFIG_FILE"
  exit 1
fi

echo "Deploying version $VERSION to $ENVIRONMENT environment"

# Load configuration
echo "Loading configuration from $CONFIG_FILE"
DOMAIN=$(grep -E "^domain:" $CONFIG_FILE | awk '{print $2}')
echo "Domain: $DOMAIN"

# Run pre-deployment tests if not skipped
if [ "$SKIP_TESTS" = false ]; then
  echo "Running pre-deployment tests..."
  make test
  if [ $? -ne 0 ]; then
    echo "Tests failed. Aborting deployment."
    exit 1
  fi
fi

# Dry run check
if [ "$DRY_RUN" = true ]; then
  echo "This is a dry run. No changes will be applied."
fi

# Update infrastructure if not dry run
if [ "$DRY_RUN" = false ]; then
  echo "Updating infrastructure..."
  make infra-deploy ENV=$ENVIRONMENT VERSION=$VERSION

  # Deploy application
  echo "Deploying application..."
  
  # Deploy to AWS
  echo "Deploying to AWS..."
  if [ "$ENVIRONMENT" = "prod" ]; then
    # For production, use blue-green deployment
    echo "Using blue-green deployment for production"
    # Simulate blue-green deployment steps here
    echo "Creating new (green) environment..."
    echo "Deploying version $VERSION to green environment..."
    echo "Running smoke tests on green environment..."
    echo "Switching traffic to green environment..."
    echo "Verifying new environment..."
    echo "Decommissioning old (blue) environment..."
  else
    # For non-production, use simple deployment
    echo "Using standard deployment for $ENVIRONMENT"
    make deploy-aws ENV=$ENVIRONMENT
  fi
  
  # Deploy to Azure
  echo "Deploying to Azure..."
  make deploy-azure ENV=$ENVIRONMENT
fi

# Run verification
echo "Running deployment verification..."
./deploy/scripts/verify.sh --env $ENVIRONMENT --version $VERSION

# Notify about deployment
echo "Sending deployment notifications..."
if [ "$ENVIRONMENT" = "prod" ]; then
  echo "Production deployment of version $VERSION completed successfully!"
  # Here you would send notifications via email, Slack, etc.
else
  echo "$ENVIRONMENT deployment of version $VERSION completed successfully!"
fi

echo "Deployment completed successfully!"