#!/bin/bash
# Rollback script for AEGIS

set -e

# Default values
ENVIRONMENT="dev"
VERSION=""

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
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 --env [dev|staging|prod] --version [VERSION]"
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

echo "Rolling back $ENVIRONMENT environment to version $VERSION"

# Check if version exists
echo "Checking if version $VERSION exists..."
# Here you would check if the version exists in your artifact repository

# Perform rollback
echo "Performing rollback..."

if [ "$ENVIRONMENT" = "prod" ]; then
  # For production, we need special handling
  echo "Production rollback requires additional verification"
  read -p "Are you sure you want to rollback production to version $VERSION? (yes/no) " CONFIRM
  if [ "$CONFIRM" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
  fi
  
  echo "Rolling back production to version $VERSION..."
  # Here you would implement the production rollback
  # For example, reverting to a previous deployment or snapshot
else
  # For non-production environments
  echo "Rolling back $ENVIRONMENT to version $VERSION..."
  # Here you would implement the rollback for non-production environments
fi

# Verify rollback
echo "Verifying rollback..."
./deploy/scripts/verify.sh --env $ENVIRONMENT --version $VERSION

# Notify about rollback
echo "Sending rollback notifications..."
# Here you would send notifications about the rollback

echo "Rollback to version $VERSION completed successfully!"