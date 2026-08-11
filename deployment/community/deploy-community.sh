#!/bin/bash
# SuperInstance Community Platform Deployment Script
# Deploys Discourse forums and Template Gallery

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
COMPOSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$COMPOSE_DIR")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SuperInstance Community Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

# Check if kubectl is installed (for Kubernetes deployment)
if [ "$ENVIRONMENT" = "production" ]; then
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}Error: kubectl is required for production deployment${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Load environment variables
echo -e "${YELLOW}Loading environment variables...${NC}"

if [ -f "$COMPOSE_DIR/.env.$ENVIRONMENT" ]; then
    export $(cat "$COMPOSE_DIR/.env.$ENVIRONMENT" | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Environment variables loaded from .env.$ENVIRONMENT${NC}"
else
    echo -e "${RED}Error: .env.$ENVIRONMENT file not found${NC}"
    echo "Please create .env.$ENVIRONMENT with required environment variables"
    exit 1
fi

echo ""

# Step 1: Deploy Discourse Forums
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 1: Deploying Discourse Forums${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

cd "$COMPOSE_DIR/discourse"

echo -e "${YELLOW}Creating Discourse directories...${NC}"
mkdir -p shared/logs
mkdir -p shared/uploads

echo -e "${YELLOW}Building Discourse containers...${NC}"
docker-compose build

echo -e "${YELLOW}Starting Discourse services...${NC}"
docker-compose up -d

echo -e "${YELLOW}Waiting for Discourse to be healthy...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker-compose exec -T discourse-app curl -f http://localhost/health &> /dev/null; then
        echo -e "${GREEN}✓ Discourse is healthy${NC}"
        break
    fi
    ATTEMPT=$((ATTEMPT+1))
    echo "Waiting for Discourse... ($ATTEMPT/$MAX_ATTEMPTS)"
    sleep 10
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}Error: Discourse failed to start${NC}"
    exit 1
fi

echo -e "${YELLOW}Configuring Discourse categories and permissions...${NC}"
docker-compose exec -T discourse-app ruby /config/categories.rb

echo -e "${YELLOW}Creating Discourse admin user...${NC}"
docker-compose exec -T discourse-app rake admin:create \
    DISCOURSE_DEVELOPER_EMAILS="$DISCOURSE_ADMIN_EMAIL" \
    DISCOURSE_HOSTNAME="$DISCOURSE_HOSTNAME" \
    DISCOURSE_USERNAME="$DISCOURSE_ADMIN_USERNAME" \
    DISCOURSE_PASSWORD="$DISCOURSE_ADMIN_PASSWORD"

echo -e "${GREEN}✓ Discourse deployment complete${NC}"
echo ""

# Step 2: Deploy Template Gallery
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 2: Deploying Template Gallery${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

cd "$COMPOSE_DIR/template-gallery"

echo -e "${YELLOW}Building Template Gallery services...${NC}"
docker-compose build

echo -e "${YELLOW}Starting Template Gallery services...${NC}"
docker-compose up -d

echo -e "${YELLOW}Waiting for Template Gallery to be healthy...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker-compose exec -T template-gallery-api curl -f http://localhost:4004/health &> /dev/null; then
        echo -e "${GREEN}✓ Template Gallery is healthy${NC}"
        break
    fi
    ATTEMPT=$((ATTEMPT+1))
    echo "Waiting for Template Gallery... ($ATTEMPT/$MAX_ATTEMPTS)"
    sleep 10
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}Error: Template Gallery failed to start${NC}"
    exit 1
fi

echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose exec -T template-gallery-api npm run db:migrate

echo -e "${YELLOW}Importing initial templates...${NC}"
docker-compose exec -T template-gallery-api npm run templates:import

echo -e "${GREEN}✓ Template Gallery deployment complete${NC}"
echo ""

# Step 3: Verify Deployment
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 3: Verifying Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}Checking service health...${NC}"

# Check Discourse
if docker-compose -f discourse/docker-compose.yml exec -T discourse-app curl -f http://localhost/health &> /dev/null; then
    echo -e "${GREEN}✓ Discourse Forums: RUNNING${NC}"
    DISCOURSE_URL="http://localhost:80"
    echo "  URL: $DISCOURSE_URL"
else
    echo -e "${RED}✗ Discourse Forums: FAILED${NC}"
fi

# Check Template Gallery
if docker-compose -f template-gallery/docker-compose.yml exec -T template-gallery-api curl -f http://localhost:4004/health &> /dev/null; then
    echo -e "${GREEN}✓ Template Gallery: RUNNING${NC}"
    GALLERY_URL="http://localhost:4004"
    echo "  URL: $GALLERY_URL"
else
    echo -e "${RED}✗ Template Gallery: FAILED${NC}"
fi

echo ""

# Step 4: Run Tests
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 4: Running Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}Running Discourse tests...${NC}"
cd "$COMPOSE_DIR/discourse"
docker-compose exec -T discourse-app rake spec

echo -e "${YELLOW}Running Template Gallery tests...${NC}"
cd "$COMPOSE_DIR/template-gallery"
docker-compose exec -T template-gallery-api npm test

echo ""

# Step 5: Generate Report
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deployment Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${GREEN}✓ Community platform deployed successfully!${NC}"
echo ""

echo "Environment: $ENVIRONMENT"
echo "Deployment Date: $(date)"
echo ""

echo "Services:"
echo "  - Discourse Forums: http://localhost:80"
echo "  - Template Gallery: http://localhost:4004"
echo ""

echo "Admin Credentials:"
echo "  Discourse Admin: $DISCOURSE_ADMIN_USERNAME"
echo "  Discourse Email: $DISCOURSE_ADMIN_EMAIL"
echo ""

echo "Next Steps:"
echo "  1. Access Discourse at http://localhost:80"
echo "  2. Complete Discourse setup wizard"
echo "  3. Access Template Gallery at http://localhost:4004"
echo "  4. Configure gamification and moderation settings"
echo "  5. Set up custom branding and themes"
echo ""

echo "For production deployment:"
echo "  1. Configure domain names and SSL certificates"
echo "  2. Set up email service (SMTP)"
echo "  3. Configure S3 for file storage"
echo "  4. Enable backups and monitoring"
echo "  5. Review security settings"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
