# Runbook: High Error Rate

**Alert:** `HighErrorRate`
**Severity:** Critical
**Component:** API
**Team:** Backend

## Summary
Error rate is above 5% for one or more API endpoints, indicating significant service degradation.

## Symptoms
- Alert triggered: Error rate > 5% for 5 minutes
- Dashboard: https://monitoring.superinstance.ai/d/api-performance
- Grafana shows spike in 5xx errors
- User reports of failed requests

## Diagnosis

### Step 1: Verify Alert
```bash
# Check current error rate
curl -s "http://prometheus:9090/api/v1/query?query=$(curl -s -G 'http://prometheus:9090/api/v1/query' --data-urlencode 'query=sum(rate(http_requests_total{status=~"5.."}[5m]))/sum(rate(http_requests_total[5m]))')"
```

### Step 2: Check Grafana Dashboard
- Navigate to API Performance Dashboard
- Identify which endpoints are failing
- Check error distribution by status code

### Step 3: Check Application Logs
```bash
# Query Loki for errors
logcli query --addr="http://loki:3100" '{level="error", job="superinstance-api"}' --since=5m
```

### Step 4: Check Sentry
- Navigate to Sentry dashboard
- Review recent errors
- Identify common error patterns

### Step 5: Check Database Health
```bash
# Check PostgreSQL connections
curl -s "http://prometheus:9090/api/v1/query?query=pg_stat_activity_count"
curl -s "http://prometheus:9090/api/v1/query?query=pg_settings_max_connections"
```

### Step 6: Check Redis Health
```bash
# Check Redis connections
curl -s "http://prometheus:9090/api/v1/query?query=redis_connected_clients"
```

## Resolution

### Scenario 1: Database Connection Issues
**Symptoms:** Database-related errors in logs, high connection count

**Actions:**
1. Check database connection pool
2. Verify database is not overloaded
3. Check for long-running queries
4. Scale database if needed

```bash
# Scale PostgreSQL
kubectl scale statefulset postgres --replicas=3 -n superinstance
```

### Scenario 2: Memory Issues
**Symptoms:** OOM errors, high memory usage

**Actions:**
1. Check memory metrics
2. Restart affected pods
3. Increase memory limits

```bash
# Restart API pods
kubectl rollout restart deployment/superinstance-api -n superinstance
```

### Scenario 3: Application Bug
**Symptoms:** Specific endpoints failing, stack traces in logs

**Actions:**
1. Identify the failing endpoint
2. Check Sentry for error details
3. Rollback recent deployment if needed
4. Create bug ticket for fix

```bash
# Rollback deployment
kubectl rollout undo deployment/superinstance-api -n superinstance
```

### Scenario 4: External Dependency Failure
**Symptoms:** Timeout errors, 3rd-party API failures

**Actions:**
1. Check external service status
2. Enable fallback behavior
3. Increase timeout values
4. Contact external service provider

## Prevention

### Short-term
1. Add more specific alerts for individual endpoints
2. Implement circuit breakers for external dependencies
3. Add request validation

### Long-term
1. Implement comprehensive error handling
2. Add automated testing for error scenarios
3. Improve graceful degradation
4. Implement request queuing for overload scenarios

## Escalation
- **15 minutes:** Notify backend team lead
- **30 minutes:** Notify engineering manager
- **1 hour:** Consider incident response team activation

## Related Runbooks
- [Critical Latency](./api-critical-latency.md)
- [Service Down](./uptime-service-down.md)
- [Database Connection Errors](./database-connection-errors.md)
