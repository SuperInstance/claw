# Runbook: Service Down

**Alert:** `ServiceDown`
**Severity:** Critical
**Component:** Uptime
**Team:** SRE

## Summary
A monitored service is not responding to health checks, indicating complete service failure.

## Symptoms
- Alert triggered: Service unreachable for 2 minutes
- Dashboard: https://monitoring.superinstance.ai/d/overview
- Service not responding to HTTP requests
- Health check failures

## Diagnosis

### Step 1: Verify Service Status
```bash
# Check if service is up
curl -I https://api.superinstance.ai/health

# Check service discovery
kubectl get svc -n superinstance

# Check pod status
kubectl get pods -n superinstance -l app=<service-name>
```

### Step 2: Check Pod Status
```bash
# Check pod status and events
kubectl describe pod <pod-name> -n superinstance

# Check pod logs
kubectl logs <pod-name> -n superinstance --tail=100

# Check previous pod logs if crashed
kubectl logs <pod-name> -n superinstance --previous
```

### Step 3: Check Node Status
```bash
# Check node health
kubectl get nodes

# Check node issues
kubectl describe node <node-name>
```

### Step 4: Check Network Connectivity
```bash
# Check network policies
kubectl get networkpolicies -n superinstance

# Check service endpoints
kubectl get endpoints <service-name> -n superinstance

# Check ingress
kubectl get ingress -n superinstance
```

## Resolution

### Scenario 1: Pod CrashLooping
**Symptoms:** Pod restarting repeatedly

**Actions:**
1. Check pod logs for errors
2. Verify configuration is correct
3. Check resource limits
4. Fix configuration issue

```bash
# View pod logs
kubectl logs <pod-name> -n superinstance --tail=200 -f

# Check pod resources
kubectl describe pod <pod-name> -n superinstance | grep -A 5 "Limits\|Requests"
```

### Scenario 2: Out of Resources
**Symptoms:** Pod in Pending state due to insufficient resources

**Actions:**
1. Check available resources
2. Add more nodes to cluster
3. Reduce resource requests
4. Delete evicted pods

```bash
# Check cluster capacity
kubectl top nodes

# Scale cluster up (example for EKS)
aws eks update-nodegroup-version --cluster-name superinstance --nodegroup-name managed-ng --version latest

# Clear evicted pods
kubectl delete pods --field-selector=status.phase=Failed -n superinstance
```

### Scenario 3: Application Error
**Symptoms:** Application failing to start

**Actions:**
1. Check application logs
2. Verify environment variables
3. Check secrets and configmaps
4. Rollback recent deployment

```bash
# Rollback deployment
kubectl rollout undo deployment/<deployment-name> -n superinstance

# Check environment variables
kubectl exec -it <pod-name> -n superinstance -- env | sort
```

### Scenario 4: Network Issue
**Symptoms:** Service not reachable despite healthy pods

**Actions:**
1. Check network policies
2. Verify service selector
3. Check ingress configuration
4. Test network connectivity

```bash
# Test from within cluster
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://<service-name>:<port>

# Check service selector
kubectl get svc <service-name> -n superinstance -o yaml | grep selector -A 2
```

### Scenario 5: Database Dependency
**Symptoms:** Service failing due to database unavailability

**Actions:**
1. Check database status
2. Verify database connectivity
3. Check database credentials
4. Wait for database recovery

```bash
# Check PostgreSQL
kubectl exec -n superinstance postgres-0 -- pg_isready

# Check Redis
kubectl exec -n superinstance redis-0 -- redis-cli ping
```

## Recovery Procedures

### Restart Service
```bash
# Restart deployment
kubectl rollout restart deployment/<deployment-name> -n superinstance

# Restart statefulset
kubectl rollout restart statefulset/<statefulset-name> -n superinstance
```

### Force Delete Pods
```bash
# Force delete stuck pods
kubectl delete pod <pod-name> -n superinstance --force --grace-period=0
```

### Scale to Zero and Back
```bash
# Scale to zero
kubectl scale deployment/<deployment-name> --replicas=0 -n superinstance

# Scale back up
kubectl scale deployment/<deployment-name> --replicas=<original-count> -n superinstance
```

### Emergency Debug Pod
```bash
# Create debug pod
kubectl run debug-shell --image=nicolaka/netshoot --rm -it --restart=Never -- /bin/bash
```

## Prevention

### High Availability
1. Run multiple replicas
2. Use pod disruption budgets
3. Implement horizontal pod autoscaling
4. Use anti-affinity rules

```yaml
# Example: Pod Disruption Budget
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: superinstance-api
```

### Health Checks
1. Implement proper liveness and readiness probes
2. Use startup probes for slow-starting apps
3. Configure appropriate timeouts and thresholds

### Resource Management
1. Set appropriate resource requests and limits
2. Use cluster autoscaler
3. Implement priority classes
4. Regular capacity planning

## Escalation
- **Immediate:** Page on-call engineer
- **15 minutes:** Notify SRE team lead
- **30 minutes:** Notify engineering manager
- **1 hour:** Consider incident response team activation

## Related Runbooks
- [Pod Not Ready](./kubernetes-pod-not-ready.md)
- [Database Connection Errors](./database-connection-errors.md)
- [High CPU Usage](./infrastructure-high-cpu.md)
