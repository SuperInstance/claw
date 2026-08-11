# Security Hardening Quick Reference

**Spreadsheet Moment - Round 17**

## Quick Import

```typescript
import {
  // Core
  initSecurity,
  SecurityHeaders,
  InputValidator,
  AuthManager,
  CSRFProtection,
  RateLimiter,

  // Validation
  validateString,
  validateEmail,
  validateURL,
  validateFile,
  validateSQLQuery,

  // Authentication
  validatePasswordStrength,
  generateToken,
  generateId,

  // Monitoring
  SecurityMonitor,
  SecurityEventType,
  SecuritySeverity,

  // Scanning
  quickScan,
  VulnerabilityScanner
} from './security/index.js';
```

## Common Patterns

### Initialize Security Suite

```typescript
const security = initSecurity();
```

### Validate Input

```typescript
// String
const result = validateString(userInput, 'fieldName');
if (!result.valid) return { error: result.errors };

// Email
const emailResult = validateEmail(email);

// File
const fileResult = validateFile({
  name: fileName,
  size: fileSize,
  type: mimeType
});
```

### Password Operations

```typescript
// Check strength
const strength = validatePasswordStrength(password);
if (!strength.strong) return { error: strength.errors };

// Hash password
const hash = await auth.hashPassword(password);

// Verify password
const isValid = await auth.verifyPassword(password, hash);
```

### JWT Tokens

```typescript
// Generate token
const token = await auth.generateToken({
  sub: userId,
  role: 'user'
});

// Verify token
const verified = await auth.verifyToken(token);
if (!verified.valid) return { error: 'Invalid token' };

// Get payload
const payload = verified.payload;
```

### Session Management

```typescript
// Create session
const sessionId = auth.createSession(userId, ipAddress);

// Get session
const session = auth.getSession(sessionId);

// Destroy session
auth.destroySession(sessionId);
```

### Rate Limiting

```typescript
// Check limit
const result = rateLimiter.check(identifier);
if (!result.allowed) {
  return {
    error: 'Too many requests',
    retryAfter: result.retryAfter
  };
}
```

### Security Monitoring

```typescript
// Log event
monitor.logEvent(
  SecurityEventType.AUTHENTICATION,
  SecuritySeverity.INFO,
  { userId, ipAddress },
  { success: true }
);

// Get metrics
const metrics = monitor.getMetrics();

// Query events
const events = monitor.queryEvents({
  severity: SecuritySeverity.CRITICAL,
  limit: 100
});
```

### Vulnerability Scanning

```typescript
// Quick scan
const result = await quickScan();
console.log('Security Score:', result.score);

// Custom scan
const scanner = new VulnerabilityScanner({
  scanDependencies: true,
  scanCode: true,
  paths: ['./src']
});

const customResult = await scanner.scan();
scanner.exportToSARIF(customResult, './scan.sarif');
```

## Security Headers

```typescript
const headers = security.headers.getHeaders();
// Returns:
// {
//   'Content-Security-Policy': '...',
//   'Strict-Transport-Security': '...',
//   'X-Content-Type-Options': 'nosniff',
//   'X-Frame-Options': 'DENY',
//   ...
// }
```

## Express.js Middleware

```typescript
// Security headers
app.use((req, res, next) => {
  const headers = security.headers.getHeaders();
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  next();
});

// Rate limiting
app.use((req, res, next) => {
  const result = security.rateLimiter.check(req.ip);
  if (!result.allowed) return res.status(429).json({ error: 'Too many requests' });
  next();
});

// Input validation
app.use((req, res, next) => {
  if (req.body) {
    const result = security.validator.sanitizeHTML(JSON.stringify(req.body));
    if (!result.safe) return res.status(400).json({ error: 'Invalid input' });
    req.body = JSON.parse(result.sanitized);
  }
  next();
});
```

## OWASP Top 10 Mapping

| Risk | Module | Functions |
|------|--------|-----------|
| A01: Broken Access Control | auth.ts | getSession(), RBAC |
| A02: Cryptographic Failures | auth.ts | hashPassword(), verifyPassword() |
| A03: Injection | validation.ts | validateString(), validateSQLQuery() |
| A04: Insecure Design | SecurityHardening.ts | SecurityHeaders, CSP |
| A05: Security Misconfiguration | vulnerability-scanner.ts | scan() |
| A06: Vulnerable Components | vulnerability-scanner.ts | scanDependencies() |
| A07: Authentication Failures | auth.ts | AuthManager, checkLoginAttempt() |
| A08: Data Integrity | auth.ts | JWT signing, verification |
| A09: Logging Failures | monitoring.ts | logEvent(), queryEvents() |
| A10: SSRF | validation.ts | validateURL() |

## Security Score Card

```
Critical Vulnerabilities: -25 points each
High Vulnerabilities:     -15 points each
Medium Vulnerabilities:   -10 points each
Low Vulnerabilities:       -5 points each
Info Vulnerabilities:      -1 point each

PASSING SCORE: ≥80/100
```

## Emergency Procedures

### Security Incident Detected

```typescript
// 1. Log the incident
monitor.logEvent(
  SecurityEventType.SUSPICIOUS_ACTIVITY,
  SecuritySeverity.CRITICAL,
  { userId, ipAddress },
  { incident: 'description' }
);

// 2. Block the source
rateLimiter.clear(identifier); // Or implement IP blocking

// 3. Alert team
// (configured via monitoring channels)

// 4. Preserve evidence
const events = monitor.queryEvents({
  ipAddress: suspiciousIP,
  startDate: incidentTime
});

// 5. Run vulnerability scan
await quickScan();
```

### Compromised Account

```typescript
// 1. Lock account
auth.recordLoginAttempt(userId, false); // Trigger lockout

// 2. Destroy all sessions
auth.destroyUserSessions(userId);

// 3. Log incident
monitor.logEvent(
  SecurityEventType.AUTHENTICATION,
  SecuritySeverity.CRITICAL,
  { userId },
  { action: 'account_locked', reason: 'compromise' }
);

// 4. Force password reset
// (implement reset flow)
```

## Testing Checklist

- [ ] XSS attempts are blocked
- [ ] SQL injection attempts are detected
- [ ] Rate limiting works
- [ ] Password hashing is secure
- [ ] JWT tokens are verified
- [ ] Sessions expire correctly
- [ ] Security headers are set
- [ ] CSRF tokens work
- [ ] Monitoring logs events
- [ ] Vulnerability scan passes (≥80)

## Configuration Examples

### Development
```typescript
const config = {
  csp: { enabled: false },
  rateLimit: { enabled: false },
  auth: { maxLoginAttempts: 100 }
};
```

### Production
```typescript
const config = {
  csp: { enabled: true },
  rateLimit: { enabled: true, maxRequests: 100 },
  auth: {
    maxLoginAttempts: 5,
    lockoutDuration: 900000
  },
  monitoring: {
    enabled: true,
    minSeverity: SecuritySeverity.HIGH
  }
};
```

## Common Mistakes to Avoid

❌ **Don't:**
```typescript
// Trusting user input
const query = `SELECT * FROM users WHERE name = '${name}'`;

// Storing plain text passwords
await db.users.create({ password: 'password123' });

// Using eval()
eval(userInput);

// Weak secrets
const secret = 'secret123';
```

✅ **Do:**
```typescript
// Validating input
const result = validateString(name, 'name');

// Hashing passwords
const hash = await auth.hashPassword(password);

// Using safe alternatives
const parsed = JSON.parse(userInput);

// Strong secrets
const secret = crypto.randomBytes(32).toString('hex');
```

## Quick Commands

```bash
# Run vulnerability scan
npm run security-scan

# Run security tests
npm run test:security

# Check dependencies
npm audit

# Update dependencies
npm update

# Generate security report
npm run security-report
```

## Support

- **Documentation:** ./security/README.md
- **Examples:** ./security/examples.ts
- **Implementation:** ./security/IMPLEMENTATION_SUMMARY.md
- **Issues:** security@superinstance.org

---

**Version:** 1.0.0
**Last Updated:** 2026-03-14
