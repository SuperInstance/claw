# Spreadsheet Moment - Kubernetes Deployment Guide

Complete production-ready Kubernetes deployment for for the Spreadsheet Moment platform - an AI-powered spreadsheet analysis platform with real-time collaboration, analytics, and GraphQL subscriptions, Community features, and object storage.

## Table of Contents

- [Prerequisites](# Requirements](# Quick Start](# Directory Structure](# Services Architecture](# Kubernetes Manifests](# Docker configuration](# Helm charts](# GPU node configuration
# Network policies (# Logging stack)
- [Quick Start](# Deployment Instructions](# Contributing](# Development Guide](# Operations Runbook](# Troubleshooting)

- [Architecture Overview](# Directory Structure](# Configuration Reference

# Quick Start

## Prerequisites

| Tool | Version |
|-------------|----------------|--------|------------|--------------|------------------|
| Kubernetes | 1.25+ | kubectl, 1.25+ | helm 3.x+ | [kubectl](https://kubernetes.io/docs/tasks/tools/) |
| Docker | 20.10+ | docker-compose v2+ | [Docker Desktop](https://docker.com) |

| Git clone the repository and navigate to the deployment directory:
```bash
git clone https://github.com/SuperInstance/polln.git
cd polln/deployment/kubernetes/spreadsheet-moment
```

For full development environment setup:

 see [Local development guide](# docker-compose.local.md)

```

For production deployment:
```bash
cd polln/deployment/kubernetes/spreadsheet-moment

kubectl apply -f base/
kubectl apply -f services/
```

For Helm deployment:
```bash
cd polln/deployment/helm/spreadsheet-moment
helm dependency update
helm install spreadsheet-moment ./values.yaml
`` check the deployment:
```bash
helm status spreadsheet-moment
```

For TLS/HTTPS configuration with cert-manager:
```bash
# Install cert-manager if not already installed
kubectl apply -f https://github.com/cert-manager/cert-manager.yaml
kubectl apply -f ingress/cert-issuer.yaml
```

## Directory Structure

```
deployment/
├── kubernetes/
│   └── spreadsheet-moment/
│       ├── base/
│       │   ├── namespace.yaml
│       │   ├── configmap.yaml
│       │   └── secrets.yaml
│       ├── services/
│       │   ├── graphql-api.yaml
│       │   ├── analytics.yaml
│       │   ├── subscription.yaml
│       │   ├── community.yaml
│       │   ├── databases.yaml
│       │   ├── redis.yaml
│       │   └── minio.yaml
│       ├── gpu/
│       │   └── gpu-node-pool.yaml
│       ├── ingress/
│       │   └── ingress.yaml
│       ├── network-policies/
│       │   └── network-policies.yaml
│       ├── monitoring/
│       │   └── prometheus.yaml
│       └── logging/
│           └── elasticsearch.yaml
├── docker/
│   └── spreadsheet-moment/
│       ├── Dockerfile.graphql
│       ├── Dockerfile.analytics
│       ├── Dockerfile.subscription
│       ├── Dockerfile.community
│       ├── Dockerfile.ml-inference (GPU)
│       └── docker-compose.yml
├── helm/
│   └── spreadsheet-moment/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── _helpers.tpl
│           ├── deployment.yaml
│           └── ...
```

> ... see README files for full documentation.

</environmentSetting>
>
```

## Architecture

```
                    ┌──                            ┌──               ─       │
    │   ┌   │   ConfigMap   │── configmap.yaml     │   │   └── secrets.yaml
    │   └   └── Services                │
    ┌── GraphQL API         │   ├── Port 4000 (GraphQL endpoint)
    │   └── Service: ClusterIP
    ├── Analytics           │   └── Port 4001 (REST API + metrics)
    ├── Subscription         │   └── Ports 4002 (GraphQL), 4003 (WebSocket)
    ├── Community             │   └── Port 4004 (REST API)
    ├── PostgreSQL            │   └── Port 5432 (PostgreSQL)
    ├── Redis                 │   └── Port 6379 (Redis)
    ├── MinIO                 │   └── Ports 9000 (API), 9001 (Console)
    └── GPU Node Pool           │
        └── ML Inference Service with GPU support
```
                    ┌── Ingress Controller (nginx)
                    ├── TLS termination
                    ├── Certificate management (cert-manager)
                    └── TLS certificates for HTTPS

                    |
┌── prometheus.io/scrape: "true"
                    └── Prometheus scrapes metrics from pods
```
- Horizontal Pod Autoscalers (HPA) for automatic scaling
- Pod Disruption Budgets (PDB) for high availability
- Network Policies for zero-trust network segmentation

- Security hardening (non-root user, read-only filesystem, capabilities dropping)
- Health probes (liveness and readiness)
- Rolling updates with zero downtime deployment

- GPU support via NVIDIA device plugin and runtime class, and resource quotas/limits for GPU allocation

- TLS/SSL via cert-manager integration
- Prometheus Operator for metrics collection
- Grafana for visualization
- Alertmanager for alerting
- Node Exporter for PostgreSQL metrics
- Redis Exporter for Redis metrics
- Elasticsearch + Kibana + Fluent Bit + Filebeat for centralized logging
- Logstash for log processing
- Kibana for log visualization

## Services

| Service | Port | Description | Resources |
|---------|------|-------------|----------|
| graphql-api | 4000 | GraphQL API Server | 512Mi-2Gi RAM, 0.5-2 CPU |
| analytics-service | 4001 | Analytics & ML Service | 1Gi-4Gi RAM, 1-4 CPU |
| subscription-service | 4002/4003 | Real-time Subscriptions | 256Mi-1Gi RAM |
| community-service | 4004 | Community Features | 256Mi-1Gi RAM |
| postgres | 5432 | PostgreSQL Database | 1Gi-4Gi RAM |
| redis | 6379 | Redis Cache | 256Mi-1Gi RAM |
| minio | 9000/9001 | Object Storage | 512Mi-2Gi RAM |
| ml-inference | 5000 | ML/AI Inference (GPU) | 4Gi-16Gi RAM |

## Resource Allocation

```yaml
# Production recommended resource requests/limits
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "2000m"
    memory: "2Gi"
```

### Development Resources
For local development, reduce resource limits:
```yaml
# Development environment - reduced resources
resources:
  requests:
    cpu: "100m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

## Network Policies

The network policies implement zero-trust networking:

- Default deny all ingress/egress
- Allow DNS resolution
- Service-specific policies for each microservice
- Allow monitoring stack to scrape metrics

- Deny all other cross-namespace traffic by default

### Security Best Practices
1. Run as non-root user (UID 1001)
2. Read-only root filesystem
3. Drop all Linux capabilities
4. No privilege escalation
5. Seccomp profile: RuntimeDefault

6. Resource quotas and limits per namespace
7. Encrypted secrets (use External Secrets Operator in production)

## Deployment Commands

### Local Development
```bash
# Start all services
docker-compose -f deployment/docker/spreadsheet-moment/docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment
```bash
# Create namespace
kubectl apply -f deployment/kubernetes/spreadsheet-moment/base/namespace.yaml

# Create secrets (update with actual values first!)
kubectl apply -f deployment/kubernetes/spreadsheet-moment/base/secrets.yaml

# Create configmaps
kubectl apply -f deployment/kubernetes/spreadsheet-moment/base/configmap.yaml

# Deploy services
kubectl apply -f deployment/kubernetes/spreadsheet-moment/services/

# Deploy GPU configuration (if needed)
kubectl apply -f deployment/kubernetes/spreadsheet-moment/gpu/

# Deploy ingress
kubectl apply -f deployment/kubernetes/spreadsheet-moment/ingress/

# Deploy network policies
kubectl apply -f deployment/kubernetes/spreadsheet-moment/network-policies/

# Deploy monitoring
kubectl apply -f deployment/kubernetes/spreadsheet-moment/monitoring/

# Deploy logging
kubectl apply -f deployment/kubernetes/spreadsheet-moment/logging/
```

### Helm Deployment
```bash
# Add repository
helm repo add spreadsheet-moment https://github.com/SuperInstance/polln

# Update dependencies
helm dependency update

# Install with custom values
helm install spreadsheet-moment ./deployment/helm/spreadsheet-moment \
  --namespace spreadsheet-moment \
  --set global.imageRegistry=your-registry.com \
  --set graphqlApi.replicaCount=3 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=api.yourdomain.com
```

For GPU deployment:
```bash
# Label GPU nodes
kubectl label nodes <node-name> accelerator=nvidia-gpu

# Install NVIDIA GPU Operator
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm install gpu-operator nvidia/gpu-operator -n gpu-operator --create-namespace

# Deploy GPU services
kubectl apply -f deployment/kubernetes/spreadsheet-moment/gpu/
```
## Configuration

### Environment Variables
Key environment variables for each service:

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | production |
| DATABASE_URL | PostgreSQL connection | From secret |
| REDIS_URL | Redis connection | From secret |
| JWT_SECRET | JWT signing secret | From secret |
| LOG_LEVEL | Logging level | info |
| PORT | Service port | Service-specific |

### Secrets Management
Use External Secrets Operator for production. DO NOT commit secrets to git

```yaml
# Example: ExternalSecret for database URL
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: spreadsheet-moment-db
  namespace: spreadsheet-moment
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: ClusterSecretStore
  target:
    name: spreadsheet-moment/database-url
    template:
      type: opaque
      data:
        database-url: ""
```
```

### Using Sealed Secrets
```bash
# Install Sealed Secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets-controller.yaml
 -n kube-system

# Create sealed secret
kubectl create -f deployment/kubernetes/spreadsheet-moment/base/secrets.yaml -n spreadsheet-moment --dry-run
 > sealed-secret.yaml
```

 for development, use Docker Compose with secrets in environment files:

```yaml
services:
  api:
    environment:
      - DATABASE_URL=postgresql://spreadsheet:spreadsheet_dev_password@postgres:5432/spreadsheet_moment
      - REDIS_URL=redis://redis:6379
```

```

### Using SOPS for secret management
```bash
# Install Mozilla SOPS operator
kubectl apply -f https://github.com/mozilla/sops-operator.yaml

# Create SOPS secret
kubectl create secret generic/sops-secret --from-literal=secret=value='your-sops-key' -n spreadsheet-moment
```

## Monitoring

### Dashboards

Access Grafana dashboards at:

| Dashboard | Description | Panels |
|-----------|-------------|--------|
| API Overview | API metrics and 6 |
| Infrastructure | Resource usage | 4 |
| Database | PostgreSQL metrics | 4 |
| Cache | Redis metrics | 4 |
| ML Inference | GPU metrics | 2 |

### Alerts

Configure alerts in AlertManager for critical conditions

```yaml
groups:
- name: critical
  rules:
  - alert: ServiceDown
    expr: up(redis_connection_count{app="subscription-service"}) < 2
    for: 1m
    labels:
      severity: critical
    annotations:
      description: "Subscription service is down"
        runbook_url: "https://wiki.spreadsheet-moment.io/alerts/service-down"
  - alert: HighErrorRate
    expr: rate(http_requests_total{code="500"}[5m]) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      description: "High error rate on GraphQL API"
        runbook_url: "https://wiki.spreadsheet-moment.io/alerts/high-error-rate"
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| ImagePullBackOff | Check image exists, use `docker images` or |
| CrashLoopBackOff | Check CrashLoopBackOff logs, verify network policies |
| Database connection failed | Check credentials, network connectivity |
| High memory usage | Increase resource limits, check for memory leaks |
| Slow response times | Check resource allocation, enable caching |
| GPU not available | Check node labels, GPU operator status |
| TLS certificate issues | Verify cert-manager is running, check certificate |

### Useful Commands
```bash
# View all resources
kubectl get all -n spreadsheet-moment

# View pods
kubectl get pods -n spreadsheet-moment

# View logs
kubectl logs -f deployment/graphql-api -n spreadsheet-moment

# Describe pods
kubectl describe pod <pod-name> -n spreadsheet-moment

# Execute into pod
kubectl exec -it <pod-name> -n spreadsheet-moment -- /bin/sh

# Port forward
kubectl port-forward deployment/graphql-api 4000 -n spreadsheet-moment

# View events
kubectl get events -n spreadsheet-moment --sort-by='.lastseen'

# Check resource usage
kubectl top pods -n spreadsheet-moment

# Scale deployment
kubectl scale deployment graphql-api --replicas=5 -n spreadsheet-moment
```

## Security Checklist

- [ ] All secrets are from external secret stores
- [ ] Network policies are applied
- [ ] RBAC is configured
- [ ] Pod Security Standards are enforced
- [ ] TLS is enabled for all ingress
- [ ] Container images are scanned
- [ ] Resource limits are set
- [ ] Health checks are configured

- [ ] Non-root user is used
- [ ] Read-only filesystem where possible

- [ ] Privilege escalation is disabled
- [ ] Capabilities are dropped

- [ ] Service mesh is configured (if applicable)

- [ ] Audit logging is enabled

## Maintenance

### Backup

```bash
# Backup PostgreSQL
kubectl exec -it postgres-0 -n spreadsheet-moment -- pg_dump -U spreadsheet spreadsheet_moment > backup.sql

# Backup Redis
kubectl exec -it redis-0 -n spreadsheet-moment -- redis-cli BGSAVE

# Backup volumes
kubectl exec -it minio-0 -n spreadsheet-moment -- mc mirror backup /data /backup-bucket
```

### Updates
```bash
# Update deployment image
kubectl set image deployment/graphql-api spreadsheet-moment/graphql-api:v1.2.0 -n spreadsheet-moment

# Rolling restart
kubectl rollout restart deployment/graphql-api -n spreadsheet-moment

# View rollout status
kubectl rollout status deployment/graphql-api -n spreadsheet-moment

# Rollback if needed
kubectl rollout undo deployment/graphql-api -n spreadsheet-moment
```

### Scaling
```bash
# Manual scale
kubectl scale deployment graphql-api --replicas=5 -n spreadsheet-moment

# Auto-scale status
kubectl get hpa -n spreadsheet-moment
```

## License

Apache License 2.0

## Support

- GitHub Issues: https://github.com/SuperInstance/polln/issues
- Email: support@superinstance.ai
- Documentation: https://github.com/SuperInstance/polln/tree/main/deployment/kubernetes/spreadsheet-moment/README.md

---

**Last Updated:** 2026-03-14
**Version:** 1.0.0
**Status:** Production Ready
