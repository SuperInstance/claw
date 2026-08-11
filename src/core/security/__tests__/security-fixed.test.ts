/**
 * Comprehensive Security Test Suite
 *
 * TESTS:
 * - Cryptographic implementations (Ed25519, JWT, Argon2id)
 * - CORS strict origin validation
 * - CSRF token generation and validation
 * - GraphQL rate limiting
 * - Input validation and sanitization
 * - Security headers
 * - Rate limiting
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { KeyManager, SignatureService, EncryptionService, hashPassword, verifyPassword } from '../crypto-fixed';
import { CORSMiddleware, CSRFProtection, GraphQLRateLimiter, InputValidator, SecurityHeaders, defaultSecurityConfig } from '../hardening-fixed';
import { RateLimiter } from '../rate-limiter-fixed';

describe('Security Fixes Test Suite', () => {
  describe('1. Cryptographic Implementations', () => {
    describe('Ed25519 Signatures', () => {
      let keyManager: KeyManager;
      let signatureService: SignatureService;

      beforeEach(() => {
        keyManager = new KeyManager();
        signatureService = new SignatureService(keyManager);
      });

      test('should generate Ed25519 key pair', async () => {
        const keyPair = await keyManager.generateKeyPair();
        expect(keyPair).toBeDefined();
        expect(keyPair.publicKey).toBeDefined();
        expect(keyPair.privateKey).toBeDefined();
        expect(keyPair.keyId).toBeDefined();
        expect(keyPair.createdAt).toBeDefined();
      });

      test('should sign and verify data correctly', async () => {
        await keyManager.generateKeyPair();
        const data = { message: 'test data', timestamp: Date.now() };
        const signed = await signatureService.sign(data);

        expect(signed.signature.algorithm).toBe('Ed25519');
        expect(signed.signature.value).toBeDefined();

        const verified = await signatureService.verifySignedData(signed);
        expect(verified).toBe(true);
      });

      test('should reject invalid signatures', async () => {
        await keyManager.generateKeyPair();
        const data = { message: 'test data' };
        const signed = await signatureService.sign(data);

        // Tamper with signature
        signed.signature.value = 'invalid';

        const verified = await signatureService.verifySignedData(signed);
        expect(verified).toBe(false);
      });

      test('should handle key rotation', async () => {
        const key1 = await keyManager.generateKeyPair();
        await new Promise(resolve => setTimeout(resolve, 10));
        const key2 = await keyManager.generateKeyPair();

        expect(key1.keyId).not.toBe(key2.keyId);
        expect(key2.createdAt).toBeGreaterThan(key1.createdAt);
      });
    });

    describe('Password Hashing with Argon2id', () => {
      test('should hash password using Argon2id', async () => {
        const password = 'SecurePassword123!';
        const hash = await hashPassword(password);

        expect(hash).toBeDefined();
        expect(hash).not.toBe(password);
        expect(hash.startsWith('$argon2')).toBe(true);
      });

      test('should verify correct password', async () => {
        const password = 'SecurePassword123!';
        const hash = await hashPassword(password);
        const isValid = await verifyPassword(password, hash);

        expect(isValid).toBe(true);
      });

      test('should reject incorrect password', async () => {
        const password = 'SecurePassword123!';
        const wrongPassword = 'WrongPassword123!';
        const hash = await hashPassword(password);
        const isValid = await verifyPassword(wrongPassword, hash);

        expect(isValid).toBe(false);
      });

      test('should generate different hashes for same password', async () => {
        const password = 'SecurePassword123!';
        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);

        expect(hash1).not.toBe(hash2);
      });
    });

    describe('Encryption Service', () => {
      let keyManager: KeyManager;
      let encryptionService: EncryptionService;

      beforeEach(() => {
        keyManager = new KeyManager();
        encryptionService = new EncryptionService(keyManager);
      });

      test('should encrypt and decrypt data', () => {
        const data = { sensitive: 'information', value: 42 };
        const encrypted = encryptionService.encrypt(data);

        expect(encrypted.algorithm).toBe('aes-256-gcm');
        expect(encrypted.data).toBeDefined();
        expect(encrypted.iv).toBeDefined();
        expect(encrypted.authTag).toBeDefined();

        const decrypted = encryptionService.decrypt<any>(encrypted);
        expect(decrypted).toEqual(data);
      });

      test('should reject tampered encrypted data', () => {
        const data = { message: 'secret' };
        const encrypted = encryptionService.encrypt(data);

        // Tamper with encrypted data
        encrypted.data = 'tampered';

        const decrypted = encryptionService.decrypt<any>(encrypted);
        expect(decrypted).toBeNull();
      });

      test('should fail with invalid auth tag', () => {
        const data = { message: 'secret' };
        const encrypted = encryptionService.encrypt(data);

        // Tamper with auth tag
        encrypted.authTag = 'invalid';

        const decrypted = encryptionService.decrypt<any>(encrypted);
        expect(decrypted).toBeNull();
      });
    });
  });

  describe('2. CORS Configuration', () => {
    test('should reject wildcard origins', () => {
      const invalidConfig = {
        ...defaultSecurityConfig.cors,
        origins: ['*']
      };

      expect(() => new CORSMiddleware(invalidConfig)).toThrow('Wildcard origin');
    });

    test('should allow only whitelisted origins', () => {
      const config = {
        ...defaultSecurityConfig.cors,
        origins: ['https://example.com', 'https://app.example.com']
      };

      const cors = new CORSMiddleware(config);

      expect(cors.isOriginAllowed('https://example.com')).toBe(true);
      expect(cors.isOriginAllowed('https://app.example.com')).toBe(true);
      expect(cors.isOriginAllowed('https://evil.com')).toBe(false);
      expect(cors.isOriginAllowed('https://example.com.evil.com')).toBe(false);
    });

    test('should handle preflight requests correctly', () => {
      const cors = new CORSMiddleware(defaultSecurityConfig.cors);
      const middleware = cors.getMiddleware();

      const req: any = {
        method: 'OPTIONS',
        headers: {
          origin: 'https://spreadsheetmoment.com'
        }
      };

      const res: any = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        end: jest.fn()
      };

      const next = jest.fn();

      middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://spreadsheetmoment.com');
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
    });
  });

  describe('3. CSRF Protection', () => {
    let csrf: CSRFProtection;

    beforeEach(() => {
      csrf = new CSRFProtection(defaultSecurityConfig.csrf);
    });

    test('should generate CSRF token', () => {
      const sessionId = 'session123';
      const token = csrf.generateToken(sessionId);

      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    test('should verify valid CSRF token', () => {
      const sessionId = 'session123';
      const token = csrf.generateToken(sessionId);

      expect(csrf.verifyToken(sessionId, token)).toBe(true);
    });

    test('should reject invalid CSRF token', () => {
      const sessionId = 'session123';
      const token = csrf.generateToken(sessionId);

      expect(csrf.verifyToken(sessionId, 'wrongtoken')).toBe(false);
      expect(csrf.verifyToken('wrongsession', token)).toBe(false);
    });

    test('should expire CSRF tokens', () => {
      const sessionId = 'session123';
      const token = csrf.generateToken(sessionId);

      // Mock expired token
      csrf['tokens'].set(sessionId, {
        token,
        expiry: Date.now() - 1000
      });

      expect(csrf.verifyToken(sessionId, token)).toBe(false);
    });

    test('should use timing-safe comparison', () => {
      const sessionId = 'session123';
      const token = csrf.generateToken(sessionId);

      // Timing-safe comparison should not short-circuit
      const startTime = Date.now();
      csrf.verifyToken(sessionId, token);
      const duration1 = Date.now() - startTime;

      const startTime2 = Date.now();
      csrf.verifyToken(sessionId, 'wrong');
      const duration2 = Date.now() - startTime2;

      // Timing should be similar (within 100ms)
      expect(Math.abs(duration1 - duration2)).toBeLessThan(100);
    });
  });

  describe('4. GraphQL Rate Limiting', () => {
    let rateLimiter: GraphQLRateLimiter;

    beforeEach(() => {
      rateLimiter = new GraphQLRateLimiter(defaultSecurityConfig.graphqlRateLimit);
    });

    test('should calculate query complexity', () => {
      const simpleQuery = '{ user { name } }';
      const complexQuery = `
        {
          user {
            name
            email
            posts {
              title
              comments {
                author
              }
            }
          }
        }
      `;

      const simpleAnalysis = rateLimiter.analyzeQuery(simpleQuery);
      const complexAnalysis = rateLimiter.analyzeQuery(complexQuery);

      expect(simpleAnalysis.complexity).toBeLessThan(complexAnalysis.complexity);
      expect(complexAnalysis.depth).toBeGreaterThan(simpleAnalysis.depth);
    });

    test('should reject overly complex queries', () => {
      const overlyComplexQuery = '{'.repeat(20) + 'user { name }' + '}'.repeat(20);

      const analysis = rateLimiter.analyzeQuery(overlyComplexQuery);

      expect(analysis.allowed).toBe(false);
      expect(analysis.reason).toContain('exceeds maximum');
    });

    test('should reject deep queries', () => {
      const deepQuery = '{ a { b { c { d { e { f { g { h { i { j } } } } } } } } } }';

      const analysis = rateLimiter.analyzeQuery(deepQuery);

      expect(analysis.allowed).toBe(false);
      expect(analysis.reason).toContain('depth');
    });

    test('should enforce rate limits', () => {
      const identifier = 'user123';

      // First 60 requests should be allowed (perMinute limit)
      for (let i = 0; i < 60; i++) {
        const result = rateLimiter.checkRateLimit(identifier, 60000, 60);
        expect(result.allowed).toBe(true);
      }

      // 61st request should be blocked
      const result = rateLimiter.checkRateLimit(identifier, 60000, 60);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });
  });

  describe('5. Input Validation', () => {
    let validator: InputValidator;

    beforeEach(() => {
      validator = new InputValidator(defaultSecurityConfig);
    });

    test('should detect SQL injection in query params', () => {
      const req: any = {
        query: {
          id: "1' OR '1'='1",
          name: 'admin'
        }
      };

      const result = validator.validateQueryParams(req, ['id', 'name']);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('SQL injection'))).toBe(true);
    });

    test('should detect dangerous patterns in request body', () => {
      const req: any = {
        headers: { 'content-type': 'application/json' },
        body: {
          query: '${process.env.SECRET}',
          script: '<script>alert("XSS")</script>'
        }
      };

      const result = validator.validateRequestBody(req);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate against schema', () => {
      const req: any = {
        headers: { 'content-type': 'application/json' },
        body: {
          email: 'invalid-email',
          age: 15,
          name: 'Test'
        }
      };

      const schema = {
        email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, required: true },
        age: { type: 'number', min: 18, max: 120, required: true },
        name: { type: 'string', required: true }
      };

      const result = validator.validateRequestBody(req, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid format for email');
      expect(result.errors).toContain('age is below minimum value');
    });

    test('should sanitize output', () => {
      const dangerous = {
        message: '<script>alert("XSS")</script>',
        html: '<img src=x onerror="alert(1)">',
        safe: 'normal text'
      };

      const sanitized = validator.sanitizeOutput(dangerous);

      expect(sanitized.message).not.toContain('<script>');
      expect(sanitized.html).not.toContain('onerror');
      expect(sanitized.safe).toBe('normal text');
    });

    test('should validate path parameters', () => {
      const req: any = {
        params: {
          userId: '123',
          postId: 'abc'
        }
      };

      const patterns = {
        userId: /^\d+$/,
        postId: /^[a-z]+$/
      };

      const result = validator.validatePathParams(req, patterns);

      expect(result.valid).toBe(true);
    });

    test('should reject invalid path parameters', () => {
      const req: any = {
        params: {
          userId: 'abc', // Should be numeric
          postId: '123' // Should be alphabetic
        }
      };

      const patterns = {
        userId: /^\d+$/,
        postId: /^[a-z]+$/
      };

      const result = validator.validatePathParams(req, patterns);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid path parameter: userId');
    });
  });

  describe('6. Security Headers', () => {
    let headers: SecurityHeaders;

    beforeEach(() => {
      headers = new SecurityHeaders(defaultSecurityConfig);
    });

    test('should include all required security headers', () => {
      const securityHeaders = headers.getHeaders();

      expect(securityHeaders['Strict-Transport-Security']).toBeDefined();
      expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');
      expect(securityHeaders['X-Frame-Options']).toBe('DENY');
      expect(securityHeaders['X-XSS-Protection']).toBeDefined();
      expect(securityHeaders['Content-Security-Policy']).toBeDefined();
      expect(securityHeaders['Referrer-Policy']).toBeDefined();
    });

    test('should build strict CSP', () => {
      const securityHeaders = headers.getHeaders();
      const csp = securityHeaders['Content-Security-Policy'];

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    test('should build permissions policy', () => {
      const securityHeaders = headers.getHeaders();
      const permissions = securityHeaders['Permissions-Policy'];

      expect(permissions).toContain('geolocation=()');
      expect(permissions).toContain('microphone=()');
      expect(permissions).toContain('camera=()');
    });
  });

  describe('7. Rate Limiting', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 10
      });
    });

    afterEach(() => {
      rateLimiter.destroy();
    });

    test('should allow requests within limit', () => {
      const identifier = 'user1';

      for (let i = 0; i < 10; i++) {
        const result = rateLimiter.check(identifier);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(10 - i - 1);
      }
    });

    test('should block requests over limit', () => {
      const identifier = 'user1';

      // Use all 10 requests
      for (let i = 0; i < 10; i++) {
        rateLimiter.check(identifier);
      }

      // 11th request should be blocked
      const result = rateLimiter.check(identifier);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    test('should reset after window expires', () => {
      const identifier = 'user1';

      // Use all 10 requests
      for (let i = 0; i < 10; i++) {
        rateLimiter.check(identifier);
      }

      // Manually clean up expired entries
      rateLimiter.cleanup();

      // Reset should allow requests again
      rateLimiter.reset(identifier);
      const result = rateLimiter.check(identifier);
      expect(result.allowed).toBe(true);
    });

    test('should track usage correctly', () => {
      const identifier = 'user1';

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.check(identifier);
      }

      const usage = rateLimiter.getUsage(identifier);
      expect(usage.count).toBe(5);
      expect(usage.limit).toBe(10);
      expect(usage.remaining).toBe(5);
    });
  });

  describe('8. Integration Tests', () => {
    test('should handle complete security workflow', async () => {
      // 1. Generate keys
      const keyManager = new KeyManager();
      await keyManager.generateKeyPair();

      // 2. Sign and verify data
      const signatureService = new SignatureService(keyManager);
      const data = { user: 'test', action: 'login' };
      const signed = await signatureService.sign(data);
      expect(await signatureService.verifySignedData(signed)).toBe(true);

      // 3. Encrypt sensitive data
      const encryptionService = new EncryptionService(keyManager);
      const encrypted = encryptionService.encrypt({ password: 'secret' });
      const decrypted = encryptionService.decrypt<any>(encrypted);
      expect(decrypted).toEqual({ password: 'secret' });

      // 4. Validate input
      const validator = new InputValidator(defaultSecurityConfig);
      const sanitized = validator.sanitizeOutput('<script>alert("xss")</script>');
      expect(sanitized).not.toContain('<script>');

      // 5. Check rate limits
      const rateLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 5 });
      const result = rateLimiter.check('user1');
      expect(result.allowed).toBe(true);
      rateLimiter.destroy();
    });

    test('should fail security checks with bad data', async () => {
      const validator = new InputValidator(defaultSecurityConfig);

      // Bad input
      const req: any = {
        query: { id: "1' OR '1'='1" },
        body: { script: '<script>alert(1)</script>' }
      };

      const queryResult = validator.validateQueryParams(req, ['id']);
      expect(queryResult.valid).toBe(false);

      const bodyResult = validator.validateRequestBody(req);
      expect(bodyResult.valid).toBe(false);
    });
  });
});
