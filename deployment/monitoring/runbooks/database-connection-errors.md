# Runbook: Database Connection Errors

**Alert:** `PostgresConnectionPoolExhausted` or `RedisConnectionErrors`
**Severity:** Critical
**Component:** Database
**Team:** Backend

## Summary
Database connection pool is exhausted or experiencing high error rates, causing service degradation.

## Symptoms
- Alert triggered: Connection usage > 90% or error rate > 10/sec
- Dashboard: https://monitoring.superinstance.ai/d/database-performance
- Application errors related to database connections
- Slow or failed database queries

## Diagnosis

### Step 1: Check Connection Count
```bash
# PostgreSQL connections
curl -s "http://prometheus:9090/api/v1/query?query=pg_stat_activity_count"
curl -s "http://prometheus:9090/api/v1/query?query=pg_settings_max_connections"

# Redis connections
curl -s "http://prometheus:9090/api/v1/query?query=redis_connected_clients"
```

### Step 2: Check Database Performance
```bash
# Check slow queries
curl -s "http://prometheus:9090/api/v1/query?query=rate(pg_stat_statements_mean_exec_time_ms[5m])"

# Check cache hit ratio
curl -s "http://prometheus:9090/api/v1/query?query=(sum(pg_stat_database_blks_hit)/(sum(pg_stat_database_blks_hit)+sum(pg_stat_database_blks_read)))*100"
```

### Step 3: Check Application Logs
```bash
# Query for connection errors
logcli query --addr="http://loki:3100" '{msg=~".*connection.*error.*"}' --since=5m
```

### Step 4: Check Database Metrics
```bash
# PostgreSQL
kubectl exec -n superinstance postgres-0 -- psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Redis
kubectl exec -n superinstance redis-0 -- redis-cli INFO clients
```

## Resolution

### Scenario 1: Connection Leak
**Symptoms:** Connections increasing over time, never released

**Actions:**
1. Identify long-running connections
2. Check application code for connection handling
3. Restart application to release connections
4. Implement connection timeout

```sql
-- Find long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

```bash
# Kill long-running queries
kubectl exec -n superinstance postgres-0 -- psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND (now() - query_start) > interval '10 minutes';"
```

### Scenario 2: Insufficient Connection Pool Size
**Symptoms:** All connections used consistently

**Actions:**
1. Increase max_connections in PostgreSQL
2. Increase connection pool size in application
3. Add more database replicas

```bash
# Scale PostgreSQL replicas
kubectl scale statefulset postgres --replicas=3 -n superinstance

# Update config to increase max connections
kubectl edit configmap postgres-config -n superinstance
```

### Scenario 3: Slow Queries Causing Backlog
**Symptoms:** Many queries waiting, high execution time

**Actions:**
1. Identify slow queries
2. Add missing indexes
3. Optimize query performance
4. Enable query caching

```sql
-- Find slow queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Scenario 4: Database Overload
**Symptoms:** High CPU, memory, or disk usage

**Actions:**
1. Check database resource usage
2. Scale up database resources
3. Implement read replicas
4. Partition large tables

```bash
# Check database pod resources
kubectl top pod -n superinstance -l app=postgres

# Increase resource limits
kubectl patch statefulset postgres -n superinstance -p '{"spec":{"template":{"spec":{"containers":[{"name":"postgres","resources":{"limits":{"memory":"8Gi","cpu":"4"}}}]}}}}'
```

### Scenario 5: Redis Memory Full
**Symptoms:** Redis out of memory, evicting keys

**Actions:**
1. Check Redis memory usage
2. Increase Redis memory limit
3. Implement Redis clustering
4. Review data retention policies

```bash
# Check Redis memory
kubectl exec -n superinstance redis-0 -- redis-cli INFO memory

# Increase memory limit
kubectl patch deployment redis -n superinstance -p '{"spec":{"template":{"spec":{"containers":[{"name":"redis","resources":{"limits":{"memory":"4Gi"}}}]}}}}'
```

## Prevention

### Connection Management
1. Implement connection pooling in application
2. Set connection timeouts
3. Use pgbouncer for PostgreSQL
4. Implement connection health checks

### Performance Optimization
1. Regular query performance reviews
2. Index optimization
3. Query caching strategy
4. Database maintenance (VACUUM, ANALYZE)

### Monitoring
1. Connection usage alerts
2. Slow query alerts
3. Cache hit ratio monitoring
4. Connection trend analysis

## Escalation
- **15 minutes:** Notify database team
- **30 minutes:** Consider database failover
- **1 hour:** Consider incident response team

## Related Runbooks
- [High Error Rate](./api-high-error-rate.md)
- [Slow PostgreSQL Queries](./database-slow-queries.md)
- [Redis Memory High](./database-redis-memory.md)
