/**
 * InputValidator Unit Tests
 * Testing input sanitization, validation, and security
 */

import { InputValidator, ValidationResult, SecurityLevel } from '../../../src/security/InputValidator';

describe('InputValidator', () => {
  let validator: InputValidator;

  beforeEach(() => {
    validator = new InputValidator({
      securityLevel: SecurityLevel.High,
      enableLogging: true,
    });
  });

  afterEach(() => {
    validator.clearLogs();
  });

  describe('HTML Sanitization', () => {
    describe('Script Tag Detection', () => {
      it('should remove basic script tags', () => {
        const result = validator.sanitizeHTML('<script>alert("xss")</script>');
        expect(result.clean).not.toContain('<script>');
        expect(result.threats).toContain('Script tag detected');
      });

      it('should remove script tags with attributes', () => {
        const result = validator.sanitizeHTML('<script src="evil.js"></script>');
        expect(result.clean).not.toContain('src=');
        expect(result.threats.length).toBeGreaterThan(0);
      });

      it('should remove uppercase script tags', () => {
        const result = validator.sanitizeHTML('<SCRIPT>alert("xss")</SCRIPT>');
        expect(result.clean).not.toContain('<SCRIPT>');
        expect(result.clean).not.toContain('<script>');
      });

      it('should remove mixed case script tags', () => {
        const result = validator.sanitizeHTML('<ScRiPt>alert("xss")</ScRiPt>');
        expect(result.clean).not.toMatch(/<script/i);
      });

      it('should remove script tags with whitespace variations', () => {
        const result = validator.sanitizeHTML('< script >alert("xss")</ script >');
        expect(result.threats.length).toBeGreaterThan(0);
      });

      it('should handle multiple script tags', () => {
        const result = validator.sanitizeHTML(
          '<script>alert(1)</script>text<script>alert(2)</script>'
        );
        expect(result.clean.match(/<script>/gi)).toBeNull();
      });

      it('should remove script tags in javascript: protocol', () => {
        const result = validator.sanitizeHTML('<a href="javascript:alert(1)">click</a>');
        expect(result.clean).not.toContain('javascript:');
        expect(result.threats).toContain('javascript: protocol detected');
      });
    });

    describe('Event Handler Detection', () => {
      it('should detect onclick handlers', () => {
        const result = validator.sanitizeHTML('<div onclick="evil()">click</div>');
        expect(result.threats).toContain('Event handler detected');
      });

      it('should detect onerror handlers', () => {
        const result = validator.sanitizeHTML('<img src="x" onerror="alert(1)">');
        expect(result.threats).toContain('Event handler detected');
      });

      it('should detect onload handlers', () => {
        const result = validator.sanitizeHTML('<body onload="evil()">');
        expect(result.threats).toContain('Event handler detected');
      });

      it('should detect all common event handlers', () => {
        const events = ['onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
                        'onmouseout', 'onmousemove', 'onkeydown', 'onkeyup', 'onkeypress'];

        events.forEach((event) => {
          const result = validator.sanitizeHTML(`<div ${event}="evil()">test</div>`);
          expect(result.threats.some(t => t.includes('Event handler'))).toBe(true);
        });
      });

      it('should handle event handlers with mixed case', () => {
        const result = validator.sanitizeHTML('<div OnClIcK="evil()">test</div>');
        expect(result.threats.some(t => t.includes('Event handler'))).toBe(true);
      });
    });

    describe('Style and Expression Detection', () => {
      it('should detect style tags with expressions', () => {
        const result = validator.sanitizeHTML(
          '<style>body { background: url("javascript:alert(1)") }</style>'
        );
        expect(result.threats.length).toBeGreaterThan(0);
      });

      it('should detect CSS expressions', () => {
        const result = validator.sanitizeHTML(
          '<div style="width: expression(alert(1))">test</div>'
        );
        expect(result.threats).toContain('CSS expression detected');
      });

      it('should detect style attribute with javascript', () => {
        const result = validator.sanitizeHTML(
          '<div style="background: javascript:alert(1)">test</div>'
        );
        expect(result.threats).toContain('javascript: in CSS detected');
      });

      it('should detect @import with javascript', () => {
        const result = validator.sanitizeHTML(
          '<style>@import "javascript:alert(1)";</style>'
        );
        expect(result.threats.length).toBeGreaterThan(0);
      });
    });

    describe('Iframe and Embed Detection', () => {
      it('should detect iframe tags', () => {
        const result = validator.sanitizeHTML('<iframe src="evil.com"></iframe>');
        expect(result.threats).toContain('Iframe detected');
      });

      it('should detect object tags', () => {
        const result = validator.sanitizeHTML('<object data="evil.swf"></object>');
        expect(result.threats).toContain('Object/embed detected');
      });

      it('should detect embed tags', () => {
        const result = validator.sanitizeHTML('<embed src="evil.swf">');
        expect(result.threats).toContain('Object/embed detected');
      });
    });

    describe('Form and Input Detection', () => {
      it('should detect form tags with action', () => {
        const result = validator.sanitizeHTML('<form action="http://evil.com">...</form>');
        expect(result.threats).toContain('External form action detected');
      });

      it('should detect input tags with dangerous values', () => {
        const result = validator.sanitizeHTML(
          '<input type="text" value="javascript:alert(1)">'
        );
        expect(result.threats.length).toBeGreaterThan(0);
      });

      it('should detect button tags with formaction', () => {
        const result = validator.sanitizeHTML(
          '<button formaction="http://evil.com">submit</button>'
        );
        expect(result.threats).toContain('External formaction detected');
      });
    });

    describe('Meta and Link Detection', () => {
      it('should detect meta refresh', () => {
        const result = validator.sanitizeHTML(
          '<meta http-equiv="refresh" content="0;url=http://evil.com">'
        );
        expect(result.threats).toContain('Meta refresh detected');
      });

      it('should detect meta tags with unsafe content', () => {
        const result = validator.sanitizeHTML(
          '<meta http-equiv="Set-Cookie" content="evil=true">'
        );
        expect(result.threats.length).toBeGreaterThan(0);
      });
    });

    describe('SVG and MathML Detection', () => {
      it('should detect script in SVG', () => {
        const result = validator.sanitizeHTML(
          '<svg><script>alert(1)</script></svg>'
        );
        expect(result.threats).toContain('Script tag detected');
      });

      it('should detect dangerous SVG handlers', () => {
        const result = validator.sanitizeHTML(
          '<svg onload="alert(1)"><rect/></svg>'
        );
        expect(result.threats).toContain('Event handler detected');
      });

      it('should detect script in MathML', () => {
        const result = validator.sanitizeHTML(
          '<math><script>alert(1)</script></math>'
        );
        expect(result.threats).toContain('Script tag detected');
      });
    });

    describe('Data URIs', () => {
      it('should detect data URIs in attributes', () => {
        const result = validator.sanitizeHTML(
          '<img src="data:text/html,<script>alert(1)</script>">'
        );
        expect(result.threats).toContain('data: URI detected');
      });

      it('should detect data URIs in href', () => {
        const result = validator.sanitizeHTML(
          '<a href="data:text/html,<script>alert(1)</script>">click</a>'
        );
        expect(result.threats).toContain('data: URI detected');
      });

      it('should allow safe data URIs', () => {
        const result = validator.sanitizeHTML(
          '<img src="data:image/png;base64,iVBORw0KG...">'
        );
        expect(result.threats).not.toContain('data: URI');
      });
    });

    describe('Codemeta and Unicode Attacks', () => {
      it('should detect null bytes', () => {
        const result = validator.sanitizeHTML('test\x00value');
        expect(result.threats).toContain('Null byte detected');
      });

      it('should handle unicode escape sequences', () => {
        const result = validator.sanitizeHTML('\\u003cscript\\u003ealert(1)\\u003c/script\\u003e');
        expect(result.threats.length).toBeGreaterThan(0);
      });

      it('should detect HTML entity encoding', () => {
        const result = validator.sanitizeHTML(
          '&lt;script&gt;alert(1)&lt;/script&gt;'
        );
        // Should detect and decode, then flag as threat
        expect(result.threats.length).toBeGreaterThan(0);
      });
    });

    describe('Sanitization Options', () => {
      it('should allow specific tags when configured', () => {
        const permissiveValidator = new InputValidator({
          securityLevel: SecurityLevel.Low,
          allowedTags: ['b', 'i', 'em', 'strong'],
        });

        const result = permissiveValidator.sanitizeHTML('<b>bold</b><script>evil()</script>');
        expect(result.clean).toContain('<b>bold</b>');
        expect(result.clean).not.toContain('<script>');
      });

      it('should allow specific attributes when configured', () => {
        const permissiveValidator = new InputValidator({
          securityLevel: SecurityLevel.Medium,
          allowedAttributes: ['href', 'title'],
        });

        const result = permissiveValidator.sanitizeHTML(
          '<a href="/safe" onclick="evil()">link</a>'
        );
        expect(result.clean).toContain('href="/safe"');
        expect(result.clean).not.toContain('onclick');
      });
    });
  });

  describe('SQL Injection Detection', () => {
    it('should detect SQL injection in single quotes', () => {
      const result = validator.validateInput("'; DROP TABLE users; --", 'sql');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('SQL injection pattern detected');
    });

    it('should detect SQL injection with UNION', () => {
      const result = validator.validateInput("1' UNION SELECT * FROM users--", 'sql');
      expect(result.isValid).toBe(false);
    });

    it('should detect SQL injection with OR', () => {
      const result = validator.validateInput("' OR '1'='1", 'sql');
      expect(result.isValid).toBe(false);
    });

    it('should detect SQL injection with comments', () => {
      const result = validator.validateInput("admin'/*", 'sql');
      expect(result.isValid).toBe(false);
    });

    it('should detect SQL injection with stacked queries', () => {
      const result = validator.validateInput("1'; DROP TABLE users; SELECT * FROM data WHERE '1'='1", 'sql');
      expect(result.isValid).toBe(false);
    });

    it('should detect SQL injection with EXEC', () => {
      const result = validator.validateInput("'; EXEC xp_cmdshell('dir')--", 'sql');
      expect(result.isValid).toBe(false);
    });

    it('should detect time-based blind injection', () => {
      const result = validator.validateInput("'; WAITFOR DELAY '00:00:10'--", 'sql');
      expect(result.isValid).toBe(false);
    });

    it('should allow safe SQL queries', () => {
      const result = validator.validateInput("SELECT * FROM users WHERE id = ?", 'sql');
      expect(result.isValid).toBe(true);
    });

    it('should allow parameterized queries', () => {
      const result = validator.validateInput("SELECT name, email FROM users WHERE status = $1", 'sql');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Command Injection Detection', () => {
    it('should detect pipe command injection', () => {
      const result = validator.validateInput('file.txt | cat /etc/passwd', 'command');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Command injection detected');
    });

    it('should detect semicolon command injection', () => {
      const result = validator.validateInput('file.txt; rm -rf /', 'command');
      expect(result.isValid).toBe(false);
    });

    it('should detect ampersand command injection', () => {
      const result = validator.validateInput('file.txt && evil', 'command');
      expect(result.isValid).toBe(false);
    });

    it('should detect backtick command injection', () => {
      const result = validator.validateInput('file.txt`evil`', 'command');
      expect(result.isValid).toBe(false);
    });

    it('should detect dollar sign command substitution', () => {
      const result = validator.validateInput('file.txt$(evil)', 'command');
      expect(result.isValid).toBe(false);
    });

    it('should detect newline command injection', () => {
      const result = validator.validateInput('file.txt\nevil', 'command');
      expect(result.isValid).toBe(false);
    });

    it('should allow safe filenames', () => {
      const result = validator.validateInput('document.pdf', 'command');
      expect(result.isValid).toBe(true);
    });

    it('should allow safe paths', () => {
      const result = validator.validateInput('/home/user/document.pdf', 'command');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Path Traversal Detection', () => {
    it('should detect ../ traversal', () => {
      const result = validator.validateInput('../../../etc/passwd', 'path');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Path traversal detected');
    });

    it('should detect URL encoded traversal', () => {
      const result = validator.validateInput('%2e%2e%2fetc/passwd', 'path');
      expect(result.isValid).toBe(false);
    });

    it('should detect double encoded traversal', () => {
      const result = validator.validateInput('%252e%252e%252fetc/passwd', 'path');
      expect(result.isValid).toBe(false);
    });

    it('should detect ..\\ traversal', () => {
      const result = validator.validateInput('..\\..\\..\\windows\\system32', 'path');
      expect(result.isValid).toBe(false);
    });

    it('should detect absolute path escape attempts', () => {
      const result = validator.validateInput('/etc/passwd', 'path');
      expect(result.threats).toContain('Absolute path detected');
    });

    it('should allow safe relative paths', () => {
      const result = validator.validateInput('documents/report.pdf', 'path');
      expect(result.isValid).toBe(true);
    });

    it('should allow safe relative paths with subdirectories', () => {
      const result = validator.validateInput('docs/2024/reports/q1.pdf', 'path');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@sub.example.com',
        'user123@example-site.com',
      ];

      validEmails.forEach((email) => {
        const result = validator.validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example..com',
        'user@example',
      ];

      invalidEmails.forEach((email) => {
        const result = validator.validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });

    it('should check for disposable email domains', () => {
      const result = validator.validateEmail('user@tempmail.com');
      expect(result.threats).toContain('Disposable email detected');
    });

    it('should check for suspicious email patterns', () => {
      const result = validator.validateEmail('test+test+test+test@example.com');
      expect(result.threats).toContain('Suspicious email pattern');
    });
  });

  describe('URL Validation', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'https://example.com/path',
        'https://example.com/path?query=value',
        'https://example.com:8080/path',
      ];

      validUrls.forEach((url) => {
        const result = validator.validateURL(url);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject non-HTTPS URLs', () => {
      const result = validator.validateURL('http://example.com');
      expect(result.threats).toContain('Insecure protocol');
    });

    it('should detect javascript: URLs', () => {
      const result = validator.validateURL('javascript:alert(1)');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('javascript: protocol detected');
    });

    it('should detect data: URLs', () => {
      const result = validator.validateURL('data:text/html,<script>alert(1)</script>');
      expect(result.isValid).toBe(false);
    });

    it('should detect file: URLs', () => {
      const result = validator.validateURL('file:///etc/passwd');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Local file access attempted');
    });

    it('should detect SSRF attempts', () => {
      const result = validator.validateURL('http://localhost/admin');
      expect(result.threats).toContain('Internal URL detected');
    });

    it('should detect private IP addresses', () => {
      const result = validator.validateURL('http://192.168.1.1/admin');
      expect(result.threats).toContain('Private IP detected');
    });
  });

  describe('Number Validation', () => {
    it('should validate positive integers', () => {
      const result = validator.validateNumber('42');
      expect(result.isValid).toBe(true);
    });

    it('should validate negative integers', () => {
      const result = validator.validateNumber('-42');
      expect(result.isValid).toBe(true);
    });

    it('should validate decimal numbers', () => {
      const result = validator.validateNumber('3.14');
      expect(result.isValid).toBe(true);
    });

    it('should validate within range', () => {
      const result = validator.validateNumber('50', { min: 0, max: 100 });
      expect(result.isValid).toBe(true);
    });

    it('should reject out of range', () => {
      const result = validator.validateNumber('150', { min: 0, max: 100 });
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Out of range');
    });

    it('should reject non-numeric values', () => {
      const result = validator.validateNumber('not a number');
      expect(result.isValid).toBe(false);
    });

    it('should reject NaN', () => {
      const result = validator.validateNumber('NaN');
      expect(result.isValid).toBe(false);
    });

    it('should reject Infinity', () => {
      const result = validator.validateNumber('Infinity');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Invalid number');
    });
  });

  describe('String Length Validation', () => {
    it('should validate within max length', () => {
      const result = validator.validateLength('short', { max: 10 });
      expect(result.isValid).toBe(true);
    });

    it('should reject exceeding max length', () => {
      const result = validator.validateLength('this is too long', { max: 10 });
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Exceeds maximum length');
    });

    it('should validate within min length', () => {
      const result = validator.validateLength('password123', { min: 8 });
      expect(result.isValid).toBe(true);
    });

    it('should reject below min length', () => {
      const result = validator.validateLength('short', { min: 10 });
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Below minimum length');
    });

    it('should validate exact length', () => {
      const result = validator.validateLength('exact10!', { exact: 10 });
      expect(result.isValid).toBe(true);
    });

    it('should reject wrong exact length', () => {
      const result = validator.validateLength('not10', { exact: 10 });
      expect(result.isValid).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const result = validator.validatePassword('Str0ng!Pass@');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
    });

    it('should detect weak passwords', () => {
      const result = validator.validatePassword('password');
      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.threats).toContain('Weak password');
    });

    it('should require minimum length', () => {
      const result = validator.validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Password too short');
    });

    it('should require uppercase letters', () => {
      const result = validator.validatePassword('lowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Missing uppercase letter');
    });

    it('should require lowercase letters', () => {
      const result = validator.validatePassword('UPPERCASE123!');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Missing lowercase letter');
    });

    it('should require numbers', () => {
      const result = validator.validatePassword('NoNumbers!');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Missing number');
    });

    it('should require special characters', () => {
      const result = validator.validatePassword('NoSpecial123');
      expect(result.isValid).toBe(false);
      expect(result.threats).toContain('Missing special character');
    });

    it('should check for common passwords', () => {
      const result = validator.validatePassword('password123');
      expect(result.threats).toContain('Common password detected');
    });

    it('should check for personal information', () => {
      const result = validator.validatePassword('JohnDoe1990!', {
        firstName: 'John',
        lastName: 'Doe',
        birthYear: '1990',
      });
      expect(result.threats).toContain('Password contains personal info');
    });
  });

  describe('Logging and Monitoring', () => {
    it('should log validation attempts', () => {
      validator.validateInput('test', 'general');
      const logs = validator.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should log threats detected', () => {
      validator.sanitizeHTML('<script>alert(1)</script>');
      const logs = validator.getLogs();
      expect(logs.some(l => l.threatsDetected > 0)).toBe(true);
    });

    it('should support log export', () => {
      validator.validateInput('test', 'general');
      const logs = validator.exportLogs();
      expect(JSON.parse(logs)).toBeInstanceOf(Array);
    });

    it('should clear logs', () => {
      validator.validateInput('test', 'general');
      validator.clearLogs();
      expect(validator.getLogs()).toHaveLength(0);
    });
  });

  describe('Security Levels', () => {
    it('should apply high security restrictions', () => {
      const highValidator = new InputValidator({
        securityLevel: SecurityLevel.High,
      });

      const result = highValidator.sanitizeHTML('<b>bold</b><i>italic</i>');
      expect(result.threats.length).toBeGreaterThan(0);
    });

    it('should apply medium security restrictions', () => {
      const mediumValidator = new InputValidator({
        securityLevel: SecurityLevel.Medium,
      });

      const result = mediumValidator.sanitizeHTML('<b>bold</b><i>italic</i>');
      expect(result.clean).toContain('<b>bold</b>');
    });

    it('should apply low security restrictions', () => {
      const lowValidator = new InputValidator({
        securityLevel: SecurityLevel.Low,
      });

      const result = lowValidator.sanitizeHTML(
        '<b>bold</b><i>italic</i><em>emphasis</em>'
      );
      expect(result.clean).toContain('<b>bold</b>');
      expect(result.clean).toContain('<i>italic</i>');
      expect(result.clean).toContain('<em>emphasis</em>');
    });
  });

  describe('Custom Validation Rules', () => {
    it('should support custom validators', () => {
      validator.addCustomRule('custom', (input) => {
        return input.startsWith('VALID-');
      });

      const result = validator.validateCustom('VALID-input', 'custom');
      expect(result.isValid).toBe(true);
    });

    it('should fail custom validation', () => {
      validator.addCustomRule('custom', (input) => {
        return input.startsWith('VALID-');
      });

      const result = validator.validateCustom('INVALID-input', 'custom');
      expect(result.isValid).toBe(false);
    });

    it('should remove custom rules', () => {
      validator.addCustomRule('custom', () => true);
      validator.removeCustomRule('custom');

      const result = validator.validateCustom('any', 'custom');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle large inputs efficiently', () => {
      const largeInput = '<div>'.repeat(10000) + '<script>alert(1)</script>';
      const start = Date.now();
      const result = validator.sanitizeHTML(largeInput);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(result.threats.length).toBeGreaterThan(0);
    });

    it('should cache validation results', () => {
      const input = 'test input';
      validator.validateInput(input, 'general');

      const start = Date.now();
      validator.validateInput(input, 'general');
      const cachedDuration = Date.now() - start;

      expect(cachedDuration).toBeLessThan(10); // Cached lookup should be fast
    });
  });
});
