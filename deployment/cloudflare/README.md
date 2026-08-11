# Spreadsheet Moment - Cloudflare Workers Deployment

Complete deployment configuration for Spreadsheet Moment on Cloudflare Workers with D1 database, R2 storage, KV caching, and Durable Objects for real-time collaboration.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Post-Deployment Setup](#post-deployment-setup)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)
- [Cost Optimization](#cost-optimization)

## Architecture Overview

```
┌─────────────────┐
│   Cloudflare    │
│     CDN         │
└────────┬────────┘
         │
    ┌────▼────┐
    │  Worker │
    │  Entry  │
    └────┬────┘
         │
    ┌────┴──────────────────────────┐
    │                               │
┌───▼────┐    ┌──────┐    ┌───────▼──┐
│   D1   │    │  KV   │    │    R2    │
│Database │    │Cache  │    │  Storage │
└────────┘    └──────┘    └──────────┘
                                    │
                            ┌───────▼──────┐
                            │  Durable     │
                            │  Objects     │
                            │(Collaboration)│
                            └──────────────┘
```

### Components

- **Cloudflare Workers**: Serverless compute for GraphQL API, analytics, i18n, and community features
- **D1 Database**: SQLite database for persistent data storage
- **R2 Storage**: Object storage for user uploads, avatars, and static assets
- **KV Storage**: Key-value store for caching and session management
- **Durable Objects**: Stateful objects for real-time collaboration with WebSocket support

### Key Features

- **GraphQL API v2**: Type-safe schema with subscriptions and caching
- **Real-time Collaboration**: WebSocket-based multi-user editing with Durable Objects
- **Analytics Dashboard**: Advanced metrics and forecasting
- **i18n Support**: 37 languages with KV-cached translations
- **Community Features**: Forums, templates, user profiles, gamification
- **Security**: JWT auth, rate limiting, input validation, CORS

---

## Prerequisites

### Required Accounts

1. **Cloudflare Account** (Free tier available)
   - Sign up at: https://dash.cloudflare.com/sign-up

2. **GitHub Account** (for CI/CD)
   - For GitHub Actions deployment

### Required Tools

```bash
# Node.js and npm
node --version  # Should be v18 or higher
npm --version

# Wrangler CLI
npm install -g wrangler
wrangler --version  # Should be v3 or higher

# Git
git --version
```

### Required Secrets

Generate the following secrets before deployment:

```bash
# JWT Secret (for authentication)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/SuperInstance/SuperInstance-papers.git
cd SuperInstance-papers

npm install
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This will open your browser for authentication.

### 3. Deploy

**On Linux/macOS:**

```bash
chmod +x deployment/cloudflare/scripts/deploy.sh
./deployment/cloudflare/scripts/deploy.sh production
```

**On Windows (PowerShell):**

```powershell
.\deployment\cloudflare\scripts\deploy.ps1 -Environment production
```

## Configuration

### wrangler.toml

The main configuration file is `deployment/cloudflare/wrangler.toml`. Key sections:

#### Database Configuration

```toml
[[d1_databases]]
binding = "DB"
database_name = "spreadsheet-moment-db"
database_id = "YOUR_DATABASE_ID"
```

#### KV Namespaces

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_CACHE_NAMESPACE_ID"

[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_SESSIONS_NAMESPACE_ID"
```

#### R2 Buckets

```toml
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "spreadsheet-moment-assets"

[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "spreadsheet-moment-uploads"
```

#### Durable Objects

```toml
[[durable_objects.bindings]]
name = "COLLABORATION"
class_name = "CollaborationObject"
```

### Environment Variables

Set in `wrangler.toml` or via CLI:

```bash
wrangler secret put JWT_SECRET
wrangler secret put DATABASE_URL
wrangler secret put SMTP_PASSWORD
wrangler secret put STRIPE_SECRET_KEY
```

## Deployment

### Manual Deployment

#### Development Environment

```bash
wrangler deploy deployment/cloudflare/wrangler.toml --env=development
```

#### Production Environment

```bash
wrangler deploy deployment/cloudflare/wrangler.toml --env=production
```

### Automated Deployment (GitHub Actions)

1. **Set up GitHub Secrets:**

   Go to: Repository Settings → Secrets and variables → Actions

   Add the following secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `JWT_SECRET`
   - `SLACK_WEBHOOK_URL` (optional)

2. **Configure API Token:**

   Create a Cloudflare API Token with permissions:
   - Account - Cloudflare Workers: Edit
   - Account - Workers Scripts: Edit
   - Account - D1: Edit
   - Account - Workers KV Storage: Edit
   - Account - Workers R2 Storage: Edit

3. **Trigger Deployment:**

   Push to `main` branch or create a pull request.

### Database Migrations

#### Run Migrations

```bash
wrangler d1 execute spreadsheet-moment-db-prod \
  --file=./deployment/cloudflare/d1/schema.sql \
  --env=production
```

## Post-Deployment Setup

### 1. Configure Custom Domain

```bash
wrangler domains add api.spreadsheetmoment.com
```

Or via Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your worker
3. Click "Triggers" → "Custom Domains"
4. Add domain: `api.spreadsheetmoment.com`

### 2. Configure DNS

Add DNS records for your domain:

```
Type: CNAME
Name: api
Target: spreadsheet-moment.workers.dev
Proxy: Proxied (orange cloud)
```

### 3. Upload Initial Assets

```bash
# Upload default avatar
wrangler r2 object put spreadsheet-moment-assets/avatars/default.png \
  --file=./assets/default-avatar.png

# Upload logo
wrangler r2 object put spreadsheet-moment-assets/logo.png \
  --file=./assets/logo.png
```

## Monitoring and Logs

### Real-time Logs

```bash
wrangler tail --env=production
```

### Metrics and Analytics

Access Cloudflare Dashboard:
- Workers Analytics: https://dash.cloudflare.com/workers/analytics
- R2 Usage: https://dash.cloudflare.com/r2
- D1 Metrics: https://dash.cloudflare.com/d1

### Key Metrics to Monitor

- Request count and success rate
- Response time (P50, P95, P99)
- Error rate
- CPU usage
- D1 query performance
- R2 storage usage
- KV read/write operations

## Troubleshooting

### Worker Not Responding

```bash
# Check worker status
wrangler deployments list --env=production

# View recent logs
wrangler tail --env=production --format=pretty
```

### Database Connection Issues

```bash
# Test D1 connection
wrangler d1 execute spreadsheet-moment-db-prod \
  --command="SELECT 1" \
  --env=production
```

### KV Cache Issues

```bash
# List KV keys
wrangler kv:key list --namespace-id=YOUR_CACHE_ID

# Clear cache
wrangler kv:key delete --namespace-id=YOUR_CACHE_ID "key:*"
```

## Cost Optimization

### Free Tier Limits (as of 2024)

- **Workers**: 100,000 requests/day
- **D1**: 5 million rows read, 100,000 rows written/day
- **KV**: 100,000 read, 1,000 write operations/day
- **R2**: 10 GB storage, 1 million Class A operations/month

### Optimization Strategies

1. **Reduce Worker Requests:**
   - Implement aggressive caching
   - Use batch operations
   - Optimize GraphQL queries

2. **Optimize D1 Usage:**
   - Use indexes effectively
   - Implement query result caching
   - Use prepared statements

3. **Reduce KV Operations:**
   - Use longer TTLs
   - Implement cache warming
   - Use read-heavy patterns

4. **Optimize R2 Storage:**
   - Use lifecycle rules for auto-cleanup
   - Implement CDN caching
   - Use compression

## Security Best Practices

1. **Secrets Management:**
   - Never commit secrets to Git
   - Use Wrangler secrets for sensitive data
   - Rotate secrets regularly

2. **CORS Configuration:**
   - Whitelist specific origins
   - Use appropriate HTTP methods
   - Set proper cache headers

3. **Rate Limiting:**
   - Implement per-IP rate limits
   - Use KV for distributed rate limiting
   - Monitor for abuse

4. **Input Validation:**
   - Validate all user inputs
   - Sanitize data before storage
   - Use prepared SQL statements

## Support and Resources

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **D1 Documentation**: https://developers.cloudflare.com/d1/
- **R2 Documentation**: https://developers.cloudflare.com/r2/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/

## License

MIT License - Copyright (c) 2026 SuperInstance Research Team
