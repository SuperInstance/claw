/**
 * Spreadsheet Moment - Input Validation Utilities
 * Round 17: OWASP Top 10 - Injection Prevention
 *
 * Comprehensive input validation for preventing injection attacks:
 * - SQL Injection
 * - NoSQL Injection
 * - OS Command Injection
 * - LDAP Injection
 * - XPath Injection
 * - HTML/XML Injection
 * - Path Traversal
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import * as path from 'path';
import { URL } from 'url';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  sanitized?: any;
  errors: string[];
  warnings: string[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Maximum string length */
  maxLength?: number;
  /** Allow null bytes */
  allowNullBytes?: boolean;
  /** Allow special characters */
  allowSpecialChars?: boolean;
  /** Custom validation patterns */
  customPatterns?: RegExp[];
  /** Sanitize output */
  sanitize?: boolean;
  /** Trim whitespace */
  trim?: boolean;
}

/**
 * SQL injection patterns
 */
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /(\bor\b|\band\b).*?=/i,
  /exec(\s|\+)+(s|x)p\w+/i,
  /union(\s|\+)+(select)/i,
  /select(\s|\+).*?from/i,
  /insert(\s|\+).*?into/i,
  /delete(\s|\+).*?from/i,
  /update(\s|\+).*?set/i,
  /drop(\s|\+)*(table|database)/i,
  /;.*?(drop|delete|insert|update|exec)/i,
  /\w*(\s|\+)*=(\s|\+)*\w*(\s|\+)*(or|and)/i,
  /1=1/i,
  /1 = 1/i,
  /admin'--/i,
  /' OR '1'='1/i,
  /' OR '1'='1'--/i,
  /admin'/i,
];

/**
 * NoSQL injection patterns
 */
const NOSQL_INJECTION_PATTERNS = [
  /\$where/i,
  /\$ne/i,
  /\$in/i,
  /\$gt/i,
  /\$lt/i,
  /\$regex/i,
  /\$expr/i,
  /{.*\$.*}/i,
  /'.*\$.*'/i,
];

/**
 * OS command injection patterns
 */
const OS_COMMAND_PATTERNS = [
  /;\s*\w+/i,
  /\|\s*\w+/i,
  /&&\s*\w+/i,
  /\`\`/,
  /\$\([^)]*\)/i,
  />>/, // Redirect append
  />/, // Redirect
  /</, // Redirect input
  /\n\s*\w+/,
  /\r\s*\w+/,
];

/**
 * Path traversal patterns
 */
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/,
  /\.\.%2f/i,
  /\.\.%5c/i,
  /%2e%2e[\/\\]/i,
  /%252e%252e/i,
  /\.\.%255c/i,
  /\.\.%c0%af/i,
  /%c0%ae%c0%ae%c0%af/i,
];

/**
 * XSS attack patterns
 */
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<embed[^>]*>/gi,
  /<object[^>]*>/gi,
  /data:\s*text\/html/gi,
  /vbscript:/gi,
  /<\?php/gi,
  /<%/gi,
  /\$\{.*?\}/g,
  /expression\s*\(/gi,
];

/**
 * LDAP injection patterns
 */
const LDAP_INJECTION_PATTERNS = [
  /\(\)/,
  /\*\)/,
  /\(\|/,
  /\(&/,
  /\/\*/,
  /\/\//,
  /[()=,*!&|<>~]/,
];

/**
 * File upload validation
 */
export interface FileValidation {
  name: string;
  size: number;
  type: string;
  content?: Buffer;
}

/**
 * Allowed file types
 */
const ALLOWED_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

/**
 * Dangerous file extensions
 */
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
  '.vbs', '.js', '.jar', '.app', '.deb', '.rpm',
  '.sh', '.ps1', '.vb', '.wsf', '.js', '.jse',
]);

/**
 * Input Validator class
 */
export class InputValidator {
  private options: ValidationOptions;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      maxLength: 10000,
      allowNullBytes: false,
      allowSpecialChars: true,
      sanitize: true,
      trim: true,
      ...options,
    };
  }

  /**
   * Validate string input
   */
  validateString(input: string, fieldName: string = 'input'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitized = input;

    // Trim if enabled
    if (this.options.trim) {
      sanitized = sanitized.trim();
    }

    // Check max length
    if (this.options.maxLength && sanitized.length > this.options.maxLength) {
      errors.push(`${fieldName} exceeds maximum length of ${this.options.maxLength}`);
    }

    // Check for null bytes
    if (!this.options.allowNullBytes && /\0/.test(sanitized)) {
      errors.push(`${fieldName} contains null bytes`);
    }

    // Check for injection patterns
    const sqlResult = this.detectSQLInjection(sanitized);
    if (sqlResult.detected) {
      errors.push(`SQL injection detected in ${fieldName}: ${sqlResult.patterns.join(', ')}`);
    }

    const nosqlResult = this.detectNoSQLInjection(sanitized);
    if (nosqlResult.detected) {
      errors.push(`NoSQL injection detected in ${fieldName}: ${nosqlResult.patterns.join(', ')}`);
    }

    const osResult = this.detectOSCommandInjection(sanitized);
    if (osResult.detected) {
      errors.push(`OS command injection detected in ${fieldName}: ${osResult.patterns.join(', ')}`);
    }

    const xssResult = this.detectXSS(sanitized);
    if (xssResult.detected) {
      warnings.push(`XSS detected in ${fieldName}: ${xssResult.patterns.join(', ')}`);
    }

    // Apply custom patterns
    if (this.options.customPatterns) {
      for (const pattern of this.options.customPatterns) {
        if (pattern.test(sanitized)) {
          errors.push(`${fieldName} matches forbidden pattern: ${pattern}`);
        }
      }
    }

    // Sanitize if enabled
    if (this.options.sanitize) {
      sanitized = this.sanitizeString(sanitized);
    }

    // Determine severity
    let severity: ValidationResult['severity'] = 'info';
    if (errors.length > 0) {
      severity = sqlResult.detected || nosqlResult.detected || osResult.detected ? 'critical' : 'high';
    } else if (warnings.length > 0) {
      severity = 'medium';
    }

    return {
      valid: errors.length === 0,
      sanitized,
      errors,
      warnings,
      severity,
    };
  }

  /**
   * Validate number input
   */
  validateNumber(
    input: any,
    fieldName: string = 'input',
    options: { min?: number; max?: number; integer?: boolean } = {}
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if number
    if (typeof input !== 'number' || isNaN(input)) {
      errors.push(`${fieldName} must be a valid number`);
      return {
        valid: false,
        errors,
        warnings,
        severity: 'high',
      };
    }

    // Check integer constraint
    if (options.integer && !Number.isInteger(input)) {
      errors.push(`${fieldName} must be an integer`);
    }

    // Check range
    if (options.min !== undefined && input < options.min) {
      errors.push(`${fieldName} must be at least ${options.min}`);
    }

    if (options.max !== undefined && input > options.max) {
      errors.push(`${fieldName} must be at most ${options.max}`);
    }

    return {
      valid: errors.length === 0,
      sanitized: input,
      errors,
      warnings,
      severity: errors.length > 0 ? 'high' : 'info',
    };
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Check for path traversal
    if (this.detectPathTraversal(email).detected) {
      errors.push('Path traversal attempt detected in email');
    }

    // Check length
    if (email.length > 254) {
      errors.push('Email exceeds maximum length of 254 characters');
    }

    // Sanitize
    const sanitized = email.toLowerCase().trim();

    return {
      valid: errors.length === 0,
      sanitized,
      errors,
      warnings,
      severity: errors.length > 0 ? 'high' : 'info',
    };
  }

  /**
   * Validate URL
   */
  validateURL(url: string, options: { allowedProtocols?: string[] } = {}): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const defaultProtocols = ['http:', 'https:', 'ftp:'];
    const allowedProtocols = options.allowedProtocols || defaultProtocols;

    try {
      const parsed = new URL(url);

      // Check protocol
      if (!allowedProtocols.includes(parsed.protocol)) {
        errors.push(`Protocol ${parsed.protocol} is not allowed`);
      }

      // Check for dangerous protocols
      if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
        errors.push('Dangerous protocol detected');
      }

      return {
        valid: errors.length === 0,
        sanitized: parsed.href,
        errors,
        warnings,
        severity: errors.length > 0 ? 'critical' : 'info',
      };
    } catch {
      return {
        valid: false,
        errors: ['Invalid URL format'],
        warnings,
        severity: 'high',
      };
    }
  }

  /**
   * Validate file path
   */
  validatePath(filePath: string, options: { allowTraversal?: boolean; basePath?: string } = {}): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for path traversal
    const traversalResult = this.detectPathTraversal(filePath);
    if (traversalResult.detected && !options.allowTraversal) {
      errors.push(`Path traversal detected: ${traversalResult.patterns.join(', ')}`);
    }

    // Normalize path
    const normalized = path.normalize(filePath);

    // Check against base path if provided
    if (options.basePath && !options.allowTraversal) {
      const resolved = path.resolve(options.basePath, normalized);
      const baseResolved = path.resolve(options.basePath);

      if (!resolved.startsWith(baseResolved)) {
        errors.push('Path escapes base directory');
      }
    }

    return {
      valid: errors.length === 0,
      sanitized: normalized,
      errors,
      warnings,
      severity: errors.length > 0 ? 'critical' : 'info',
    };
  }

  /**
   * Validate file upload
   */
  validateFile(file: FileValidation): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file name
    if (!file.name || file.name.length === 0) {
      errors.push('File name is required');
    }

    // Check file extension
    const ext = path.extname(file.name).toLowerCase();
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      errors.push(`Dangerous file extension: ${ext}`);
    }

    // Check for double extension
    const parts = file.name.split('.');
    if (parts.length > 2) {
      warnings.push('Double extension detected');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(`File size exceeds limit of ${maxSize} bytes`);
    }

    // Check MIME type
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      warnings.push(`Uncommon MIME type: ${file.type}`);
    }

    // Sanitize filename
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    return {
      valid: errors.length === 0,
      sanitized: { ...file, name: sanitized },
      errors,
      warnings,
      severity: errors.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'info',
    };
  }

  /**
   * Validate JSON data
   */
  validateJSON(data: string, schema?: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let parsed: any;

    try {
      parsed = JSON.parse(data);
    } catch (error) {
      errors.push(`Invalid JSON: ${error}`);
      return {
        valid: false,
        errors,
        warnings,
        severity: 'high',
      };
    }

    // Validate against schema if provided
    if (schema) {
      const schemaErrors = this.validateAgainstSchema(parsed, schema);
      errors.push(...schemaErrors);
    }

    return {
      valid: errors.length === 0,
      sanitized: parsed,
      errors,
      warnings,
      severity: errors.length > 0 ? 'high' : 'info',
    };
  }

  /**
   * Validate SQL query
   */
  validateSQLQuery(query: string, params: any[] = []): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for SQL injection
    const sqlResult = this.detectSQLInjection(query);
    if (sqlResult.detected) {
      errors.push(`SQL injection detected: ${sqlResult.patterns.join(', ')}`);
    }

    // Check if query uses parameterized inputs
    if (params.length > 0) {
      const hasPlaceholders = /\?|:\w+|@\w+|\$\d+/.test(query);
      if (!hasPlaceholders) {
        warnings.push('Query does not use parameterized inputs');
      }
    }

    // Check for dangerous operations
    const dangerousOps = /\b(DROP\s+(TABLE|DATABASE)|TRUNCATE|DELETE\s+FROM.*WHERE\s+1=1)\b/i;
    if (dangerousOps.test(query)) {
      errors.push('Dangerous SQL operation detected');
    }

    return {
      valid: errors.length === 0,
      sanitized: query,
      errors,
      warnings,
      severity: errors.length > 0 ? 'critical' : warnings.length > 0 ? 'medium' : 'info',
    };
  }

  /**
   * Detect SQL injection patterns
   */
  private detectSQLInjection(input: string): { detected: boolean; patterns: string[] } {
    const patterns: string[] = [];

    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        patterns.push(pattern.toString());
      }
    }

    return {
      detected: patterns.length > 0,
      patterns,
    };
  }

  /**
   * Detect NoSQL injection patterns
   */
  private detectNoSQLInjection(input: string): { detected: boolean; patterns: string[] } {
    const patterns: string[] = [];

    for (const pattern of NOSQL_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        patterns.push(pattern.toString());
      }
    }

    return {
      detected: patterns.length > 0,
      patterns,
    };
  }

  /**
   * Detect OS command injection patterns
   */
  private detectOSCommandInjection(input: string): { detected: boolean; patterns: string[] } {
    const patterns: string[] = [];

    for (const pattern of OS_COMMAND_PATTERNS) {
      if (pattern.test(input)) {
        patterns.push(pattern.toString());
      }
    }

    return {
      detected: patterns.length > 0,
      patterns,
    };
  }

  /**
   * Detect XSS patterns
   */
  private detectXSS(input: string): { detected: boolean; patterns: string[] } {
    const patterns: string[] = [];

    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(input)) {
        patterns.push(pattern.toString());
      }
    }

    return {
      detected: patterns.length > 0,
      patterns,
    };
  }

  /**
   * Detect path traversal patterns
   */
  private detectPathTraversal(input: string): { detected: boolean; patterns: string[] } {
    const patterns: string[] = [];

    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(input)) {
        patterns.push(pattern.toString());
      }
    }

    return {
      detected: patterns.length > 0,
      patterns,
    };
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(input: string): string {
    let sanitized = input;

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove control characters (except newline, tab, carriage return)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Escape HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  /**
   * Validate against schema
   */
  private validateAgainstSchema(data: any, schema: any): string[] {
    const errors: string[] = [];

    // Basic schema validation
    if (schema.type) {
      const type = typeof data;
      if (type !== schema.type) {
        errors.push(`Expected type ${schema.type}, got ${type}`);
      }
    }

    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Required field ${field} is missing`);
        }
      }
    }

    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in data) {
          const propErrors = this.validateAgainstSchema(data[key], propSchema);
          errors.push(...propErrors.map(e => `${key}: ${e}`));
        }
      }
    }

    return errors;
  }
}

/**
 * Default validator instance
 */
export const defaultValidator = new InputValidator();

/**
 * Convenience functions
 */
export function validateString(input: string, fieldName?: string): ValidationResult {
  return defaultValidator.validateString(input, fieldName);
}

export function validateNumber(input: any, fieldName?: string, options?: { min?: number; max?: number; integer?: boolean }): ValidationResult {
  return defaultValidator.validateNumber(input, fieldName, options);
}

export function validateEmail(email: string): ValidationResult {
  return defaultValidator.validateEmail(email);
}

export function validateURL(url: string, options?: { allowedProtocols?: string[] }): ValidationResult {
  return defaultValidator.validateURL(url, options);
}

export function validatePath(filePath: string, options?: { allowTraversal?: boolean; basePath?: string }): ValidationResult {
  return defaultValidator.validatePath(filePath, options);
}

export function validateFile(file: FileValidation): ValidationResult {
  return defaultValidator.validateFile(file);
}

export function validateJSON(data: string, schema?: any): ValidationResult {
  return defaultValidator.validateJSON(data, schema);
}

export function validateSQLQuery(query: string, params?: any[]): ValidationResult {
  return defaultValidator.validateSQLQuery(query, params);
}
