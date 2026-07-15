# Secrets Management for SuperInstance Website

This document outlines the secrets management strategy for the SuperInstance website deployment to Cloudflare.

## Overview

Secrets are managed through a combination of:
1. **GitHub Secrets** - For CI/CD pipeline
2. **Cloudflare Environment Variables** - For production deployment
3. **Local `.env.local` files** - For development

## Required Secrets

### GitHub Secrets (for CI/CD)

These secrets must be set in the GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | API token with Pages edit permissions | Cloudflare Dashboard > My Profile > API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Cloudflare Dashboard > Overview (right sidebar) |
| `CLOUDFLARE_ZONE_ID` | Zone ID for superinstance.ai domain | Cloudflare Dashboard > Domain > Overview |

### Cloudflare Environment Variables

These should be set in the Cloudflare Pages dashboard for each environment:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `NODE_ENV` | Node.js environment | `production` |
| `SITE_URL` | Full site URL | `https://superinstance.ai` |
| `API_BASE_URL` | API base URL | `https://api.superinstance.ai` |
| `ANALYTICS_ID` | Analytics tracking ID | `your-analytics-id` |

## Setup Instructions

### 1. GitHub Secrets Setup

```bash
# Navigate to repository settings
# Settings > Secrets and variables > Actions > New repository secret

# Add each secret:
CLOUDFLARE_API_TOKEN: your-api-token-here
CLOUDFLARE_ACCOUNT_ID: your-account-id-here
CLOUDFLARE_ZONE_ID: your-zone-id-here
```

### 2. Cloudflare Environment Variables Setup

1. Go to Cloudflare Dashboard
2. Navigate to **Pages** > **superinstance-website**
3. Go to **Settings** > **Environment variables**
4. Add variables for each environment (Production, Preview, Staging)

### 3. Local Development Setup

```bash
# Copy example file
cd website
cp .env.example .env.local

# Edit .env.local with your local values
# Never commit .env.local to version control
```

## Security Best Practices

### Do's
- ✅ Use different API tokens for different environments
- ✅ Rotate tokens regularly (every 90 days)
- ✅ Use least-privilege permissions for tokens
- ✅ Store secrets in GitHub Secrets, not in code
- ✅ Use environment-specific configurations

### Don'ts
- ❌ Never commit secrets to version control
- ❌ Don't use production tokens in development
- ❌ Don't hardcode secrets in configuration files
- ❌ Don't share tokens via unencrypted channels

## Token Permissions

### Cloudflare API Token Required Permissions

Create a custom token with these permissions:

| Permission | Scope | Purpose |
|------------|-------|---------|
| Account | Pages:Edit | Deploy to Cloudflare Pages |
| Account | Pages:Read | Read Pages configuration |
| Zone | Zone:Read | Read zone information |

### Token Creation Steps

1. Go to Cloudflare Dashboard > My Profile > API Tokens
2. Click **Create Token**
3. Use **Custom token** template
4. Name: `superinstance-website-deploy`
5. Set permissions as above
6. Set account resources to your account
7. Set zone resources to `superinstance.ai`
8. Create token and copy immediately (won't be shown again)

## Environment-Specific Configuration

### Production (`superinstance.ai`)
- Use production API tokens
- Enable all security features
- Set `NODE_ENV=production`
- Use production analytics IDs

### Staging (`staging.superinstance.ai`)
- Use staging API tokens
- Enable debugging features
- Set `NODE_ENV=staging`
- Use staging analytics IDs

### Preview (PR deployments)
- Use preview API tokens
- Enable verbose logging
- Set `NODE_ENV=preview`
- Minimal analytics

## Monitoring and Rotation

### Monitoring
- Monitor token usage in Cloudflare Dashboard
- Set up alerts for unusual activity
- Log all deployment activities

### Rotation Schedule
- **API Tokens**: Rotate every 90 days
- **Analytics IDs**: Review quarterly
- **Environment Variables**: Review with each major release

## Emergency Procedures

### If a token is compromised:
1. Immediately revoke the token in Cloudflare Dashboard
2. Generate a new token with same permissions
3. Update GitHub Secrets with new token
4. Trigger a redeployment to update environment

### If environment variables need updating:
1. Update in Cloudflare Pages dashboard
2. The change takes effect on next deployment
3. No need to update code or restart services

## Troubleshooting

### Common Issues

**"Invalid API token" error**
- Verify token has correct permissions
- Check token hasn't expired
- Ensure account/zone resources are correct

**"Zone not found" error**
- Verify `CLOUDFLARE_ZONE_ID` is correct
- Check domain is properly configured in Cloudflare
- Ensure token has zone read permissions

**Environment variables not loading**
- Check variable names match code
- Verify environment is correctly set
- Check Cloudflare Pages build logs

## References

- [Cloudflare API Tokens Documentation](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)