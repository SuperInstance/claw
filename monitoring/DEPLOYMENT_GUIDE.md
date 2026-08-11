# Spreadsheet Moment - Monitoring Deployment Guide

Complete guide for deploying and configuring the monitoring stack for production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Production Deployment](#production-deployment)
3. [Configuration](#configuration)
4. [Testing](#testing)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

### Infrastructure Requirements

- [ ] Server with minimum 8GB RAM (16GB recommended)
- [ ] 100GB disk space for monitoring data
- [ ] Docker 20.10+ and Docker Compose 2.0+
- [ ] Network connectivity between services
- [ ] Firewall rules configured for ports:
  - 3000 (Grafana)
  - 9090 (Prometheus)
  - 9093 (Alertmanager)
  - 3100 (Loki)
  - 8080 (cAdvisor)
  - 9100 (Node Exporter)

### Security Setup

- [ ] Change default Grafana admin password
- [ ] Configure SSL/TLS certificates
- [ ] Set up authentication (LDAP/OAuth)
- [ ] Configure firewall rules
- [ ] Set up VPN for access
- [ ] Configure Alertmanager webhooks securely
- [ ] Review and update alerting thresholds

### Alert Configuration

- [ ] Configure Slack webhook URL
- [ ] Set up PagerDuty integration
- [ ] Configure email settings
- [ ] Test alert delivery
- [ ] Create on-call schedules
- [ ] Document runbooks for common alerts

## Production Deployment

### Step 1: Environment Preparation

Create production environment file:

```bash
cat > .env.production << EOF
# Environment
ENVIRONMENT=production
CLUSTER_NAME=spreadsheet-moment-prod
REGION=us-east-1

# Grafana
GF_SECURITY_ADMIN_PASSWORD=your_secure_password
GF_SERVER_ROOT_URL=https://monitoring.spreadsheetmoment.com

# Alertmanager
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
PAGERDUTY_SERVICE_KEY=your_pagerduty_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@spreadsheetmoment.com
SMTP_PASSWORD=your_smtp_password

# Data Retention
PROMETHEUS_RETENTION=90d
LOKI_RETENTION=30d
EOF
```

### Step 2: Deploy Monitoring Stack

```bash
# Clone repository
git clone https://github.com/SuperInstance/polln.git
cd polln/monitoring

# Copy production environment
cp .env.production docker/.env

# Start services
cd docker
docker-compose -f docker-compose.yml --env-file ../.env.production up -d

# Verify deployment
docker-compose ps
```

### Step 3: Configure SSL/TLS

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --standalone -d monitoring.spreadsheetmoment.com

# Configure nginx reverse proxy
cat > /etc/nginx/sites-available/monitoring << EOF
server {
    listen 443 ssl http2;
    server_name monitoring.spreadsheetmoment.com;

    ssl_certificate /etc/letsencrypt/live/monitoring.spreadsheetmoment.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monitoring.spreadsheetmoment.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Configure Authentication

Enable LDAP authentication in Grafana:

```yaml
# grafana/provisioning/datasources/ldap.yml
apiVersion: 1

servers:
  - name: 'LDAP'
    host: 'ldap://ldap.spreadsheetmoment.com:389'
    bind_dn: 'cn=admin,dc=spreadsheetmoment,dc=com'
    bind_password: 'your_ldap_password'
    search_filter: '(sAMAccountName=%s)'
    search_base_dns: ['dc=spreadsheetmoment,dc=com']
    group_mappings:
      - group_dn: 'cn=grafana-admins,dc=spreadsheetmoment,dc=com'
        org_role: Admin
      - group_dn: 'cn=grafana-editors,dc=spreadsheetmoment,dc=com'
        org_role: Editor
      - group_dn: 'cn=grafana-viewers,dc=spreadsheetmoment,dc=com'
        org_role: Viewer
```

## Configuration

### Prometheus Optimization

Edit `prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'spreadsheet-moment-prod'
    environment: 'production'

# Increase retention
command:
  - '--storage.tsdb.retention.time=90d'
  - '--storage.tsdb.retention.size=50GB'

# Enable remote write (optional)
remote_write:
  - url: "https://prometheus-remote-write.example.com/api/v1/write"
    headers:
      Authorization: "Bearer YOUR_TOKEN"
```

### Alert Tuning

Review and update alert thresholds in `prometheus/rules/alerts.yml`:

```yaml
# Production-specific thresholds
- alert: HighCPUUsage
  expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 85
  for: 10m  # Increased from 5m
  labels:
    severity: warning
  annotations:
    summary: "High CPU usage in production"
```

### Dashboard Customization

1. Import dashboards to Grafana:
   - Navigate to Dashboards → Import
   - Upload JSON files from `grafana/dashboards/`
   - Configure data sources

2. Customize dashboards:
   - Adjust time ranges
   - Set up annotations
   - Configure drill-down links
   - Add business-specific metrics

## Testing

### Health Checks

```bash
# Check all services are running
docker-compose ps

# Verify Prometheus targets
curl http://localhost:9090/api/v1/targets

# Test Alertmanager
curl http://localhost:9093/api/v2/status

# Check Grafana API
curl http://localhost:3000/api/health
```

### Alert Testing

Test alert delivery:

```bash
# Trigger test alert
curl -X POST http://localhost:9093/api/v1/alerts -d '[
  {
    "labels": {
      "alertname": "TestAlert",
      "severity": "info"
    },
    "annotations": {
      "description": "This is a test alert"
    }
  }
]'

# Verify alert was received
# Check Slack channel/email/PagerDuty
```

### Load Testing

Test monitoring stack under load:

```bash
# Install Prometheus load tester
go install github.com/prometheus/pushmock/pushmock@latest

# Send high-volume metrics
pushmock -listen-address :9091 -format prometheus

# Monitor Prometheus performance
curl http://localhost:9090/api/v1/query?query=rate(prometheus_tsdb_head_samples_appended_total[5m])
```

## Monitoring

### Monitor the Monitoring Stack

Key metrics to watch:

1. **Prometheus Health**:
   - `up{job="prometheus"}`
   - `prometheus_tsdb_head_samples_appended_total`
   - `prometheus_config_last_reload_successful`

2. **Grafana Performance**:
   - `grafana_usage_statss`
   - `grafana_health`
   - Response times

3. **Alertmanager Delivery**:
   - `alertmanager_notification_success_total`
   - `alertmanager_alerts_received_total`
   - Delivery times

### Regular Maintenance

```bash
# Daily: Check alert delivery
# Review overnight alerts for missed notifications

# Weekly: Review disk usage
df -h
# Consider increasing retention if approaching capacity

# Monthly: Update dashboards
# Review business metrics relevance
# Update alert thresholds based on baselines

# Quarterly: Review monitoring stack
# Performance optimization
# Cost analysis
# Tool evaluation
```

## Troubleshooting

### Common Issues

#### Prometheus High Memory Usage

```bash
# Check current memory usage
docker stats prometheus

# Reduce retention or add recording rules
# Optimize high-cardinality metrics
```

#### Grafana Slow Dashboard Loading

```bash
# Check query performance
curl http://localhost:3000/api/v1/query?query=your_query

# Optimize queries
# Use recording rules
# Reduce dashboard refresh rate
```

#### Alerts Not Firing

```bash
# Check Prometheus rules
curl http://localhost:9090/api/v1/rules

# Verify Alertmanager configuration
curl http://localhost:9093/api/v2/status

# Test webhook delivery
curl -X POST YOUR_WEBHOOK_URL -d '{"text":"Test message"}'
```

### Performance Tuning

1. **Reduce scrape interval** for non-critical services
2. **Implement metric filtering** to reduce cardinality
3. **Use recording rules** for expensive queries
4. **Enable query caching** in Grafana
5. **Optimize dashboard refresh rates**

## Backup and Recovery

### Automated Backups

```bash
#!/bin/bash
# backup_monitoring.sh

BACKUP_DIR="/backups/monitoring"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup Grafana dashboards
docker exec grafana grafana-cli admin export-dashboard > $BACKUP_DIR/grafana_dashboards_$DATE.json

# Backup Prometheus data
docker exec prometheus tar czf - /prometheus > $BACKUP_DIR/prometheus_data_$DATE.tar.gz

# Backup configurations
tar czf $BACKUP_DIR/configs_$DATE.tar.gz prometheus/ grafana/ alertmanager/

# Keep last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### Recovery Procedures

```bash
# Restore Prometheus data
docker exec -i prometheus tar xzf - -C /prometheus < prometheus_data_backup.tar.gz

# Restore Grafana dashboards
docker exec -i grafana grafana-cli admin import-dashboard < grafana_dashboards_backup.json

# Restart services
cd docker && docker-compose restart
```

## Scaling Considerations

### Horizontal Scaling

For high-traffic environments:

1. **Deploy multiple Prometheus instances**:
   - Shard by service
   - Use Thanos for global query
   - Implement remote storage

2. **Load balance Grafana**:
   - Deploy behind nginx
   - Use shared database
   - Configure sticky sessions

3. **Distributed Alertmanager**:
   - Deploy cluster
   - Configure peer communication
   - Implement fallback mechanisms

## Security Hardening

### Network Security

```bash
# Configure firewall rules
ufw allow from 10.0.0.0/8 to any port 3000
ufw allow from 10.0.0.0/8 to any port 9090
ufw deny from any to any port 3000
ufw deny from any to any port 9090
```

### Application Security

1. **Enable authentication** for all services
2. **Use strong passwords** and rotate regularly
3. **Enable audit logging**
4. **Implement RBAC** in Grafana
5. **Encrypt data at rest**
6. **Use network encryption** (TLS)

## Support and Maintenance

### Contact Information

- **Monitoring Team**: monitoring@spreadsheetmoment.com
- **On-Call**: +1-555-MONITOR
- **Slack**: #monitoring-support

### Documentation

- Runbooks: https://docs.spreadsheetmoment.com/runbooks/
- Architecture: https://docs.spreadsheetmoment.com/monitoring-architecture/
- Alerts: https://docs.spreadsheetmoment.com/alerts/

---

**Document Version**: 1.0.0
**Last Updated**: 2025-03-15
**Maintained By**: DevOps Team
