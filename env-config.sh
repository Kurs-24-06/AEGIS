#!/bin/bash
# AEGIS - Environment Configuration Manager für Windows/Git Bash
# Vereinfachte Version für bessere Kompatibilität

# Detect working directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

# Default environment
ENV=${1:-dev}
ENV_FILE="$ROOT_DIR/environments/$ENV.env"
OUTPUT_DIR=${2:-$ROOT_DIR}

# Validate environment
if [ "$ENV" != "dev" ] && [ "$ENV" != "staging" ] && [ "$ENV" != "prod" ]; then
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
  if [ "$ENV" = "dev" ]; then
    cat > "$ENV_FILE" << 'EOF'
# AEGIS Development Environment Configuration

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
  elif [ "$ENV" = "staging" ]; then
    cat > "$ENV_FILE" << 'EOF'
# AEGIS Staging Environment Configuration

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
  else
    cat > "$ENV_FILE" << 'EOF'
# AEGIS Production Environment Configuration

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
  fi
  
  echo "Created default environment file: $ENV_FILE"
  echo "Please review and update it with appropriate values."
  echo ""
fi

# Apply environment to project components
apply_environment() {
  echo "Applying $ENV environment configuration to project components..."
  
  # Create output directories
  mkdir -p "$OUTPUT_DIR/frontend/src/environments"
  mkdir -p "$OUTPUT_DIR/backend/config"
  mkdir -p "$OUTPUT_DIR/infra/aws/env"
  mkdir -p "$OUTPUT_DIR/infra/azure/env"
  mkdir -p "$OUTPUT_DIR/deploy/environments/$ENV"

  # Load environment variables
  source "$ENV_FILE"

  # ----- Frontend Environment -----
  frontend_env_file="$OUTPUT_DIR/frontend/src/environments/environment.${ENV}.ts"
  current_date=$(date)
  
  # Set environment-specific values
  if [ "$ENV" = "prod" ] || [ "$ENV" = "staging" ]; then
    production="true"
    analytics_enabled="true"
  else
    production="false"
    analytics_enabled="false"
  fi
  
  # Set refresh rate
  if [ "$ENV" = "dev" ]; then
    refresh_rate="2000"
  else
    refresh_rate="1000"
  fi
  
  # Set tracking ID
  if [ "$ENV" = "prod" ]; then
    tracking_id="UA-PRODUCTION-ID"
  elif [ "$ENV" = "staging" ]; then
    tracking_id="UA-STAGING-ID"
  else
    tracking_id=""
  fi
  
  # Set auth URLs
  if [ "$ENV" = "dev" ]; then
    authority="http://localhost:8080/auth"
    redirect_uri="http://localhost:4200/auth-callback"
    silent_refresh_uri="http://localhost:4200/silent-refresh.html"
  elif [ "$ENV" = "staging" ]; then
    authority="https://auth-staging.aegis-security.com"
    redirect_uri="https://staging.aegis-security.com/auth-callback"
    silent_refresh_uri="https://staging.aegis-security.com/silent-refresh.html"
  else
    authority="https://auth.aegis-security.com"
    redirect_uri="https://aegis-security.com/auth-callback"
    silent_refresh_uri="https://aegis-security.com/silent-refresh.html"
  fi
  
  # Frontend environment file content
  cat > "$frontend_env_file" << EOF
// Generated for $ENV environment - $current_date
export const environment = {
  production: $production,
  apiUrl: '$FRONTEND_API_URL',
  simulationRefreshRate: $refresh_rate, // ms
  featureFlags: {
    enableExperimentalFeatures: $FEATURE_EXPERIMENTAL,
    enableDebugConsole: $FEATURE_DEBUG_MODE,
    enablePerformanceMetrics: $FEATURE_METRICS,
  },
  auth: {
    clientId: 'aegis-$ENV-client',
    authority: '$authority',
    redirectUri: '$redirect_uri',
    silentRefreshUri: '$silent_refresh_uri',
    scope: 'openid profile email aegis-api',
    autoLogin: true,
  },
  analytics: {
    enabled: $analytics_enabled,
    trackingId: '$tracking_id',
  },
};
EOF

  # ----- Backend Configuration -----
  backend_config_file="$OUTPUT_DIR/backend/config/config.${ENV}.yaml"
  
  # Set SSL mode
  if [ "$ENV" = "dev" ]; then
    ssl_mode="disable"
  else
    ssl_mode="require"
  fi
  
  # Set worker settings
  if [ "$ENV" = "prod" ]; then
    worker_count="8"
    buffer_size="10000"
    timeout_seconds="900"
  elif [ "$ENV" = "staging" ]; then
    worker_count="4"
    buffer_size="5000"
    timeout_seconds="600"
  else
    worker_count="2"
    buffer_size="1000"
    timeout_seconds="300"
  fi
  
  # Set log format
  if [ "$ENV" = "dev" ]; then
    log_format="text"
  else
    log_format="json"
  fi
  
  # Backend config file content
  cat > "$backend_config_file" << EOF
# Generated for $ENV environment - $current_date
server:
  port: $BACKEND_PORT
  debug: $DEBUG
  cors:
    allowed_origins: ["$BACKEND_CORS_ALLOWED_ORIGINS"]
    allowed_methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers: ["Authorization", "Content-Type"]

database:
  type: "postgres"
  host: "$DB_HOST"
  port: $DB_PORT
  user: "$DB_USER"
  password: "$DB_PASSWORD"
  name: "$DB_NAME"
  sslMode: "$ssl_mode"

redis:
  host: "$REDIS_HOST"
  port: $REDIS_PORT
  password: "$REDIS_PASSWORD"

simulation:
  worker_count: $worker_count
  buffer_size: $buffer_size
  default_timeout_seconds: $timeout_seconds

logging:
  level: "$LOG_LEVEL"
  format: "$log_format"

auth:
  enabled: true
  jwt_secret: "$JWT_SECRET"
  token_expiry: "$TOKEN_EXPIRY"
EOF

  # ----- AWS Configuration -----
  aws_tfvars_file="$OUTPUT_DIR/infra/aws/env/${ENV}.tfvars"
  
  # Set instance type
  if [ "$ENV" = "prod" ]; then
    instance_type="t3.large"
  elif [ "$ENV" = "staging" ]; then
    instance_type="t3.medium"
  else
    instance_type="t3.small"
  fi
  
  # AWS tfvars file content
  cat > "$aws_tfvars_file" << EOF
# Generated for $ENV environment - $current_date
environment = "$ENV"
region = "eu-central-1"
vpc_cidr = "10.0.0.0/16"
availability_zones = ["eu-central-1a", "eu-central-1b", "eu-central-1c"]
eks_cluster_name = "aegis-$ENV"
eks_node_group_instance_types = [
  "$instance_type"
]
EOF

  # ----- Azure Configuration -----
  azure_tfvars_file="$OUTPUT_DIR/infra/azure/env/${ENV}.tfvars"
  
  # Set node count and VM size
  if [ "$ENV" = "prod" ]; then
    node_count="3"
    vm_size="Standard_D2s_v3"
  elif [ "$ENV" = "staging" ]; then
    node_count="2"
    vm_size="Standard_D2s_v3"
  else
    node_count="1"
    vm_size="Standard_B2s"
  fi
  
  # Azure tfvars file content
  cat > "$azure_tfvars_file" << EOF
# Generated for $ENV environment - $current_date
environment = "$ENV"
location = "westeurope"
resource_group_name = "aegis-$ENV-rg"
kubernetes_version = "1.24.0"
node_count = $node_count
vm_size = "$vm_size"
EOF

  # ----- Deployment Configuration -----
  deploy_config_file="$OUTPUT_DIR/deploy/environments/${ENV}/config.yml"
  
  # Set resources and settings
  if [ "$ENV" = "prod" ]; then
    frontend_replicas="3"
    backend_replicas="5"
    frontend_cpu="2"
    frontend_memory="2Gi"
    backend_cpu="2"
    backend_memory="4Gi"
    db_storage="50Gi"
    db_cpu="4"
    db_memory="8Gi"
    log_retention="30d"
    backup_schedule="0 */6 * * *"
    backup_retention="30d"
    domain="aegis-security.com"
    alerting="true"
    
    # Deployment config file content for production
    cat > "$deploy_config_file" << EOF
# Generated for $ENV environment - $current_date
environment: $ENV
domain: $domain
replicas:
  frontend: $frontend_replicas
  backend: $backend_replicas
resources:
  frontend:
    cpu: "$frontend_cpu"
    memory: "$frontend_memory"
  backend:
    cpu: "$backend_cpu"
    memory: "$backend_memory"
  database:
    storage: "$db_storage"
    cpu: "$db_cpu"
    memory: "$db_memory"
features:
  experimental: $FEATURE_EXPERIMENTAL
  debugMode: $FEATURE_DEBUG_MODE
  metrics: $FEATURE_METRICS
logging:
  level: "$LOG_LEVEL"
  retention: "$log_retention"
database:
  backupSchedule: "$backup_schedule"
  backupRetention: "$backup_retention"
monitoring:
  alerting: $alerting
  alertReceivers:
    - email: "devops@aegis-security.com"
    - email: "security@aegis-security.com"
    - sms: "+1234567890"
  dashboards:
    - name: "overview"
    - name: "performance"
    - name: "security"
    - name: "usage"
    - name: "business"
EOF
  elif [ "$ENV" = "staging" ]; then
    frontend_replicas="2"
    backend_replicas="3"
    frontend_cpu="1"
    frontend_memory="1Gi"
    backend_cpu="1"
    backend_memory="1Gi"
    db_storage="20Gi"
    db_cpu="2"
    db_memory="2Gi"
    log_retention="14d"
    backup_schedule="0 0 * * *"
    backup_retention="14d"
    domain="staging.aegis-security.com"
    alerting="true"
    
    # Deployment config file content for staging
    cat > "$deploy_config_file" << EOF
# Generated for $ENV environment - $current_date
environment: $ENV
domain: $domain
replicas:
  frontend: $frontend_replicas
  backend: $backend_replicas
resources:
  frontend:
    cpu: "$frontend_cpu"
    memory: "$frontend_memory"
  backend:
    cpu: "$backend_cpu"
    memory: "$backend_memory"
  database:
    storage: "$db_storage"
    cpu: "$db_cpu"
    memory: "$db_memory"
features:
  experimental: $FEATURE_EXPERIMENTAL
  debugMode: $FEATURE_DEBUG_MODE
  metrics: $FEATURE_METRICS
logging:
  level: "$LOG_LEVEL"
  retention: "$log_retention"
database:
  backupSchedule: "$backup_schedule"
  backupRetention: "$backup_retention"
monitoring:
  alerting: $alerting
  alertReceivers:
    - email: "devops@aegis-security.com"
  dashboards:
    - name: "overview"
    - name: "performance"
    - name: "security"
    - name: "usage"
EOF
  else
    frontend_replicas="1"
    backend_replicas="2"
    frontend_cpu="0.5"
    frontend_memory="512Mi"
    backend_cpu="0.5"
    backend_memory="512Mi"
    db_storage="10Gi"
    db_cpu="1"
    db_memory="1Gi"
    log_retention="7d"
    backup_schedule="0 0 * * *"
    backup_retention="7d"
    domain="dev.aegis-security.com"
    alerting="false"
    
    # Deployment config file content for development
    cat > "$deploy_config_file" << EOF
# Generated for $ENV environment - $current_date
environment: $ENV
domain: $domain
replicas:
  frontend: $frontend_replicas
  backend: $backend_replicas
resources:
  frontend:
    cpu: "$frontend_cpu"
    memory: "$frontend_memory"
  backend:
    cpu: "$backend_cpu"
    memory: "$backend_memory"
  database:
    storage: "$db_storage"
    cpu: "$db_cpu"
    memory: "$db_memory"
features:
  experimental: $FEATURE_EXPERIMENTAL
  debugMode: $FEATURE_DEBUG_MODE
  metrics: $FEATURE_METRICS
logging:
  level: "$LOG_LEVEL"
  retention: "$log_retention"
database:
  backupSchedule: "$backup_schedule"
  backupRetention: "$backup_retention"
monitoring:
  alerting: $alerting
  alertReceivers:
  dashboards:
    - name: "overview"
    - name: "performance"
    - name: "security"
EOF
  fi

  # ----- Docker .env File -----
  docker_env_file="$OUTPUT_DIR/.env.${ENV}"
  
  # Get version if version.sh exists
  if [ -f "$ROOT_DIR/version.sh" ] && [ -x "$ROOT_DIR/version.sh" ]; then
    VERSION=$("$ROOT_DIR/version.sh" show)
  else
    VERSION="0.0.0-dev"
  fi
  
  # Docker .env file content
  cat > "$docker_env_file" << EOF
# Docker environment file for $ENV - $current_date
# This file is used by docker-compose

# Environment
ENV=$ENV
ENVIRONMENT=$ENVIRONMENT
DEBUG=$DEBUG
LOG_LEVEL=$LOG_LEVEL

# Versions
VERSION=$VERSION

# Frontend
FRONTEND_PORT=$FRONTEND_PORT
FRONTEND_API_URL=$FRONTEND_API_URL

# Backend
BACKEND_PORT=$BACKEND_PORT
BACKEND_CORS_ALLOWED_ORIGINS=$BACKEND_CORS_ALLOWED_ORIGINS
JWT_SECRET=$JWT_SECRET
TOKEN_EXPIRY=$TOKEN_EXPIRY

# Database
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# Redis
REDIS_HOST=$REDIS_HOST
REDIS_PORT=$REDIS_PORT
REDIS_PASSWORD=$REDIS_PASSWORD

# Monitoring
PROMETHEUS_PORT=$PROMETHEUS_PORT
GRAFANA_PORT=$GRAFANA_PORT
ENABLE_METRICS=$ENABLE_METRICS

# Feature Flags
FEATURE_EXPERIMENTAL=$FEATURE_EXPERIMENTAL
FEATURE_DEBUG_MODE=$FEATURE_DEBUG_MODE
FEATURE_METRICS=$FEATURE_METRICS
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
if [ "$2" = "show" ]; then
  show_environment_info
else
  apply_environment
fi