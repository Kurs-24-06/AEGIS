#!/bin/bash
# db-init.sh - Initialize and migrate the database for AEGIS

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}  AEGIS Database Initialization     ${NC}"
echo -e "${GREEN}====================================${NC}"

# Default environment is development
ENVIRONMENT=${ENVIRONMENT:-development}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-aegisuser}
DB_PASSWORD=${DB_PASSWORD:-dev-password}
DB_NAME=${DB_NAME:-aegis_dev}

# Display configuration
echo -e "\n${YELLOW}Database Configuration:${NC}"
echo -e "Environment: ${ENVIRONMENT}"
echo -e "Host: ${DB_HOST}"
echo -e "Port: ${DB_PORT}"
echo -e "User: ${DB_USER}"
echo -e "Database: ${DB_NAME}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL client (psql) is not installed.${NC}"
    echo -e "${YELLOW}Using Docker instead...${NC}"
    
    # Use PostgreSQL in Docker
    echo -e "\n${YELLOW}Checking if PostgreSQL container is running...${NC}"
    if [ "$(docker ps -q -f name=postgres)" ]; then
        echo -e "${GREEN}PostgreSQL container is running.${NC}"
    else
        echo -e "${RED}PostgreSQL container is not running.${NC}"
        echo -e "${YELLOW}Please start the development environment first by running ./dev.sh${NC}"
        exit 1
    fi
    
    echo -e "\n${YELLOW}Running migrations inside the PostgreSQL container...${NC}"
    
    # Check if migrations directory exists
    if [ ! -d "backend/db/migrations" ]; then
        echo -e "${RED}Migrations directory does not exist.${NC}"
        echo -e "${YELLOW}Creating migrations directory...${NC}"
        mkdir -p backend/db/migrations
        
        # Create sample migration
        cat > backend/db/migrations/001_initial_schema.sql << 'EOF'
-- Create initial AEGIS database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Infrastructures table
CREATE TABLE IF NOT EXISTS infrastructures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config_json JSONB NOT NULL,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) NOT NULL,
    steps_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    infrastructure_id INTEGER REFERENCES infrastructures(id) ON DELETE CASCADE,
    scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    results_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Simulation events table
CREATE TABLE IF NOT EXISTS simulation_events (
    id SERIAL PRIMARY KEY,
    simulation_id INTEGER REFERENCES simulations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resource_id VARCHAR(255),
    details_json JSONB NOT NULL,
    severity VARCHAR(50) NOT NULL
);

-- Create TimescaleDB hypertable for time-series data
SELECT create_hypertable('simulation_events', 'timestamp');

-- Create some indexes for better performance
CREATE INDEX idx_infrastructures_owner_id ON infrastructures(owner_id);
CREATE INDEX idx_simulations_infrastructure_id ON simulations(infrastructure_id);
CREATE INDEX idx_simulations_scenario_id ON simulations(scenario_id);
CREATE INDEX idx_simulation_events_simulation_id ON simulation_events(simulation_id);
CREATE INDEX idx_simulation_events_event_type ON simulation_events(event_type);
CREATE INDEX idx_simulation_events_severity ON simulation_events(severity);
EOF
        echo -e "${GREEN}Created initial migration script.${NC}"
    fi
    
    # Execute each migration file in order
    for migration in $(ls -v backend/db/migrations/*.sql); do
        filename=$(basename $migration)
        echo -e "${YELLOW}Applying migration: ${filename}${NC}"
        docker exec -i $(docker ps -q -f name=postgres) psql -U ${DB_USER} -d ${DB_NAME} < $migration
    done
    
    echo -e "\n${GREEN}Database migration completed successfully!${NC}"
    exit 0
fi

# If psql is available, use it directly
echo -e "\n${YELLOW}Connecting to database...${NC}"
export PGPASSWORD=${DB_PASSWORD}

# Check if database exists
if ! psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -c '\q' 2>/dev/null; then
    echo -e "${RED}Database ${DB_NAME} does not exist or cannot connect.${NC}"
    echo -e "${YELLOW}Attempting to create database...${NC}"
    
    # Try to create the database
    if ! psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d postgres -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null; then
        echo -e "${RED}Could not create database. Please ensure PostgreSQL is running and ${DB_USER} has appropriate permissions.${NC}"
        exit 1
    else
        echo -e "${GREEN}Database ${DB_NAME} created successfully.${NC}"
    fi
fi

# Apply migrations
echo -e "\n${YELLOW}Applying migrations...${NC}"

# Check if migrations directory exists
if [ ! -d "backend/db/migrations" ]; then
    echo -e "${RED}Migrations directory does not exist.${NC}"
    echo -e "${YELLOW}Creating migrations directory...${NC}"
    mkdir -p backend/db/migrations
    
    # Create sample migration
    cat > backend/db/migrations/001_initial_schema.sql << 'EOF'
-- Create initial AEGIS database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Infrastructures table
CREATE TABLE IF NOT EXISTS infrastructures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config_json JSONB NOT NULL,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) NOT NULL,
    steps_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    infrastructure_id INTEGER REFERENCES infrastructures(id) ON DELETE CASCADE,
    scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    results_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Simulation events table
CREATE TABLE IF NOT EXISTS simulation_events (
    id SERIAL PRIMARY KEY,
    simulation_id INTEGER REFERENCES simulations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resource_id VARCHAR(255),
    details_json JSONB NOT NULL,
    severity VARCHAR(50) NOT NULL
);

-- Create TimescaleDB hypertable for time-series data
SELECT create_hypertable('simulation_events', 'timestamp');

-- Create some indexes for better performance
CREATE INDEX idx_infrastructures_owner_id ON infrastructures(owner_id);
CREATE INDEX idx_simulations_infrastructure_id ON simulations(infrastructure_id);
CREATE INDEX idx_simulations_scenario_id ON simulations(scenario_id);
CREATE INDEX idx_simulation_events_simulation_id ON simulation_events(simulation_id);
CREATE INDEX idx_simulation_events_event_type ON simulation_events(event_type);
CREATE INDEX idx_simulation_events_severity ON simulation_events(severity);
EOF
    echo -e "${GREEN}Created initial migration script.${NC}"
fi

# Execute each migration file in order
for migration in $(ls -v backend/db/migrations/*.sql); do
    filename=$(basename $migration)
    echo -e "${YELLOW}Applying migration: ${filename}${NC}"
    psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f $migration
done

echo -e "\n${GREEN}Database migration completed successfully!${NC}"

# Insert sample data if in development environment
if [ "$ENVIRONMENT" = "development" ]; then
    echo -e "\n${YELLOW}Inserting sample data for development...${NC}"
    
    # Create sample data script
    cat > /tmp/sample_data.sql << 'EOF'
-- Sample users
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES 
('admin', 'admin@aegis-security.com', '$2a$10$xVqYwQvU5OyLp4Cz/x3zMeOmB7nvYyc.g4GBX2qH9iPJ7QRw8v5se', 'Admin User', 'admin'),
('analyst', 'analyst@aegis-security.com', '$2a$10$xVqYwQvU5OyLp4Cz/x3zMeOmB7nvYyc.g4GBX2qH9iPJ7QRw8v5se', 'Security Analyst', 'analyst'),
('user', 'user@aegis-security.com', '$2a$10$xVqYwQvU5OyLp4Cz/x3zMeOmB7nvYyc.g4GBX2qH9iPJ7QRw8v5se', 'Regular User', 'user')
ON CONFLICT (username) DO NOTHING;

-- Sample infrastructure
INSERT INTO infrastructures (name, description, config_json, owner_id)
VALUES 
('AWS Production', 'AWS Production Environment', '{"vpc": "vpc-123456", "subnets": ["subnet-123", "subnet-456"], "instances": [{"id": "i-123456", "type": "web", "ip": "10.0.1.1"}, {"id": "i-789012", "type": "db", "ip": "10.0.1.2"}]}', (SELECT id FROM users WHERE username = 'admin')),
('Azure Development', 'Azure Development Environment', '{"vnet": "vnet-123456", "subnets": ["subnet-123", "subnet-456"], "vms": [{"id": "vm-123456", "type": "web", "ip": "10.0.2.1"}, {"id": "vm-789012", "type": "db", "ip": "10.0.2.2"}]}', (SELECT id FROM users WHERE username = 'admin'))
ON CONFLICT DO NOTHING;

-- Sample scenarios
INSERT INTO scenarios (name, description, difficulty, steps_json)
VALUES 
('Basic Pentest', 'Basic penetration testing scenario', 'easy', '{"steps": [{"id": 1, "name": "Reconnaissance", "description": "Gather information about the target"}, {"id": 2, "name": "Scanning", "description": "Scan for open ports and services"}, {"id": 3, "name": "Exploitation", "description": "Exploit vulnerabilities"}]}'),
('Advanced Ransomware', 'Advanced ransomware attack simulation', 'hard', '{"steps": [{"id": 1, "name": "Initial Access", "description": "Gain initial access through phishing"}, {"id": 2, "name": "Privilege Escalation", "description": "Escalate privileges"}, {"id": 3, "name": "Lateral Movement", "description": "Move laterally through the network"}, {"id": 4, "name": "Data Exfiltration", "description": "Exfiltrate sensitive data"}, {"id": 5, "name": "Encryption", "description": "Encrypt files and demand ransom"}]}')
ON CONFLICT DO NOTHING;

-- Sample simulations
INSERT INTO simulations (name, infrastructure_id, scenario_id, status, start_time, end_time, results_json)
VALUES 
('Pentest-001', (SELECT id FROM infrastructures WHERE name = 'AWS Production'), (SELECT id FROM scenarios WHERE name = 'Basic Pentest'), 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', '{"vulnerabilities": 5, "criticalIssues": 2, "recommendations": ["Update web server", "Enable WAF"]}'),
('Ransom-001', (SELECT id FROM infrastructures WHERE name = 'Azure Development'), (SELECT id FROM scenarios WHERE name = 'Advanced Ransomware'), 'running', NOW() - INTERVAL '1 hour', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Sample simulation events
INSERT INTO simulation_events (simulation_id, event_type, timestamp, resource_id, details_json, severity)
VALUES 
((SELECT id FROM simulations WHERE name = 'Pentest-001'), 'discovery', NOW() - INTERVAL '1 day', 'i-123456', '{"method": "port_scan", "details": "Found open ports 22, 80, 443"}', 'info'),
((SELECT id FROM simulations WHERE name = 'Pentest-001'), 'exploitation', NOW() - INTERVAL '23 hours 30 minutes', 'i-123456', '{"vulnerability": "CVE-2023-1234", "details": "Exploited web server vulnerability"}', 'high'),
((SELECT id FROM simulations WHERE name = 'Ransom-001'), 'discovery', NOW() - INTERVAL '1 hour', 'vm-123456', '{"method": "port_scan", "details": "Found open ports 3389, 445"}', 'info'),
((SELECT id FROM simulations WHERE name = 'Ransom-001'), 'exploitation', NOW() - INTERVAL '45 minutes', 'vm-123456', '{"vulnerability": "weak_password", "details": "Gained access using weak credentials"}', 'medium'),
((SELECT id FROM simulations WHERE name = 'Ransom-001'), 'lateral_movement', NOW() - INTERVAL '30 minutes', 'vm-789012', '{"method": "psexec", "details": "Moved laterally to database server"}', 'high')
ON CONFLICT DO NOTHING;
EOF

    # Apply sample data
    if command -v psql &> /dev/null; then
        psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f /tmp/sample_data.sql
    else
        cat /tmp/sample_data.sql | docker exec -i $(docker ps -q -f name=postgres) psql -U ${DB_USER} -d ${DB_NAME}
    fi
    
    # Clean up
    rm /tmp/sample_data.sql
    
    echo -e "${GREEN}Sample data inserted successfully.${NC}"
fi

echo -e "\n${GREEN}Database initialization completed successfully!${NC}"