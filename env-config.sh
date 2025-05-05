#!/bin/bash
# AEGIS - Environment Configuration Manager
# Manages environment configurations across all project components

set -e

# Detect working directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

# Default environment
ENV=${1:-dev}
ENV_FILE="$ROOT_DIR/environments/$ENV.env"
OUTPUT_DIR=${2:-$ROOT_DIR}

# Validate environment
if [[ ! "$ENV" =~ ^(dev|staging|prod)$ ]]; then
  echo "Error: Invalid environment '$ENV'. Valid options: dev, staging, prod"
  exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file not found: $ENV_FILE"
  echo "Creating default environment file..."
  
  # Create environments directory if it doesn't exist
  mkdir -p "$(dirname "$ENV_FILE")"
  
  # Create default environment file based on environment
  case $ENV in
    dev)
      cat > "$ENV_FILE" << EOF
# AEGIS Development Environment Configuration
# This file is auto-generated and can be modified for your development environment

# General
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=debug

# Frontend
FRONTEND_PORT=4200
FRONTEND_API_URL=http://localhost:8080/api

# Backend
BACKEND_PORT=8080
BACKEND_CORS_ALLOWED_ORIGINS=http://localhost:4200
JWT_SECRET=dev-jwt-secret-change-me
TOKEN_EXPIRY=24h

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=aegisuser
DB_PASSWORD=dev-password
DB_NAME=aegis_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
ENABLE_METRICS=true

# Feature Flags
FEATURE_EXPERIMENTAL=true
FEATURE_DEBUG_MODE=true
FEATURE_METRICS=true
EOF
      ;;
      
    staging)
      cat > "$ENV_FILE" << EOF
# AEGIS Staging Environment Configuration
# This file is auto-generated and should be customized for your staging environment

# General
ENVIRONMENT=staging
DEBUG=false
LOG_LEVEL=info

# Frontend
FRONTEND_PORT=80
FRONTEND_API_URL=https://api-staging.aegis-security.com/api

# Backend
BACKEND_PORT=8080
BACKEND_CORS_ALLOWED_ORIGINS=https://staging.aegis-security.com
JWT_SECRET=staging-jwt-secret-change-me
TOKEN_EXPIRY=12h

# Database
DB_HOST=db.staging.aegis-security.com
DB_PORT=5432
DB_USER=aegisuser
DB_PASSWORD=staging-password-change-me
DB_NAME=aegis_staging

# Redis
REDIS_HOST=redis.staging.aegis-security.com
REDIS_PORT=6379
REDIS_PASSWORD=staging-redis-password-change-me

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
ENABLE_METRICS=true

# Feature Flags
FEATURE_EXPERIMENTAL=true
FEATURE_DEBUG_MODE=false
FEATURE_METRICS=true
EOF
      ;;
      
    prod)
      cat > "$ENV_FILE" << EOF
# AEGIS Production Environment Configuration
# This file is auto-generated and should be customized for your production environment

# General
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=warn

# Frontend
FRONTEND_PORT=80
FRONTEND_API_URL=https://api.aegis-security.com/api

# Backend
BACKEND_PORT=8080
BACKEND_CORS_ALLOWED_ORIGINS=https://aegis-security.com
JWT_SECRET=prod-jwt-secret-change-me
TOKEN_EXPIRY=8h

# Database
DB_HOST=db.aegis-security.com
DB_PORT=5432
DB_USER=aegisuser
DB_PASSWORD=prod-password-change-me
DB_NAME=aegis_prod

# Redis
REDIS_HOST=redis.aegis-security.com
REDIS_PORT=6379
REDIS_PASSWORD=prod-redis-password-change-me

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
ENABLE_METRICS=true

# Feature Flags
FEATURE_EXPERIMENTAL=false
FEATURE_DEBUG_MODE=false
FEATURE_METRICS=true
EOF
      ;;
  esac
  
  echo "Created default environment file: $ENV_FILE"
  echo "Please review and update it with appropriate values."
  echo ""
fi

# Function to apply environment variables to a file
apply_env_to_file() {
  local template_file=$1
  local target_file=$2
  
  if [ ! -f "$template_file" ]; then
    echo "Template file not found: $template_file"
    return 1
  fi
  
  echo "Applying environment to $target_file..."
  
  # Create target directory if it doesn't exist
  mkdir -p "$(dirname "$target_file")"
  
  # Load environment variables
  set -a
  source "$ENV_FILE"
  set +a
  
  # Process the template file and output to target file
  cat "$template_file" | envsubst > "$target_file"
  
  echo "Successfully applied environment to $target_file"
}

# Apply environment to project components
apply_environment() {
  echo "Applying $ENV environment configuration to project components..."
  
  # Create output directories
  mkdir -p "$OUTPUT_DIR/frontend/src/environments"
  mkdir -p "$OUTPUT_DIR/backend/config"
  mkdir -p "$OUTPUT_DIR/infra/aws/env"
  mkdir -p "$OUTPUT_DIR/infra/azure/env"
  mkdir -p "$OUTPUT_DIR/deploy/environments/$ENV"
  
  # Frontend environment
  cat > "$OUTPUT_DIR/frontend/src/environments/environment.${ENV}.ts" << EOF
// Generated for $ENV environment - $(date)
export const environment = {
  production: ${ENV == "prod" || ENV == "staging" ? "true" : "false"},
  apiUrl: '${FRONTEND_API_URL}',
  simulationRefreshRate: ${ENV == "dev" ? "2000" : "1000"}, // ms
  featureFlags: {
    enableExperimentalFeatures: ${FEATURE_EXPERIMENTAL},
    enableDebugConsole: ${FEATURE_DEBUG_MODE},
    enablePerformanceMetrics: ${FEATURE_METRICS},
  },
  auth: {
    clientId: 'aegis-${ENV}-client',
    authority: '${ENV == "dev" ? "http://localhost:8080/auth" : "https://auth" + (ENV == "staging" ? "-staging" : "") + ".aegis-security.com"}',
    redirectUri: '${ENV == "dev" ? "http://localhost:4200/auth-callback" : "https://" + (ENV == "staging" ? "staging." : "") + "aegis-security.com/auth-callback"}',
    silentRefreshUri: '${ENV == "dev" ? "http://localhost:4200/silent-refresh.html" : "https://" + (ENV == "staging" ? "staging." : "") + "aegis-security.com/silent-refresh.html"}',
    scope: 'openid profile email aegis-api',
    autoLogin: true,
  },
  analytics: {
    enabled: ${ENV == "prod" || ENV == "staging" ? "true" : "false"},
    trackingId: '${ENV == "prod" ? "UA-PRODUCTION-ID" : (ENV == "staging" ? "UA-STAGING-ID" : "")}',
  },
};
EOF

  # Backend configuration
  cat > "$OUTPUT_DIR/backend/config/config.${ENV}.yaml" << EOF
# Generated for $ENV environment - $(date)
server:
  port: ${BACKEND_PORT}
  debug: ${DEBUG}
  cors:
    allowed_origins: ["${BACKEND_CORS_ALLOWED_ORIGINS}"]
    allowed_methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers: ["Authorization", "Content-Type"]

database:
  type: "postgres"
  host: "${DB_HOST}"
  port: ${DB_PORT}
  user: "${DB_USER}"
  password: "${DB_PASSWORD}"
  name: "${DB_NAME}"
  sslMode: "${ENV == "dev" ? "disable" : "require"}"

redis:
  host: "${REDIS_HOST}"
  port: ${REDIS_PORT}
  password: "${REDIS_PASSWORD}"

simulation:
  worker_count: ${ENV == "prod" ? "8" : (ENV == "staging" ? "4" : "2")}
  buffer_size: ${ENV == "prod" ? "10000" : (ENV == "staging" ? "5000" : "1000")}
  default_timeout_seconds: ${ENV == "prod" ? "900" : (ENV == "staging" ? "600" : "300")}

logging:
  level: "${LOG_LEVEL}"
  format: "${ENV == "dev" ? "text" : "json"}"

auth:
  enabled: true
  jwt_secret: "${JWT_SECRET}"
  token_expiry: "${TOKEN_EXPIRY}"
EOF

  # Terraform variables
  cat > "$OUTPUT_DIR/infra/aws/env/${ENV}.tfvars" << EOF
# Generated for $ENV environment - $(date)
environment = "${ENV}"
region = "eu-central-1"
vpc_cidr = "10.0.0.0/16"
availability_zones = ["eu-central-1a", "eu-central-1b", "eu-central-1c"]
eks_cluster_name = "aegis-${ENV}"
eks_node_group_instance_types = [
  "${ENV == "prod" ? "t3.large" : (ENV == "staging" ? "t3.medium" : "t3.small")}"
]
EOF

  cat > "$OUTPUT_DIR/infra/azure/env/${ENV}.tfvars" << EOF
# Generated for $ENV environment - $(date)
environment = "${ENV}"
location = "westeurope"
resource_group_name = "aegis-${ENV}-rg"
kubernetes_version = "1.24.0"
node_count = ${ENV == "prod" ? "3" : (ENV == "staging" ? "2" : "1")}
vm_size = "${ENV == "prod" ? "Standard_D2s_v3" : (ENV == "staging" ? "Standard_D2s_v3" : "Standard_B2s")}"
EOF

  # Deployment config
  cat > "$OUTPUT_DIR/deploy/environments/${ENV}/config.yml" << EOF
# Generated for $ENV environment - $(date)
environment: ${ENV}
domain: ${ENV == "prod" ? "aegis-security.com" : "${ENV}.aegis-security.com"}
replicas:
  frontend: ${ENV == "prod" ? "3" : (ENV == "staging" ? "2" : "1")}
  backend: ${ENV == "prod" ? "5" : (ENV == "staging" ? "3" : "2")}
resources:
  frontend:
    cpu: "${ENV == "prod" ? "2" : (ENV == "staging" ? "1" : "0.5")}"
    memory: "${ENV == "prod" ? "2Gi" : (ENV == "staging" ? "1Gi" : "512Mi")}"
  backend:
    cpu: "${ENV == "prod" ? "2" : (ENV == "staging" ? "1" : "0.5")}"
    memory: "${ENV == "prod" ? "4Gi" : (ENV == "staging" ? "1Gi" : "512Mi")}"
  database:
    storage: "${ENV == "prod" ? "50Gi" : (ENV == "staging" ? "20Gi" : "10Gi")}"
    cpu: "${ENV == "prod" ? "4" : (ENV == "staging" ? "2" : "1")}"
    memory: "${ENV == "prod" ? "8Gi" : (ENV == "staging" ? "2Gi" : "1Gi")}"
features:
  experimental: ${FEATURE_EXPERIMENTAL}
  debugMode: ${FEATURE_DEBUG_MODE}
  metrics: ${FEATURE_METRICS}
logging:
  level: "${LOG_LEVEL}"
  retention: "${ENV == "prod" ? "30d" : (ENV == "staging" ? "14d" : "7d")}"
database:
  backupSchedule: "${ENV == "prod" ? "0 */6 * * *" : "0 0 * * *"}"
  backupRetention: "${ENV == "prod" ? "30d" : (ENV == "staging" ? "14d" : "7d")}"
monitoring:
  alerting: ${ENV == "dev" ? "false" : "true"}
  alertReceivers:
    - email: "devops@aegis-security.com"
    ${ENV == "prod" ? "- email: \"security@aegis-security.com\"\n    - sms: \"+1234567890\"" : ""}
  dashboards:
    - name: "overview"
    - name: "performance"
    - name: "security"
    - name: "usage"
    ${ENV == "prod" ? "- name: \"business\"" : ""}
EOF

  # Create .env file for Docker
  cat > "$OUTPUT_DIR/.env.${ENV}" << EOF
# Docker environment file for $ENV - $(date)
# This file is used by docker-compose

# Environment
ENV=${ENV}
ENVIRONMENT=${ENVIRONMENT}
DEBUG=${DEBUG}
LOG_LEVEL=${LOG_LEVEL}

# Versions
VERSION=$(./version.sh)

# Frontend
FRONTEND_PORT=${FRONTEND_PORT}
FRONTEND_API_URL=${FRONTEND_API_URL}

# Backend
BACKEND_PORT=${BACKEND_PORT}
BACKEND_CORS_ALLOWED_ORIGINS=${BACKEND_CORS_ALLOWED_ORIGINS}
JWT_SECRET=${JWT_SECRET}
TOKEN_EXPIRY=${TOKEN_EXPIRY}

# Database
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# Redis
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}

# Monitoring
PROMETHEUS_PORT=${PROMETHEUS_PORT}
GRAFANA_PORT=${GRAFANA_PORT}
ENABLE_METRICS=${ENABLE_METRICS}

# Feature Flags
FEATURE_EXPERIMENTAL=${FEATURE_EXPERIMENTAL}
FEATURE_DEBUG_MODE=${FEATURE_DEBUG_MODE}
FEATURE_METRICS=${FEATURE_METRICS}
EOF

  echo "Successfully applied $ENV environment configuration to project components"
}

# Function to display environment information
show_environment_info() {
  echo "AEGIS Environment Configuration: $ENV"
  echo "---------------------------------------"
  echo "Environment File: $ENV_FILE"
  
  if [ -f "$ENV_FILE" ]; then
    echo "Environment Variables:"
    grep -v "^#" "$ENV_FILE" | grep -v "^$" | sort
  else
    echo "Environment file not found!"
  fi
}

# Main execution
case ${2:-apply} in
  apply)
    apply_environment
    ;;
    
  show)
    show_environment_info
    ;;
    
  *)
    echo "Usage: $0 [dev|staging|prod] [apply|show]"
    echo ""
    echo "  dev|staging|prod - Environment to use (default: dev)"
    echo "  apply            - Apply environment configuration to project components (default)"
    echo "  show             - Show environment information"
    exit 1
    ;;
esac