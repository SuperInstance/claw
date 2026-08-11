#!/bin/bash

# Spreadsheet Moment - Monitoring Stack Deployment Script
# Deploys comprehensive monitoring infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Please install kubectl."
        exit 1
    fi

    # Check kubectl context
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi

    # Check helm (optional)
    if command -v helm &> /dev/null; then
        log_info "Helm is available"
    else
        log_warn "Helm not found. Some features may not work."
    fi

    log_info "Prerequisites check passed"
}

# Create monitoring namespace
create_namespace() {
    log_info "Creating monitoring namespace..."
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
    log_info "Namespace created"
}

# Deploy monitoring stack
deploy_monitoring_stack() {
    log_info "Deploying monitoring stack..."

    # Apply Kubernetes manifests
    log_info "Applying Kubernetes manifests..."
    kubectl apply -f kubernetes/monitoring-stack.yaml

    log_info "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s \
        deployment/prometheus -n monitoring \
        deployment/alertmanager -n monitoring \
        deployment/grafana -n monitoring \
        deployment/loki -n monitoring \
        deployment/blackbox-exporter -n monitoring || {
        log_warn "Some deployments are not ready yet. Check with: kubectl get pods -n monitoring"
    }

    log_info "Monitoring stack deployed"
}

# Configure monitoring components
configure_monitoring() {
    log_info "Configuring monitoring components..."

    # Copy Grafana dashboards
    log_info "Copying Grafana dashboards..."
    kubectl create configmap grafana-dashboard-files \
        --from-file=grafana/dashboards/ \
        --namespace=monitoring \
        --dry-run=client -o yaml | kubectl apply -f -

    # Copy Prometheus rules
    log_info "Copying Prometheus alert rules..."
    kubectl create configmap prometheus-rules \
        --from-file=prometheus/rules/comprehensive-alerts.yml \
        --namespace=monitoring \
        --dry-run=client -o yaml | kubectl apply -f -

    # Copy Alertmanager configuration
    log_info "Copying Alertmanager configuration..."
    kubectl create configmap alertmanager-config \
        --from-file=alertmanager/alertmanager.yml \
        --namespace=monitoring \
        --dry-run=client -o yaml | kubectl apply -f -

    # Restart Prometheus to load new configuration
    log_info "Restarting Prometheus..."
    kubectl rollout restart deployment/prometheus -n monitoring

    log_info "Monitoring components configured"
}

# Setup secrets
setup_secrets() {
    log_info "Setting up secrets..."

    # Check if secrets already exist
    if kubectl get secret monitoring-secrets -n monitoring &> /dev/null; then
        log_warn "Secrets already exist. Skipping creation."
        return
    fi

    log_warn "Creating placeholder secrets. Please update these in production!"

    # Generate random passwords
    GRAFANA_PASSWORD=$(openssl rand -base64 16)
    SMTP_PASSWORD=$(openssl rand -base64 16)

    # Create secret
    kubectl create secret generic monitoring-secrets \
        --namespace=monitoring \
        --from-literal=grafana-admin-password="$GRAFANA_PASSWORD" \
        --from-literal=smtp-password="$SMTP_PASSWORD" \
        --from-literal=pagerduty-service-key="CHANGE_ME_IN_PRODUCTION" \
        --from-literal=slack-webhook-url="CHANGE_ME_IN_PRODUCTION" \
        --from-literal=sentry-dsn="CHANGE_ME_IN_PRODUCTION" \
        --from-literal=elasticsearch-password="CHANGE_ME_IN_PRODUCTION"

    log_info "Secrets created"
    log_warn "Grafana admin password: $GRAFANA_PASSWORD"
    log_warn "Please update production secrets!"
}

# Validate deployment
validate_deployment() {
    log_info "Validating deployment..."

    # Check pods
    log_info "Checking pod status..."
    kubectl get pods -n monitoring

    # Check services
    log_info "Checking services..."
    kubectl get services -n monitoring

    # Check Prometheus configuration
    log_info "Checking Prometheus configuration..."
    kubectl exec -n monitoring deployment/prometheus -- \
        wget -qO- http://localhost:9090/-/healthy || {
        log_error "Prometheus health check failed"
        return 1
    }

    # Check Grafana configuration
    log_info "Checking Grafana configuration..."
    kubectl exec -n monitoring deployment/grafana -- \
        wget -qO- http://localhost:3000/api/health || {
        log_warn "Grafana health check failed (may still be starting)"
    }

    # Check Loki
    log_info "Checking Loki..."
    kubectl exec -n monitoring deployment/loki -- \
        wget -qO- http://localhost:3100/ready || {
        log_warn "Loki health check failed (may still be starting)"
    }

    log_info "Deployment validation completed"
}

# Run tests
run_tests() {
    log_info "Running monitoring tests..."

    # Test Prometheus targets
    log_info "Testing Prometheus targets..."
    PROMETHEUS_POD=$(kubectl get pod -n monitoring -l app=prometheus -o jsonpath='{.items[0].metadata.name}')
    kubectl exec -n monitoring "$PROMETHEUS_POD" -- \
        wget -qO- http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.health == "up") | .labels.job' || {
        log_warn "Some Prometheus targets may be down"
    }

    # Test Alertmanager
    log_info "Testing Alertmanager..."
    ALERTMANAGER_POD=$(kubectl get pod -n monitoring -l app=alertmanager -o jsonpath='{.items[0].metadata.name}')
    kubectl exec -n monitoring "$ALERTMANAGER_POD" -- \
        wget -qO- http://localhost:9093/-/healthy || {
        log_error "Alertmanager health check failed"
        return 1
    }

    # Test Grafana datasource
    log_info "Testing Grafana datasources..."
    GRAFANA_POD=$(kubectl get pod -n monitoring -l app=grafana -o jsonpath='{.items[0].metadata.name}')
    kubectl exec -n monitoring "$GRAFANA_POD" -- \
        curl -s http://admin:CHANGE_ME_IN_PRODUCTION@localhost:3000/api/datasources || {
        log_warn "Grafana datasource test failed (password may need updating)"
    }

    log_info "Tests completed"
}

# Display access information
display_access_info() {
    log_info "Monitoring Stack Access Information"
    echo "====================================="
    echo ""
    echo "Grafana:"
    echo "  URL: http://localhost:3000"
    echo "  Username: admin"
    echo "  Password: <see secret monitoring-secrets>"
    echo ""
    echo "Prometheus:"
    echo "  URL: http://localhost:9090"
    echo ""
    echo "Alertmanager:"
    echo "  URL: http://localhost:9093"
    echo ""
    echo "Loki:"
    echo "  URL: http://localhost:3100"
    echo ""
    echo "To port forward locally:"
    echo "  kubectl port-forward -n monitoring svc/grafana 3000:3000"
    echo "  kubectl port-forward -n monitoring svc/prometheus 9090:9090"
    echo "  kubectl port-forward -n monitoring svc/alertmanager 9093:9093"
    echo ""
    echo "====================================="
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    # Add any cleanup tasks here
}

# Main deployment flow
main() {
    log_info "Starting Spreadsheet Moment monitoring stack deployment..."
    echo ""

    # Trap errors
    trap cleanup EXIT

    # Execute deployment steps
    check_prerequisites
    create_namespace
    setup_secrets
    deploy_monitoring_stack
    configure_monitoring
    validate_deployment
    run_tests
    display_access_info

    log_info "Deployment completed successfully!"
    echo ""
    log_warn "Next steps:"
    log_warn "1. Update production secrets in monitoring-secrets"
    log_warn "2. Configure Slack webhook URL"
    log_warn "3. Configure PagerDuty service key"
    log_warn "4. Configure Sentry DSN"
    log_warn "5. Review and customize alerting rules"
    log_warn "6. Review runbooks in deployment/monitoring/runbooks/"
    echo ""
}

# Run main function
main "$@"
