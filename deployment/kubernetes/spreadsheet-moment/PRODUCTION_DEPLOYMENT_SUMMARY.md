# Spreadsheet Moment - Production Kubernetes Deployment Summary

# Deployment Date: 2026-03-15
# Status: Production Ready
# Cluster: Kubernetes 1.25+

## Overview

This document provides a comprehensive summary of the Spreadsheet Moment platform deployment to Kubernetes with GPU support. The deployment follows GitOps principles and cloud-native best practices.

---

## Architecture Summary

### Namespace Structure

| Namespace | Purpose | Resource Quota |
|-----------|---------|-----------------|
| `spreadsheet-moment` | Application services | 20 CPU, 40Gi RAM, 50 pods |
| `monitoring` | Observability stack | 4 CPU, 8Gi RAM, 10 pods |
| `gpu-operator` | NVIDIA GPU management | Managed by operator |
| `keda` | Event-driven autoscaling | Managed by KEDA |

### Services Deployed

| Service | Replicas | Resources | HPA | Description |
|---------|----------|-----------|-----|-------------|
| graphql-api | 3-20 | 512Mi-2Gi RAM, 0.5-2 CPU | Yes | Main GraphQL API endpoint |
| analytics-service | 2-10 | 1Gi-4Gi RAM, 1-4 CPU | Yes | Analytics and ML orchestration |
| subscription-service | 3-15 | 256Mi-1Gi RAM, 0.25-1 CPU | Yes | Real-time WebSocket subscriptions |
| community-service | 2-10 | 256Mi-1Gi RAM, 0.25-1 CPU | Yes | Community features and social |
| postgres | 3 (StatefulSet) | 1Gi-4Gi RAM, 0.5-2 CPU | No | PostgreSQL database cluster |
| redis | 1 | 256Mi-2Gi RAM, 0.1-1 CPU | No | Redis cache and pub/sub |
| minio | 2 | 512Mi-2Gi RAM, 0.25-1 CPU | No | S3-compatible object storage |
| ml-inference-service | 1-5 | 4Gi-16Gi RAM, 2-8 CPU, 1 GPU | KEDA | ML/AI inference with GPU |

### Monitoring Stack

| Component | Resources | Purpose |
|-----------|-----------|---------|
| Prometheus | 512Mi-2Gi RAM, 0.25-1 CPU | Time-series metrics collection |
| Grafana | 256Mi-512Mi RAM, 0.1-0.5 CPU | Visualization dashboards |
| Alertmanager | 64Mi-128Mi RAM | Alert routing and notifications |

---

## Directory Structure

```
deployment/kubernetes/spreadsheet-moment/
├── base/
│   ├── namespace.yaml                    # Namespace, LimitRange, ResourceQuota
│   ├── configmap.yaml                    # Application configuration
│   ├── secrets.yaml                      # Secrets template (DO NOT COMMIT)
│   ├── production-secrets.yaml           # Production secrets template
│   └── persistent-volumes.yaml           # PVC definitions
├── services/
│   ├── graphql-api.yaml                  # GraphQL API deployment + HPA + PDB
│   ├── analytics.yaml                    # Analytics service + HPA + PDB
│   ├── subscription.yaml                 # WebSocket subscription service
│   ├── community.yaml                     # Community features service
│   ├── databases.yaml                     # PostgreSQL StatefulSet + exporter
│   ├── redis.yaml                         # Redis deployment + exporter
│   └── minio.yaml                          # MinIO object storage
├── gpu/
│   ├── gpu-node-pool.yaml                # GPU deployment with node selector
│   └── gpu-autoscaling.yaml               # KEDA ScaledObject for GPU scaling
├── ingress/
│   └── ingress.yaml                       # Ingress with TLS (cert-manager)
├── network-policies/
│   └── network-policies.yaml              # Zero-trust network policies
├── monitoring/
│   └── monitoring-stack.yaml              # Prometheus, Grafana, Alertmanager
├── scripts/
│   ├── generate-secrets.sh               # Secure secrets generator
│   └── deploy-production.sh               # Main deployment script
└── README.md                              # Documentation
```

---

## Deployment Instructions

### Prerequisites

1. Kubernetes cluster 1.25+ with kubectl configured
2. Helm 3.x (optional but recommended)
3. NVIDIA GPU Operator (for GPU workloads)
4. KEDA (for event-driven autoscaling)
5. cert-manager (for TLS certificates)
6. Prometheus Operator (for monitoring stack)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/SuperInstance/polln.git
cd polln/deployment/kubernetes/spreadsheet-moment

# 2. Generate secure secrets
./scripts/generate-secrets.sh

# 3. Update secrets with production values
kubectl edit secret spreadsheet-moment-secrets -n spreadsheet-moment

# 4. Deploy the platform
./scripts/deploy-production.sh --gpu --monitoring

# 5. Verify deployment
kubectl get pods -n spreadsheet-moment
kubectl get pods -n monitoring
```

### Step-by-Step Deployment

```bash
# 1. Create namespace andkubectl apply -f base/namespace.yaml

# 2. Create ConfigMaps
kubectl apply -f base/configmap.yaml

# 3. Create secrets (update with real values first!)
kubectl apply -f base/secrets.yaml

# 4. Create persistent volume claims
kubectl apply -f base/persistent-volumes.yaml

# 5. Deploy databases (PostgreSQL)
kubectl apply -f services/databases.yaml

# 6. Deploy Redis cache
kubectl apply -f services/redis.yaml

# 7. Deploy MinIO object storage
kubectl apply -f services/minio.yaml

# 8. Deploy application services
kubectl apply -f services/graphql-api.yaml
kubectl apply -f services/analytics.yaml
kubectl apply -f services/subscription.yaml
kubectl apply -f services/community.yaml

# 9. Deploy GPU services (if applicable)
kubectl apply -f gpu/gpu-node-pool.yaml
kubectl apply -f gpu/gpu-autoscaling.yaml

# 10. Deploy network policies
kubectl apply -f network-policies/network-policies.yaml

# 11. Deploy ingress with TLS
kubectl apply -f ingress/ingress.yaml

# 12. Deploy monitoring stack
kubectl apply -f monitoring/monitoring-stack.yaml
```

---

## Configuration

### Environment Variables

| Variable | Description | Default | Source |
|----------|-------------|---------|--------|
| NODE_ENV | Environment | production | ConfigMap |
| LOG_LEVEL | Logging level | info | ConfigMap |
| DATABASE_URL | PostgreSQL connection | - | Secret |
| REDIS_URL | Redis connection | - | Secret |
| JWT_SECRET | JWT signing secret | - | Secret |
| NVIDIA_VISIBLE_DEVICES | GPU devices | all | ConfigMap |

### Secrets Management

**IMPORTANT**: Never commit real secrets to version control. Use one of the following methods:

#### Option 1: External Secrets Operator (Recommended)
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: spreadsheet-moment-secrets
  namespace: spreadsheet-moment
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: ClusterSecretStore
  target:
    name: spreadsheet-moment-secrets
  dataFrom:
    - extract:
        key: spreadsheet-moment/production
```

#### Option 2: Sealed Secrets
```bash
# Install Sealed Secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Create sealed secret
kubeseal --format=yaml < base/secrets.yaml > base/sealed-secret.yaml
```

#### Option 3: HashiCorp Vault
```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: vault-secrets
spec:
  provider: vault
  parameters:
    vaultAddress: "https://vault.example.com"
```

---

## Horizontal Pod Autoscaling

### HPA Configuration

| Service | Min Replicas | Max Replicas | CPU Target | Memory Target |
|---------|-------------|--------------|------------|----------------|
| graphql-api | 3 | 20 | 70% | 80% |
| analytics-service | 2 | 10 | 75% | 80% |
| subscription-service | 3 | 15 | 70% | 80% |
| community-service | 2 | 10 | 70% | 80% |

### GPU Autoscaling (KEDA)

The ML Inference service uses KEDA for event-driven autoscaling based on:
        - Queue depth in Redis
        - GPU utilization metrics
        - Request latency

---

## Network Policies

Zero-trust network segmentation is implemented:

### Default Policy
- Deny all ingress/egress by default
- Allow DNS resolution

### Service-Specific Policies
- graphql-api-policy: Allow ingress -> API, API -> DB/Redis/MinIO/Analytics
- analytics-service-policy: Allow API -> Analytics, Analytics -> DB/Redis/ML-Inference
- subscription-service-policy: Allow ingress -> Subscription, Subscription -> DB/Redis
- community-service-policy: Allow API -> Community, Community -> DB/Redis
- ml-inference-policy: Allow Analytics -> ML-Inference, ML-Inference -> DB/Redis/MinIO
- monitoring-policy: Allow monitoring namespace -> all pods for scraping

---

## Ingress Configuration

### Hosts
- api.spreadsheet-moment.io - GraphQL API
- ws.spreadsheet-moment.io - WebSocket/Subscription
- internal.spreadsheet-moment.io - Internal services (restricted)

### TLS
- Managed by cert-manager with Let's Encrypt
- ClusterIssuer: letsencrypt-prod
- Automatic certificate provisioning

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy: default-src 'self'

---

## Monitoring

### Prometheus Alerts

| Alert | Severity | Description |
|-------|----------|-------------|
| HighErrorRate | Warning | Error rate above 10% |
| ServiceDown | Critical | Service unreachable |
| HighMemoryUsage | Warning | Memory above 90% |
| DatabaseConnectionFailed | Critical | PostgreSQL unreachable |
| RedisConnectionFailed | Critical | Redis unreachable |
| HighGPUUtilization | Warning | GPU above 95% |

### Grafana Dashboards

1. **API Overview**: Request rate, response time, error rate
2. **Infrastructure Overview**: CPU, memory, network
3. **Database Overview**: Connections, queries, locks
4. **Cache Overview**: Redis metrics, hit rate
5. **GPU Overview**: GPU utilization, memory, temperature

---

## Backup and Recovery

### Database Backup
```bash
# PostgreSQL backup
kubectl exec -it postgres-0 -n spreadsheet-moment -- \
  pg_dump -U spreadsheet spreadsheet_moment > backup_$(date +%Y%m%d).sql

# Redis backup
kubectl exec -it redis-0 -n spreadsheet-moment -- redis-cli BGSAVE
```

### Disaster Recovery
- PostgreSQL: StatefulSet with 3 replicas, persistent storage
- Redis: AOF persistence enabled
- MinIO: Distributed mode with 2 replicas

---

## Operations Runbook

### Scaling

```bash
# Manual scale
kubectl scale deployment graphql-api --replicas=5 -n spreadsheet-moment

# Check HPA status
kubectl get hpa -n spreadsheet-moment
```

### Rolling Updates

```bash
# Update image
kubectl set image deployment/graphql-api \
  spreadsheet-moment/graphql-api:v1.2.0 \
  -n spreadsheet-moment

# Monitor rollout
kubectl rollout status deployment/graphql-api -n spreadsheet-moment

# Rollback if needed
kubectl rollout undo deployment/graphql-api -n spreadsheet-moment
```

### Troubleshooting

```bash
# View pod logs
kubectl logs -f deployment/graphql-api -n spreadsheet-moment

# Describe pod
kubectl describe pod <pod-name> -n spreadsheet-moment

# Execute into pod
kubectl exec -it <pod-name> -n spreadsheet-moment -- /bin/sh

# Port forward for debugging
kubectl port-forward deployment/graphql-api 4000:4000 -n spreadsheet-moment
```

---

## Security Checklist

- [x] All pods run as non-root user
- [x] Read-only root filesystem where possible
- [x] Privilege escalation disabled
- [x] All capabilities dropped
- [x] Network policies implemented
- [x] TLS enabled for all ingress
- [x] Secrets from external secret stores
- [x] Resource limits configured
- [x] Health checks configured
- [x] Pod Security Standards enforced

---

## Cost Optimization

### Resource Recommendations
- Use spot instances for non-critical workloads
- Implement cluster autoscaler for node scaling
- Use reserved instances for baseline capacity
- Monitor costs with KubeCost/OpenCost

### Right-Sizing
```bash
# View resource usage
kubectl top pods -n spreadsheet-moment

# View HPA recommendations
kubectl describe hpa graphql-api-hpa -n spreadsheet-moment
```

---

## Support

- GitHub Issues: https://github.com/SuperInstance/polln/issues
- Email: support@superinstance.ai
- Documentation: This file

---

**Last Updated:** 2026-03-15
**Version:** 1.0.0
**Status:** Production Ready
