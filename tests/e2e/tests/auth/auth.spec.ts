import { test, expect } from '../../fixtures/test-fixtures';
import { TestDataGenerator } from '../../helpers/test-data-generator';

test.describe('User Authentication E2E Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ authPage }) => {
    await authPage.gotoLoginPage();
  });

  test.describe('Login Flows', () => {
    test('should login with valid credentials', async ({ authPage, testUser }) => {
      await authPage.login(testUser.email, testUser.password);
      await authPage.verifyLoginSuccess();
      await authPage.verifyUrlContains('/dashboard');
    });

    test('should fail login with invalid email', async ({ authPage }) => {
      await authPage.login('invalid@example.com', 'password123');
      await authPage.verifyLoginError();
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toContain('invalid');
    });

    test('should fail login with invalid password', async ({ authPage, testUser }) => {
      await authPage.login(testUser.email, 'wrongpassword');
      await authPage.verifyLoginError();
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toContain('password');
    });

    test('should fail login with empty credentials', async ({ authPage }) => {
      await authPage.login('', '');
      await authPage.verifyEmailError();
      await authPage.verifyPasswordError();
    });

    test('should remember user when remember me is checked', async ({ authPage, testUser }) => {
      await authPage.login(testUser.email, testUser.password, true);
      await authPage.verifyLoginSuccess();
      await authPage.verifyRememberMeChecked(true);
      await authPage.reload();
      await authPage.verifySessionPersists();
    });
  });

  test.describe('Two-Factor Authentication', () => {
    test('should setup 2FA for account', async ({ authPage }) => {
      await authPage.goto('/settings/security');
      await authPage.click('[data-testid="setup-2fa-button"]');
      await authPage.verify2FAQRCodeDisplayed();
      const backupCodes = await authPage.setup2FA();
      expect(backupCodes.length).toBeGreaterThan(0);
      await authPage.verify2FASetupSuccess();
    });

    test('should login with 2FA code', async ({ authPage, testUser }) => {
      const twoFactorCode = TestDataGenerator.twoFactorCode();
      await authPage.loginWith2FA(testUser.email, testUser.password, twoFactorCode);
      await authPage.verifyLoginSuccess();
    });

    test('should fail login with invalid 2FA code', async ({ authPage, testUser }) => {
      await authPage.login(testUser.email, testUser.password);
      await authPage.verify2FARequired();
      await authPage.verify2FA('000000');
      await authPage.verifyLoginError();
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toContain('invalid code');
    });
  });

  test.describe('OAuth Integration', () => {
    test('should login with Google OAuth', async ({ authPage }) => {
      await authPage.loginWithGoogle();
      // Note: OAuth flow requires additional setup for popup handling
      await authPage.verifyUrlContains('/dashboard');
    });

    test('should login with GitHub OAuth', async ({ authPage }) => {
      await authPage.loginWithGitHub();
      // Note: OAuth flow requires additional setup for popup handling
      await authPage.verifyUrlContains('/dashboard');
    });

    test('should login with Microsoft OAuth', async ({ authPage }) => {
      await authPage.loginWithMicrosoft();
      // Note: OAuth flow requires additional setup for popup handling
      await authPage.verifyUrlContains('/dashboard');
    });
  });

  test.describe('Registration', () => {
    test('should register new account with valid data', async ({ authPage, testUser }) => {
      await authPage.register(testUser.email, testUser.password, testUser.password);
      await authPage.verifyRegistrationSuccess();
      await authPage.verifyUrlContains('/dashboard');
    });

    test('should fail registration with mismatched passwords', async ({ authPage, testUser }) => {
      await authPage.register(testUser.email, testUser.password, 'differentpassword');
      await authPage.verifyPasswordError();
      const errorMessage = await authPage.getText(authPage.passwordErrorMessage);
      expect(errorMessage.toLowerCase()).toContain('match');
    });

    test('should fail registration with weak password', async ({ authPage, testUser }) => {
      await authPage.register(testUser.email, '123', '123');
      await authPage.verifyPasswordError();
      await authPage.verifyPasswordStrength('weak');
    });

    test('should display password requirements during registration', async ({ authPage }) => {
      await authPage.gotoRegisterPage();
      await authPage.fill(authPage.passwordInput, 'test');
      await authPage.verifyPasswordRequirementsDisplayed();
    });
  });

  test.describe('Password Reset', () => {
    test('should request password reset with valid email', async ({ authPage, testUser }) => {
      await authPage.requestPasswordReset(testUser.email);
      await authPage.verifyPasswordResetEmailSent();
      const successMessage = await authPage.getSuccessMessage();
      expect(successMessage.toLowerCase()).toContain('email sent');
    });

    test('should reset password with valid token', async ({ authPage, testUser }) => {
      const resetToken = TestDataGenerator.resetToken();
      const newPassword = TestDataGenerator.password();
      await authPage.resetPassword(resetToken, newPassword, newPassword);
      await authPage.verifyUrlContains('/login');
      await authPage.verifyVisible(authPage.successMessage);
    });

    test('should fail reset password with expired token', async ({ authPage }) => {
      const expiredToken = 'expired_token_123';
      const newPassword = TestDataGenerator.password();
      await authPage.resetPassword(expiredToken, newPassword, newPassword);
      await authPage.verifyLoginError();
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toContain('expired');
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ authPage, testUser }) => {
      await authPage.login(testUser.email, testUser.password);
      await authPage.verifyLoginSuccess();
      await authPage.logout();
      await authPage.verifyLoggedOut();
      await authPage.verifyUrlContains('/login');
    });

    test('should clear session after logout', async ({ authPage, testUser }) => {
      await authPage.login(testUser.email, testUser.password);
      await authPage.verifyLoginSuccess();
      await authPage.logout();
      await authPage.goto('/dashboard');
      await authPage.verifyUrlContains('/login');
      await authPage.verifySessionExpires();
    });
  });

  test.describe('Account Security', () => {
    test('should lock account after too many failed attempts', async ({ authPage, testUser }) => {
      // Attempt login 5 times with wrong password
      for (let i = 0; i < 5; i++) {
        await authPage.login(testUser.email, 'wrongpassword');
        await authPage.wait(500);
      }
      await authPage.verifyAccountLocked();
    });

    test('should timeout session after inactivity', async ({ authPage, testUser }) => {
      await authPage.login(testUser.email, testUser.password);
      await authPage.verifyLoginSuccess();
      // Wait for session timeout (typically 30 minutes)
      await authPage.verifyLoginTimeout();
    });
  });

  test.describe('Email Confirmation', () => {
    test('should require email confirmation after registration', async ({ authPage, testUser }) => {
      await authPage.register(testUser.email, testUser.password, testUser.password);
      await authPage.verifyEmailConfirmationRequired();
    });

    test('should confirm email with valid token', async ({ authPage }) => {
      const confirmToken = TestDataGenerator.resetToken();
      await authPage.goto(`/confirm-email?token=${confirmToken}`);
      await authPage.verifyVisible(authPage.successMessage);
      const successMessage = await authPage.getSuccessMessage();
      expect(successMessage.toLowerCase()).toContain('confirmed');
    });
  });

  test.describe('CAPTCHA', () => {
    test('should show CAPTCHA after multiple failed attempts', async ({ authPage }) => {
      // Attempt login 3 times with wrong credentials
      for (let i = 0; i < 3; i++) {
        await authPage.login('invalid@example.com', 'wrongpassword');
        await authPage.wait(500);
      }
      await authPage.verifyCaptchaDisplayed();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels on login form', async ({ authPage }) => {
      await authPage.verifyAriaLabel('[data-testid="email-input"]', 'Email address');
      await authPage.verifyAriaLabel('[data-testid="password-input"]', 'Password');
      await authPage.verifyAriaLabel('[data-testid="login-button"]', 'Sign in');
    });

    test('should be keyboard navigable', async ({ authPage, testUser }) => {
      await authPage.keyboardPress('Tab');
      await authPage.verifyHasFocus(authPage.emailInput);
      await authPage.keyboardPress('Tab');
      await authPage.verifyHasFocus(authPage.passwordInput);
      await authPage.keyboardPress('Tab');
      await authPage.verifyHasFocus(authPage.loginButton);
      await authPage.keyboardPress('Enter');
      await authPage.wait(1000);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ authPage }) => {
      await authPage.setViewport(375, 667);
      await authPage.gotoLoginPage();
      await authPage.verifyVisible(authPage.emailInput);
      await authPage.verifyVisible(authPage.passwordInput);
      await authPage.verifyVisible(authPage.loginButton);
    });

    test('should display correctly on tablet viewport', async ({ authPage }) => {
      await authPage.setViewport(768, 1024);
      await authPage.gotoLoginPage();
      await authPage.verifyVisible(authPage.emailInput);
      await authPage.verifyVisible(authPage.passwordInput);
      await authPage.verifyVisible(authPage.loginButton);
    });
  });
});
