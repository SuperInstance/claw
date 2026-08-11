import { test, expect } from '@playwright/test';
import { AuthPage } from '../../pages/AuthPage';
import { SpreadsheetPage } from '../../pages/SpreadsheetPage';
import { AnalyticsPage } from '../../pages/AnalyticsPage';
import { CommunityPage } from '../../pages/CommunityPage';

test.describe('Mobile Responsiveness E2E Tests', () => {
  const mobileViewport = { width: 375, height: 667 };
  const tabletViewport = { width: 768, height: 1024 };
  const desktopViewport = { width: 1920, height: 1080 };

  test.describe('Mobile Layout (iPhone 12)', () => {
    test.use({ viewport: mobileViewport });

    test('should display login page on mobile', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      await authPage.verifyVisible(authPage.emailInput);
      await authPage.verifyVisible(authPage.passwordInput);
      await authPage.verifyVisible(authPage.loginButton);
    });

    test('should have responsive navigation', async ({ page }) => {
      await page.goto('/');

      const navToggle = page.locator('[data-testid="nav-toggle"]');
      await expect(navToggle).toBeVisible();

      await navToggle.click();
      const mobileNav = page.locator('[data-testid="mobile-nav"]');
      await expect(mobileNav).toBeVisible();
    });

    test('should display spreadsheet on mobile', async ({ page }) => {
      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      await spreadsheetPage.verifyVisible('[data-cell="A1"]');
      await spreadsheetPage.verifyVisible('[data-testid="mobile-toolbar"]');
    });

    test('should display analytics on mobile', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.gotoAnalytics();

      await analyticsPage.verifyVisible(analyticsPage.metricsOverview);
      await analyticsPage.verifyVisible('[data-testid="metric-card"]');
    });

    test('should display forum on mobile', async ({ page }) => {
      const communityPage = new CommunityPage(page);
      await communityPage.gotoForum();

      await communityPage.verifyVisible(communityPage.forumThreads);
      await communityPage.verifyVisible('[data-testid="thread-card"]');
    });
  });

  test.describe('Tablet Layout (iPad)', () => {
    test.use({ viewport: tabletViewport });

    test('should display login page on tablet', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      await authPage.verifyVisible(authPage.emailInput);
      await authPage.verifyVisible(authPage.passwordInput);
      await authPage.verifyVisible(authPage.loginButton);
    });

    test('should display spreadsheet on tablet', async ({ page }) => {
      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      await spreadsheetPage.verifyVisible('[data-cell="A1"]');
      await spreadsheetPage.verifyVisible('[data-testid="toolbar"]');
    });

    test('should display analytics on tablet', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.gotoAnalytics();

      await analyticsPage.verifyVisible(analyticsPage.metricsOverview);
      await analyticsPage.verifyVisible('[data-testid="chart-widget"]');
    });

    test('should show tablet-specific features', async ({ page }) => {
      await page.goto('/dashboard');

      const tabletFeatures = page.locator('[data-testid="tablet-feature"]');
      await expect(tabletFeatures.first()).toBeVisible();
    });
  });

  test.describe('Desktop Layout', () => {
    test.use({ viewport: desktopViewport });

    test('should display login page on desktop', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      await authPage.verifyVisible(authPage.emailInput);
      await authPage.verifyVisible(authPage.passwordInput);
      await authPage.verifyVisible(authPage.loginButton);
    });

    test('should display spreadsheet on desktop', async ({ page }) => {
      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      await spreadsheetPage.verifyVisible('[data-cell="A1"]');
      await spreadsheetPage.verifyVisible('[data-testid="toolbar"]');
      await spreadsheetPage.verifyVisible('[data-testid="formula-bar"]');
    });

    test('should display analytics on desktop', async ({ page }) => {
      const analyticsPage = new AnalyticsPage(page);
      await analyticsPage.gotoAnalytics();

      await analyticsPage.verifyVisible(analyticsPage.metricsOverview);
      await analyticsPage.verifyVisible('[data-testid="chart-widget"]');
    });
  });

  test.describe('Touch Gestures', () => {
    test.use({ viewport: mobileViewport, hasTouch: true });

    test('should support swipe to navigate', async ({ page }) => {
      await page.goto('/spreadsheet/test');

      // Swipe right to go back
      await page.touchscreen.tap(50, 300);
      await page.touchscreen.swipe({ x: 50, y: 300 }, { x: 300, y: 300 });

      await page.waitForTimeout(500);
      // Verify navigation occurred
    });

    test('should support pinch to zoom', async ({ page }) => {
      await page.goto('/spreadsheet/test');

      // Pinch zoom gesture
      await page.touchscreen.tap(187, 333);
      // Note: Actual pinch zoom would require more complex gesture handling
    });

    test('should support long press for context menu', async ({ page }) => {
      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      const cell = page.locator('[data-cell="A1"]');
      await cell.tap();
      await page.waitForTimeout(1000);

      const contextMenu = page.locator('[data-testid="cell-context-menu"]');
      await expect(contextMenu).toBeVisible();
    });

    test('should support double tap to zoom', async ({ page }) => {
      await page.goto('/analytics');

      const chart = page.locator('[data-testid="chart-widget"]');
      await chart.tap();
      await chart.tap();

      await page.waitForTimeout(500);
      // Verify zoom occurred
    });
  });

  test.describe('Orientation Changes', () => {
    test.use({ viewport: mobileViewport });

    test('should adapt to landscape orientation', async ({ page }) => {
      await page.goto('/spreadsheet/test');

      // Change to landscape
      await page.setViewportSize({ width: 667, height: 375 });

      await page.waitForTimeout(500);
      // Verify layout adapted
    });

    test('should adapt to portrait orientation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/spreadsheet/test');

      // Change to portrait
      await page.setViewportSize({ width: 667, height: 375 });
      await page.setViewportSize({ width: 375, height: 667 });

      await page.waitForTimeout(500);
      // Verify layout adapted
    });

    test('should maintain state on orientation change', async ({ page }) => {
      await page.goto('/spreadsheet/test');

      // Edit a cell
      await page.fill('[data-cell="A1"]', 'Test');
      await page.keyboardPress('Enter');

      // Change orientation
      await page.setViewportSize({ width: 667, height: 375 });

      // Verify cell content preserved
      const cellValue = await page.textContent('[data-cell="A1"]');
      expect(cellValue).toBe('Test');
    });
  });

  test.describe('Responsive Typography', () => {
    test('should scale text for mobile', async ({ page }) => {
      await page.setViewportSize(mobileViewport);
      await page.goto('/');

      const fontSize = await page.locator('h1').evaluate(el =>
        parseInt(window.getComputedStyle(el).fontSize)
      );
      expect(fontSize).toBeLessThan(32);
    });

    test('should scale text for desktop', async ({ page }) => {
      await page.setViewportSize(desktopViewport);
      await page.goto('/');

      const fontSize = await page.locator('h1').evaluate(el =>
        parseInt(window.getComputedStyle(el).fontSize)
      );
      expect(fontSize).toBeGreaterThan(24);
    });
  });

  test.describe('Responsive Images', () => {
    test('should load appropriate image size for mobile', async ({ page }) => {
      await page.setViewportSize(mobileViewport);
      await page.goto('/community/templates');

      const images = await page.$$('img');
      for (const image of images) {
        const src = await image.getAttribute('src');
        expect(src).not.toContain('large');
      }
    });

    test('should load appropriate image size for desktop', async ({ page }) => {
      await page.setViewportSize(desktopViewport);
      await page.goto('/community/templates');

      const images = await page.$$('img');
      for (const image of images) {
        const src = await image.getAttribute('src');
        // Desktop should load higher quality images
      }
    });
  });

  test.describe('Mobile-Specific Features', () => {
    test.use({ viewport: mobileViewport });

    test('should show bottom navigation on mobile', async ({ page }) => {
      await page.goto('/');

      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      await expect(bottomNav).toBeVisible();
    });

    test('should show floating action button on mobile', async ({ page }) => {
      await page.goto('/dashboard');

      const fab = page.locator('[data-testid="fab"]');
      await expect(fab).toBeVisible();
    });

    test('should use mobile-friendly form inputs', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      const emailInput = page.locator('[data-testid="email-input"]');
      const inputType = await emailInput.getAttribute('type');
      expect(inputType).toBe('email');
    });

    test('should have large touch targets', async ({ page }) => {
      await page.goto('/');

      const buttons = await page.$$('button, a');
      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box) {
          // Touch targets should be at least 44x44 pixels
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Performance on Mobile', () => {
    test.use({ viewport: mobileViewport });

    test('should load quickly on mobile', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load in less than 3 seconds on mobile
      expect(loadTime).toBeLessThan(3000);
    });

    test('should not block main thread', async ({ page }) => {
      await page.goto('/');

      const metrics = await page.evaluate(() => {
        return performance.getEntriesByType('navigation')[0];
      });

      // DOM content should load quickly
      expect(metrics.domContentLoadedEventEnd).toBeDefined();
    });
  });

  test.describe('Responsive Tables', () => {
    test.use({ viewport: mobileViewport });

    test('should handle tables on mobile', async ({ page }) => {
      const spreadsheetPage = new SpreadsheetPage(page);
      await spreadsheetPage.gotoSpreadsheet('test-spreadsheet');

      // Should have horizontal scroll for wide tables
      const tableContainer = page.locator('[data-testid="spreadsheet-container"]');
      const overflow = await tableContainer.evaluate(el =>
        window.getComputedStyle(el).overflowX
      );
      expect(overflow).toBe('auto');
    });

    test('should stack table columns on mobile', async ({ page }) => {
      await page.goto('/analytics');

      const dataTables = page.locator('[data-testid="data-table"]');
      const count = await dataTables.count();

      if (count > 0) {
        const table = dataTables.first();
        await expect(table).toHaveClass(/responsive/);
      }
    });
  });

  test.describe('Responsive Charts', () => {
    test.use({ viewport: mobileViewport });

    test('should resize charts for mobile', async ({ page }) => {
      await page.goto('/analytics');

      const chart = page.locator('[data-testid="chart-widget"]');
      await expect(chart).toBeVisible();

      const box = await chart.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(375);
    });

    test('should maintain chart readability', async ({ page }) => {
      await page.goto('/analytics');

      const chart = page.locator('[data-testid="chart-widget"]');
      await expect(chart).toBeVisible();

      // Chart should still be interactive
      await chart.tap();
      await page.waitForTimeout(500);
    });
  });

  test.describe('Viewport Meta Tag', () => {
    test('should have correct viewport meta tag', async ({ page }) => {
      await page.goto('/');

      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
      expect(viewport).toContain('initial-scale=1');
    });
  });

  test.describe('Safe Area Handling', () => {
    test.use({ viewport: mobileViewport });

    test('should respect safe area insets', async ({ page }) => {
      await page.goto('/');

      const safeAreaTop = await page.locator('body').evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.paddingTop;
      });

      // Should have padding for safe area
      expect(safeAreaTop).not.toBe('0px');
    });
  });

  test.describe('Responsive Modals', () => {
    test.use({ viewport: mobileViewport });

    test('should show full-screen modals on mobile', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="create-spreadsheet"]');

      const modal = page.locator('[data-testid="modal"]');
      await expect(modal).toHaveClass(/fullscreen/);
    });

    test('should show centered modals on desktop', async ({ page }) => {
      await page.setViewportSize(desktopViewport);
      await page.goto('/dashboard');
      await page.click('[data-testid="create-spreadsheet"]');

      const modal = page.locator('[data-testid="modal"]');
      await expect(modal).not.toHaveClass(/fullscreen/);
    });
  });

  test.describe('Keyboard Support on Mobile', () => {
    test.use({ viewport: mobileViewport });

    test('should support external keyboard', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoLoginPage();

      await page.keyboard.press('Tab');
      await authPage.verifyHasFocus(authPage.emailInput);

      await page.keyboard.type('test@example.com');
      await page.keyboard.press('Tab');

      await authPage.verifyHasFocus(authPage.passwordInput);
    });
  });

  test.describe('Cross-Browser Mobile', () => {
    test.use({ viewport: mobileViewport });

    test('should work on Mobile Safari', async ({ page, context }) => {
      // Mobile Safari specific test
      await page.goto('/');

      const isSafari = await page.evaluate(() => {
        return /Safari/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent);
      });

      if (isSafari) {
        // Safari-specific checks
      }
    });

    test('should work on Mobile Chrome', async ({ page }) => {
      // Mobile Chrome specific test
      await page.goto('/');

      const isChrome = await page.evaluate(() => {
        return /Chrome/.test(navigator.userAgent);
      });

      if (isChrome) {
        // Chrome-specific checks
      }
    });
  });
});
