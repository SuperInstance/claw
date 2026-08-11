# Monitoring Stack - Quick Start Guide

## Deploy Monitoring Stack

```bash
# Navigate to monitoring directory
cd deployment/monitoring

# Deploy all components
./deploy-monitoring.sh

# Verify deployment
kubectl get pods -n monitoring
kubectl get services -n monitoring
```

## Access Dashboards

### Port Forwarding (Quick Access)

```bash
# Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Open: http://localhost:3000
# Username: admin
# Password: <check secret monitoring-secrets>

# Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Open: http://localhost:9090

# Alertmanager
kubectl port-forward -n monitoring svc/alertmanager 9093:9093
# Open: http://localhost:9093
```

## Key Files

| Component | Configuration | Location |
|-----------|--------------|----------|
| Prometheus | `prometheus.yml` | `prometheus/prometheus.yml` |
| Alert Rules | `comprehensive-alerts.yml` | `prometheus/rules/` |
| Alertmanager | `alertmanager.yml` | `alertmanager/` |
| Grafana Dashboards | `*.json` | `grafana/dashboards/` |
| Loki | `loki-config.yaml` | `loki/` |
| Jaeger | `jaeger-config.yaml` | `jaeger/` |
| Blackbox | `blackbox.yml` | `blackbox/` |

## Update Production Secrets

```bash
kubectl edit secret monitoring-secrets -n monitoring

# Update these values:
# - grafana-admin-password
# - smtp-password
# - pagerduty-service-key
# - slack-webhook-url
# - sentry-dsn
# - elasticsearch-password
```

## Test Alerts

```bash
# Trigger a test alert (raise CPU usage)
kubectl run test-stress --image=busybox --restart=OnFailure --command -- sh -c "yes > /dev/null"

# Clean up
kubectl delete pod test-stress
```

## Common Commands

```bash
# Check Prometheus targets
kubectl exec -n monitoring deployment/prometheus -- \
  wget -qO- http://localhost:9090/api/v1/targets | jq .

# View Prometheus rules
kubectl exec -n monitoring deployment/prometheus -- \
  wget -qO- http://localhost:9090/api/v1/rules | jq .

# Check Alertmanager alerts
kubectl exec -n monitoring deployment/alertmanager -- \
  wget -qO- http://localhost:9093/api/v1/alerts | jq .

# View logs from Loki
logcli query --addr="http://localhost:3100" '{level="error"}' --since=1h

# Query Prometheus
curl -G http://localhost:9090/api/v1/query --data-urlencode 'query=up'
```

## Troubleshooting

### Pod Not Starting
```bash
kubectl describe pod <pod-name> -n monitoring
kubectl logs <pod-name> -n monitoring
```

### Configuration Not Loading
```bash
# Restart Prometheus
kubectl rollout restart deployment/prometheus -n monitoring

# Restart Alertmanager
kubectl rollout restart deployment/alertmanager -n monitoring
```

### Grafana Dashboard Not Showing Data
```bash
# Check datasource
kubectl exec -n monitoring deployment/grafana -- \
  curl -s http://admin:PASSWORD@localhost:3000/api/datasources

# Verify Prometheus is accessible
kubectl exec -n monitoring deployment/grafana -- \
  wget -qO- http://prometheus:9090/api/v1/query?query=up
```

## Dashboards Overview

1. **Overview Dashboard** - System health at a glance
2. **API Performance** - Request metrics, latency, errors
3. **Infrastructure** - CPU, memory, disk, network
4. **Database** - PostgreSQL and Redis metrics
5. **GPU Monitoring** - GPU utilization, memory, temperature
6. **Alert History** - Alert trends and status

## Alert Severity

- **Critical** (Red): Immediate action required (< 5 min response)
- **Warning** (Yellow): Monitor and investigate (< 15 min response)
- **Info** (Green): Optimization opportunity (next business day)

## Support

- **Runbooks:** `deployment/monitoring/runbooks/`
- **Full Report:** `deployment/monitoring/MONITORING_SETUP_REPORT.md`
- **SRE Team:** sre@superinstance.ai
- **On-Call:** on-call@superinstance.ai

## Next Steps

1. Update production secrets
2. Configure notification channels (Slack, PagerDuty)
3. Customize alerting thresholds
4. Review and tune dashboards
5. Read runbooks for common scenarios
6. Set up Ingress for external access

---

**For detailed information, see:** `MONITORING_SETUP_REPORT.md`
