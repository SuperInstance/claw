# Monitoring Runbooks Index

Spreadsheet Moment operational runbooks for common alert scenarios.

## Quick Reference

### Critical Alerts (Immediate Response Required)
- [Service Down](./service-down.md) - Complete service failure
- [High Error Rate](./api-high-error-rate.md) - API errors above 5%
- [Database Connection Errors](./database-connection-errors.md) - Database unavailable
- [Deployment Rollout Failed](./kubernetes-rollout-failed.md) - Deployment issues

### Warning Alerts (Monitor and Respond)
- [High Latency](./api-high-latency.md) - Slow response times
- [Worker Queue Full](./worker-queue-full.md) - Work backlog
- [GPU Temperature High](./worker-gpu-temperature.md) - Thermal issues
- [Slow Database Queries](./database-slow-queries.md) - Performance issues

### Info Alerts (Optimization Opportunities)
- [GPU Underutilized](./worker-gpu-underutilized.md) - Cost optimization
- [Low Request Rate](./api-low-request-rate.md) - Unusual traffic patterns

## Runbook Structure

Each runbook contains:
- **Alert Details**: Name, severity, component, team
- **Summary**: Quick description of the issue
- **Symptoms**: What to look for
- **Diagnosis**: Step-by-step investigation
- **Resolution**: Scenarios and solutions
- **Prevention**: Long-term mitigation strategies
- **Escalation**: When and who to notify

## Response Guidelines

### Critical Alert Response
1. **0-5 minutes**: Acknowledge alert, begin investigation
2. **5-15 minutes**: Identify root cause, implement workaround
3. **15-30 minutes**: Implement permanent fix or rollback
4. **30+ minutes**: Escalate if unresolved

### Warning Alert Response
1. **0-15 minutes**: Acknowledge alert, assess impact
2. **15-60 minutes**: Investigate and resolve
3. **60+ minutes**: Escalate if needed

### Info Alert Response
1. **Next business day**: Review and assess
2. **Weekly**: Address optimization opportunities

## Alert Severity Levels

### Critical (Red)
- Service completely down
- Data loss risk
- Security breach
- Major user impact

**Response Time**: < 5 minutes
**Escalation**: 15 minutes

### Warning (Yellow)
- Performance degradation
- Partial service impact
- Resource exhaustion imminent

**Response Time**: < 15 minutes
**Escalation**: 1 hour

### Info (Green)
- Optimization opportunities
- Informational events
- Trends and patterns

**Response Time**: Next business day
**Escalation**: Weekly review

## Common Commands

### Check Alert Status
```bash
# Check current alerts
curl -s "http://prometheus:9090/api/v1/alerts" | jq '.data.alerts[] | select(.state=="firing")'

# Check alert history
logcli query --addr="http://loki:3100" '{job="alertmanager"}' --since=1h
```

### Service Status
```bash
# Check all pods
kubectl get pods -n superinstance

# Check pod health
kubectl describe pod <pod-name> -n superinstance

# Check logs
kubectl logs <pod-name> -n superinstance --tail=100 -f
```

### Performance Metrics
```bash
# Query Prometheus
curl -s "http://prometheus:9090/api/v1/query?query=<metric-name>"

# Check error rate
curl -s "http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])"
```

## Communication Channels

### Slack
- `#critical-alerts` - Critical alerts only
- `#warnings` - Warning alerts
- `#info` - Informational alerts
- `#incidents` - Active incidents

### PagerDuty
- On-call rotation: 24/7/365
- Escalation policy: 15 min -> 30 min -> 1 hour

### Email
- `on-call@superinstance.ai` - On-call engineer
- `sre@superinstance.ai` - SRE team
- `backend@superinstance.ai` - Backend team
- `security@superinstance.ai` - Security team

## Dashboard Links

- [Overview](https://monitoring.superinstance.ai/d/overview)
- [API Performance](https://monitoring.superinstance.ai/d/api-performance)
- [Infrastructure](https://monitoring.superinstance.ai/d/infrastructure)
- [Database](https://monitoring.superinstance.ai/d/database)
- [GPU Monitoring](https://monitoring.superinstance.ai/d/gpu-monitoring)
- [Alert History](https://monitoring.superinstance.ai/d/alert-history)

## Incident Response

### Incident Declaration
An incident is declared when:
1. Critical alert fires for > 15 minutes
2. Multiple users report the same issue
3. Estimated user impact > 25% of traffic
4. Data loss or security breach detected

### Incident Roles
- **Incident Commander**: Coordinates response
- **Communications Lead**: Manages user communication
- **Technical Lead**: Leads technical investigation
- **Scribe**: Documents all actions

### Post-Incident Process
1. Complete incident timeline
2. Identify root cause
3. Create remediation tickets
4. Schedule blameless postmortem
5. Update runbooks

## Training

All on-call engineers should:
1. Review all critical runbooks
2. Participate in game days
3. Complete shadow shifts
4. Document new procedures

## Maintenance

Runbooks should be updated:
- After every incident
- When new alerts are added
- When procedures change
- Quarterly review scheduled

## Contact

For runbook questions or updates:
- SRE Team: sre@superinstance.ai
- Runbook Repository: https://github.com/SuperInstance/runbooks
- Runbook Issues: https://github.com/SuperInstance/runbooks/issues

---

**Last Updated**: 2026-03-15
**Version**: 1.0
**Maintained By**: SRE Team
