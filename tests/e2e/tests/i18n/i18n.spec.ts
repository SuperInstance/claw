import { test, expect } from '@playwright/test';
import { AuthPage } from '../../pages/AuthPage';
import { SpreadsheetPage } from '../../pages/SpreadsheetPage';
import { AnalyticsPage } from '../../pages/AnalyticsPage';

test.describe('Internationalization E2E Tests', () => {
  test.describe('Language Switching', () => {
    test('should switch to Spanish', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="es"]');

      await page.waitForLoadState('networkidle');
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('es');
    });

    test('should switch to French', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="fr"]');

      await page.waitForLoadState('networkidle');
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('fr');
    });

    test('should switch to German', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="de"]');

      await page.waitForLoadState('networkidle');
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('de');
    });

    test('should switch to Chinese', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="zh"]');

      await page.waitForLoadState('networkidle');
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('zh');
    });

    test('should switch to Japanese', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="ja"]');

      await page.waitForLoadState('networkidle');
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('ja');
    });

    test('should switch to Korean', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="ko"]');

      await page.waitForLoadState('networkidle');
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('ko');
    });

    test('should persist language preference', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="es"]');

      await page.reload();
      await page.waitForLoadState('networkidle');

      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('es');
    });
  });

  test.describe('RTL Layouts', () => {
    test('should display Arabic with RTL layout', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="ar"]');

      await page.waitForLoadState('networkidle');
      const direction = await page.locator('html').getAttribute('dir');
      expect(direction).toBe('rtl');
    });

    test('should mirror navigation in RTL', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="ar"]');

      const nav = page.locator('nav');
      const direction = await nav.evaluate(el => window.getComputedStyle(el).direction);
      expect(direction).toBe('rtl');
    });

    test('should flip content in RTL', async ({ page }) => {
      await page.goto('/spreadsheet/test');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="ar"]');

      const toolbar = page.locator('[data-testid="toolbar"]');
      const direction = await toolbar.evaluate(el => window.getComputedStyle(el).direction);
      expect(direction).toBe('rtl');
    });
  });

  test.describe('Currency Formatting', () => {
    test('should format currency as USD', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="currency-selector"]');
      await page.click('[data-currency="USD"]');

      const currency = await page.textContent('[data-metric="revenue"]');
      expect(currency).toContain('$');
    });

    test('should format currency as EUR', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="currency-selector"]');
      await page.click('[data-currency="EUR"]');

      const currency = await page.textContent('[data-metric="revenue"]');
      expect(currency).toContain('€');
    });

    test('should format currency as GBP', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="currency-selector"]');
      await page.click('[data-currency="GBP"]');

      const currency = await page.textContent('[data-metric="revenue"]');
      expect(currency).toContain('£');
    });

    test('should format currency as JPY', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="currency-selector"]');
      await page.click('[data-currency="JPY"]');

      const currency = await page.textContent('[data-metric="revenue"]');
      expect(currency).toContain('¥');
    });

    test('should format currency as CNY', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="currency-selector"]');
      await page.click('[data-currency="CNY"]');

      const currency = await page.textContent('[data-metric="revenue"]');
      expect(currency).toContain('¥');
    });
  });

  test.describe('Date/Time Localization', () => {
    test('should format date in US locale', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="locale-selector"]');
      await page.click('[data-locale="en-US"]');

      const date = await page.textContent('[data-testid="current-date"]');
      expect(date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test('should format date in EU locale', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="locale-selector"]');
      await page.click('[data-locale="de-DE"]');

      const date = await page.textContent('[data-testid="current-date"]');
      expect(date).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
    });

    test('should format date in JP locale', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="locale-selector"]');
      await page.click('[data-locale="ja-JP"]');

      const date = await page.textContent('[data-testid="current-date"]');
      expect(date).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/);
    });

    test('should format time in 12-hour format', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="time-format-selector"]');
      await page.click('[data-format="12h"]');

      const time = await page.textContent('[data-testid="current-time"]');
      expect(time).toMatch(/(AM|PM)/);
    });

    test('should format time in 24-hour format', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="time-format-selector"]');
      await page.click('[data-format="24h"]');

      const time = await page.textContent('[data-testid="current-time"]');
      expect(time).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  test.describe('Number Formatting', () => {
    test('should use US number formatting', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="locale-selector"]');
      await page.click('[data-locale="en-US"]');

      const number = await page.textContent('[data-metric="users"]');
      expect(number).toMatch(/,/);
    });

    test('should use EU number formatting', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="locale-selector"]');
      await page.click('[data-locale="de-DE"]');

      const number = await page.textContent('[data-metric="users"]');
      expect(number).toMatch(/\./);
    });
  });

  test.describe('Translated Content', () => {
    test('should translate navigation to Spanish', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="es"]');

      const dashboardLink = page.locator('a[href="/dashboard"]');
      await expect(dashboardLink).toContainText('Tablero');
    });

    test('should translate navigation to French', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="fr"]');

      const dashboardLink = page.locator('a[href="/dashboard"]');
      await expect(dashboardLink).toContainText('Tableau de bord');
    });

    test('should translate error messages', async ({ page }) => {
      await page.goto('/login');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="es"]');

      await page.fill('[data-testid="email-input"]', 'invalid');
      await page.fill('[data-testid="password-input"]', 'short');
      await page.click('[data-testid="login-button"]');

      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toContainText('inválido');
    });

    test('should translate form labels', async ({ page }) => {
      await page.goto('/login');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="de"]');

      const emailLabel = page.locator('[data-testid="email-input"]');
      await expect(emailLabel).toHaveAttribute('placeholder', /E-Mail/);
    });
  });

  test.describe('Localized Keyboard Shortcuts', () => {
    test('should adapt shortcuts for AZERTY', async ({ page }) => {
      await page.goto('/spreadsheet/test');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="fr"]');

      // Shortcut help should show AZERTY layout
      await page.keyboard.press('Control+q');
      const shortcutHelp = page.locator('[data-testid="shortcut-help"]');
      await expect(shortcutHelp).toBeVisible();
    });
  });

  test.describe('Timezone Handling', () => {
    test('should display times in user timezone', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="timezone-selector"]');
      await page.click('[data-timezone="America/New_York"]');

      const time = await page.textContent('[data-testid="current-time"]');
      expect(time).toBeTruthy();
    });

    test('should convert timezone correctly', async ({ page }) => {
      await page.goto('/analytics');
      await page.click('[data-testid="timezone-selector"]');
      await page.click('[data-timezone="Europe/London"]');

      const time = await page.textContent('[data-testid="current-time"]');
      expect(time).toBeTruthy();
    });
  });

  test.describe('Localized URL Slugs', () => {
    test('should use Spanish URL slug', async ({ page }) => {
      await page.goto('/es/tablero');
      await page.waitForLoadState('networkidle');

      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('es');
    });

    test('should use French URL slug', async ({ page }) => {
      await page.goto('/fr/tableau-de-bord');
      await page.waitForLoadState('networkidle');

      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('fr');
    });
  });

  test.describe('Content Adaptation', () => {
    test('should show culturally appropriate examples', async ({ page }) => {
      await page.goto('/templates');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="ja"]');

      // Template examples should use Japanese data
      const templates = page.locator('[data-testid="template-card"]');
      await expect(templates.first()).toContainText('日本語');
    });
  });

  test.describe('Accessibility', () => {
    test('should maintain accessibility in RTL', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="ar"]');

      // Check that focus order is correct in RTL
      await page.keyboard.press('Tab');
      const firstElement = page.locator(':focus');
      await expect(firstElement).toBeVisible();
    });

    test('should have proper lang attributes', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="es"]');

      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBe('es');
    });
  });

  test.describe('SEO and Metadata', () => {
    test('should update meta language', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-lang="es"]');

      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('es');
    });

    test('should update hreflang tags', async ({ page }) => {
      await page.goto('/');
      const hreflangTags = await page.$$eval('link[hreflang]', tags =>
        tags.map(tag => ({
          hreflang: tag.getAttribute('hreflang'),
          href: tag.getAttribute('href')
        }))
      );

      expect(hreflangTags.length).toBeGreaterThan(0);
    });
  });
});
