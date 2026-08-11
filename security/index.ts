/**
 * Spreadsheet Moment - Security Hardening Module
 * Round 17: Enterprise-grade security with OWASP Top 10 compliance
 *
 * Comprehensive security suite with:
 * - Input validation and sanitization
 * - Authentication and authorization
 * - Rate limiting and CSRF protection
 * - Security monitoring and alerting
 * - Vulnerability scanning
 * - Security headers management
 */

// Core security functionality
export {
  SecurityHeaders,
  InputValidator,
  AuthManager,
  CSRFProtection,
  VulnerabilityScanner,
  RateLimiter,
  defaultSecurityConfig,
  initSecurity
} from './SecurityHardening.js';

export type {
  SecurityConfig,
  SanitizationResult,
  VulnerabilityScan
} from './SecurityHardening.js';

// Advanced input validation
export {
  InputValidator as AdvancedInputValidator,
  validateString,
  validateNumber,
  validateEmail,
  validateURL,
  validatePath,
  validateFile,
  validateJSON,
  validateSQLQuery,
  defaultValidator
} from './validation.js';

export type {
  ValidationResult,
  ValidationOptions,
  FileValidation
} from './validation.js';

// Authentication helpers
export {
  AuthManager as AdvancedAuthManager,
  validatePasswordStrength,
  generateToken,
  generateId
} from './auth.js';

export type {
  JWTPayload,
  JWTOptions,
  PasswordHashOptions,
  PasswordStrengthResult,
  SessionData,
  TOTPOptions,
  LoginAttempt
} from './auth.js';

// Security monitoring
export {
  SecurityMonitor,
  SecurityEventType,
  SecuritySeverity,
  logAuthenticationEvent,
  logInjectionAttack,
  logRateLimitExceeded
} from './monitoring.js';

export type {
  SecurityEvent,
  AlertConfig,
  AlertChannel,
  AnomalyResult,
  SecurityMetrics,
  MonitoringStats
} from './monitoring.js';

// Vulnerability scanning
export {
  VulnerabilityScanner as AdvancedVulnerabilityScanner,
  quickScan
} from './vulnerability-scanner.js';

export type {
  VulnerabilityFinding,
  ScanResult,
  ScanOptions,
  VulnerabilitySeverity as VulnSeverity,
  VulnerabilityType as VulnType
} from './vulnerability-scanner.js';

// Usage examples (for development/testing)
export {
  runExamples
} from './examples.js';
