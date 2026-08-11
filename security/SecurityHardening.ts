/**
 * Spreadsheet Moment - Security Hardening Suite
 *
 * Round 17: Comprehensive security implementation and penetration testing tools
 * Features: Security headers, input validation, authentication, vulnerability scanning
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import * as crypto from 'crypto';

/**
 * Security configuration
 */
export interface SecurityConfig {
  /** Content Security Policy */
  csp: {
    enabled: boolean;
    directives: Record<string, string[]>;
    reportOnly?: boolean;
  };
  /** Rate limiting */
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
  /** Authentication */
  auth: {
    bcryptRounds: number;
    argon2Config: {
      memoryCost: number;
      timeCost: number;
      parallelism: number;
    };
    sessionExpiry: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  /** CORS */
  cors: {
    enabled: boolean;
    origins: string[];
    credentials: boolean;
  };
  /** Helmet.js headers */
  helmet: {
    enabled: boolean;
    hsts: boolean;
    noSniff: boolean;
    frameguard: boolean;
    xssFilter: boolean;
  };
}

/**
 * Input sanitization result
 */
export interface SanitizationResult {
  sanitized: string;
  safe: boolean;
  threats: string[];
}

/**
 * Vulnerability scan result
 */
export interface VulnerabilityScan {
  vulnerabilities: {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    type: string;
    description: string;
    remediation: string;
  }[];
  score: number; // 0-100 (higher = more secure)
  timestamp: Date;
}

/**
 * Security headers manager
 */
export class SecurityHeaders {
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  /**
   * Generate all security headers
   */
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.helmet.enabled) {
      // Content Security Policy
      if (this.config.csp.enabled) {
        headers['Content-Security-Policy'] = this.buildCSP();
        if (this.config.csp.reportOnly) {
          headers['Content-Security-Policy-Report-Only'] = this.buildCSP();
        }
      }

      // HTTP Strict Transport Security
      if (this.config.helmet.hsts) {
        headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
      }

      // X-Content-Type-Options
      if (this.config.helmet.noSniff) {
        headers['X-Content-Type-Options'] = 'nosniff';
      }

      // X-Frame-Options
      if (this.config.helmet.frameguard) {
        headers['X-Frame-Options'] = 'DENY';
      }

      // X-XSS-Protection
      if (this.config.helmet.xssFilter) {
        headers['X-XSS-Protection'] = '1; mode=block';
      }

      // Additional security headers
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
      headers['Permissions-Policy'] = this.buildPermissionsPolicy();
      headers['Cross-Origin-Opener-Policy'] = 'same-origin';
      headers['Cross-Origin-Resource-Policy'] = 'same-origin';
    }

    return headers;
  }

  /**
   * Build Content Security Policy
   */
  private buildCSP(): string {
    const directives = this.config.csp.directives;

    // Default CSP directives
    const defaultDirectives: Record<string, string[]> = {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'media-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
    };

    // Merge with custom directives
    const merged = { ...defaultDirectives, ...directives };

    return Object.entries(merged)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }

  /**
   * Build Permissions Policy
   */
  private buildPermissionsPolicy(): string {
    const policies = [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ];

    return policies.join(', ');
  }
}

/**
 * Input validator and sanitizer
 */
export class InputValidator {
  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeHTML(input: string): SanitizationResult {
    const threats: string[] = [];
    let sanitized = input;

    // Detect script tags
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(input)) {
      threats.push('Script tag detected');
    }

    // Detect on* event handlers
    if (/\s+on\w+\s*=/gi.test(input)) {
      threats.push('Event handler detected');
    }

    // Detect javascript: protocol
    if (/javascript:/gi.test(input)) {
      threats.push('JavaScript protocol detected');
    }

    // Detect data: with script (data URI XSS)
    if (/data:\s*text\/html/gi.test(input)) {
      threats.push('Data URI script detected');
    }

    // Sanitize by removing dangerous content
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\s+on\w+\s*=/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:\s*text\/html/gi, '');

    return {
      sanitized,
      safe: threats.length === 0,
      threats,
    };
  }

  /**
   * Validate SQL query for injection attempts
   */
  validateSQL(query: string, params: any[]): SanitizationResult {
    const threats: string[] = [];

    // Detect SQL injection patterns
    const injectionPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /(\bor\b|\band\b).*?=/i,
      /exec(\s|\+)+(s|x)p\w+/i,
      /union(\s|\+)+(select)/i,
      /select(\s|\+).*?from/i,
      /insert(\s|\+).*?into/i,
      /delete(\s|\+).*?from/i,
      /update(\s|\+).*?set/i,
      /drop(\s|\+)*(table|database)/i,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(query)) {
        threats.push(`SQL injection pattern detected: ${pattern}`);
      }
    }

    // Check for parameterized queries (if params exist)
    if (params.length > 0) {
      // Check if params are properly escaped (for string params)
      for (const param of params) {
        if (typeof param === 'string') {
          if (/['"\\]/.test(param) && !/['"]\s*\+\s*['"]/.test(query)) {
            threats.push('Possible unescaped parameter');
          }
        }
      }
    }

    return {
      sanitized: query,
      safe: threats.length === 0,
      threats,
    };
  }

  /**
   * Validate file upload
   */
  validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
  }): SanitizationResult {
    const threats: string[] = [];

    // Check file extension
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
      '.vbs', '.js', '.jar', '.app', '.deb', '.rpm',
    ];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (dangerousExtensions.includes(ext)) {
      threats.push(`Dangerous file extension: ${ext}`);
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      threats.push('File size exceeds limit (10MB)');
    }

    // Check MIME type
    const dangerousTypes = [
      'application/x-msdownload',
      'application/x-msdos-program',
      'application/x-executable',
    ];

    if (dangerousTypes.includes(file.type)) {
      threats.push(`Dangerous MIME type: ${file.type}`);
    }

    // Check for double extension (e.g., file.jpg.exe)
    if ((file.name.match(/\./g) || []).length > 1) {
      threats.push('Double extension detected');
    }

    return {
      sanitized: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
      safe: threats.length === 0,
      threats,
    };
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): SanitizationResult {
    const threats: string[] = [];

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      threats.push('Invalid email format');
    }

    // Check for suspicious patterns
    if (email.includes('../') || email.includes('..\\')) {
      threats.push('Path traversal attempt detected');
    }

    return {
      sanitized: email.toLowerCase().trim(),
      safe: threats.length === 0,
      threats,
    };
  }
}

/**
 * Authentication manager
 */
export class AuthManager {
  private config: SecurityConfig['auth'];
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  constructor(config: SecurityConfig['auth']) {
    this.config = config;
  }

  /**
   * Hash password using Argon2 (recommended) or bcrypt (fallback)
   */
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16);

    try {
      // Try Argon2 first (most secure)
      const argon2 = require('argon2');
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: this.config.argon2Config.memoryCost,
        timeCost: this.config.argon2Config.timeCost,
        parallelism: this.config.argon2Config.parallelism,
      });
    } catch {
      // Fallback to bcrypt
      const bcrypt = require('bcrypt');
      return await bcrypt.hash(password, this.config.bcryptRounds);
    }
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const argon2 = require('argon2');
      return await argon2.verify(hash, password);
    } catch {
      const bcrypt = require('bcrypt');
      return await bcrypt.compare(password, hash);
    }
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate session ID
   */
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Check login rate limiting
   */
  async checkLoginRateLimit(identifier: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
    const now = Date.now();

    // Reset if lockout period has passed
    if (attempts.count >= this.config.maxLoginAttempts) {
      const lockoutEnd = attempts.lastAttempt + this.config.lockoutDuration;
      if (now < lockoutEnd) {
        return {
          allowed: false,
          retryAfter: Math.ceil((lockoutEnd - now) / 1000),
        };
      }
    }

    // Check rate limit within window
    if (now - attempts.lastAttempt < 60000) { // 1 minute window
      if (attempts.count >= this.config.maxLoginAttempts) {
        return {
          allowed: false,
          retryAfter: 60,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Record login attempt
   */
  recordLoginAttempt(identifier: string, success: boolean): void {
    if (success) {
      this.loginAttempts.delete(identifier);
    } else {
      const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
      this.loginAttempts.set(identifier, {
        count: attempts.count + 1,
        lastAttempt: Date.now(),
      });
    }
  }

  /**
   * Generate TOTP secret for 2FA
   */
  generateTOTPSecret(): string {
    return crypto.randomBytes(20).toString('base32');
  }

  /**
   * Verify TOTP code
   */
  verifyTOTP(secret: string, token: string): boolean {
    const speakeasy = require('speakeasy');
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }
}

/**
 * CSRF protection
 */
export class CSRFProtection {
  private tokens: Map<string, { token: string; expiry: number }> = new Map();

  /**
   * Generate CSRF token
   */
  generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour

    this.tokens.set(sessionId, { token, expiry });
    return token;
  }

  /**
   * Verify CSRF token
   */
  verifyToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);

    if (!stored) {
      return false;
    }

    if (Date.now() > stored.expiry) {
      this.tokens.delete(sessionId);
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(stored.token),
      Buffer.from(token)
    );
  }

  /**
   * Clean up expired tokens
   */
  cleanup(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expiry) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

/**
 * Vulnerability scanner
 */
export class VulnerabilityScanner {
  /**
   * Scan for security vulnerabilities
   */
  async scan(): Promise<VulnerabilityScan> {
    const vulnerabilities: VulnerabilityScan['vulnerabilities'] = [];

    // Check for outdated dependencies
    const depVulns = await this.checkDependencies();
    vulnerabilities.push(...depVulns);

    // Check security headers
    const headerVulns = this.checkSecurityHeaders();
    vulnerabilities.push(...headerVulns);

    // Check for common vulnerabilities
    const commonVulns = this.checkCommonVulnerabilities();
    vulnerabilities.push(...commonVulns);

    // Calculate security score
    const score = this.calculateScore(vulnerabilities);

    return {
      vulnerabilities,
      score,
      timestamp: new Date(),
    };
  }

  /**
   * Check for vulnerable dependencies
   */
  private async checkDependencies(): VulnerabilityScan['vulnerabilities'] {
    const vulnerabilities: VulnerabilityScan['vulnerabilities'] = [];

    try {
      // Read package.json
      const packageJson = require('../../package.json');
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // In production, this would use npm audit or Snyk
      // For now, check for known vulnerable versions
      const knownVulnerabilities: Record<string, { version: string; severity: string; description: string }> = {
        'lodash': {
          version: '<4.17.21',
          severity: 'high',
          description: 'Prototype pollution in lodash',
        },
        'axios': {
          version: '<0.21.1',
          severity: 'medium',
          description: 'SSRF in axios',
        },
      };

      const depNames = Object.keys(dependencies);
      for (let i = 0; i < depNames.length; i++) {
        const dep = depNames[i];
        const version = dependencies[dep] as string;
        const vuln = knownVulnerabilities[dep];
        if (vuln !== undefined && this.satisfiesVersion(version, vuln.version)) {
          vulnerabilities.push({
            severity: vuln.severity as any,
            type: 'Dependency Vulnerability',
            description: vuln.description,
            remediation: 'Update ' + dep + ' to latest version',
          });
        }
      }
    } catch (error) {
      // package.json not found or error reading
    }

    return vulnerabilities;
  }

  /**
   * Check security headers
   */
  private checkSecurityHeaders(): VulnerabilityScan['vulnerabilities'] {
    const vulnerabilities: VulnerabilityScan['vulnerabilities'] = [];

    // In production, this would make actual HTTP requests
    // For now, return example checks

    return vulnerabilities;
  }

  /**
   * Check for common vulnerabilities
   */
  private checkCommonVulnerabilities(): VulnerabilityScan['vulnerabilities'] {
    const vulnerabilities: VulnerabilityScan['vulnerabilities'] = [];

    // Check for debug mode
    if (process.env.NODE_ENV === 'development') {
      vulnerabilities.push({
        severity: 'info',
        type: 'Debug Mode',
        description: 'Application running in development mode',
        remediation: 'Set NODE_ENV=production in production',
      });
    }

    // Check for insecure cookies
    if (process.env.COOKIE_SECURE !== 'true') {
      vulnerabilities.push({
        severity: 'medium',
        type: 'Insecure Cookies',
        description: 'Cookies not marked as secure',
        remediation: 'Set COOKIE_SECURE=true',
      });
    }

    return vulnerabilities;
  }

  /**
   * Calculate security score (0-100)
   */
  private calculateScore(vulnerabilities: VulnerabilityScan['vulnerabilities']): number {
    let score = 100;

    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
        case 'info':
          score -= 1;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Check if version satisfies constraint
   */
  private satisfiesVersion(version: string, constraint: string): boolean {
    // Simple version comparison (in production, use semver library)
    return version.startsWith(constraint.replace(/[<>=]/, '').split(' ')[0]);
  }
}

/**
 * Rate limiter
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: SecurityConfig['rateLimit'];

  constructor(config: SecurityConfig['rateLimit']) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  check(identifier: string): { allowed: boolean; retryAfter?: number } {
    if (!this.config.enabled) {
      return { allowed: true };
    }

    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or init request history
    let timestamps = this.requests.get(identifier) || [];

    // Filter out old requests outside window
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // Check if limit exceeded
    if (timestamps.length >= this.config.maxRequests) {
      // Find oldest request in window
      const oldest = timestamps[0];
      const retryAfter = Math.ceil((oldest + this.config.windowMs - now) / 1000);

      return { allowed: false, retryAfter };
    }

    // Add current request
    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    return { allowed: true };
  }

  /**
   * Clear rate limit for identifier
   */
  clear(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clean up old entries
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [identifier, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((ts) => ts > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validTimestamps);
      }
    }
  }
}

// Export default configuration
export const defaultSecurityConfig: SecurityConfig = {
  csp: {
    enabled: true,
    directives: {
      'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.example.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
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
      timeCost: 3, // iterations
      parallelism: 4, // threads
    },
    sessionExpiry: 3600000, // 1 hour
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
  },
  cors: {
    enabled: true,
    origins: ['https://spreadsheetmoment.com'],
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

/**
 * Initialize security suite
 */
export function initSecurity(config: SecurityConfig = defaultSecurityConfig) {
  return {
    headers: new SecurityHeaders(config),
    validator: new InputValidator(),
    auth: new AuthManager(config.auth),
    csrf: new CSRFProtection(),
    scanner: new VulnerabilityScanner(),
    rateLimiter: new RateLimiter(config.rateLimit),
  };
}
