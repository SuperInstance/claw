#!/bin/bash

# Spreadsheet Moment - Cloudflare Deployment Script
# MIT License - Copyright (c) 2026 SuperInstance Research Team

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
ENVIRONMENT="${1:-production}"
WORKER_NAME="spreadsheet-moment"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Spreadsheet Moment - Cloudflare Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Error: wrangler CLI is not installed${NC}"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Check if user is authenticated
echo -e "${YELLOW}Checking authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}Not authenticated. Please login:${NC}"
    wrangler login
fi

# Function to create D1 database
create_d1_database() {
    local db_name="$1"
    local env="$2"

    echo -e "${YELLOW}Creating D1 database: ${db_name}${NC}"

    if [ "$env" = "development" ]; then
        db_name="${db_name}-dev"
    elif [ "$env" = "production" ]; then
        db_name="${db_name}-prod"
    fi

    # Check if database already exists
    if wrangler d1 list | grep -q "$db_name"; then
        echo -e "${GREEN}Database ${db_name} already exists${NC}"
    else
        wrangler d1 create "$db_name"
        echo -e "${GREEN}Created database ${db_name}${NC}"
    fi
}

# Function to run D1 migrations
run_d1_migrations() {
    local db_name="$1"
    local env="$2"

    echo -e "${YELLOW}Running migrations for ${db_name}${NC}"

    if [ "$env" = "development" ]; then
        db_name="${db_name}-dev"
    elif [ "$env" = "production" ]; then
        db_name="${db_name}-prod"
    fi

    # Execute schema
    wrangler d1 execute "$db_name" --file="./deployment/cloudflare/d1/schema.sql" --env="$env"

    echo -e "${GREEN}Migrations completed${NC}"
}

# Function to create R2 buckets
create_r2_buckets() {
    echo -e "${YELLOW}Creating R2 buckets...${NC}"

    local buckets=("spreadsheet-moment-assets" "spreadsheet-moment-uploads")

    for bucket in "${buckets[@]}"; do
        if wrangler r2 bucket list | grep -q "$bucket"; then
            echo -e "${GREEN}Bucket ${bucket} already exists${NC}"
        else
            wrangler r2 bucket create "$bucket"
            echo -e "${GREEN}Created bucket ${bucket}${NC}"
        fi
    done
}

# Function to create KV namespaces
create_kv_namespaces() {
    echo -e "${YELLOW}Creating KV namespaces...${NC}"

    local namespaces=("CACHE" "SESSIONS")

    for ns in "${namespaces[@}"; do
        # Check if namespace ID is set in wrangler.toml
        if grep -q "${ns}_id = \"\"" ./deployment/cloudflare/wrangler.toml; then
            echo -e "${YELLOW}Creating namespace ${ns}${NC}"
            local ns_id=$(wrangler kv:namespace create "${ns}" --env="$ENVIRONMENT" | jq -r '.id')
            echo -e "${GREEN}Created namespace ${ns} with ID: ${ns_id}${NC}"
            echo "Please update wrangler.toml with the namespace ID"
        else
            echo -e "${GREEN}Namespace ${ns} already configured${NC}"
        fi
    done
}

# Function to set secrets
set_secrets() {
    echo -e "${YELLOW}Setting secrets...${NC}"
    echo "Please enter the following secrets:"

    read -p "JWT Secret: " jwt_secret
    wrangler secret put JWT_SECRET --env="$ENVIRONMENT" <<< "$jwt_secret"

    read -p "Database URL (optional, press Enter to skip): " db_url
    if [ -n "$db_url" ]; then
        wrangler secret put DATABASE_URL --env="$ENVIRONMENT" <<< "$db_url"
    fi

    read -p "SMTP Password (optional, press Enter to skip): " smtp_password
    if [ -n "$smtp_password" ]; then
        wrangler secret put SMTP_PASSWORD --env="$ENVIRONMENT" <<< "$smtp_password"
    fi

    read -p "Stripe Secret Key (optional, press Enter to skip): " stripe_key
    if [ -n "$stripe_key" ]; then
        wrangler secret put STRIPE_SECRET_KEY --env="$ENVIRONMENT" <<< "$stripe_key"
    fi

    echo -e "${GREEN}Secrets configured${NC}"
}

# Main deployment flow
main() {
    echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
    echo ""

    # Change to project root
    cd "$PROJECT_ROOT"

    # Step 1: Create resources
    echo -e "${GREEN}Step 1: Creating Cloudflare resources${NC}"
    create_d1_database "spreadsheet-moment-db" "$ENVIRONMENT"
    run_d1_migrations "spreadsheet-moment-db" "$ENVIRONMENT"
    create_r2_buckets
    create_kv_namespaces
    echo ""

    # Step 2: Configure secrets
    echo -e "${GREEN}Step 2: Configuring secrets${NC}"
    read -p "Do you want to configure secrets now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        set_secrets
    fi
    echo ""

    # Step 3: Build worker
    echo -e "${GREEN}Step 3: Building Worker${NC}"
    npm run build:worker || echo -e "${YELLOW}Warning: Build script not found, skipping${NC}"
    echo ""

    # Step 4: Deploy worker
    echo -e "${GREEN}Step 4: Deploying Worker${NC}"
    wrangler deploy deployment/cloudflare/wrangler.toml --env="$ENVIRONMENT"
    echo ""

    # Step 5: Configure R2 CORS
    echo -e "${GREEN}Step 5: Configuring R2 CORS${NC}"
    wrangler r2 bucket cors put spreadsheet-moment-assets --config=./deployment/cloudflare/r2/cors.json
    wrangler r2 bucket cors put spreadsheet-moment-uploads --config=./deployment/cloudflare/r2/cors.json
    echo ""

    # Step 6: Configure R2 lifecycle
    echo -e "${GREEN}Step 6: Configuring R2 lifecycle rules${NC}"
    wrangler r2 bucket lifecycle put spreadsheet-moment-uploads --file=./deployment/cloudflare/r2/lifecycle.json
    echo ""

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Worker URL: https://spreadsheet-moment.${ENVIRONMENT}.workers.dev"
    echo "GraphQL API: https://spreadsheet-moment.${ENVIRONMENT}.workers.dev/graphql"
    echo ""
    echo "Next steps:"
    echo "1. Update your DNS records to point to the Worker"
    echo "2. Configure custom domain in Cloudflare dashboard"
    echo "3. Monitor Worker logs: wrangler tail --env=$ENVIRONMENT"
    echo "4. Test the deployment: npm run test:cloudflare"
}

# Run main function
main
