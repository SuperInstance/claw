#!/bin/bash
# Spreadsheet Moment - Production Kubernetes Deployment Script
# This script deploys the complete Spreadsheet Moment platform to Kubernetes
#
# Usage: ./deploy-production.sh [options]
# Options:
#   --skip-prereqs    Skip prerequisite checks
#   --dry-run         Show what would be deployed without applying
#   --gpu             Include GPU workloads
#   --monitoring      Include monitoring stack

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAMESPACE="spreadsheet-moment"
MONITORING_NAMESPACE="monitoring"
DRY_RUN=false
SKIP_PREREQS=false
INCLUDE_GPU=false
INCLUDE_MONITORING=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-prereqs)
            SKIP_PREREQS=true
            shift
            ;;
        --gpu)
            INCLUDE_GPU=true
            shift
            ;;
        --monitoring)
            INCLUDE_MONITORING=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi

    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi

    # Check helm (optional but recommended)
    if command -v helm &> /dev/null; then
        HELM_VERSION=$(helm version --short 2>/dev/null || echo "unknown")
        log_info "Helm version: $HELM_VERSION"
    else
        log_warning "Helm not installed - some features may be unavailable"
    fi

    # Check for required namespaces
    log_info "Kubernetes cluster connected successfully"
    KUBE_VERSION=$(kubectl version -o json 2>/dev/null | grep -o '"gitVersion":"[^"]*"' | head -1 || echo "unknown")
    log_info "Kubernetes version: $KUBE_VERSION"

    log_success "Prerequisites check passed"
}

apply_kubectl() {
    local manifest_path="$1"
    local description="$2"

    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would apply: $description"
        kubectl apply -f "$manifest_path" --dry-run=client -o yaml > /dev/null 2>&1 && \
            log_success "[DRY-RUN] Validation passed: $description" || \
            log_error "[DRY-RUN] Validation failed: $description"
    else
        log_info "Applying: $description"
        kubectl apply -f "$manifest_path"
        log_success "Applied: $description"
    fi
}

deploy_namespace() {
    log_info "=== Deploying Namespace and Resource Quotas ==="
    apply_kubectl "$SCRIPT_DIR/base/namespace.yaml" "Namespace and Resource Quotas"
}

deploy_configmaps() {
    log_info "=== Deploying ConfigMaps ==="
    apply_kubectl "$SCRIPT_DIR/base/configmap.yaml" "Application ConfigMaps"
}

deploy_secrets() {
    log_info "=== Deploying Secrets ==="

    # Check if secrets already exist
    if kubectl get secret spreadsheet-moment-secrets -n "$NAMESPACE" &> /dev/null; then
        log_warning "Secret spreadsheet-moment-secrets already exists - skipping"
        log_warning "To update secrets, delete and recreate or use External Secrets Operator"
    else
        log_warning "Creating placeholder secrets - UPDATE THESE BEFORE PRODUCTION USE!"
        apply_kubectl "$SCRIPT_DIR/base/secrets.yaml" "Application Secrets (PLACEHOLDER - UPDATE BEFORE USE)"
    fi
}

deploy_persistent_volumes() {
    log_info "=== Deploying Persistent Volume Claims ==="

    # Create PVCs for services
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: analytics-models-pvc
  namespace: spreadsheet-moment
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 20Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: spreadsheet-moment
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: minio-pvc
  namespace: spreadsheet-moment
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 100Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ml-models-pvc
  namespace: spreadsheet-moment
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 50Gi
EOF
    log_success "Applied: Persistent Volume Claims"
}

deploy_databases() {
    log_info "=== Deploying PostgreSQL Database ==="
    apply_kubectl "$SCRIPT_DIR/services/databases.yaml" "PostgreSQL StatefulSet"

    log_info "Waiting for PostgreSQL to be ready..."
    if [ "$DRY_RUN" = false ]; then
        kubectl rollout status statefulset/postgres -n "$NAMESPACE" --timeout=300s || \
            log_warning "PostgreSQL rollout status check timed out"
    fi
}

deploy_redis() {
    log_info "=== Deploying Redis Cache ==="
    apply_kubectl "$SCRIPT_DIR/services/redis.yaml" "Redis Deployment"

    log_info "Waiting for Redis to be ready..."
    if [ "$DRY_RUN" = false ]; then
        kubectl rollout status deployment/redis -n "$NAMESPACE" --timeout=180s || \
            log_warning "Redis rollout status check timed out"
    fi
}

deploy_minio() {
    log_info "=== Deploying MinIO Object Storage ==="
    apply_kubectl "$SCRIPT_DIR/services/minio.yaml" "MinIO Deployment"

    log_info "Waiting for MinIO to be ready..."
    if [ "$DRY_RUN" = false ]; then
        kubectl rollout status deployment/minio -n "$NAMESPACE" --timeout=180s || \
            log_warning "MinIO rollout status check timed out"
    fi
}

deploy_services() {
    log_info "=== Deploying Application Services ==="

    # GraphQL API
    log_info "Deploying GraphQL API..."
    apply_kubectl "$SCRIPT_DIR/services/graphql-api.yaml" "GraphQL API Deployment"

    # Analytics Service
    log_info "Deploying Analytics Service..."
    apply_kubectl "$SCRIPT_DIR/services/analytics.yaml" "Analytics Service Deployment"

    # Subscription Service
    log_info "Deploying Subscription Service..."
    apply_kubectl "$SCRIPT_DIR/services/subscription.yaml" "Subscription Service Deployment"

    # Community Service
    log_info "Deploying Community Service..."
    apply_kubectl "$SCRIPT_DIR/services/community.yaml" "Community Service Deployment"

    # Wait for deployments
    if [ "$DRY_RUN" = false ]; then
        log_info "Waiting for application services to be ready..."
        kubectl rollout status deployment/graphql-api -n "$NAMESPACE" --timeout=300s &
        kubectl rollout status deployment/analytics-service -n "$NAMESPACE" --timeout=300s &
        kubectl rollout status deployment/subscription-service -n "$NAMESPACE" --timeout=300s &
        kubectl rollout status deployment/community-service -n "$NAMESPACE" --timeout=300s &
        wait
    fi
}

deploy_gpu_services() {
    if [ "$INCLUDE_GPU" = true ]; then
        log_info "=== Deploying GPU/ML Services ==="

        # Check for GPU nodes
        GPU_NODES=$(kubectl get nodes -l accelerator=nvidia-gpu -o name 2>/dev/null | wc -l)
        if [ "$GPU_NODES" -eq 0 ]; then
            log_warning "No GPU nodes found with label 'accelerator=nvidia-gpu'"
            log_warning "ML Inference service may not schedule properly"
        fi

        apply_kubectl "$SCRIPT_DIR/gpu/gpu-node-pool.yaml" "ML Inference GPU Deployment"

        if [ "$DRY_RUN" = false ]; then
            log_info "Waiting for ML Inference service to be ready..."
            kubectl rollout status deployment/ml-inference-service -n "$NAMESPACE" --timeout=300s || \
                log_warning "ML Inference rollout status check timed out"
        fi
    else
        log_info "Skipping GPU services (use --gpu flag to include)"
    fi
}

deploy_network_policies() {
    log_info "=== Deploying Network Policies ==="
    apply_kubectl "$SCRIPT_DIR/network-policies/network-policies.yaml" "Zero-Trust Network Policies"
}

deploy_ingress() {
    log_info "=== Deploying Ingress Controller ==="

    # Check if NGINX Ingress Controller is installed
    if ! kubectl get svc -n ingress-nginx ingress-nginx-controller &> /dev/null; then
        log_warning "NGINX Ingress Controller not found in ingress-nginx namespace"
        log_info "Installing NGINX Ingress Controller..."

        if [ "$DRY_RUN" = false ]; then
            kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
            log_info "Waiting for Ingress Controller to be ready..."
            kubectl wait --namespace ingress-nginx \
                --for=condition=ready pod \
                --selector=app.kubernetes.io/component=controller \
                --timeout=300s || log_warning "Ingress Controller readiness check timed out"
        fi
    fi

    # Check if cert-manager is installed
    if ! kubectl get namespace cert-manager &> /dev/null; then
        log_warning "cert-manager not found - TLS certificates will not be automatically provisioned"
        log_info "To install cert-manager: kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml"
    fi

    apply_kubectl "$SCRIPT_DIR/ingress/ingress.yaml" "Ingress Configuration"
}

deploy_monitoring() {
    if [ "$INCLUDE_MONITORING" = true ]; then
        log_info "=== Deploying Monitoring Stack ==="

        # Create monitoring namespace
        kubectl create namespace "$MONITORING_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

        apply_kubectl "$SCRIPT_DIR/monitoring/prometheus.yaml" "Prometheus and Grafana"

        log_info "Waiting for monitoring stack to be ready..."
        if [ "$DRY_RUN" = false ]; then
            kubectl rollout status deployment/prometheus -n "$MONITORING_NAMESPACE" --timeout=180s &
            kubectl rollout status deployment/grafana -n "$MONITORING_NAMESPACE" --timeout=180s &
            wait
        fi
    else
        log_info "Skipping monitoring stack (use --monitoring flag to include)"
    fi
}

verify_deployment() {
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Skipping deployment verification"
        return
    fi

    log_info "=== Verifying Deployment ==="

    echo ""
    log_info "Namespace Resources:"
    kubectl get all -n "$NAMESPACE"

    echo ""
    log_info "Pod Status:"
    kubectl get pods -n "$NAMESPACE" -o wide

    echo ""
    log_info "Services:"
    kubectl get svc -n "$NAMESPACE"

    echo ""
    log_info "Horizontal Pod Autoscalers:"
    kubectl get hpa -n "$NAMESPACE"

    echo ""
    log_info "Persistent Volume Claims:"
    kubectl get pvc -n "$NAMESPACE"

    echo ""
    log_info "Ingress:"
    kubectl get ingress -n "$NAMESPACE"

    # Check for any failing pods
    FAILING_PODS=$(kubectl get pods -n "$NAMESPACE" --field-filter=status.phase!=Running,status.phase!=Succeeded -o name 2>/dev/null || true)
    if [ -n "$FAILING_PODS" ]; then
        log_warning "Some pods are not running properly:"
        echo "$FAILING_PODS"
    fi
}

print_summary() {
    echo ""
    echo "=============================================="
    echo "  Spreadsheet Moment - Deployment Summary"
    echo "=============================================="
    echo ""
    echo "Namespace: $NAMESPACE"
    echo "Dry Run: $DRY_RUN"
    echo "GPU Services: $INCLUDE_GPU"
    echo "Monitoring: $INCLUDE_MONITORING"
    echo ""

    if [ "$DRY_RUN" = true ]; then
        echo "This was a DRY RUN - no resources were actually created."
        echo "Remove --dry-run flag to perform actual deployment."
    else
        echo "Next Steps:"
        echo "1. Update secrets with production values:"
        echo "   kubectl edit secret spreadsheet-moment-secrets -n $NAMESPACE"
        echo ""
        echo "2. Verify all pods are running:"
        echo "   kubectl get pods -n $NAMESPACE"
        echo ""
        echo "3. Check service health:"
        echo "   kubectl port-forward svc/graphql-api 4000:4000 -n $NAMESPACE"
        echo "   curl http://localhost:4000/health"
        echo ""
        echo "4. Access Grafana (if monitoring deployed):"
        echo "   kubectl port-forward svc/grafana 3000:3000 -n monitoring"
        echo ""
        echo "5. Configure DNS for ingress hosts:"
        echo "   api.spreadsheet-moment.io -> Ingress Load Balancer IP"
        echo "   ws.spreadsheet-moment.io -> Ingress Load Balancer IP"
    fi
    echo ""
}

# Main execution
main() {
    echo ""
    echo "=============================================="
    echo "  Spreadsheet Moment Production Deployment"
    echo "=============================================="
    echo ""

    if [ "$SKIP_PREREQS" = false ]; then
        check_prerequisites
    fi

    # Deploy in order
    deploy_namespace
    deploy_configmaps
    deploy_secrets
    deploy_persistent_volumes
    deploy_databases
    deploy_redis
    deploy_minio
    deploy_services
    deploy_gpu_services
    deploy_network_policies
    deploy_ingress
    deploy_monitoring

    # Verify
    verify_deployment

    # Print summary
    print_summary
}

main "$@"
