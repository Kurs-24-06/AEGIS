#!/bin/bash
# setup-dev.sh - Initialize and migrate the database for AEGIS

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
        echo -e "${YELLOW}Please run the setup script first.${NC}"
        exit 1
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
    echo -e "${YELLOW}Please ensure the database is created and accessible.${NC}"
    exit 1
fi

# Apply migrations
echo -e "\n${YELLOW}Applying migrations...${NC}"

# Check if migrations directory exists
if [ ! -d "backend/db/migrations" ]; then
    echo -e "${RED}Migrations directory does not exist.${NC}"
    echo -e "${YELLOW}Please run the setup script first.${NC}"
    exit 1
fi

# Execute each migration file in order
for migration in $(ls -v backend/db/migrations/*.sql); do
    filename=$(basename $migration)
    echo -e "${YELLOW}Applying migration: ${filename}${NC}"
    psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f $migration
done

echo -e "\n${GREEN}Database migration completed successfully!${NC}"LOG_FILE="db-init.log"

echo -e "${GREEN}====================================${NC}" >> $LOG_FILE
echo -e "${GREEN}  AEGIS Database Initialization     ${NC}" >> $LOG_FILE
echo -e "${GREEN}====================================${NC}" >> $LOG_FILE

# Default environment is development
ENVIRONMENT=${ENVIRONMENT:-development}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-aegisuser}
DB_PASSWORD=${DB_PASSWORD:-dev-password}
DB_NAME=${DB_NAME:-aegis_dev}

# Display configuration
echo -e "\n${YELLOW}Database Configuration:${NC}" >> $LOG_FILE
echo -e "Environment: ${ENVIRONMENT}" >> $LOG_FILE
echo -e "Host: ${DB_HOST}" >> $LOG_FILE
echo -e "Port: ${DB_PORT}" >> $LOG_FILE
echo -e "User: ${DB_USER}" >> $LOG_FILE
echo -e "Database: ${DB_NAME}" >> $LOG_FILE

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL client (psql) is not installed.${NC}" >> $LOG_FILE
    echo -e "${YELLOW}Using Docker instead...${NC}" >> $LOG_FILE
    
    # Use PostgreSQL in Docker
    echo -e "\n${YELLOW}Checking if PostgreSQL container is running...${NC}" >> $LOG_FILE
    if [ "$(docker ps -q -f name=postgres)" ]; then
        echo -e "${GREEN}PostgreSQL container is running.${NC}" >> $LOG_FILE
    else
        echo -e "${RED}PostgreSQL container is not running.${NC}" >> $LOG_FILE
        echo -e "${YELLOW}Please start the development environment first by running ./dev.sh${NC}" >> $LOG_FILE
        exit 1
    fi
    
    echo -e "\n${YELLOW}Running migrations inside the PostgreSQL container...${NC}" >> $LOG_FILE
    
    # Check if migrations directory exists
    if [ ! -d "backend/db/migrations" ]; then
        echo -e "${RED}Migrations directory does not exist.${NC}" >> $LOG_FILE
        echo -e "${YELLOW}Please run the setup script first.${NC}" >> $LOG_FILE
        exit 1
    fi
    
    # Execute each migration file in order
    for migration in $(ls -v backend/db/migrations/*.sql); do
        filename=$(basename $migration)
        echo -e "${YELLOW}Applying migration: ${filename}${NC}" >> $LOG_FILE
        docker exec -i $(docker ps -q -f name=postgres) psql -U ${DB_USER} -d ${DB_NAME} < $migration
    done
    
    echo -e "\n${GREEN}Database migration completed successfully!${NC}" >> $LOG_FILE
    exit 0
fi

# If psql is available, use it directly
echo -e "\n${YELLOW}Connecting to database...${NC}" >> $LOG_FILE
export PGPASSWORD=${DB_PASSWORD}

# Check if database exists
if ! psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -c '\q' 2>/dev/null; then
    echo -e "${RED}Database ${DB_NAME} does not exist or cannot connect.${NC}" >> $LOG_FILE
    echo -e "${YELLOW}Please ensure the database is created and accessible.${NC}" >> $LOG_FILE
    exit 1
fi

# Apply migrations
echo -e "\n${YELLOW}Applying migrations...${NC}" >> $LOG_FILE

# Check if migrations directory exists
if [ ! -d "backend/db/migrations" ]; then
    echo -e "${RED}Migrations directory does not exist.${NC}" >> $LOG_FILE
    echo -e "${YELLOW}Please run the setup script first.${NC}" >> $LOG_FILE
    exit 1
fi

# Execute each migration file in order
for migration in $(ls -v backend/db/migrations/*.sql); do
    filename=$(basename $migration)
    echo -e "${YELLOW}Applying migration: ${filename}${NC}" >> $LOG_FILE
    psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f $migration
done

echo -e "\n${GREEN}Database migration completed successfully!${NC}" >> $LOG_FILE