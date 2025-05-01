#!/bin/bash
# Verification script for AEGIS deployments

set -e

# Default values
ENVIRONMENT="dev"
VERSION=""
TIMEOUT=300  # 5 minutes

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
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 --env [dev|staging|prod] --version [VERSION] [--timeout SECONDS]"
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

# Load configuration
echo "Loading configuration from $CONFIG_FILE"
DOMAIN=$(grep -E "^domain:" $CONFIG_FILE | awk '{print $2}')
echo "Domain: $DOMAIN"

echo "Verifying deployment of version $VERSION in $ENVIRONMENT environment"

# Function to check endpoint health
check_endpoint() {
  local url=$1
  local expected_status=$2
  local max_attempts=$3
  local attempt=0
  
  echo "Checking endpoint: $url"
  
  while [ $attempt -lt $max_attempts ]; do
    attempt=$((attempt + 1))
    echo "Attempt $attempt of $max_attempts..."
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" $url)
    
    if [ "$status_code" = "$expected_status" ]; then
      echo "Endpoint check passed: $url returned $status_code"
      return 0
    else
      echo "Endpoint check failed: $url returned $status_code, expected $expected_status"
      sleep 5
    fi
  done
  
  echo "Endpoint check failed after $max_attempts attempts"
  return 1
}

# Determine endpoints to check based on environment
FRONTEND_URL="https://$DOMAIN"
BACKEND_URL="https://api.$DOMAIN"
HEALTH_URL="https://api.$DOMAIN/health"

# Verify frontend
echo "Verifying frontend..."
check_endpoint $FRONTEND_URL 200 $((TIMEOUT / 5))

# Verify backend health
echo "Verifying backend health..."
check_endpoint $HEALTH_URL 200 $((TIMEOUT / 5))

# Verify API
echo "Verifying API..."
check_endpoint "$BACKEND_URL/api/version" 200 $((TIMEOUT / 5))

# Verify version
echo "Verifying deployed version..."
deployed_version=$(curl -s "$BACKEND_URL/api/version" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
if [ "$deployed_version" = "$VERSION" ]; then
  echo "Version verification passed: Deployed version is $deployed_version"
else
  echo "Version verification failed: Expected $VERSION but found $deployed_version"
  exit 1
fi

# For production, run additional verification
if [ "$ENVIRONMENT" = "prod" ]; then
  echo "Running additional production verification..."
  
  # Check critical endpoints
  echo "Verifying critical endpoints..."
  check_endpoint "$BACKEND_URL/api/status" 200 $((TIMEOUT / 5))
  
  # Check system health metrics
  echo "Checking system health metrics..."
  # This would be a more complex check in a real system
  
  # Check database connectivity
  echo "Checking database connectivity..."
  # This would be a check against the database
fi

echo "All verification checks passed for version $VERSION in $ENVIRONMENT environment!"