# SpreadsheetMoment - Cloudflare Deployment Guide

**Version:** 1.0
**Last Updated:** 2026-03-14

---

## Prerequisites

### Required Accounts & Tools

1. **Cloudflare Account**
   - Sign up at https://dash.cloudflare.com/sign-up
   - Verify email address
   - Note your Account ID from the dashboard

2. **Domain Name**
   - Purchase a domain or use an existing one
   - Add domain to Cloudflare (nameservers will be provided)

3. **Required Tools**
   ```bash
   # Install Node.js (v18+)
   node --version  # Should be v18.0.0 or higher

   # Install Wrangler CLI
   npm install -g wrangler

   # Login to Cloudflare
   wrangler login

   # Verify authentication
   wrangler whoami
   ```

4. **External API Keys**
   - OpenAI API key (for NLP and embeddings)
   - SuperInstance API key (for tensor computation)
   - OAuth provider credentials (Google, GitHub)

---

## Initial Setup

### Step 1: Repository Setup

```bash
# Clone repository
git clone https://github.com/your-org/spreadsheet-moment.git
cd spreadsheet-moment

# Install dependencies
npm install

# Copy configuration files
cp deployment/cloudflare/wrangler.example.toml wrangler.toml
cp deployment/cloudflare/.env.example .env
```

### Step 2: Configure Wrangler

Edit `wrangler.toml` and fill in your values:

```toml
# Set your account ID (from Cloudflare dashboard)
account_id = "your-account-id-here"

# Configure domain routes
[env.production]
routes = [
  { pattern = "api.spreadsheetmoment.com/*", zone_name = "spreadsheetmoment.com" }
]
```

### Step 3: Create Cloudflare Resources

#### Create D1 Databases

```bash
# Production database
wrangler d1 create spreadsheetmoment-prod

# Note the database_id from output and update wrangler.toml

# Staging database
wrangler d1 create spreadsheetmoment-staging

# Note the database_id from output and update wrangler.toml
```

#### Create R2 Buckets

```bash
# Production bucket
wrangler r2 bucket create spreadsheetmoment-prod

# Staging bucket
wrangler r2 bucket create spreadsheetmoment-staging
```

#### Create KV Namespaces

```bash
# Production KV
wrangler kv:namespace create "KV" --preview=false

# Note the namespace ID and update wrangler.toml

# Staging KV
wrangler kv:namespace create "KV" --preview=true
```

#### Create Vectorize Indexes

```bash
# Cell similarity index
wrangler vectorize create spreadsheetmoment-cells \
  --dimensions=1536 \
  --metric=cosine \
  --metadata-fields=workspace_id:string,cell_type:string,temperature:number

# Query history index
wrangler vectorize create spreadsheetmoment-queries \
  --dimensions=1536 \
  --metric=cosine \
  --metadata-fields=user_id:string,workspace_id:string,query_type:string
```

#### Create Queues

```bash
# Analytics events queue
wrangler queues create analytics-events

# Backup jobs queue
wrangler queues create backup-jobs
```

---

## Database Setup

### Step 1: Run Migrations

```bash
# Apply schema to production database
wrangler d1 execute spreadsheetmoment-prod --file=deployment/cloudflare/migrations/001_initial_schema.sql

# Verify tables created
wrangler d1 execute spreadsheetmoment-prod --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Step 2: Seed Initial Data

```bash
# Create admin user
wrangler d1 execute spreadsheetmoment-prod --command="
  INSERT INTO users (id, email, display_name, subscription_tier)
  VALUES ('admin-uuid', 'admin@spreadsheetmoment.com', 'Admin', 'premium');
"

# Create example workspace
wrangler d1 execute spreadsheetmoment-prod --command="
  INSERT INTO workspaces (id, owner_id, name, description)
  VALUES ('workspace-uuid', 'admin-uuid', 'Example Workspace', 'Welcome to SpreadsheetMoment');
"
```

---

## Environment Configuration

### Step 1: Set Secrets

```bash
# OpenAI API key
wrangler secret put OPENAI_API_KEY --env production
# Enter your key when prompted

# SuperInstance API key
wrangler secret put SUPERINSTANCE_API_KEY --env production

# JWT secret for session tokens
wrangler secret put JWT_SECRET --env production
# Generate with: openssl rand -base64 32

# Encryption key for sensitive data
wrangler secret put ENCRYPTION_KEY --env production
# Generate with: openssl rand -base64 32

# OAuth credentials
wrangler secret put GOOGLE_CLIENT_ID --env production
wrangler secret put GOOGLE_CLIENT_SECRET --env production

# Database encryption key (for D1 backups)
wrangler secret put DB_ENCRYPTION_KEY --env production
```

### Step 2: Configure Staging

```bash
# Repeat for staging environment
wrangler secret put OPENAI_API_KEY --env staging
wrangler secret put SUPERINSTANCE_API_KEY --env staging
# ... (repeat for all secrets)
```

---

## Durable Objects Setup

### Step 1: Enable Durable Objects

1. Go to Cloudflare Dashboard
2. Navigate to: Workers & Pages > Your Worker > Settings > Durable Objects
3. Enable Durable Objects (requires paid plan)

### Step 2: Deploy Durable Objects

```bash
# Deploy with Durable Objects classes
wrangler deploy --env production
```

### Step 3: Verify Durable Objects

```bash
# List Durable Objects
wrangler durable-objects --env production

# Check object status
wrangler tail --env production
```

---

## Deploy Workers

### Step 1: Initial Deployment

```bash
# Deploy to staging first
wrangler deploy --env staging

# Test staging deployment
curl https://api-staging.spreadsheetmoment.com/health

# If staging works, deploy to production
wrangler deploy --env production

# Verify production deployment
curl https://api.spreadsheetmoment.com/health
```

### Step 2: Verify Routes

```bash
# Check that routes are configured
wrangler routes:list --env production

# Test API endpoints
curl https://api.spreadsheetmoment.com/api/v1/health
curl https://api.spreadsheetmoment.com/api/v1/workspaces
```

---

## Configure Cloudflare Access

### Step 1: Set Up Zero Trust

1. Go to Cloudflare Dashboard
2. Navigate to: Zero Trust > Settings > Authentication
3. Add Login Methods:
   - Google OAuth
   - GitHub OAuth
   - One-Time PIN (email)

### Step 2: Create Access Policy

1. Navigate to: Zero Trust > Access > Applications
2. Add Application:
   - Name: "SpreadsheetMoment API"
   - Domain: `api.spreadsheetmoment.com`
   - Session Duration: 24h
3. Add Policy:
   - Name: "Allow All Users"
   - Action: Allow
   - Include: Email domain `*` (all emails)

### Step 3: Configure JWT Validation

```bash
# Get your Access public key
curl "https://[YOUR-CERTIFICATE-ZONE].cloudflareaccess.com/cdn-cgi/access/certs"

# Add to wrangler.toml or environment variable
wrangler secret put ACCESS_PUBLIC_KEY --env production
# Paste the public key
```

---

## Configure DNS Records

### Step 1: Add DNS Records

In Cloudflare Dashboard > DNS > Records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | api | [Your origin IP] | Proxied |
| CNAME | www | spreadsheetmoment.com | Proxied |
| CNAME | app | spreadsheetmoment.com | Proxied |

### Step 2: Configure SSL/TLS

1. Navigate to: SSL/TLS > Overview
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

---

## Monitoring & Analytics Setup

### Step 1: Enable Analytics Engine

```bash
# Create analytics dataset
wrangler analytics-engine create spreadsheetmoment-analytics
```

### Step 2: Configure Worker Analytics

```typescript
// In your Worker, add analytics tracking
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now()

    // ... handle request ...

    // Track metrics
    env.ANALYTICS.writeDataPoint({
      blobs: [request.url, request.method],
      doubles: [Date.now() - startTime],
      indexes: [request.status]
    })

    return response
  }
}
```

### Step 3: Set Up Alerts

1. Navigate to: Workers & Pages > Your Worker > Metrics
2. Configure alerts for:
   - Error rate > 5%
   - P95 latency > 1s
   - CPU usage > 80%
3. Add notification channels (Slack, PagerDuty, email)

---

## Post-Deployment Verification

### Step 1: Health Checks

```bash
# API health check
curl https://api.spreadsheetmoment.com/health

# Database connectivity
curl https://api.spreadsheetmoment.com/api/v1/health/db

# R2 connectivity
curl https://api.spreadsheetmoment.com/api/v1/health/storage

# Durable Objects check
curl https://api.spreadsheetmoment.com/api/v1/health/objects
```

### Step 2: Functional Testing

```bash
# Create a test workspace
curl -X POST https://api.spreadsheetmoment.com/api/v1/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Workspace"}'

# Create a test cell
curl -X POST https://api.spreadsheetmoment.com/api/v1/workspaces/WS_ID/cells \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "A1", "value": 42, "type": "number"}'

# Test NLP query
curl -X POST https://api.spreadsheetmoment.com/api/v1/nlp/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me all cells with value greater than 40"}'
```

### Step 3: Load Testing

```bash
# Install load testing tool
npm install -g autocannon

# Run load test
autocannon -c 100 -d 30 https://api.spreadsheetmoment.com/api/v1/health

# Check metrics in Cloudflare dashboard
```

---

## Rollback Procedure

### If Deployment Fails

```bash
# 1. Rollback to previous version
wrangler rollback --env production

# 2. Or deploy specific version
wrangler deploy --env production --version PREVIOUS_VERSION_ID

# 3. Verify rollback
curl https://api.spreadsheetmoment.com/health
```

### Database Rollback

```bash
# List backups
wrangler d1 backups list spreadsheetmoment-prod

# Restore from backup
wrangler d1 backups restore spreadsheetmoment-prod BACKUP_ID
```

---

## Troubleshooting

### Common Issues

**Issue: "Durable Objects not enabled"**
```bash
# Solution: Enable in Cloudflare dashboard
# Navigate to: Workers & Pages > Settings > Durable Objects
# Requires Workers Paid plan ($5/month)
```

**Issue: "Database locked"**
```bash
# Solution: Check for long-running queries
wrangler d1 execute spreadsheetmoment-prod --command="
  SELECT * FROM sqlite_master WHERE sql LIKE '%TRANSACTION%';
"

# Kill long-running connections if needed
```

**Issue: "Vectorize index not found"**
```bash
# Solution: Recreate index
wrangler vectorize create spreadsheetmoment-cells \
  --dimensions=1536 \
  --metric=cosine

# Wait a few minutes for index to be ready
wrangler vectorize list
```

**Issue: "High latency"**
```bash
# Check Worker logs
wrangler tail --env production

# Check CPU usage
wrangler metrics --env production

# Review D1 query performance
wrangler d1 execute spreadsheetmoment-prod --command="
  EXPLAIN QUERY PLAN SELECT * FROM tensor_cells WHERE workspace_id = ?;
"
```

---

## Maintenance Tasks

### Daily

- Check error rates in Cloudflare dashboard
- Review analytics metrics
- Verify backup completion

### Weekly

- Review and optimize slow queries
- Clean up old KV entries
- Check Durable Object storage usage
- Review cost reports

### Monthly

- Apply security updates
- Review and update quotas
- Archive old data to cold storage
- Conduct disaster recovery drill

---

## Cost Estimation

### Monthly Cost Breakdown (per 100K active users)

| Service | Usage | Cost |
|---------|-------|------|
| Workers | 100M requests | $500 |
| D1 Database | 1B rows read, 50GB storage | $275 |
| R2 Storage | 1TB storage, 10M operations | $65 |
| Durable Objects | 10M requests, 100GB storage | $52 |
| KV | 10GB storage, 10M reads | $0.50 |
| Vectorize | 10M searches, 1M vectors | $1.20 |
| Queue | 10M operations | $0.50 |
| **Total** | | **~$894/month** |

### Cost Optimization Tips

1. **Enable aggressive caching** for static assets
2. **Batch operations** to reduce request count
3. **Use read replicas** for analytics queries
4. **Archive old data** to cold storage (R2 Infrequent Access)
5. **Implement request deduplication**
6. **Optimize database queries** with proper indexes

---

## Next Steps

1. **Set up CI/CD pipeline** (GitHub Actions)
2. **Configure monitoring dashboards** (Grafana, Cloudflare Analytics)
3. **Set up alerting** (PagerDuty, Slack)
4. **Document runbooks** for common operations
5. **Conduct load testing** to validate capacity
6. **Set up staging environment** for pre-production testing
7. **Configure custom domain** with SSL certificate
8. **Set up backup and disaster recovery** procedures
9. **Implement log aggregation** (Cloudflare Logs, external service)
10. **Create operations documentation** for on-call engineers

---

## Additional Resources

- **Cloudflare Workers Documentation:** https://developers.cloudflare.com/workers/
- **D1 Database Guide:** https://developers.cloudflare.com/d1/
- **Durable Objects:** https://developers.cloudflare.com/durable-objects/
- **Vectorize:** https://developers.cloudflare.com/vectorize/
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/

---

**Support:** For issues or questions, contact infrastructure@spreadsheetmoment.com
