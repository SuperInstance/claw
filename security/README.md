# Spreadsheet Moment - Security Hardening Suite

**Round 17: Enterprise-Grade Security Implementation**

Comprehensive security hardening suite for Spreadsheet Moment, implementing OWASP Top 10 protections and industry best practices.

## Overview

This security suite provides production-ready security features including:

- **Input Validation** - Comprehensive validation for all input types
- **Authentication** - JWT, sessions, password hashing, 2FA
- **Authorization** - RBAC, permission checking
- **Rate Limiting** - Token bucket, sliding window, IP-based
- **CSRF Protection** - Token generation and verification
- **Security Headers** - CSP, HSTS, X-Frame-Options, etc.
- **Monitoring** - Event logging, anomaly detection, alerting
- **Vulnerability Scanning** - Automated security assessments

## Installation

```bash
npm install --save argon2 bcrypt speakeasy
npm install --save-dev @types/bcrypt
```

## Quick Start

```typescript
import { initSecurity } from './security/index.js';

// Initialize with default configuration
const security = initSecurity();

// Use security features
const headers = security.headers.getHeaders();
const sanitized = security.validator.sanitizeHTML(userInput);
const hash = await security.auth.hashPassword(password);
```

## Modules

### 1. Security Headers (`SecurityHardening.ts`)

Generate and manage security headers for HTTP responses.

```typescript
import { SecurityHeaders, defaultSecurityConfig } from './security/SecurityHardening.js';

const headers = new SecurityHeaders(defaultSecurityConfig);
const securityHeaders = headers.getHeaders();
// Returns: {
//   'Content-Security-Policy': '...',
//   'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
//   'X-Content-Type-Options': 'nosniff',
//   'X-Frame-Options': 'DENY',
//   ...
// }
```

**Features:**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### 2. Input Validation (`validation.ts`)

Comprehensive input validation to prevent injection attacks.

```typescript
import {
  validateString,
  validateEmail,
  validateURL,
  validateFile,
  validateSQLQuery
} from './security/validation.js';

// Validate string input
const result = validateString('<script>alert("XSS")</script>', 'comment');
if (!result.valid) {
  console.error('Threats detected:', result.threats);
}

// Validate email
const emailResult = validateEmail('user@example.com');

// Validate file upload
const fileResult = validateFile({
  name: 'document.pdf',
  size: 1024000,
  type: 'application/pdf'
});
```

**Supported Validations:**
- String validation (length, null bytes, injection patterns)
- Number validation (range, integer checks)
- Email validation
- URL validation
- Path validation (prevents directory traversal)
- File upload validation
- JSON validation
- SQL query validation

**OWASP Coverage:**
- A03:2021 - Injection (SQL, NoSQL, OS Command, LDAP)
- A05:2021 - Security Misconfiguration

### 3. Authentication (`auth.ts`)

Complete authentication system with secure password handling.

```typescript
import {
  AuthManager,
  validatePasswordStrength,
  generateToken
} from './security/auth.js';

const auth = new AuthManager(
  { secret: process.env.JWT_SECRET },
  { algorithm: 'argon2' }
);

// Password hashing
const hash = await auth.hashPassword('SecurePassword123!');
const isValid = await auth.verifyPassword('SecurePassword123!', hash);

// JWT tokens
const token = await auth.generateToken({
  sub: 'user-123',
  name: 'John Doe'
});
const verified = await auth.verifyToken(token);

// Session management
const sessionId = auth.createSession('user-123', '192.168.1.1');
const session = auth.getSession(sessionId);

// Two-factor authentication
const secret = auth.generateTOTPSecret();
const code = auth.generateTOTPCode(secret);
const isValid = auth.verifyTOTPCode(secret, code);

// Password strength
const strength = auth.validatePasswordStrength('password123');
if (!strength.strong) {
  console.error('Weak password:', strength.errors);
}
```

**Features:**
- Password hashing (Argon2, bcrypt, PBKDF2)
- JWT token generation and verification
- Session management
- Login attempt tracking
- Account lockout
- Two-factor authentication (TOTP)
- Password strength validation

**OWASP Coverage:**
- A07:2021 - Identification and Authentication Failures
- A02:2021 - Cryptographic Failures

### 4. Rate Limiting (`SecurityHardening.ts`)

Protect against brute force and DoS attacks.

```typescript
import { RateLimiter } from './security/SecurityHardening.js';

const rateLimiter = new RateLimiter({
  enabled: true,
  windowMs: 60000, // 1 minute
  maxRequests: 100
});

// Check rate limit
const result = rateLimiter.check('user-123');
if (!result.allowed) {
  console.log('Rate limit exceeded. Retry after:', result.retryAfter);
}
```

**Features:**
- Time-based rate limiting
- IP-based limiting
- User-based limiting
- Automatic cleanup
- Configurable windows

**OWASP Coverage:**
- A07:2021 - Identification and Authentication Failures

### 5. CSRF Protection (`SecurityHardening.ts`)

Prevent Cross-Site Request Forgery attacks.

```typescript
import { CSRFProtection } from './security/SecurityHardening.js';

const csrf = new CSRFProtection();

// Generate token for session
const token = csrf.generateToken(sessionId);

// Verify token on form submission
const isValid = csrf.verifyToken(sessionId, token);
if (!isValid) {
  throw new Error('CSRF token validation failed');
}
```

**OWASP Coverage:**
- A01:2021 - Broken Access Control

### 6. Security Monitoring (`monitoring.ts`)

Comprehensive security event logging and monitoring.

```typescript
import {
  SecurityMonitor,
  SecurityEventType,
  SecuritySeverity,
  logAuthenticationEvent,
  logInjectionAttack
} from './security/monitoring.js';

const monitor = new SecurityMonitor({
  enabled: true,
  minSeverity: SecuritySeverity.HIGH,
  channels: [
    {
      type: 'slack',
      config: { webhookUrl: process.env.SLACK_WEBHOOK }
    }
  ]
});

// Log security event
monitor.logEvent(
  SecurityEventType.AUTHENTICATION,
  SecuritySeverity.INFO,
  {
    userId: 'user-123',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  },
  {
    success: true,
    method: 'password'
  },
  ['authentication', 'success']
);

// Or use convenience functions
logAuthenticationEvent(monitor, true, {
  userId: 'user-123',
  ipAddress: '192.168.1.1'
});

logInjectionAttack(monitor, 'SQL Injection', {
  ipAddress: '10.0.0.1',
  userAgent: 'sqlmap/1.0'
});

// Get metrics
const metrics = monitor.getMetrics();
console.log('Total events:', metrics.totalEvents);
console.log('By type:', metrics.eventsByType);
console.log('By severity:', metrics.eventsBySeverity);

// Query events
const criticalEvents = monitor.queryEvents({
  severity: SecuritySeverity.CRITICAL,
  limit: 100
});
```

**Features:**
- Event logging and correlation
- Real-time alerting (Email, Slack, Webhook, SMS, PagerDuty)
- Anomaly detection
- Security metrics
- Event querying and filtering
- Automatic cleanup

**OWASP Coverage:**
- A09:2021 - Security Logging and Monitoring Failures

### 7. Vulnerability Scanning (`vulnerability-scanner.ts`)

Automated vulnerability detection.

```typescript
import {
  VulnerabilityScanner,
  quickScan
} from './security/vulnerability-scanner.js';

// Quick scan
const result = await quickScan({
  scanDependencies: true,
  scanConfig: true,
  scanCode: true,
  checkHeaders: false
});

console.log('Security Score:', result.score);
console.log('Critical:', result.summary.critical);
console.log('High:', result.summary.high);
console.log('Medium:', result.summary.medium);

// Print findings
for (const finding of result.findings) {
  console.log(`[${finding.severity}] ${finding.title}`);
  console.log(`  Location: ${finding.location}`);
  console.log(`  Remediation: ${finding.remediation}`);
}

// Custom scan
const scanner = new VulnerabilityScanner({
  scanDependencies: true,
  scanConfig: true,
  scanCode: true,
  paths: ['./src'],
  excludePatterns: ['node_modules/**', 'dist/**']
});

const customResult = await scanner.scan();

// Export results
scanner.exportResults(customResult, './security-scan.json');
scanner.exportToSARIF(customResult, './security-scan.sarif');
```

**Features:**
- Dependency vulnerability detection
- Configuration analysis
- Source code scanning
- Security header validation
- SARIF export for CI/CD integration
- OWASP Top 10 coverage

**OWASP Coverage:**
- All OWASP Top 10 categories

## OWASP Top 10 Coverage

| Risk | Coverage | Implementation |
|------|----------|----------------|
| A01: Broken Access Control | ✓ | RBAC, CSRF, session management |
| A02: Cryptographic Failures | ✓ | Strong encryption, secure hashing |
| A03: Injection | ✓ | Input validation, parameterized queries |
| A04: Insecure Design | ✓ | Security headers, CSP |
| A05: Security Misconfiguration | ✓ | Configuration scanning, hardening |
| A06: Vulnerable Components | ✓ | Dependency scanning |
| A07: Authentication Failures | ✓ | Password hashing, 2FA, rate limiting |
| A08: Data Integrity Failures | ✓ | Digital signatures, checksums |
| A09: Logging Failures | ✓ | Comprehensive monitoring |
| A10: Server-Side Request Forgery | ✓ | URL validation, allowlists |

## Configuration

### Security Configuration

```typescript
import { SecurityConfig } from './security/SecurityHardening.js';

const config: SecurityConfig = {
  csp: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", 'https://cdn.trusted.com'],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'", 'https://api.example.com'],
    },
  },
  rateLimit: {
    enabled: true,
    windowMs: 60000,
    maxRequests: 100,
  },
  auth: {
    bcryptRounds: 12,
    argon2Config: {
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    },
    sessionExpiry: 3600000,
    maxLoginAttempts: 5,
    lockoutDuration: 900000,
  },
  cors: {
    enabled: true,
    origins: ['https://example.com'],
    credentials: true,
  },
  helmet: {
    enabled: true,
    hsts: true,
    noSniff: true,
    frameguard: true,
    xssFilter: true,
  },
};
```

## Express.js Integration

```typescript
import express from 'express';
import { initSecurity } from './security/index.js';

const app = express();
const security = initSecurity();

// Security headers
app.use((req, res, next) => {
  const headers = security.headers.getHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

// Rate limiting
app.use((req, res, next) => {
  const identifier = req.ip || req.connection.remoteAddress;
  const result = security.rateLimiter.check(identifier);

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: result.retryAfter,
    });
  }

  next();
});

// Input validation
app.use(express.json());
app.use((req, res, next) => {
  if (req.body) {
    const result = security.validator.sanitizeHTML(
      JSON.stringify(req.body)
    );
    if (!result.safe) {
      return res.status(400).json({
        error: 'Invalid input',
        threats: result.threats,
      });
    }
    req.body = JSON.parse(result.sanitized);
  }
  next();
});

app.listen(3000);
```

## Best Practices

### 1. Always Use HTTPS

```typescript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}
```

### 2. Validate All Input

```typescript
// Never trust user input
const input = req.body.username;
const result = validateString(input, 'username');

if (!result.valid) {
  return res.status(400).json({ error: result.errors });
}

const sanitized = result.sanitized;
```

### 3. Use Parameterized Queries

```typescript
// Bad: Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE username = '${username}'`;

// Good: Parameterized query
const query = 'SELECT * FROM users WHERE username = ?';
db.query(query, [username]);
```

### 4. Hash Passwords Properly

```typescript
// Use Argon2 (best) or bcrypt
const hash = await auth.hashPassword(password);

// Never store plain text passwords
```

### 5. Implement Rate Limiting

```typescript
// Protect all authentication endpoints
app.post('/api/login', rateLimitMiddleware, async (req, res) => {
  // Login logic
});
```

### 6. Set Security Headers

```typescript
// Always use security headers
app.use(securityHeadersMiddleware);
```

### 7. Log Security Events

```typescript
// Log all authentication attempts
logAuthenticationEvent(monitor, success, {
  userId: user.id,
  ipAddress: req.ip
});
```

### 8. Regularly Scan for Vulnerabilities

```typescript
// Run in CI/CD pipeline
const result = await quickScan();

if (result.score < 80) {
  throw new Error('Security score too low');
}
```

## Testing

```typescript
import { describe, it, expect } from 'vitest';
import { validateString, validateEmail } from './security/validation.js';

describe('Input Validation', () => {
  it('should detect XSS attempts', () => {
    const result = validateString('<script>alert("XSS")</script>', 'comment');
    expect(result.valid).toBe(false);
    expect(result.threats).toContain('Script tag detected');
  });

  it('should validate email addresses', () => {
    const result = validateEmail('user@example.com');
    expect(result.valid).toBe(true);
  });
});
```

## Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] Security headers configured
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] CSRF protection enabled
- [ ] Password hashing (Argon2/bcrypt)
- [ ] Session management secure
- [ ] Two-factor authentication available
- [ ] Security monitoring enabled
- [ ] Vulnerability scanning automated
- [ ] Dependencies regularly updated
- [ ] Secrets properly managed
- [ ] Error handling doesn't leak information
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Incident response plan ready

## Contributing

When adding security features:

1. Follow OWASP guidelines
2. Add comprehensive tests
3. Document security implications
4. Update this README
5. Run vulnerability scanner

## License

MIT License - Copyright (c) 2026 SuperInstance Research Team

## Support

For security issues, please email: security@superinstance.org

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Security Headers](https://securityheaders.com/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

**Version:** 1.0.0
**Last Updated:** 2026-03-14
**Maintained By:** SuperInstance Research Team
