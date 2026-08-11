/**
 * Spreadsheet Moment - Security Hardening Examples
 * Round 17: Usage Examples and Best Practices
 *
 * This file contains comprehensive examples of using the security hardening suite.
 * Copy and adapt these examples for your application.
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import {
  SecurityHeaders,
  InputValidator,
  AuthManager,
  CSRFProtection,
  VulnerabilityScanner,
  RateLimiter,
  defaultSecurityConfig,
  initSecurity,
  type SecurityConfig,
} from './SecurityHardening.js';

import {
  validateString,
  validateNumber,
  validateEmail,
  validateURL,
  validatePath,
  validateFile,
  validateJSON,
  validateSQLQuery,
  InputValidator as AdvancedInputValidator,
} from './validation.js';

import {
  AuthManager as AdvancedAuthManager,
  validatePasswordStrength,
  generateToken,
  generateId,
} from './auth.js';

import {
  SecurityMonitor,
  SecurityEventType,
  SecuritySeverity,
  logAuthenticationEvent,
  logInjectionAttack,
  logRateLimitExceeded,
} from './monitoring.js';

import {
  VulnerabilityScanner as AdvancedVulnerabilityScanner,
  quickScan,
} from './vulnerability-scanner.js';

// ============================================================================
// EXAMPLE 1: Initialize Security Suite
// ============================================================================

/**
 * Example 1: Basic initialization with default configuration
 */
function example1_BasicInit() {
  console.log('\n=== Example 1: Basic Security Initialization ===\n');

  // Initialize with default config
  const security = initSecurity();

  // Use security headers
  const headers = security.headers.getHeaders();
  console.log('Security Headers:', headers);

  // Validate input
  const result = security.validator.sanitizeHTML('<script>alert("XSS")</script>Hello');
  console.log('Sanitization Result:', result);

  // Rate limiting
  const rateLimit = security.rateLimiter.check('user-123');
  console.log('Rate Limit:', rateLimit);
}

/**
 * Example 2: Custom security configuration
 */
function example2_CustomConfig() {
  console.log('\n=== Example 2: Custom Security Configuration ===\n');

  const customConfig: SecurityConfig = {
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
      windowMs: 60000, // 1 minute
      maxRequests: 100,
    },
    auth: {
      bcryptRounds: 12,
      argon2Config: {
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4,
      },
      sessionExpiry: 3600000, // 1 hour
      maxLoginAttempts: 5,
      lockoutDuration: 900000, // 15 minutes
    },
    cors: {
      enabled: true,
      origins: ['https://example.com', 'https://app.example.com'],
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

  const security = initSecurity(customConfig);
  console.log('Security initialized with custom configuration');
}

// ============================================================================
// EXAMPLE 2: Input Validation
// ============================================================================

/**
 * Example 3: Validating user input
 */
async function example3_InputValidation() {
  console.log('\n=== Example 3: Input Validation ===\n');

  // Validate string input
  const stringResult = validateString('Hello, World!', 'username');
  console.log('String Validation:', stringResult);

  // Validate number input
  const numberResult = validateNumber(42, 'age', { min: 0, max: 120, integer: true });
  console.log('Number Validation:', numberResult);

  // Validate email
  const emailResult = validateEmail('user@example.com');
  console.log('Email Validation:', emailResult);

  // Validate URL
  const urlResult = validateURL('https://example.com');
  console.log('URL Validation:', urlResult);

  // Validate file upload
  const fileResult = validateFile({
    name: 'document.pdf',
    size: 1024000,
    type: 'application/pdf',
  });
  console.log('File Validation:', fileResult);

  // Validate SQL query
  const sqlResult = validateSQLQuery('SELECT * FROM users WHERE id = ?', [123]);
  console.log('SQL Validation:', sqlResult);
}

/**
 * Example 4: Advanced input validation
 */
async function example4_AdvancedValidation() {
  console.log('\n=== Example 4: Advanced Input Validation ===\n');

  const validator = new AdvancedInputValidator({
    maxLength: 1000,
    allowNullBytes: false,
    allowSpecialChars: true,
    sanitize: true,
    trim: true,
  });

  // Validate multiple inputs
  const inputs = {
    username: '<script>alert("XSS")</script>admin',
    email: 'user@example.com',
    age: '25',
    bio: 'This is a long biography...',
  };

  for (const [field, value] of Object.entries(inputs)) {
    const result = validator.validateString(value, field);
    console.log(`${field}:`, result.valid ? 'VALID' : 'INVALID', result);
  }
}

// ============================================================================
// EXAMPLE 3: Authentication & Authorization
// ============================================================================

/**
 * Example 5: Password hashing and verification
 */
async function example5_PasswordHashing() {
  console.log('\n=== Example 5: Password Hashing ===\n');

  const authManager = new AdvancedAuthManager(
    { secret: 'your-secret-key' },
    { algorithm: 'argon2' }
  );

  // Hash password
  const password = 'SecurePassword123!';
  const hash = await authManager.hashPassword(password);
  console.log('Password Hash:', hash);

  // Verify password
  const isValid = await authManager.verifyPassword(password, hash);
  console.log('Password Valid:', isValid);

  // Validate password strength
  const strength = authManager.validatePasswordStrength(password);
  console.log('Password Strength:', strength);
}

/**
 * Example 6: JWT token management
 */
async function example6_JWTokens() {
  console.log('\n=== Example 6: JWT Token Management ===\n');

  const authManager = new AdvancedAuthManager({
    secret: 'your-secret-key',
    expiresIn: 3600, // 1 hour
  });

  // Generate token
  const payload = {
    sub: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
  };

  const token = await authManager.generateToken(payload);
  console.log('Generated Token:', token);

  // Verify token
  const verification = await authManager.verifyToken(token);
  console.log('Token Valid:', verification.valid);
  console.log('Token Payload:', verification.payload);

  // Refresh token
  const refreshed = await authManager.refreshToken(token);
  console.log('Refreshed Token:', refreshed?.substring(0, 50) + '...');
}

/**
 * Example 7: Session management
 */
async function example7_SessionManagement() {
  console.log('\n=== Example 7: Session Management ===\n');

  const authManager = new AdvancedAuthManager({
    secret: 'your-secret-key',
  });

  // Create session
  const sessionId = authManager.createSession(
    'user-123',
    '192.168.1.1',
    'Mozilla/5.0...',
    { lastPage: '/dashboard' }
  );
  console.log('Session ID:', sessionId);

  // Get session
  const session = authManager.getSession(sessionId);
  console.log('Session Data:', session);

  // Update activity
  authManager.updateSessionActivity(sessionId);

  // Destroy session
  authManager.destroySession(sessionId);
  console.log('Session destroyed');
}

/**
 * Example 8: Login attempt tracking
 */
async function example8_LoginAttempts() {
  console.log('\n=== Example 8: Login Attempt Tracking ===\n');

  const authManager = new AdvancedAuthManager({
    secret: 'your-secret-key',
  });

  const userId = 'user@example.com';

  // Check if can attempt login
  const canLogin = authManager.checkLoginAttempt(userId);
  console.log('Can Login:', canLogin);

  // Record failed attempt
  authManager.recordLoginAttempt(userId, false);

  // Check again
  const canLogin2 = authManager.checkLoginAttempt(userId);
  console.log('Can Login After Failure:', canLogin2);

  // Record successful attempt
  authManager.recordLoginAttempt(userId, true);
  console.log('Attempts reset after success');
}

/**
 * Example 9: Two-factor authentication (TOTP)
 */
async function example9_TwoFactorAuth() {
  console.log('\n=== Example 9: Two-Factor Authentication ===\n');

  const authManager = new AdvancedAuthManager({
    secret: 'your-secret-key',
  });

  // Generate TOTP secret
  const secret = authManager.generateTOTPSecret();
  console.log('TOTP Secret:', secret);

  // Generate current code
  const code = authManager.generateTOTPCode(secret);
  console.log('Current Code:', code);

  // Verify code
  const isValid = authManager.verifyTOTPCode(secret, code);
  console.log('Code Valid:', isValid);
}

// ============================================================================
// EXAMPLE 4: Rate Limiting
// ============================================================================

/**
 * Example 10: Basic rate limiting
 */
function example10_RateLimiting() {
  console.log('\n=== Example 10: Basic Rate Limiting ===\n');

  const rateLimiter = new RateLimiter({
    enabled: true,
    windowMs: 60000, // 1 minute
    maxRequests: 100,
  });

  // Check rate limit
  const result = rateLimiter.check('user-123');
  console.log('Rate Limit Result:', result);

  // Check multiple times
  for (let i = 0; i < 10; i++) {
    const result = rateLimiter.check('user-456');
    console.log(`Request ${i + 1}:`, result.allowed ? 'ALLOWED' : 'BLOCKED');
  }
}

// ============================================================================
// EXAMPLE 5: Security Monitoring
// ============================================================================

/**
 * Example 11: Logging security events
 */
function example11_SecurityMonitoring() {
  console.log('\n=== Example 11: Security Monitoring ===\n');

  const monitor = new SecurityMonitor({
    enabled: true,
    minSeverity: SecuritySeverity.MEDIUM,
    channels: [],
  });

  // Log authentication event
  const authEventId = monitor.logEvent(
    SecurityEventType.AUTHENTICATION,
    SecuritySeverity.INFO,
    {
      userId: 'user-123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
    },
    {
      success: true,
      method: 'password',
    },
    ['authentication', 'success']
  );
  console.log('Auth Event ID:', authEventId);

  // Log injection attack
  const attackEventId = monitor.logEvent(
    SecurityEventType.INJECTION_ATTACK,
    SecuritySeverity.CRITICAL,
    {
      ipAddress: '10.0.0.1',
      userAgent: 'sqlmap/1.0',
    },
    {
      attackType: 'SQL Injection',
      payload: "1' OR '1'='1",
      endpoint: '/api/users',
    },
    ['injection', 'attack', 'critical']
  );
  console.log('Attack Event ID:', attackEventId);

  // Get metrics
  const metrics = monitor.getMetrics();
  console.log('Security Metrics:', metrics);
}

/**
 * Example 12: Querying security events
 */
function example12_QueryingEvents() {
  console.log('\n=== Example 12: Querying Security Events ===\n');

  const monitor = new SecurityMonitor();

  // Log some events
  monitor.logEvent(
    SecurityEventType.AUTHENTICATION,
    SecuritySeverity.HIGH,
    { userId: 'user-1', ipAddress: '192.168.1.1' },
    { success: false }
  );

  monitor.logEvent(
    SecurityEventType.INJECTION_ATTACK,
    SecuritySeverity.CRITICAL,
    { ipAddress: '10.0.0.1' },
    { attackType: 'SQL Injection' }
  );

  // Query events by severity
  const criticalEvents = monitor.queryEvents({
    severity: SecuritySeverity.CRITICAL,
  });
  console.log('Critical Events:', criticalEvents.length);

  // Query events by type
  const authEvents = monitor.queryEvents({
    type: SecurityEventType.AUTHENTICATION,
  });
  console.log('Auth Events:', authEvents.length);

  // Query events by IP
  const ipEvents = monitor.queryEvents({
    ipAddress: '192.168.1.1',
  });
  console.log('Events from 192.168.1.1:', ipEvents.length);
}

// ============================================================================
// EXAMPLE 6: Vulnerability Scanning
// ============================================================================

/**
 * Example 13: Running vulnerability scan
 */
async function example13_VulnerabilityScan() {
  console.log('\n=== Example 13: Vulnerability Scanning ===\n');

  // Quick scan with default options
  const result = await quickScan({
    scanDependencies: true,
    scanConfig: true,
    scanCode: true,
    checkHeaders: false,
  });

  console.log('Scan Summary:', result.summary);
  console.log('Security Score:', result.score);
  console.log('Duration:', result.duration, 'ms');

  // Print findings
  for (const finding of result.findings) {
    console.log(`\n[${finding.severity.toUpperCase()}] ${finding.title}`);
    console.log(`  Type: ${finding.type}`);
    console.log(`  Location: ${finding.location || 'N/A'}`);
    console.log(`  Description: ${finding.description}`);
    console.log(`  Remediation: ${finding.remediation}`);
  }
}

/**
 * Example 14: Custom vulnerability scan
 */
async function example14_CustomScan() {
  console.log('\n=== Example 14: Custom Vulnerability Scan ===\n');

  const scanner = new AdvancedVulnerabilityScanner({
    scanDependencies: true,
    scanConfig: true,
    scanCode: true,
    checkHeaders: false,
    paths: ['./src'],
    excludePatterns: ['node_modules/**', 'dist/**', 'test/**'],
    maxDepth: 5,
  });

  const result = await scanner.scan();

  // Export results
  scanner.exportResults(result, './security-scan-results.json');
  scanner.exportToSARIF(result, './security-scan-results.sarif');

  console.log('Scan complete. Results exported.');
}

// ============================================================================
// EXAMPLE 7: Integration Examples
// ============================================================================

/**
 * Example 15: Express.js middleware integration
 */
function example15_ExpressMiddleware() {
  console.log('\n=== Example 15: Express.js Middleware ===\n');

  // This shows how to integrate with Express.js
  const code = `
import express from 'express';
import { initSecurity } from './security/SecurityHardening.js';

const app = express();
const security = initSecurity();

// Security headers middleware
app.use((req, res, next) => {
  const headers = security.headers.getHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

// Rate limiting middleware
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

// Input validation middleware
app.use(express.json());
app.use((req, res, next) => {
  if (req.body) {
    const result = security.validator.sanitizeHTML(JSON.stringify(req.body));
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
  `;

  console.log('Express.js Integration Code:');
  console.log(code);
}

/**
 * Example 16: Complete authentication flow
 */
async function example16_CompleteAuthFlow() {
  console.log('\n=== Example 16: Complete Authentication Flow ===\n');

  const authManager = new AdvancedAuthManager({
    secret: 'your-secret-key',
    expiresIn: 3600,
  });

  const monitor = new SecurityMonitor();

  // User registration
  const username = 'john@example.com';
  const password = 'SecurePass123!';

  const strength = authManager.validatePasswordStrength(password);
  if (!strength.strong) {
    console.log('Password too weak:', strength.errors);
    return;
  }

  const hash = await authManager.hashPassword(password);
  console.log('User registered with password hash');

  // User login
  const loginCheck = authManager.checkLoginAttempt(username);
  if (!loginCheck.success) {
    console.log('Account locked. Retry after:', loginCheck.retryAfter, 'seconds');
    return;
  }

  const isValid = await authManager.verifyPassword(password, hash);
  if (!isValid) {
    authManager.recordLoginAttempt(username, false);
    logAuthenticationEvent(monitor, false, { userId: username });
    console.log('Invalid password');
    return;
  }

  authManager.recordLoginAttempt(username, true);
  logAuthenticationEvent(monitor, true, { userId: username });
  console.log('Login successful');

  // Create session
  const sessionId = authManager.createSession(username);
  console.log('Session created:', sessionId);

  // Generate JWT
  const token = await authManager.generateToken({
    sub: username,
    name: 'John Doe',
  });
  console.log('JWT generated:', token.substring(0, 50) + '...');
}

/**
 * Example 17: Security best practices checklist
 */
function example17_BestPractices() {
  console.log('\n=== Example 17: Security Best Practices Checklist ===\n');

  const checklist = [
    '✓ Use HTTPS everywhere',
    '✓ Implement rate limiting',
    '✓ Validate and sanitize all input',
    '✓ Use parameterized queries',
    '✓ Hash passwords with Argon2/bcrypt',
    '✓ Implement CSRF protection',
    '✓ Set security headers (CSP, HSTS, etc.)',
    '✓ Enable 2FA for sensitive accounts',
    '✓ Log and monitor security events',
    '✓ Run regular vulnerability scans',
    '✓ Keep dependencies updated',
    '✓ Implement proper session management',
    '✓ Use JWT tokens with short expiry',
    '✓ Encrypt sensitive data at rest',
    '✓ Implement proper access control',
    '✓ Use environment variables for secrets',
    '✓ Regularly audit and review code',
  ];

  checklist.forEach(item => console.log(item));
}

// ============================================================================
// RUN EXAMPLES
// ============================================================================

/**
 * Run all examples
 */
export async function runExamples() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Spreadsheet Moment - Security Hardening Examples        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    example1_BasicInit();
    example2_CustomConfig();
    await example3_InputValidation();
    await example4_AdvancedValidation();
    await example5_PasswordHashing();
    await example6_JWTokens();
    await example7_SessionManagement();
    await example8_LoginAttempts();
    await example9_TwoFactorAuth();
    example10_RateLimiting();
    example11_SecurityMonitoring();
    example12_QueryingEvents();
    await example13_VulnerabilityScan();
    await example14_CustomScan();
    example15_ExpressMiddleware();
    await example16_CompleteAuthFlow();
    example17_BestPractices();

    console.log('\n✓ All examples completed successfully!\n');
  } catch (error) {
    console.error('\n✗ Error running examples:', error);
  }
}

// Run examples if executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}
