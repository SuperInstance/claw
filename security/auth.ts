/**
 * Spreadsheet Moment - Authentication Helpers
 * Round 17: OWASP Top 10 - Broken Authentication
 *
 * Comprehensive authentication utilities:
 * - JWT token management
 * - Session management
 * - Password hashing (Argon2/bcrypt)
 * - Two-factor authentication (TOTP)
 * - Password strength validation
 * - Account lockout mechanisms
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import * as crypto from 'crypto';
import { promisify } from 'util';

const pbkdf2 = promisify(crypto.pbkdf2);

/**
 * JWT payload
 */
export interface JWTPayload {
  sub: string; // Subject (user ID)
  iss?: string; // Issuer
  aud?: string; // Audience
  exp?: number; // Expiration
  nbf?: number; // Not before
  iat?: number; // Issued at
  jti?: string; // JWT ID
  [key: string]: any; // Additional claims
}

/**
 * JWT header
 */
interface JWTHeader {
  alg: string;
  typ: string;
  [key: string]: any;
}

/**
 * JWT options
 */
export interface JWTOptions {
  /** Secret key */
  secret: string;
  /** Algorithm */
  algorithm?: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
  /** Token expiration (seconds) */
  expiresIn?: number;
  /** Issuer */
  issuer?: string;
  /** Audience */
  audience?: string;
  /** Private key (for RSA) */
  privateKey?: string;
  /** Public key (for RSA) */
  publicKey?: string;
}

/**
 * Password hash options
 */
export interface PasswordHashOptions {
  /** Algorithm (argon2 or bcrypt) */
  algorithm?: 'argon2' | 'bcrypt' | 'pbkdf2';
  /** Memory cost (Argon2) */
  memoryCost?: number;
  /** Time cost (Argon2) */
  timeCost?: number;
  /** Parallelism (Argon2) */
  parallelism?: number;
  /** Salt rounds (bcrypt) */
  saltRounds?: number;
  /** Iterations (PBKDF2) */
  iterations?: number;
  /** Key length (PBKDF2) */
  keyLength?: number;
  /** Digest (PBKDF2) */
  digest?: string;
}

/**
 * Password strength result
 */
export interface PasswordStrengthResult {
  strong: boolean;
  score: number; // 0-100
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Session data
 */
export interface SessionData {
  sessionId: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  data?: Record<string, any>;
}

/**
 * TOTP options
 */
export interface TOTPOptions {
  /** Secret length */
  secretLength?: number;
  /** Digits */
  digits?: 6 | 8;
  /** Period (seconds) */
  period?: number;
  /** Algorithm */
  algorithm?: 'sha1' | 'sha256' | 'sha512';
}

/**
 * Login attempt result
 */
export interface LoginAttempt {
  success: boolean;
  attempts: number;
  remainingAttempts: number;
  lockoutUntil?: Date;
  retryAfter?: number;
}

/**
 * Authentication Manager class
 */
export class AuthManager {
  private jwtOptions: JWTOptions;
  private passwordOptions: PasswordHashOptions;
  private sessions: Map<string, SessionData> = new Map();
  private loginAttempts: Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }> = new Map();
  private maxLoginAttempts: number = 5;
  private lockoutDuration: number = 15 * 60 * 1000; // 15 minutes
  private sessionExpiry: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    jwtOptions: JWTOptions,
    passwordOptions: PasswordHashOptions = {}
  ) {
    this.jwtOptions = {
      algorithm: 'HS256',
      expiresIn: 3600, // 1 hour
      ...jwtOptions,
    };

    this.passwordOptions = {
      algorithm: 'argon2',
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
      saltRounds: 12,
      iterations: 100000,
      keyLength: 64,
      digest: 'sha512',
      ...passwordOptions,
    };

    // Cleanup expired sessions periodically
    setInterval(() => this.cleanupExpiredSessions(), 60000); // Every minute
  }

  /**
   * Generate JWT token
   */
  async generateToken(payload: JWTPayload): Promise<string> {
    const header: JWTHeader = {
      alg: this.jwtOptions.algorithm!,
      typ: 'JWT',
    };

    // Add standard claims
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JWTPayload = {
      ...payload,
      iss: this.jwtOptions.issuer,
      aud: this.jwtOptions.audience,
      iat: now,
      exp: this.jwtOptions.expiresIn ? now + this.jwtOptions.expiresIn : undefined,
      jti: this.generateTokenId(),
    };

    // Encode header and payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));

    // Generate signature
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = await this.sign(data);

    return `${data}.${signature}`;
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<{ valid: boolean; payload?: JWTPayload; error?: string }> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [encodedHeader, encodedPayload, signature] = parts;

      // Verify signature
      const data = `${encodedHeader}.${encodedPayload}`;
      const isValid = await this.verify(data, signature);

      if (!isValid) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Decode payload
      const payload: JWTPayload = JSON.parse(this.base64UrlDecode(encodedPayload));

      // Check expiration
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return { valid: false, error: 'Token expired' };
      }

      // Check not before
      if (payload.nbf && Date.now() / 1000 < payload.nbf) {
        return { valid: false, error: 'Token not yet valid' };
      }

      // Verify issuer
      if (this.jwtOptions.issuer && payload.iss !== this.jwtOptions.issuer) {
        return { valid: false, error: 'Invalid issuer' };
      }

      // Verify audience
      if (this.jwtOptions.audience && payload.aud !== this.jwtOptions.audience) {
        return { valid: false, error: 'Invalid audience' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: `Token verification failed: ${error}` };
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(token: string): Promise<string | null> {
    const result = await this.verifyToken(token);

    if (!result.valid || !result.payload) {
      return null;
    }

    // Generate new token with same payload
    return this.generateToken(result.payload);
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16);

    switch (this.passwordOptions.algorithm) {
      case 'argon2':
        return this.hashPasswordArgon2(password, salt);
      case 'bcrypt':
        return this.hashPasswordBcrypt(password);
      case 'pbkdf2':
        return this.hashPasswordPBKDF2(password, salt);
      default:
        throw new Error(`Unsupported algorithm: ${this.passwordOptions.algorithm}`);
    }
  }

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      // Detect hash format
      if (hash.startsWith('$argon2')) {
        return this.verifyPasswordArgon2(password, hash);
      } else if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
        return this.verifyPasswordBcrypt(password, hash);
      } else {
        // Assume PBKDF2 format: salt.salt iterations
        return this.verifyPasswordPBKDF2(password, hash);
      }
    } catch {
      return false;
    }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): PasswordStrengthResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Check length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (password.length < 12) {
      warnings.push('Password should be at least 12 characters long');
    } else {
      score += 20;
    }

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 15;
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 15;
    }

    // Check for numbers
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 15;
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 15;
    }

    // Check for common patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /admin/i,
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        warnings.push('Password contains common patterns');
        score -= 10;
        break;
      }
    }

    // Check for character repetition
    if (/(.)\1{2,}/.test(password)) {
      warnings.push('Password contains repeated characters');
      score -= 10;
    }

    // Check for sequential characters
    if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
      warnings.push('Password contains sequential characters');
      score -= 10;
    }

    // Add suggestions
    if (errors.length > 0 || warnings.length > 0) {
      suggestions.push('Use a mix of uppercase and lowercase letters');
      suggestions.push('Include numbers and special characters');
      suggestions.push('Avoid common words and patterns');
      suggestions.push('Make it at least 12 characters long');
    }

    // Calculate final score
    score = Math.max(0, Math.min(100, score));

    return {
      strong: errors.length === 0 && score >= 60,
      score,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Create session
   */
  createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    data?: Record<string, any>
  ): string {
    const sessionId = this.generateSessionId();
    const now = new Date();

    const sessionData: SessionData = {
      sessionId,
      userId,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.sessionExpiry),
      lastActivity: now,
      ipAddress,
      userAgent,
      data,
    };

    this.sessions.set(sessionId, sessionData);

    return sessionId;
  }

  /**
   * Get session
   */
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Update session activity
   */
  updateSessionActivity(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    session.lastActivity = new Date();

    return true;
  }

  /**
   * Destroy session
   */
  destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Destroy all user sessions
   */
  destroyUserSessions(userId: string): number {
    let count = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        count++;
      }
    }

    return count;
  }

  /**
   * Check login attempt
   */
  checkLoginAttempt(identifier: string): LoginAttempt {
    const attempt = this.loginAttempts.get(identifier);
    const now = new Date();

    // Check if locked out
    if (attempt && attempt.lockedUntil && now < attempt.lockedUntil) {
      return {
        success: false,
        attempts: attempt.count,
        remainingAttempts: 0,
        lockoutUntil: attempt.lockedUntil,
        retryAfter: Math.ceil((attempt.lockedUntil.getTime() - now.getTime()) / 1000),
      };
    }

    // Reset if lockout expired
    if (attempt && attempt.lockedUntil && now >= attempt.lockedUntil) {
      this.loginAttempts.delete(identifier);
      return {
        success: true,
        attempts: 0,
        remainingAttempts: this.maxLoginAttempts,
      };
    }

    const count = attempt?.count || 0;
    const remainingAttempts = Math.max(0, this.maxLoginAttempts - count - 1);

    return {
      success: remainingAttempts > 0,
      attempts: count,
      remainingAttempts,
    };
  }

  /**
   * Record login attempt
   */
  recordLoginAttempt(identifier: string, success: boolean): void {
    if (success) {
      this.loginAttempts.delete(identifier);
    } else {
      const attempt = this.loginAttempts.get(identifier) || {
        count: 0,
        lastAttempt: new Date(),
      };

      attempt.count++;
      attempt.lastAttempt = new Date();

      // Check if should lockout
      if (attempt.count >= this.maxLoginAttempts) {
        attempt.lockedUntil = new Date(Date.now() + this.lockoutDuration);
      }

      this.loginAttempts.set(identifier, attempt);
    }
  }

  /**
   * Generate TOTP secret
   */
  generateTOTPSecret(options: TOTPOptions = {}): string {
    const {
      secretLength = 20,
    } = options;

    return crypto.randomBytes(secretLength).toString('base32');
  }

  /**
   * Generate TOTP code
   */
  generateTOTPCode(secret: string, options: TOTPOptions = {}): string {
    const {
      digits = 6,
      period = 30,
      algorithm = 'sha1',
    } = options;

    const time = Math.floor(Date.now() / 1000 / period);
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(time));

    // Decode base32 secret
    const secretBuffer = this.base32Decode(secret);

    // Generate HMAC
    const hmac = crypto.createHmac(algorithm, secretBuffer);
    hmac.update(counter);
    const digest = hmac.digest();

    // Dynamic truncation
    const offset = digest[digest.length - 1] & 0x0f;
    const code =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    const strCode = (code % Math.pow(10, digits)).toString();

    return strCode.padStart(digits, '0');
  }

  /**
   * Verify TOTP code
   */
  verifyTOTPCode(secret: string, token: string, options: TOTPOptions = {}): boolean {
    const {
      digits = 6,
      period = 30,
      algorithm = 'sha1',
    } = options;

    // Check current and adjacent time windows
    const time = Math.floor(Date.now() / 1000 / period);

    for (let i = -1; i <= 1; i++) {
      const counter = Buffer.alloc(8);
      counter.writeBigUInt64BE(BigInt(time + i));

      const secretBuffer = this.base32Decode(secret);

      const hmac = crypto.createHmac(algorithm, secretBuffer);
      hmac.update(counter);
      const digest = hmac.digest();

      const offset = digest[digest.length - 1] & 0x0f;
      const code =
        ((digest[offset] & 0x7f) << 24) |
        ((digest[offset + 1] & 0xff) << 16) |
        ((digest[offset + 2] & 0xff) << 8) |
        (digest[offset + 3] & 0xff);

      const expectedCode = (code % Math.pow(10, digits)).toString().padStart(digits, '0');

      if (expectedCode === token) {
        return true;
      }
    }

    return false;
  }

  /**
   * Private helper methods
   */

  private generateTokenId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlDecode(str: string): string {
    return Buffer.from(str, 'base64').toString();
  }

  private base32Decode(str: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bits = str
      .toUpperCase()
      .split('')
      .map(char => {
        const index = alphabet.indexOf(char);
        if (index === -1) {
          throw new Error(`Invalid base32 character: ${char}`);
        }
        return index.toString(2).padStart(5, '0');
      })
      .join('');

    const bytes: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
      if (i + 8 <= bits.length) {
        bytes.push(parseInt(bits.substring(i, i + 8), 2));
      }
    }

    return Buffer.from(bytes);
  }

  private async sign(data: string): Promise<string> {
    const algorithm = this.jwtOptions.algorithm!;

    if (algorithm.startsWith('HS')) {
      // HMAC
      const hmac = crypto.createHmac(
        algorithm.replace('HS', 'sha') as any,
        this.jwtOptions.secret
      );
      hmac.update(data);
      return this.base64UrlEncode(hmac.digest());
    } else if (algorithm.startsWith('RS')) {
      // RSA
      if (!this.jwtOptions.privateKey) {
        throw new Error('Private key required for RSA signing');
      }
      const sign = crypto.createSign(algorithm.replace('RS', 'RSA-') as any);
      sign.update(data);
      sign.end();
      return this.base64UrlEncode(sign.sign(this.jwtOptions.privateKey));
    } else {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  }

  private async verify(data: string, signature: string): Promise<boolean> {
    const algorithm = this.jwtOptions.algorithm!;

    if (algorithm.startsWith('HS')) {
      // HMAC
      const hmac = crypto.createHmac(
        algorithm.replace('HS', 'sha') as any,
        this.jwtOptions.secret
      );
      hmac.update(data);
      const expected = this.base64UrlEncode(hmac.digest());

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
      );
    } else if (algorithm.startsWith('RS')) {
      // RSA
      if (!this.jwtOptions.publicKey) {
        throw new Error('Public key required for RSA verification');
      }
      const verify = crypto.createVerify(algorithm.replace('RS', 'RSA-') as any);
      verify.update(data);
      verify.end();
      return verify.verify(this.jwtOptions.publicKey, this.base64UrlDecode(signature));
    } else {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  }

  private async hashPasswordArgon2(password: string, salt: Buffer): Promise<string> {
    try {
      const argon2 = require('argon2');
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: this.passwordOptions.memoryCost,
        timeCost: this.passwordOptions.timeCost,
        parallelism: this.passwordOptions.parallelism,
      });
    } catch {
      throw new Error('Argon2 not available. Install with: npm install argon2');
    }
  }

  private async verifyPasswordArgon2(password: string, hash: string): Promise<boolean> {
    try {
      const argon2 = require('argon2');
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  private async hashPasswordBcrypt(password: string): Promise<string> {
    try {
      const bcrypt = require('bcrypt');
      return await bcrypt.hash(password, this.passwordOptions.saltRounds!);
    } catch {
      throw new Error('bcrypt not available. Install with: npm install bcrypt');
    }
  }

  private async verifyPasswordBcrypt(password: string, hash: string): Promise<boolean> {
    try {
      const bcrypt = require('bcrypt');
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  private async hashPasswordPBKDF2(password: string, salt: Buffer): Promise<string> {
    const derivedKey = await pbkdf2(
      password,
      salt,
      this.passwordOptions.iterations!,
      this.passwordOptions.keyLength!,
      this.passwordOptions.digest! as any
    );

    return `${salt.toString('hex')}.${derivedKey.toString('hex')}`;
  }

  private async verifyPasswordPBKDF2(password: string, hash: string): Promise<boolean> {
    try {
      const [saltHex, derivedKeyHex] = hash.split('.');
      const salt = Buffer.from(saltHex, 'hex');
      const derivedKey = await pbkdf2(
        password,
        salt,
        this.passwordOptions.iterations!,
        this.passwordOptions.keyLength!,
        this.passwordOptions.digest! as any
      );

      const expected = Buffer.from(derivedKeyHex, 'hex');

      return crypto.timingSafeEqual(derivedKey, expected);
    } catch {
      return false;
    }
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

/**
 * Convenience functions for password validation
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const authManager = new AuthManager({ secret: 'dummy' }, {});
  return authManager.validatePasswordStrength(password);
}

/**
 * Generate secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate secure random ID
 */
export function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}
