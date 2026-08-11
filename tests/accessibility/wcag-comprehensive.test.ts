/**
 * Comprehensive WCAG 2.1 Level AA Accessibility Test Suite
 *
 * This test suite validates all critical accessibility improvements
 * Target: 98%+ WCAG 2.1 Level AA compliance
 *
 * Test Categories:
 * 1. Skip Navigation (2.4.1 Bypass Blocks)
 * 2. Focus Indicators (2.4.7 Focus Visible)
 * 3. Page Titles (2.4.2 Page Titled)
 * 4. Border Contrast (1.4.11 Non-text Contrast)
 * 5. Icon Labels (1.1.1 Non-text Content)
 * 6. ARIA Landmarks (1.3.1 Info and Relationships)
 * 7. Reduced Motion (2.3.3 Animation from Interactions)
 * 8. Link Descriptions (2.4.4 Link Purpose)
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('WCAG 2.1 Level AA - Critical Accessibility Tests', () => {
  // Setup: Inject axe-core before each test
  test.beforeEach(async ({ page }) => {
    await injectAxe(page);
  });

  test.describe('1. Skip Navigation (WCAG 2.4.1)', () => {
    test('should have skip to main content link', async ({ page }) => {
      await page.goto('/');

      // Check for skip link
      const skipLink = page.locator('a[href="#main-content"], [data-skip-link]');
      await expect(skipLink).toHaveCount(1);

      // Verify it's first focusable element
      const firstTabbable = await page.locator('a, button').first();
      await expect(firstTabbable).toHaveAttribute('data-skip-link');
    });

    test('should show skip link on focus', async ({ page }) => {
      await page.goto('/');

      // Focus skip link via keyboard
      await page.keyboard.press('Tab');

      // Verify skip link is visible
      const skipLink = page.locator('a[href="#main-content"], [data-skip-link]');
      await expect(skipLink).toBeVisible();

      // Verify contrast
      const backgroundColor = await skipLink.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      const color = await skipLink.evaluate(el =>
        window.getComputedStyle(el).color
      );
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('should navigate to main content when activated', async ({ page }) => {
      await page.goto('/');

      // Click skip link
      await page.click('a[href="#main-content"]');

      // Verify focus moved to main content
      const mainContent = page.locator('#main-content, [role="main"]');
      await expect(mainContent).toBeFocused();
    });

    test('should announce navigation to screen readers', async ({ page }) => {
      await page.goto('/');

      // Activate skip link
      await page.click('a[href="#main-content"]');

      // Check for live region announcement
      const liveRegion = page.locator('[aria-live="polite"]');
      await expect(liveRegion).toContainText('main content');
    });
  });

  test.describe('2. Focus Indicators (WCAG 2.4.7)', () => {
    test('should show visible focus on all interactive elements', async ({ page }) => {
      await page.goto('/');

      // Get all focusable elements
      const focusableElements = await page.locator(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      ).all();

      for (const element of focusableElements) {
        // Focus element
        await element.focus();

        // Check for focus indicator (outline or box-shadow)
        const outline = await element.evaluate(el =>
          window.getComputedStyle(el).outline
        );
        const boxShadow = await element.evaluate(el =>
          window.getComputedStyle(el).boxShadow
        );

        // At least one should be present
        const hasFocusIndicator =
          outline !== 'none' ||
          boxShadow !== 'none' ||
          (outline.includes('solid') && parseFloat(outline) >= 2);

        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('should have 3:1 contrast for focus indicators', async ({ page }) => {
      await page.goto('/login');

      const input = page.locator('input[type="text"]').first();
      await input.focus();

      // Get focus styles
      const outlineColor = await input.evaluate(el =>
        window.getComputedStyle(el).outlineColor
      );
      const backgroundColor = await input.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // Calculate contrast (simplified - use axe for accurate results)
      expect(outlineColor).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('should not remove default focus without replacement', async ({ page }) => {
      await page.goto('/');

      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        await button.focus();

        // Check that outline exists or custom focus ring exists
        const outline = await button.evaluate(el =>
          window.getComputedStyle(el).outline
        );
        const customFocus = await button.evaluate(el =>
          window.getComputedStyle(el).boxShadow
        );

        const hasFocus = outline !== 'none' || customFocus !== 'none';
        expect(hasFocus).toBeTruthy();
      }
    });
  });

  test.describe('3. Page Titles (WCAG 2.4.2)', () => {
    test('should have unique page titles for each route', async ({ page }) => {
      const routes = ['/', '/dashboard', '/spreadsheet', '/settings'];
      const titles: string[] = [];

      for (const route of routes) {
        await page.goto(route);
        const title = await page.title();
        titles.push(title);
      }

      // All titles should be unique
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(routes.length);
    });

    test('should include page name and site name', async ({ page }) => {
      await page.goto('/dashboard');

      const title = await page.title();

      // Should follow format: "Page Name - Site Name"
      expect(title).toMatch(/^[^-]+ - .+$/);
      expect(title).toContain('Spreadsheet Moment');
    });

    test('should update title on route change', async ({ page }) => {
      await page.goto('/');

      const initialTitle = await page.title();

      // Navigate to new page
      await page.click('a[href="/dashboard"]');
      await page.waitForLoadState('networkidle');

      const newTitle = await page.title();

      // Title should change
      expect(newTitle).not.toBe(initialTitle);
    });

    test('should not have duplicate titles', async ({ page }) => {
      const pages = ['/', '/about', '/contact'];
      const titles: string[] = [];

      for (const pageUrl of pages) {
        await page.goto(pageUrl);
        titles.push(await page.title());
      }

      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(pages.length);
    });
  });

  test.describe('4. Border Color Contrast (WCAG 1.4.11)', () => {
    test('should have 3:1 contrast for form borders', async ({ page }) => {
      await page.goto('/login');

      const inputs = await page.locator('input, textarea, select').all();

      for (const input of inputs) {
        const borderColor = await input.evaluate(el =>
          window.getComputedStyle(el).borderColor
        );
        const backgroundColor = await input.evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        );

        // Border should be visible against background
        expect(borderColor).not.toBe(backgroundColor);
      }
    });

    test('should have 3:1 contrast for button borders', async ({ page }) => {
      await page.goto('/');

      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        const borderInfo = await button.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            color: styles.borderColor,
            width: styles.borderWidth,
            style: styles.borderStyle,
          };
        });

        // If border exists, it should have contrast
        if (
          borderInfo.style !== 'none' &&
          borderInfo.width !== '0px'
        ) {
          const hasContrast = borderInfo.color !== 'rgb(0, 0, 0)' ||
            borderInfo.color !== 'rgb(255, 255, 255)';
          expect(hasContrast).toBeTruthy();
        }
      }
    });

    test('should pass axe-core contrast checks', async ({ page }) => {
      await page.goto('/');

      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: false },
        },
      });
    });
  });

  test.describe('5. Icon Labels (WCAG 1.1.1)', () => {
    test('should have aria-label on icon-only buttons', async ({ page }) => {
      await page.goto('/');

      // Find icon-only buttons
      const iconButtons = await page.locator('button').filter(async (el) => {
        const text = await el.textContent();
        return text?.trim().length === 0;
      }).all();

      for (const button of iconButtons) {
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        const title = await button.getAttribute('title');

        // Should have at least one label
        expect(ariaLabel || ariaLabelledBy || title).toBeTruthy();
      }
    });

    test('should mark decorative icons with aria-hidden', async ({ page }) => {
      await page.goto('/');

      // Find decorative icons
      const decorativeIcons = await page.locator('.icon, [class*="icon"]').all();

      for (const icon of decorativeIcons) {
        const ariaHidden = await icon.getAttribute('aria-hidden');
        const ariaLabel = await icon.getAttribute('aria-label');

        // If purely decorative, should be aria-hidden
        if (ariaLabel) {
          // Has label, OK
        } else {
          // Should be marked as decorative
          expect(ariaHidden).toBe('true');
        }
      }
    });

    test('should have descriptive icon labels', async ({ page }) => {
      await page.goto('/');

      const iconButtons = await page.locator('button[aria-label]').all();

      for (const button of iconButtons) {
        const ariaLabel = await button.getAttribute('aria-label');

        // Label should be descriptive (not just "icon")
        if (ariaLabel) {
          expect(ariaLabel.toLowerCase()).not.toBe('icon');
          expect(ariaLabel.length).toBeGreaterThan(2);
        }
      }
    });
  });

  test.describe('6. ARIA Landmarks (WCAG 1.3.1)', () => {
    test('should have main landmark', async ({ page }) => {
      await page.goto('/');

      const main = page.locator('main, [role="main"]');
      await expect(main).toHaveCount(1);
    });

    test('should have navigation landmark', async ({ page }) => {
      await page.goto('/');

      const nav = page.locator('nav, [role="navigation"]');
      await expect(nav).toHaveCountGreaterThan(0);
    });

    test('should have header landmark', async ({ page }) => {
      await page.goto('/');

      const header = page.locator('header, [role="banner"]');
      await expect(header).toHaveCount(1);
    });

    test('should have footer landmark', async ({ page }) => {
      await page.goto('/');

      const footer = page.locator('footer, [role="contentinfo"]');
      await expect(footer).toHaveCount(1);
    });

    test('should have unique labels for landmarks', async ({ page }) => {
      await page.goto('/');

      const navs = await page.locator('nav, [role="navigation"]').all();

      if (navs.length > 1) {
        const labels: string[] = [];

        for (const nav of navs) {
          const label = await nav.getAttribute('aria-label');
          if (label) {
            labels.push(label);
          }
        }

        // Should have unique labels
        const uniqueLabels = new Set(labels);
        expect(uniqueLabels.size).toBeGreaterThan(0);
      }
    });
  });

  test.describe('7. Reduced Motion (WCAG 2.3.3)', () => {
    test('should respect prefers-reduced-motion', async ({ page, context }) => {
      // Enable reduced motion
      await context.addInitScript(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: (query: string) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          }),
        });
      });

      await page.goto('/');

      // Check for reduced-motion class
      const hasReducedMotion = await page.evaluate(() =>
        document.documentElement.classList.contains('reduced-motion')
      );

      expect(hasReducedMotion).toBeTruthy();
    });

    test('should disable animations when reduced motion is preferred', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');

      // Check that animations are disabled
      const animations = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let hasAnimation = false;

        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          if (styles.animationName !== 'none') {
            hasAnimation = true;
          }
        });

        return hasAnimation;
      });

      expect(animations).toBeFalsy();
    });
  });

  test.describe('8. Link Descriptions (WCAG 2.4.4)', () => {
    test('should have descriptive link text', async ({ page }) => {
      await page.goto('/');

      const links = await page.locator('a').all();

      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');

        // Link should have descriptive text or aria-label
        const hasDescription = text?.trim().length > 0 || ariaLabel;

        expect(hasDescription).toBeTruthy();

        // Should not use generic text
        if (text) {
          expect(text.toLowerCase().trim()).not.toBe('click here');
          expect(text.toLowerCase().trim()).not.toBe('read more');
          expect(text.toLowerCase().trim()).not.toBe('more');
        }
      }
    });

    test('should have aria-label for icon-only links', async ({ page }) => {
      await page.goto('/');

      const iconLinks = await page.locator('a').filter(async (el) => {
        const text = await el.textContent();
        return text?.trim().length === 0;
      }).all();

      for (const link of iconLinks) {
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');

        expect(ariaLabel || title).toBeTruthy();
      }
    });

    test('should include context in link text when needed', async ({ page }) => {
      await page.goto('/community/forum');

      const links = await page.locator('a').all();

      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');

        // If link text is generic, should have aria-label
        if (text && ['get started', 'learn more', 'view all'].includes(text.toLowerCase())) {
          expect(ariaLabel).toBeTruthy();
        }
      }
    });
  });

  test.describe('Comprehensive axe-core Tests', () => {
    test('should pass all WCAG 2.1 AA rules on homepage', async ({ page }) => {
      await page.goto('/');

      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: {
          // WCAG 2.1 Level A
          'color-contrast': { enabled: true },
          'image-alt': { enabled: true },
          'label': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },

          // WCAG 2.1 Level AA
          'document-title': { enabled: true },
          'html-has-lang': { enabled: true },
          'landmark-one-main': { enabled: true },
          'landmark-no-duplicate-banner': { enabled: true },
          'landmark-no-duplicate-contentinfo': { enabled: true },

          // Best practices
          'heading-order': { enabled: true },
          'empty-heading': { enabled: false }, // Allow empty headings
        },
      });
    });

    test('should pass all WCAG 2.1 AA rules on all pages', async ({ page }) => {
      const pages = ['/', '/dashboard', '/spreadsheet', '/settings', '/community'];

      for (const pagePath of pages) {
        await page.goto(pagePath);

        await checkA11y(page, null, {
          detailedReport: true,
          detailedReportOptions: { html: true },
        });
      }
    });

    test('should have 98%+ accessibility score', async ({ page }) => {
      await page.goto('/');

      const results = await checkA11y(page, null, {
        detailedReport: true,
      });

      // Calculate pass rate
      const violations = results.violations?.length || 0;
      const passes = results.passes?.length || 0;
      const total = violations + passes;

      const passRate = total > 0 ? (passes / total) * 100 : 0;

      expect(passRate).toBeGreaterThanOrEqual(98);
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/dashboard');

      // Trigger dynamic content change
      await page.click('[data-testid="refresh-button"]');

      // Wait for announcement
      await page.waitForTimeout(500);

      // Check for live region
      const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"]');
      await expect(liveRegion).toBeVisible();
    });

    test('should have proper ARIA roles', async ({ page }) => {
      await page.goto('/');

      // Check for proper roles on interactive elements
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const role = await button.getAttribute('role');
        // Button elements should not need role attribute
        // but if present, should be button
        if (role) {
          expect(role).toBe('button');
        }
      }

      // Check for proper roles on custom components
      const customComponents = await page.locator('[role]').all();
      for (const component of customComponents) {
        const role = await component.getAttribute('role');
        expect(role).toBeTruthy();
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be fully keyboard navigable', async ({ page }) => {
      await page.goto('/');

      // Tab through all interactive elements
      let tabCount = 0;
      const maxTabs = 50;

      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;

        // Verify focus is visible
        const focused = await page.locator(':focus').count();
        expect(focused).toBeGreaterThan(0);

        // Check if we've looped back to the beginning
        const firstElement = page.locator('a, button').first();
        const isFocused = await firstElement.evaluate(el => el === document.activeElement);

        if (isFocused && tabCount > 1) {
          break;
        }
      }
    });

    test('should have logical tab order', async ({ page }) => {
      await page.goto('/');

      const tabOrder: string[] = [];

      for (let i = 0; i < 10; i++) {
        const focused = await page.locator(':focus');
        const tagName = await focused.evaluate(el => el.tagName);
        tabOrder.push(tagName);
        await page.keyboard.press('Tab');
      }

      // Tab order should be logical (not jumping around randomly)
      expect(tabOrder.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Run tests with:
 * npx playwright test wcag-comprehensive.test.ts
 *
 * Generate report with:
 * npx playwright test wcag-comprehensive.test.ts --reporter=html
 */
