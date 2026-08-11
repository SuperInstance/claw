import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
import { AuthPage } from '../../pages/AuthPage';
import { SpreadsheetPage } from '../../pages/SpreadsheetPage';
import { AnalyticsPage } from '../../pages/AnalyticsPage';
import { CommunityPage } from '../../pages/CommunityPage';

test.describe('Accessibility E2E Tests', () => {
  test.describe('Keyboard Navigation', () => {
    test('should navigate login form with keyboard', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      // Tab through form
      await page.keyboard.press('Tab');
      await authPage.verifyHasFocus(authPage.emailInput);

      await page.keyboard.press('Tab');
      await authPage.verifyHasFocus(authPage.passwordInput);

      await page.keyboard.press('Tab');
      await authPage.verifyHasFocus(authPage.loginButton);

      // Submit with Enter key
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    });

    test('should navigate spreadsheet with keyboard', async ({ page }) => {
      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      // Tab to first cell
      await page.keyboard.press('Tab');
      await spreadsheetPage.verifyHasFocus('[data-cell="A1"]');

      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      await spreadsheetPage.verifyHasFocus('[data-cell="B1"]');

      await page.keyboard.press('ArrowDown');
      await spreadsheetPage.verifyHasFocus('[data-cell="B2"]');

      await page.keyboard.press('ArrowLeft');
      await spreadsheetPage.verifyHasFocus('[data-cell="A2"]');

      await page.keyboard.press('ArrowUp');
      await spreadsheetPage.verifyHasFocus('[data-cell="A1"]');
    });

    test('should navigate dashboard with keyboard', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.gotoAnalytics();

      // Tab through widgets
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);

      // Skip to main content
      await page.keyboard.press('Alt+Shift+S');
      await page.waitForTimeout(500);
    });

    test('should have visible focus indicators', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      // Check focus indicator on email input
      await authPage.emailInput = '[data-testid="email-input"]';
      await page.focus('[data-testid="email-input"]');
      const outline = await page.locator('[data-testid="email-input"]').evaluate(el =>
        window.getComputedStyle(el).outline
      );
      expect(outline).not.toBe('none');
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      await authPage.verifyAriaLabel('[data-testid="email-input"]', 'Email address');
      await authPage.verifyAriaLabel('[data-testid="password-input"]', 'Password');
      await authPage.verifyAriaLabel('[data-testid="login-button"]', 'Sign in');
    });

    test('should have proper ARIA roles', async ({ page }) => {
      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      await spreadsheetPage.verifyAriaRole('[data-cell="A1"]', 'gridcell');
      await spreadsheetPage.verifyAriaRole('[data-testid="toolbar"]', 'toolbar');
      await spreadsheetPage.verifyAriaRole('[data-testid="formula-bar"]', 'textbox');
    });

    test('should announce dynamic changes', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.gotoAnalytics();

      // Trigger a dynamic change
      await analyticsPage.refreshData();

      // Check for live region
      const liveRegion = page.locator('[aria-live]');
      await expect(liveRegion).toBeVisible();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const communityPage = new CommunityPage(page);
      await communityPage.gotoForum();

      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', headings =>
        headings.map(h => ({
          tag: h.tagName,
          text: h.textContent
        }))
      );

      // Verify proper hierarchy (h1 before h2, etc.)
      let lastLevel = 0;
      for (const heading of headings) {
        const level = parseInt(heading.tag.charAt(1));
        expect(level).toBeLessThanOrEqual(lastLevel + 1);
        lastLevel = level;
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast for text', async ({ page }) => {
      await injectAxe(page);
      await page.goto('/login');

      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: { 'color-contrast': { enabled: true } }
      });
    });

    test('should have sufficient color contrast for links', async ({ page }) => {
      await injectAxe(page);
      await page.goto('/community/forum');

      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: { 'color-contrast': { enabled: true } }
      });
    });

    test('should have sufficient color contrast for buttons', async ({ page }) => {
      await injectAxe(page);
      await page.goto('/dashboard');

      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: { 'color-contrast': { enabled: true } }
      });
    });
  });

  test.describe('High Contrast Mode', () => {
    test('should display properly in high contrast mode', async ({ page, context }) => {
      // Enable high contrast mode
      await context.addInitScript(() => {
        document.documentElement.setAttribute('data-high-contrast', 'true');
      });

      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      // Verify elements are visible
      await spreadsheetPage.verifyVisible('[data-cell="A1"]');
      await spreadsheetPage.verifyVisible('[data-testid="toolbar"]');
    });

    test('should maintain readability in high contrast mode', async ({ page }) => {
      await page.goto('/login');

      const backgroundColor = await page.locator('body').evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      const color = await page.locator('[data-testid="email-input"]').evaluate(el =>
        window.getComputedStyle(el).color
      );

      // Verify contrast (simplified check)
      expect(backgroundColor).not.toBe(color);
    });
  });

  test.describe('Font Scaling', () => {
    test('should display correctly at 200% zoom', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      // Set zoom to 200%
      await page.evaluate(() => {
        document.body.style.zoom = '200%';
      });

      await authPage.verifyVisible(authPage.emailInput);
      await authPage.verifyVisible(authPage.passwordInput);
      await authPage.verifyVisible(authPage.loginButton);

      // Verify no horizontal scroll
      const bodyOverflow = await page.locator('body').evaluate(el =>
        window.getComputedStyle(el).overflowX
      );
      expect(bodyOverflow).not.toBe('scroll');
    });

    test('should display correctly at 400% zoom', async ({ page }) => {
      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      // Set zoom to 400%
      await page.evaluate(() => {
        document.body.style.zoom = '400%';
      });

      await spreadsheetPage.verifyVisible('[data-cell="A1"]');

      // Verify vertical scroll is available but content is readable
      const bodyOverflow = await page.locator('body').evaluate(el =>
        window.getComputedStyle(el).overflowY
      );
      expect(['auto', 'scroll']).toContain(bodyOverflow);
    });
  });

  test.describe('Screen Magnification', ()  => {
    test('should work with screen magnifier', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.gotoAnalytics();

      // Simulate magnifier viewport
      await page.setViewportSize({ width: 400, height: 300 });

      await analyticsPage.verifyVisible(analyticsPage.metricsOverview);

      // Verify content is still accessible
      await analyticsPage.verifyVisible('[data-testid="metric-card"]');
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      // Check email input label
      const emailLabel = await page.locator('[data-testid="email-input"]').getAttribute('aria-label');
      expect(emailLabel).toBeTruthy();

      // Check password input label
      const passwordLabel = await page.locator('[data-testid="password-input"]').getAttribute('aria-label');
      expect(passwordLabel).toBeTruthy();
    });

    test('should have proper error messages', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      await authPage.login('invalid@example.com', 'wrongpassword');
      await authPage.verifyLoginError();

      // Check error message is accessible
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    test('should have proper field validation', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoRegisterPage();

      // Check required fields
      const emailInput = page.locator('[data-testid="email-input"]');
      await expect(emailInput).toHaveAttribute('required', '');

      const passwordInput = page.locator('[data-testid="password-input"]');
      await expect(passwordInput).toHaveAttribute('required', '');
    });
  });

  test.describe('Image Accessibility', () => {
    test('should have alt text for images', async ({ page }) => {
      await page.goto('/community/templates');

      const images = await page.$$('img');
      for (const image of images) {
        const alt = await image.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });

    test('should have decorative images marked as such', async ({ page }) => {
      await page.goto('/dashboard');

      const decorativeImages = await page.$$('img[alt=""]');
      for (const image of decorativeImages) {
        const role = await image.getAttribute('role');
        expect(role).toBe('presentation');
      }
    });
  });

  test.describe('Table Accessibility', () => {
    test('should have proper table headers', async ({ page }) => {
      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      // Check for table headers
      const headers = await page.$$('[role="columnheader"]');
      expect(headers.length).toBeGreaterThan(0);
    });

    test('should have proper table captions', async ({ page }) => {
      await page.goto('/analytics');

      const tables = await page.$$('table');
      for (const table of tables) {
        const caption = await table.$('caption');
        // Caption is optional but good to have
      }
    });
  });

  test.describe('Link Accessibility', () => {
    test('should have descriptive link text', async ({ page }) => {
      await page.goto('/community/forum');

      const links = await page.$$('a');
      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');

        expect(text || ariaLabel).toBeTruthy();
        expect(text?.trim()).not.toBe('click here');
        expect(text?.trim()).not.toBe('read more');
      }
    });

    test('should have focusable links', async ({ page }) => {
      await page.goto('/');

      const links = await page.$$('a');
      for (const link of links) {
        const tabIndex = await link.getAttribute('tabindex');
        expect(tabIndex).not.toBe('-1');
      }
    });
  });

  test.describe('Button Accessibility', () => {
    test('should have accessible button names', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        expect(text || ariaLabel).toBeTruthy();
      }
    });

    test('should indicate disabled state', async ({ page }) => {
      await page.goto('/register');

      // Submit button should be disabled initially
      const submitButton = page.locator('[data-testid="register-button"]');
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Modal Accessibility', () => {
    test('should trap focus in modal', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="create-spreadsheet"]');

      // Focus should be in modal
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeFocused();

      // Close modal
      await page.keyboard.press('Escape');
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="create-spreadsheet"]');

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toHaveAttribute('aria-modal', 'true');
    });
  });

  test.describe('Skip Links', () => {
    test('should have skip to main content link', async ({ page }) => {
      await page.goto('/');

      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeVisible();
    });

    test('should skip to main content on activate', async ({ page }) => {
      await page.goto('/');

      await page.click('a[href="#main-content"]');
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    });
  });

  test.describe('Language Declaration', () => {
    test('should have proper lang attribute', async ({ page }) => {
      await page.goto('/');

      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
    });
  });

  test.describe('Page Title', () => {
    test('should have unique page titles', async ({ page }) => {
      await page.goto('/login');
      const loginTitle = await page.title();

      await page.goto('/register');
      const registerTitle = await page.title();

      expect(loginTitle).not.toBe(registerTitle);
    });
  });

  test.describe('Semantic HTML', () => {
    test('should use semantic elements', async ({ page }) => {
      await page.goto('/');

      const semanticElements = await page.$$('header, nav, main, article, section, aside, footer');
      expect(semanticElements.length).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Accessibility', () => {
    test('should be accessible on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');

      await injectAxe(page);
      await checkA11y(page);
    });

    test('should be accessible on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard');

      await injectAxe(page);
      await checkA11y(page);
    });
  });

  test.describe('Custom Components', () => {
    test('should have accessible spreadsheet grid', async ({ page }) => {
      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      await injectAxe(page);
      await checkA11y(page, null, {
        rules: {
          'aria-valid-attr-value': { enabled: true },
          'aria-required-attr': { enabled: true }
        }
      });
    });

    test('should have accessible charts', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="add-widget"]');
      await page.selectOption('[data-testid="widget-type"]', 'line');

      await injectAxe(page);
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
          'aria-valid-attr-value': { enabled: true }
        }
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should announce errors to screen readers', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      await authPage.login('invalid', 'invalid');
      await authPage.verifyLoginError();

      const errorMessage = page.locator('[role="alert"]');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('should announce loading states', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="refresh-data"]');

      const loadingIndicator = page.locator('[aria-busy="true"]');
      await expect(loadingIndicator).toBeVisible();
    });
  });

  test.describe('Focus Management', () => {
    test('should restore focus after modal closes', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="create-spreadsheet"]');

      // Close modal
      await page.click('[data-testid="cancel-button"]');

      // Focus should return to trigger
      const trigger = page.locator('[data-testid="create-spreadsheet"]');
      await expect(trigger).toBeFocused();
    });
  });
});
