#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Fletnix services...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Build and start the containers
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose up -d --build

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 5

# Check container status
echo -e "${YELLOW}Checking container status...${NC}"
CONTAINERS=$(docker-compose ps -q)
ALL_RUNNING=true

for CONTAINER in $CONTAINERS; do
  STATUS=$(docker inspect --format='{{.State.Status}}' $CONTAINER)
  NAME=$(docker inspect --format='{{.Name}}' $CONTAINER | cut -c 2-)
  
  if [ "$STATUS" = "running" ]; then
    echo -e "${GREEN}✓ $NAME is running${NC}"
  else
    echo -e "${RED}✗ $NAME is not running (status: $STATUS)${NC}"
    ALL_RUNNING=false
  fi
done

# Display URLs
if [ "$ALL_RUNNING" = true ]; then
  echo -e "\n${GREEN}All services are running!${NC}"
  echo -e "\n${YELLOW}Access your services:${NC}"
  echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
  echo -e "${GREEN}Backend API:${NC} http://localhost:8083/api"
  echo -e "${GREEN}Jellyfin:${NC} http://localhost:8096"
  
  echo -e "\n${YELLOW}Login credentials:${NC}"
  echo -e "${GREEN}Username:${NC} admin"
  echo -e "${GREEN}Password:${NC} admin123"
else
  echo -e "\n${RED}Some services failed to start. Check the logs with:${NC}"
  echo -e "docker-compose logs"
fi

echo -e "\n${YELLOW}To stop all services:${NC}"
echo -e "docker-compose down" 