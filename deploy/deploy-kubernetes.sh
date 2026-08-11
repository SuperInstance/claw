#!/bin/bash
# Spreadsheet Moment - Kubernetes Deployment
# Deploys application to Kubernetes cluster

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
NAMESPACE="${NAMESPACE:-spreadsheet-moment}"
HELM_RELEASE="${HELM_RELEASE:-spreadsheet-moment}"
HELM_CHART="${PROJECT_ROOT}/deployment/helm/chart"
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-spreadsheet-moment}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo -e "${BLUE}Deploying to Kubernetes${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check for kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl not found!${NC}"
    echo "Install from: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Check cluster connection
echo -e "${YELLOW}Checking cluster connection...${NC}"
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Cannot connect to Kubernetes cluster!${NC}"
    exit 1
fi

# Create namespace if it doesn't exist
echo -e "${YELLOW}Creating namespace...${NC}"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Build and push Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
IMAGE_FULL="$REGISTRY/$IMAGE_NAME:$IMAGE_TAG"

docker build -t "$IMAGE_FULL" .
docker push "$IMAGE_FULL"

# Use Helm if available, otherwise use kubectl
if command -v helm &> /dev/null && [ -d "$HELM_CHART" ]; then
    echo -e "${YELLOW}Deploying with Helm...${NC}"

    # Update dependencies
    helm dependency update "$HELM_CHART"

    # Deploy/upgrade release
    helm upgrade --install "$HELM_RELEASE" "$HELM_CHART" \
        --namespace "$NAMESPACE" \
        --create-namespace \
        --set image.repository="$REGISTRY/$IMAGE_NAME" \
        --set image.tag="$IMAGE_TAG" \
        --values "$HELM_CHART/values.yaml" \
        --values "$PROJECT_ROOT/deployment/helm/values.prod.yaml" \
        --wait \
        --timeout 10m

    echo -e "${GREEN}Helm deployment successful!${NC}"
else
    echo -e "${YELLOW}Deploying with kubectl...${NC}"

    # Apply Kubernetes manifests
    kubectl apply -f deployment/k8s/ -n "$NAMESPACE"

    # Wait for rollout
    kubectl rollout status deployment -n "$NAMESPACE" -l app="$HELM_RELEASE"

    echo -e "${GREEN}kubectl deployment successful!${NC}"
fi

# Get deployment status
echo ""
echo -e "${BLUE}Deployment Status:${NC}"
kubectl get pods -n "$NAMESPACE" -l app="$HELM_RELEASE"

# Get service info
echo ""
echo -e "${BLUE}Service Information:${NC}"
SERVICE_IP=$(kubectl get service -n "$NAMESPACE" -l app="$HELM_RELEASE" -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ -n "$SERVICE_IP" ]; then
    echo "External IP: $SERVICE_IP"
else
    echo "Port-forward to access:"
    echo "  kubectl port-forward -n $NAMESPACE service/$HELM_RELEASE 3000:80"
fi

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
