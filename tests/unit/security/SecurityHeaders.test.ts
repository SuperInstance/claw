/**
 * SecurityHeaders Unit Tests
 * Testing HTTP security headers configuration
 */

import { SecurityHeaders, SecurityConfig } from '../../../src/security/SecurityHeaders';

describe('SecurityHeaders', () => {
  let headers: SecurityHeaders;

  beforeEach(() => {
    headers = new SecurityHeaders();
  });

  describe('Content Security Policy', () => {
    it('should set default CSP', () => {
      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain("default-src 'self'");
    });

    it('should configure script sources', () => {
      headers.configureCSP({
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.example.com'],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('script-src');
      expect(csp).toContain('https://cdn.example.com');
    });

    it('should configure style sources', () => {
      headers.configureCSP({
        styleSrc: ["'self'", "'unsafe-inline'"],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('style-src');
    });

    it('should configure image sources', () => {
      headers.configureCSP({
        imgSrc: ["'self'", 'data:', 'https:'],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain("img-src 'self' data: https:");
    });

    it('should configure connect sources', () => {
      headers.configureCSP({
        connectSrc: ["'self'", 'https://api.example.com'],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('connect-src');
      expect(csp).toContain('https://api.example.com');
    });

    it('should configure font sources', () => {
      headers.configureCSP({
        fontSrc: ["'self'", 'https://fonts.example.com'],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('font-src');
    });

    it('should configure object sources', () => {
      headers.configureCSP({
        objectSrc: ["'none'"],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain("object-src 'none'");
    });

    it('should configure media sources', () => {
      headers.configureCSP({
        mediaSrc: ["'self'", 'https://media.example.com'],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('media-src');
    });

    it('should configure frame sources', () => {
      headers.configureCSP({
        frameSrc: ["'self'", 'https://embed.example.com'],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('frame-src');
    });

    it('should configure frame ancestors', () => {
      headers.configureCSP({
        frameAncestors: ["'none'"],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should configure base URI', () => {
      headers.configureCSP({
        baseUri: ["'self'"],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain("base-uri 'self'");
    });

    it('should configure form action', () => {
      headers.configureCSP({
        formAction: ["'self'"],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain("form-action 'self'");
    });

    it('should configure manifest sources', () => {
      headers.configureCSP({
        manifestSrc: ["'self'"],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('manifest-src');
    });

    it('should configure report URI', () => {
      headers.configureCSP({
        reportUri: '/api/csp-report',
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('report-uri /api/csp-report');
    });

    it('should configure report-to', () => {
      headers.configureCSP({
        reportTo: 'csp-endpoint',
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('report-to csp-endpoint');
    });

    it('should enable report-only mode', () => {
      headers.setReportOnly(true);
      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('Content-Security-Policy-Report-Only');
    });

    it('should generate nonce', () => {
      const nonce = headers.generateNonce();
      expect(nonce).toBeDefined();
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should use nonce in CSP', () => {
      const nonce = headers.generateNonce();
      headers.configureCSP({
        scriptSrc: [`'nonce-${nonce}'`],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain(`nonce-${nonce}`);
    });

    it('should enable strict-dynamic', () => {
      headers.configureCSP({
        scriptSrc: ["'strict-dynamic'"],
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain("'strict-dynamic'");
    });

    it('should enable upgrade-insecure-requests', () => {
      headers.configureCSP({
        upgradeInsecureRequests: true,
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('upgrade-insecure-requests');
    });

    it('should enable block-all-mixed-content', () => {
      headers.configureCSP({
        blockAllMixedContent: true,
      });

      const csp = headers.getContentSecurityPolicy();
      expect(csp).toContain('block-all-mixed-content');
    });
  });

  describe('Strict-Transport-Security', () => {
    it('should set default HSTS', () => {
      const hsts = headers.getStrictTransportSecurity();
      expect(hsts).toContain('max-age=31536000');
    });

    it('should configure max-age', () => {
      headers.configureHSTS({
        maxAge: 63072000, // 2 years
      });

      const hsts = headers.getStrictTransportSecurity();
      expect(hsts).toContain('max-age=63072000');
    });

    it('should enable includeSubDomains', () => {
      headers.configureHSTS({
        includeSubDomains: true,
      });

      const hsts = headers.getStrictTransportSecurity();
      expect(hsts).toContain('includeSubDomains');
    });

    it('should enable preload', () => {
      headers.configureHSTS({
        preload: true,
      });

      const hsts = headers.getStrictTransportSecurity();
      expect(hsts).toContain('preload');
    });

    it('should combine all HSTS directives', () => {
      headers.configureHSTS({
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true,
      });

      const hsts = headers.getStrictTransportSecurity();
      expect(hsts).toContain('max-age=63072000');
      expect(hsts).toContain('includeSubDomains');
      expect(hsts).toContain('preload');
    });
  });

  describe('X-Frame-Options', () => {
    it('should set default XFO', () => {
      const xfo = headers.getXFrameOptions();
      expect(xfo).toBe('DENY');
    });

    it('should set SAMEORIGIN', () => {
      headers.setXFrameOptions('SAMEORIGIN');
      const xfo = headers.getXFrameOptions();
      expect(xfo).toBe('SAMEORIGIN');
    });

    it('should set ALLOW-FROM', () => {
      headers.setXFrameOptions('ALLOW-FROM https://example.com');
      const xfo = headers.getXFrameOptions();
      expect(xfo).toContain('ALLOW-FROM');
    });

    it('should validate XFO value', () => {
      expect(() => {
        headers.setXFrameOptions('INVALID' as any);
      }).toThrow();
    });
  });

  describe('X-Content-Type-Options', () => {
    it('should set nosniff', () => {
      const xcto = headers.getXContentTypeOptions();
      expect(xcto).toBe('nosniff');
    });
  });

  describe('X-XSS-Protection', () => {
    it('should enable XSS protection', () => {
      const xxsp = headers.getXXSSProtection();
      expect(xxsp).toContain('1');
    });

    it('should enable mode block', () => {
      headers.setXXSSProtection(true, true);
      const xxsp = headers.getXXSSProtection();
      expect(xxsp).toContain('mode=block');
    });

    it('should disable XSS protection', () => {
      headers.setXXSSProtection(false);
      const xxsp = headers.getXXSSProtection();
      expect(xxsp).toContain('0');
    });
  });

  describe('Referrer-Policy', () => {
    it('should set default referrer policy', () => {
      const rp = headers.getReferrerPolicy();
      expect(rp).toBe('strict-origin-when-cross-origin');
    });

    it('should set no-referrer', () => {
      headers.setReferrerPolicy('no-referrer');
      const rp = headers.getReferrerPolicy();
      expect(rp).toBe('no-referrer');
    });

    it('should set no-referrer-when-downgrade', () => {
      headers.setReferrerPolicy('no-referrer-when-downgrade');
      const rp = headers.getReferrerPolicy();
      expect(rp).toBe('no-referrer-when-downgrade');
    });

    it('should set origin', () => {
      headers.setReferrerPolicy('origin');
      const rp = headers.getReferrerPolicy();
      expect(rp).toBe('origin');
    });

    it('should set strict-origin', () => {
      headers.setReferrerPolicy('strict-origin');
      const rp = headers.getReferrerPolicy();
      expect(rp).toBe('strict-origin');
    });

    it('should set origin-when-cross-origin', () => {
      headers.setReferrerPolicy('origin-when-cross-origin');
      const rp = headers.getReferrerPolicy();
      expect(rp).toBe('origin-when-cross-origin');
    });

    it('should set strict-origin-when-cross-origin', () => {
      headers.setReferrerPolicy('strict-origin-when-cross-origin');
      const rp = headers.getReferrerPolicy();
      expect(rp).toBe('strict-origin-when-cross-origin');
    });

    it('should set unsafe-url', () => {
      headers.setReferrerPolicy('unsafe-url');
      const rp = headers.getReferrerPolicy();
      expect(rp).toBe('unsafe-url');
    });
  });

  describe('Permissions-Policy', () => {
    it('should set default permissions policy', () => {
      const pp = headers.getPermissionsPolicy();
      expect(pp).toBeDefined();
    });

    it('should configure geolocation', () => {
      headers.setPermission('geolocation', ['self']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('geolocation=(self)');
    });

    it('should configure microphone', () => {
      headers.setPermission('microphone', ['none']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('microphone=(none)');
    });

    it('should configure camera', () => {
      headers.setPermission('camera', ['self', 'https://trusted.example.com']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('camera=(self https://trusted.example.com)');
    });

    it('should configure fullscreen', () => {
      headers.setPermission('fullscreen', ['self']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('fullscreen=(self)');
    });

    it('should configure payment', () => {
      headers.setPermission('payment', ['self']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('payment=(self)');
    });

    it('should configure usb', () => {
      headers.setPermission('usb', ['none']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('usb=(none)');
    });

    it('should configure magnetometer', () => {
      headers.setPermission('magnetometer', ['none']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('magnetometer=(none)');
    });

    it('should configure gyroscope', () => {
      headers.setPermission('gyroscope', ['none']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('gyroscope=(none)');
    });

    it('should configure accelerometer', () => {
      headers.setPermission('accelerometer', ['none']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('accelerometer=(none)');
    });

    it('should configure ambient-light-sensor', () => {
      headers.setPermission('ambient-light-sensor', ['none']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('ambient-light-sensor=(none)');
    });

    it('should configure autoplay', () => {
      headers.setPermission('autoplay', ['self']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('autoplay=(self)');
    });

    it('should configure encrypted-media', () => {
      headers.setPermission('encrypted-media', ['self']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('encrypted-media=(self)');
    });

    it('should configure execution-while-not-rendered', () => {
      headers.setPermission('execution-while-not-rendered', ['none']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('execution-while-not-rendered=(none)');
    });

    it('should configure execution-while-out-of-viewport', () => {
      headers.setPermission('execution-while-out-of-viewport', ['none']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('execution-while-out-of-viewport=(none)');
    });

    it('should configure picture-in-picture', () => {
      headers.setPermission('picture-in-picture', ['self']);
      const pp = headers.getPermissionsPolicy();
      expect(pp).toContain('picture-in-picture=(self)');
    });
  });

  describe('Cross-Origin Headers', () => {
    it('should set Access-Control-Allow-Origin', () => {
      headers.setAccessControlAllowOrigin('https://trusted.example.com');
      const acao = headers.getAccessControlAllowOrigin();
      expect(acao).toBe('https://trusted.example.com');
    });

    it('should set Access-Control-Allow-Methods', () => {
      headers.setAccessControlAllowMethods(['GET', 'POST', 'PUT', 'DELETE']);
      const acam = headers.getAccessControlAllowMethods();
      expect(acam).toContain('GET');
      expect(acam).toContain('POST');
      expect(acam).toContain('PUT');
      expect(acam).toContain('DELETE');
    });

    it('should set Access-Control-Allow-Headers', () => {
      headers.setAccessControlAllowHeaders(['Content-Type', 'Authorization']);
      const acah = headers.getAccessControlAllowHeaders();
      expect(acah).toContain('Content-Type');
      expect(acah).toContain('Authorization');
    });

    it('should set Access-Control-Allow-Credentials', () => {
      headers.setAccessControlAllowCredentials(true);
      const acac = headers.getAccessControlAllowCredentials();
      expect(acac).toBe('true');
    });

    it('should set Access-Control-Max-Age', () => {
      headers.setAccessControlMaxAge(600);
      const acma = headers.getAccessControlMaxAge();
      expect(acma).toBe('600');
    });

    it('should set Access-Control-Expose-Headers', () => {
      headers.setAccessControlExposeHeaders(['X-Custom-Header']);
      const aceh = headers.getAccessControlExposeHeaders();
      expect(aceh).toContain('X-Custom-Header');
    });
  });

  describe('Cache-Control', () => {
    it('should set default cache control', () => {
      const cc = headers.getCacheControl();
      expect(cc).toContain('no-store');
    });

    it('should configure no-cache', () => {
      headers.setCacheControl({ noCache: true });
      const cc = headers.getCacheControl();
      expect(cc).toContain('no-cache');
    });

    it('should configure no-store', () => {
      headers.setCacheControl({ noStore: true });
      const cc = headers.getCacheControl();
      expect(cc).toContain('no-store');
    });

    it('should configure max-age', () => {
      headers.setCacheControl({ maxAge: 3600 });
      const cc = headers.getCacheControl();
      expect(cc).toContain('max-age=3600');
    });

    it('should configure s-maxage', () => {
      headers.setCacheControl({ sMaxAge: 7200 });
      const cc = headers.getCacheControl();
      expect(cc).toContain('s-maxage=7200');
    });

    it('should configure private', () => {
      headers.setCacheControl({ private: true });
      const cc = headers.getCacheControl();
      expect(cc).toContain('private');
    });

    it('should configure public', () => {
      headers.setCacheControl({ public: true });
      const cc = headers.getCacheControl();
      expect(cc).toContain('public');
    });

    it('should configure must-revalidate', () => {
      headers.setCacheControl({ mustRevalidate: true });
      const cc = headers.getCacheControl();
      expect(cc).toContain('must-revalidate');
    });

    it('should configure proxy-revalidate', () => {
      headers.setCacheControl({ proxyRevalidate: true });
      const cc = headers.getCacheControl();
      expect(cc).toContain('proxy-revalidate');
    });

    it('should configure immutable', () => {
      headers.setCacheControl({ immutable: true });
      const cc = headers.getCacheControl();
      expect(cc).toContain('immutable');
    });

    it('should configure stale-while-revalidate', () => {
      headers.setCacheControl({ staleWhileRevalidate: 600 });
      const cc = headers.getCacheControl();
      expect(cc).toContain('stale-while-revalidate=600');
    });

    it('should combine multiple directives', () => {
      headers.setCacheControl({
        maxAge: 3600,
        mustRevalidate: true,
        immutable: true,
      });

      const cc = headers.getCacheControl();
      expect(cc).toContain('max-age=3600');
      expect(cc).toContain('must-revalidate');
      expect(cc).toContain('immutable');
    });
  });

  describe('Custom Headers', () => {
    it('should add custom header', () => {
      headers.addCustomHeader('X-Custom', 'value');
      const custom = headers.getCustomHeaders();
      expect(custom['X-Custom']).toBe('value');
    });

    it('should remove custom header', () => {
      headers.addCustomHeader('X-Custom', 'value');
      headers.removeCustomHeader('X-Custom');
      const custom = headers.getCustomHeaders();
      expect(custom['X-Custom']).toBeUndefined();
    });

    it('should update custom header', () => {
      headers.addCustomHeader('X-Custom', 'value1');
      headers.addCustomHeader('X-Custom', 'value2');
      const custom = headers.getCustomHeaders();
      expect(custom['X-Custom']).toBe('value2');
    });
  });

  describe('Header Generation', () => {
    it('should generate all headers', () => {
      const allHeaders = headers.getAllHeaders();

      expect(allHeaders['Content-Security-Policy']).toBeDefined();
      expect(allHeaders['Strict-Transport-Security']).toBeDefined();
      expect(allHeaders['X-Frame-Options']).toBeDefined();
      expect(allHeaders['X-Content-Type-Options']).toBeDefined();
      expect(allHeaders['X-XSS-Protection']).toBeDefined();
      expect(allHeaders['Referrer-Policy']).toBeDefined();
      expect(allHeaders['Permissions-Policy']).toBeDefined();
    });

    it('should generate headers as object', () => {
      const headersObj = headers.toHeadersObject();
      expect(typeof headersObj).toBe('object');
    });

    it('should generate headers for Express', () => {
      const expressMiddleware = headers.toExpressMiddleware();
      expect(typeof expressMiddleware).toBe('function');
    });

    it('should generate headers for Fastify', () => {
      const fastifyHook = headers.toFastifyHook();
      expect(typeof fastifyHook).toBe('function');
    });

    it('should generate headers for Next.js', () => {
      const nextjsHeaders = headers.toNextjsHeaders();
      expect(Array.isArray(nextjsHeaders)).toBe(true);
    });
  });

  describe('Security Scoring', () => {
    it('should calculate security score', () => {
      const score = headers.getSecurityScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should provide security recommendations', () => {
      const recommendations = headers.getSecurityRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should detect missing headers', () => {
      const minimalHeaders = new SecurityHeaders();
      const missing = minimalHeaders.getMissingHeaders();
      expect(Array.isArray(missing)).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate header values', () => {
      expect(() => {
        headers.setAccessControlMaxAge(-1);
      }).toThrow();

      expect(() => {
        headers.setAccessControlMaxAge(86401); // > 24 hours
      }).not.toThrow();
    });

    it('should validate CSP directives', () => {
      expect(() => {
        headers.configureCSP({
          scriptSrc: ['invalid;source'],
        });
      }).toThrow();
    });

    it('should validate referrer policy values', () => {
      expect(() => {
        headers.setReferrerPolicy('invalid' as any);
      }).toThrow();
    });
  });

  describe('Presets', () => {
    it('should apply strict preset', () => {
      headers.applyPreset('strict');
      const score = headers.getSecurityScore();
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('should apply balanced preset', () => {
      headers.applyPreset('balanced');
      const score = headers.getSecurityScore();
      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThan(90);
    });

    it('should apply permissive preset', () => {
      headers.applyPreset('permissive');
      const score = headers.getSecurityScore();
      expect(score).toBeGreaterThanOrEqual(50);
      expect(score).toBeLessThan(70);
    });
  });
});
