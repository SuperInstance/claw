# Runbook: GPU Underutilized

**Alert:** `GPUUnderutilized`
**Severity:** Info
**Component:** Worker
**Team:** Infrastructure

## Summary
GPU utilization is below 30% for extended period, indicating potential cost optimization opportunity.

## Symptoms
- Alert triggered: GPU utilization < 30% for 20 minutes
- Dashboard: https://monitoring.superinstance.ai/d/gpu-monitoring
- GPUs sitting idle while incurring costs

## Diagnosis

### Step 1: Verify Alert
```bash
# Check current GPU utilization
curl -s "http://prometheus:9090/api/v1/query?query=avg(nvidia_gpu_utilization)"
```

### Step 2: Check Work Queue
```bash
# Check queue length
curl -s "http://prometheus:9090/api/v1/query?query=worker_queue_length"
```

### Step 3: Check Worker Status
```bash
# Check worker pods
kubectl get pods -n superinstance -l app=superinstance-worker

# Check worker logs
kubectl logs -n superinstance -l app=superinstance-worker --tail=100
```

### Step 4: Check Task Submission Rate
```bash
# Check task submission rate
curl -s "http://prometheus:9090/api/v1/query?query=rate(worker_tasks_total[5m])"
```

## Resolution

### Scenario 1: Natural Low Demand
**Symptoms:** Low queue length, low task submission rate

**Actions:**
1. Verify this is expected (night/weekend)
2. Consider autoscaling configuration
3. Document for capacity planning

```bash
# Check if autoscaling is enabled
kubectl get hpa -n superinstance
```

### Scenario 2: Worker Not Processing Tasks
**Symptoms:** Tasks in queue but not being processed

**Actions:**
1. Check worker logs for errors
2. Verify worker is connected to queue
3. Restart worker if needed

```bash
# Restart worker pods
kubectl rollout restart statefulset/superinstance-worker -n superinstance
```

### Scenario 3: GPU Configuration Issue
**Symptoms:** Worker running but not using GPU

**Actions:**
1. Verify GPU is accessible
2. Check GPU device permissions
3. Verify application is using GPU

```bash
# Check GPU availability in pods
kubectl exec -n superinstance -l app=superinstance-worker -- nvidia-smi
```

### Scenario 4: Over-provisioned Infrastructure
**Symptoms:** Consistent low utilization across all workers

**Actions:**
1. Analyze utilization patterns over time
2. Reduce worker replicas
3. Consider spot instances for cost savings
4. Implement aggressive autoscaling

```bash
# Scale down workers
kubectl scale statefulset/superinstance-worker --replicas=1 -n superinstance

# Or update HPA
kubectl patch hpa superinstance-worker -n superinstance -p '{"spec":{"minReplicas":1}}'
```

## Cost Optimization

### Immediate Actions
1. Scale down to minimum viable workers
2. Enable cluster autoscaler
3. Use spot instances for non-critical workloads

### Long-term Strategy
1. Implement predictive autoscaling
2. Schedule-based scaling for known patterns
3. Consider serverless for sporadic workloads
4. Implement rightsizing recommendations

## Prevention

### Monitoring
1. Add utilization trend alerts
2. Implement cost anomaly detection
3. Regular capacity planning reviews

### Automation
1. Automated scaling based on queue length
2. Scheduled scaling for known patterns
3. Cost optimization bots

## Escalation
- **1 hour:** Notify infrastructure team lead
- **4 hours:** Consider cost optimization meeting

## Related Runbooks
- [Worker Queue Full](./worker-queue-full.md)
- [High GPU Memory](./worker-high-gpu-memory.md)
- [GPU Temperature High](./worker-gpu-temperature.md)
