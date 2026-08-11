import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Authentication Page Object Model
 * Handles login, logout, registration, password reset, and 2FA
 */
export class AuthPage extends BasePage {
  // Locators
  readonly emailInput: string;
  readonly passwordInput: string;
  readonly confirmPasswordInput: string;
  readonly loginButton: string;
  readonly logoutButton: string;
  readonly registerButton: string;
  readonly forgotPasswordLink: string;
  readonly resetPasswordButton: string;
  readonly twoFactorInput: string;
  readonly verify2FAButton: string;
  readonly setup2FAButton: string;
  readonly backupCodesDisplay: string;
  readonly googleLoginButton: string;
  readonly githubLoginButton: string;
  readonly microsoftLoginButton: string;
  readonly errorMessage: string;
  readonly successMessage: string;
  readonly emailErrorMessage: string;
  readonly passwordErrorMessage: string;
  readonly rememberMeCheckbox: string;

  constructor(page: Page) {
    super(page);
    this.emailInput = '[data-testid="email-input"]';
    this.passwordInput = '[data-testid="password-input"]';
    this.confirmPasswordInput = '[data-testid="confirm-password-input"]';
    this.loginButton = '[data-testid="login-button"]';
    this.logoutButton = '[data-testid="logout-button"]';
    this.registerButton = '[data-testid="register-button"]';
    this.forgotPasswordLink = '[data-testid="forgot-password-link"]';
    this.resetPasswordButton = '[data-testid="reset-password-button"]';
    this.twoFactorInput = '[data-testid="two-factor-input"]';
    this.verify2FAButton = '[data-testid="verify-2fa-button"]';
    this.setup2FAButton = '[data-testid="setup-2fa-button"]';
    this.backupCodesDisplay = '[data-testid="backup-codes-display"]';
    this.googleLoginButton = '[data-testid="google-login-button"]';
    this.githubLoginButton = '[data-testid="github-login-button"]';
    this.microsoftLoginButton = '[data-testid="microsoft-login-button"]';
    this.errorMessage = '[data-testid="error-message"]';
    this.successMessage = '[data-testid="success-message"]';
    this.emailErrorMessage = '[data-testid="email-error"]';
    this.passwordErrorMessage = '[data-testid="password-error"]';
    this.rememberMeCheckbox = '[data-testid="remember-me-checkbox"]';
  }

  /**
   * Navigate to login page
   */
  async gotoLoginPage(): Promise<void> {
    await this.goto('/login');
    await this.waitForLoadState();
  }

  /**
   * Navigate to registration page
   */
  async gotoRegisterPage(): Promise<void> {
    await this.goto('/register');
    await this.waitForLoadState();
  }

  /**
   * Navigate to forgot password page
   */
  async gotoForgotPasswordPage(): Promise<void> {
    await this.goto('/forgot-password');
    await this.waitForLoadState();
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string, rememberMe?: boolean): Promise<void> {
    await this.gotoLoginPage();
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);

    if (rememberMe !== undefined) {
      if (rememberMe) {
        await this.check(this.rememberMeCheckbox);
      } else {
        await this.uncheck(this.rememberMeCheckbox);
      }
    }

    await this.click(this.loginButton);
    await this.waitForLoadState();
  }

  /**
   * Login with 2FA code
   */
  async loginWith2FA(email: string, password: string, twoFactorCode: string): Promise<void> {
    await this.login(email, password);
    await this.waitForVisible(this.twoFactorInput);
    await this.fill(this.twoFactorInput, twoFactorCode);
    await this.click(this.verify2FAButton);
    await this.waitForLoadState();
  }

  /**
   * Register new account
   */
  async register(email: string, password: string, confirmPassword: string): Promise<void> {
    await this.gotoRegisterPage();
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.fill(this.confirmPasswordInput, confirmPassword);
    await this.click(this.registerButton);
    await this.waitForLoadState();
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.click(this.logoutButton);
    await this.waitForLoadState();
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await this.gotoForgotPasswordPage();
    await this.fill(this.emailInput, email);
    await this.click(this.resetPasswordButton);
    await this.waitForLoadState();
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<void> {
    await this.goto(`/reset-password?token=${token}`);
    await this.fill(this.passwordInput, newPassword);
    await this.fill(this.confirmPasswordInput, confirmPassword);
    await this.click(this.resetPasswordButton);
    await this.waitForLoadState();
  }

  /**
   * Setup 2FA
   */
  async setup2FA(): Promise<string[]> {
    await this.goto('/settings/security');
    await this.click(this.setup2FAButton);
    await this.waitForVisible(this.backupCodesDisplay);

    // Get backup codes
    const backupCodesText = await this.getText(this.backupCodesDisplay);
    const backupCodes = backupCodesText.split('\n').filter(code => code.trim());

    return backupCodes;
  }

  /**
   * Verify 2FA code
   */
  async verify2FA(code: string): Promise<void> {
    await this.fill(this.twoFactorInput, code);
    await this.click(this.verify2FAButton);
    await this.waitForLoadState();
  }

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle(): Promise<void> {
    await this.gotoLoginPage();
    await this.click(this.googleLoginButton);
    // Note: OAuth flow requires handling popup or redirect
    await this.waitForLoadState();
  }

  /**
   * Login with GitHub OAuth
   */
  async loginWithGitHub(): Promise<void> {
    await this.gotoLoginPage();
    await this.click(this.githubLoginButton);
    // Note: OAuth flow requires handling popup or redirect
    await this.waitForLoadState();
  }

  /**
   * Login with Microsoft OAuth
   */
  async loginWithMicrosoft(): Promise<void> {
    await this.gotoLoginPage();
    await this.click(this.microsoftLoginButton);
    // Note: OAuth flow requires handling popup or redirect
    await this.waitForLoadState();
  }

  /**
   * Verify login success
   */
  async verifyLoginSuccess(): Promise<void> {
    await this.verifyUrlContains('/dashboard');
    await this.verifyVisible(this.logoutButton);
  }

  /**
   * Verify login error
   */
  async verifyLoginError(): Promise<void> {
    await this.verifyVisible(this.errorMessage);
  }

  /**
   * Verify registration success
   */
  async verifyRegistrationSuccess(): Promise<void> {
    await this.verifyVisible(this.successMessage);
  }

  /**
   * Verify email validation error
   */
  async verifyEmailError(): Promise<void> {
    await this.verifyVisible(this.emailErrorMessage);
  }

  /**
   * Verify password validation error
   */
  async verifyPasswordError(): Promise<void> {
    await this.verifyVisible(this.passwordErrorMessage);
  }

  /**
   * Verify password reset email sent
   */
  async verifyPasswordResetEmailSent(): Promise<void> {
    await this.verifyVisible(this.successMessage);
  }

  /**
   * Verify 2FA setup success
   */
  async verify2FASetupSuccess(): Promise<void> {
    await this.verifyVisible(this.successMessage);
  }

  /**
   * Verify 2FA required
   */
  async verify2FARequired(): Promise<void> {
    await this.verifyVisible(this.twoFactorInput);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  /**
   * Get success message text
   */
  async getSuccessMessage(): Promise<string> {
    return await this.getText(this.successMessage);
  }

  /**
   * Verify logged in state
   */
  async verifyLoggedIn(): Promise<boolean> {
    return await this.isVisible(this.logoutButton);
  }

  /**
   * Verify logged out state
   */
  async verifyLoggedOut(): Promise<void> {
    await this.verifyUrlContains('/login');
  }

  /**
   * Verify password strength indicator
   */
  async verifyPasswordStrength(strength: 'weak' | 'medium' | 'strong'): Promise<void> {
    const strengthIndicator = `[data-testid="password-strength-${strength}"]`;
    await this.verifyVisible(strengthIndicator);
  }

  /**
   * Verify remember me checked
   */
  async verifyRememberMeChecked(checked: boolean): Promise<void> {
    if (checked) {
      await this.verifyChecked(this.rememberMeCheckbox);
    } else {
      const isChecked = await this.page.isChecked(this.rememberMeCheckbox);
      expect(isChecked).toBe(false);
    }
  }

  /**
   * Verify session persists after reload
   */
  async verifySessionPersists(): Promise<void> {
    await this.reload();
    await this.waitForLoadState();
    await this.verifyLoggedIn();
  }

  /**
   * Verify session expires after logout
   */
  async verifySessionExpires(): Promise<void> {
    await this.logout();
    await this.goto('/dashboard');
    await this.waitForLoadState();
    await this.verifyUrlContains('/login');
  }

  /**
   * Verify account locked after too many attempts
   */
  async verifyAccountLocked(): Promise<void> {
    const errorMessage = await this.getErrorMessage();
    expect(errorMessage.toLowerCase()).toContain('locked');
  }

  /**
   * Verify login timeout
   */
  async verifyLoginTimeout(): Promise<void> {
    // Wait for session timeout
    await this.wait(30000); // 30 seconds
    await this.reload();
    await this.verifyUrlContains('/login');
  }

  /**
   * Verify password requirements displayed
   */
  async verifyPasswordRequirementsDisplayed(): Promise<void> {
    await this.verifyVisible('[data-testid="password-requirements"]');
  }

  /**
   * Verify email confirmation required
   */
  async verifyEmailConfirmationRequired(): Promise<void> {
    await this.verifyVisible('[data-testid="email-confirmation-message"]');
  }

  /**
   * Verify CAPTCHA displayed
   */
  async verifyCaptchaDisplayed(): Promise<void> {
    await this.verifyVisible('[data-testid="captcha-container"]');
  }

  /**
   * Verify social login buttons available
   */
  async verifySocialLoginAvailable(): Promise<void> {
    await this.verifyVisible(this.googleLoginButton);
    await this.verifyVisible(this.githubLoginButton);
    await this.verifyVisible(this.microsoftLoginButton);
  }

  /**
   * Verify 2FA backup codes displayed
   */
  async verifyBackupCodesDisplayed(): Promise<void> {
    await this.verifyVisible(this.backupCodesDisplay);
  }

  /**
   * Verify 2FA QR code displayed
   */
  async verify2FAQRCodeDisplayed(): Promise<void> {
    await this.verifyVisible('[data-testid="2fa-qr-code"]');
  }
}
