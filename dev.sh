#!/bin/bash
# dev.sh - AEGIS Development Environment Launcher

# Set colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to stop the development environment
function stop_dev {
    echo -e "\n${YELLOW}Stopping AEGIS development environment...${NC}"
    docker-compose -f docker-compose.dev.yml down
    echo -e "${GREEN}Development environment stopped.${NC}"
}

# Handle CTRL+C gracefully
trap stop_dev EXIT

# Check if Docker is installed
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker or Docker Compose is not installed. Please install them first.${NC}"
    exit 1
fi

# Check if docker-compose.dev.yml exists
if [ ! -f "docker-compose.dev.yml" ]; then
    echo -e "${RED}docker-compose.dev.yml not found. Please create it first.${NC}"
    exit 1
fi

# Check if database has been initialized
if ! docker-compose -f docker-compose.dev.yml exec -T postgres psql -U aegisuser -d aegis_dev -c "SELECT 1" &> /dev/null; then
    echo -e "${YELLOW}Database has not been initialized yet. Running initialization...${NC}"
    ./initialize-db.sh
fi

# Start the development environment
echo -e "${GREEN}Starting AEGIS development environment...${NC}"
docker-compose -f docker-compose.dev.yml up --build

# This will be executed when the script terminates (either by CTRL+C or normal exit)
