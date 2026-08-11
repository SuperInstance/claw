# Deployment Guide

Comprehensive deployment guide for SuperInstance example applications.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js:** 18.x or 20.x
- **Docker:** 20.x or later
- **Kubernetes:** 1.25+ (for K8s deployment)
- **PostgreSQL:** 14+ (for some examples)
- **Redis:** 7+ (for caching)

### Required Accounts

- **Docker Hub:** For container images
- **GitHub:** For CI/CD
- **Cloud Provider:** AWS/GCP/Azure (optional)

### Environment Variables

Create a `.env` file:

```env
# SuperInstance Services
CLAW_ENDPOINT=ws://localhost:8080
GEO_ENDPOINT=http://localhost:3001
SPREADSHEET_ENDPOINT=http://localhost:3002

# Authentication
CLAW_API_KEY=your-api-key-here
JWT_SECRET=your-jwt-secret-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/SuperInstance/superinstance-examples-apps.git
cd superinstance-examples-apps
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start SuperInstance Services

```bash
# In separate terminals

# Claw service
cd ../claw
cargo run

# ConstraintTheory service
cd ../constrainttheory
npm start

# Spreadsheet-Moment service
cd ../spreadsheet-moment
npm start
```

### 4. Run Examples

```bash
# Analytics Dashboard
cd examples/analytics-dashboard
npm run dev

# Collaborative Planner
cd examples/collaborative-planner
npm run dev

# etc.
```

## Docker Deployment

### 1. Build Images

```bash
# Build all examples
npm run docker:build

# Build specific example
cd examples/analytics-dashboard
docker build -t analytics-dashboard .
```

### 2. Run with Docker Compose

```bash
# Run all services
docker-compose up -d

# Run specific example
cd examples/analytics-dashboard
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Docker Compose Override

Create `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  analytics-dashboard:
    environment:
      - NODE_ENV=production
      - CLAW_API_KEY=${CLAW_API_KEY}
    ports:
      - "80:3000"
    restart: always

  claw-service:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

### 4. Health Checks

```yaml
services:
  analytics-dashboard:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace superinstance
```

### 2. Create Secrets

```bash
# API key secret
kubectl create secret generic claw-api-key \
  --from-literal=api-key=your-api-key-here \
  -n superinstance

# Database secret
kubectl create secret generic database-credentials \
  --from-literal=url=postgresql://user:pass@host/db \
  -n superinstance
```

### 3. Deploy Services

```bash
# Apply all manifests
kubectl apply -f kubernetes/ -n superinstance

# Apply specific example
kubectl apply -f examples/analytics-dashboard/kubernetes/ -n superinstance
```

### 4. Sample Kubernetes Manifests

**Deployment:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: analytics-dashboard
  namespace: superinstance
spec:
  replicas: 3
  selector:
    matchLabels:
      app: analytics-dashboard
  template:
    metadata:
      labels:
        app: analytics-dashboard
    spec:
      containers:
      - name: analytics-dashboard
        image: superinstance/analytics-dashboard:latest
        ports:
        - containerPort: 3000
        env:
        - name: CLAW_API_KEY
          valueFrom:
            secretKeyRef:
              name: claw-api-key
              key: api-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Service:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: analytics-dashboard
  namespace: superinstance
spec:
  type: LoadBalancer
  selector:
    app: analytics-dashboard
  ports:
  - port: 80
    targetPort: 3000
```

**HorizontalPodAutoscaler:**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: analytics-dashboard-hpa
  namespace: superinstance
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: analytics-dashboard
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 5. Deploy Database

```bash
# PostgreSQL
kubectl apply -f kubernetes/postgres/ -n superinstance

# Redis
kubectl apply -f kubernetes/redis/ -n superinstance
```

### 6. Verify Deployment

```bash
# Check pods
kubectl get pods -n superinstance

# Check services
kubectl get services -n superinstance

# Check logs
kubectl logs -f deployment/analytics-dashboard -n superinstance

# Port forward (for testing)
kubectl port-forward svc/analytics-dashboard 3000:80 -n superinstance
```

## Cloud Deployment

### AWS Deployment

#### 1. EKS Cluster

```bash
# Create EKS cluster
eksctl create cluster \
  --name superinstance \
  --region us-west-2 \
  --nodes 3

# Deploy applications
kubectl apply -f kubernetes/ -n superinstance
```

#### 2. RDS Database

```bash
# Create PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier superinstance-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password password

# Get connection string
aws rds describe-db-instances \
  --db-instance-identifier superinstance-db
```

#### 3. ElastiCache Redis

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id superinstance-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1
```

### GCP Deployment

#### 1. GKE Cluster

```bash
# Create GKE cluster
gcloud container clusters create superinstance \
  --region us-central1 \
  --num-nodes 3

# Get credentials
gcloud container clusters get-credentials superinstance \
  --region us-central1

# Deploy applications
kubectl apply -f kubernetes/ -n superinstance
```

#### 2. Cloud SQL

```bash
# Create PostgreSQL instance
gcloud sql instances create superinstance-db \
  --tier db-f1-micro \
  --region us-central1 \
  --database-version POSTGRES_14

# Create database
gcloud sql databases create appdb \
  --instance superinstance-db
```

### Azure Deployment

#### 1. AKS Cluster

```bash
# Create resource group
az group create --name superinstance --location eastus

# Create AKS cluster
az aks create \
  --resource-group superinstance \
  --name superinstance-aks \
  --node-count 3 \
  --enable-managed-identity

# Get credentials
az aks get-credentials \
  --resource-group superinstance \
  --name superinstance-aks

# Deploy applications
kubectl apply -f kubernetes/ -n superinstance
```

## Monitoring

### 1. Prometheus Metrics

Add to application:

```typescript
import { Counter, Histogram, Gauge } from 'prom-client';

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route']
});

const activeAgents = new Gauge({
  name: 'active_agents',
  help: 'Number of active agents'
});
```

### 2. Grafana Dashboards

Import dashboard configurations from `kubernetes/grafana/`.

### 3. Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

### 4. Distributed Tracing

```typescript
import * as opentelemetry from '@opentelemetry/api';

const tracer = opentelemetry.trace.getTracer('app-name');

const span = tracer.startSpan('operation-name');
try {
  // Do work
} finally {
  span.end();
}
```

## Troubleshooting

### Common Issues

#### 1. Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n superinstance

# Common causes:
# - Image pull errors (check credentials)
# - Resource limits (increase requests/limits)
# - Config errors (check env vars, secrets)
```

#### 2. High Memory Usage

```bash
# Check memory usage
kubectl top pods -n superinstance

# Solutions:
# - Increase memory limits
# - Reduce agent count
# - Enable memory optimization
```

#### 3. Connection Refused

```bash
# Check service endpoints
kubectl get endpoints -n superinstance

# Check service connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- sh
# Inside pod:
wget -O- http://service-name:port/health
```

#### 4. Database Connection Issues

```bash
# Check database state
kubectl exec -it postgres-0 -n superinstance -- psql -U admin

# Test connection
kubectl run -it --rm psql --image=postgres:14 --restart=Never -- \
  psql postgresql://user:pass@host/db
```

### Debug Commands

```bash
# View logs
kubectl logs -f deployment/<name> -n superinstance

# Execute in pod
kubectl exec -it <pod-name> -n superinstance -- sh

# Port forward
kubectl port-forward svc/<service-name> 3000:80 -n superinstance

# Check events
kubectl get events -n superinstance --sort-by='.lastTimestamp'
```

### Performance Tuning

#### 1. Agent Pool Size

```typescript
// Adjust based on load
const pool = new AgentPool({
  min: 100,
  max: 2000,
  acquireTimeout: 30000
});
```

#### 2. Database Connection Pool

```typescript
const pool = new Pool({
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

#### 3. Redis Configuration

```yaml
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
```

## Backup and Recovery

### Database Backup

```bash
# PostgreSQL backup
kubectl exec -it postgres-0 -n superinstance -- \
  pg_dump -U admin appdb > backup.sql

# Restore
kubectl exec -i postgres-0 -n superinstance -- \
  psql -U admin appdb < backup.sql
```

### Redis Backup

```bash
# Trigger snapshot
kubectl exec -it redis-0 -n superinstance -- redis-cli BGSAVE

# Copy RDB file
kubectl cp superinstance/redis-0:/data/dump.rdb ./dump.rdb
```

## Security

### 1. Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: superinstance
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

### 2. Pod Security Policies

```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  runAsUser:
    rule: MustRunAsNonRoot
  seLinux:
    rule: RunAsAny
  fsGroup:
    rule: RunAsAny
```

### 3. Secrets Management

```bash
# Use sealed-secrets
kubectl create secret generic my-secret \
  --from-literal=password=mypassword \
  --dry-run=client \
  -o yaml | kubeseal -o yaml > sealed-secret.yaml

kubectl apply -f sealed-secret.yaml
```

## Rollback

```bash
# Rollback deployment
kubectl rollout undo deployment/analytics-dashboard -n superinstance

# View rollout history
kubectl rollout history deployment/analytics-dashboard -n superinstance

# Rollback to specific revision
kubectl rollout undo deployment/analytics-dashboard \
  --to-revision=2 -n superinstance
```

## Scaling

### Horizontal Pod Autoscaler

```bash
# Create HPA
kubectl autoscale deployment analytics-dashboard \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n superinstance

# Check HPA status
kubectl get hpa -n superinstance
```

### Cluster Autoscaler

```bash
# Enable cluster autoscaler (AWS)
eksctl utils enable-cluster-autoscaler \
  --name superinstance \
  --region us-west-2 \
  --asg-access
```

## Maintenance

### 1. Rolling Updates

```bash
# Update image
kubectl set image deployment/analytics-dashboard \
  analytics-dashboard=superinstance/analytics-dashboard:v2 \
  -n superinstance

# Check rollout status
kubectl rollout status deployment/analytics-dashboard -n superinstance
```

### 2. Drain Nodes

```bash
# Safely drain node for maintenance
kubectl drain node-name --ignore-daemonsets --delete-emptydir-data

# Uncordon after maintenance
kubectl uncordon node-name
```

### 3. Resource Cleanup

```bash
# Clean up old replicasets
kubectl delete replicasets -l app=analytics-dashboard -n superinstance

# Clean up completed jobs
kubectl delete jobs --field-selector status.successful=true -n superinstance
```

## Best Practices

1. **Always use namespaces** for environment isolation
2. **Set resource requests and limits** on all pods
3. **Use liveness and readiness probes** for health checks
4. **Implement rolling updates** for zero-downtime deployments
5. **Configure HPA** for automatic scaling
6. **Use secrets** for sensitive data
7. **Implement network policies** for security
8. **Monitor and log** everything
9. **Backup regularly** and test restores
10. **Document procedures** and runbooks
