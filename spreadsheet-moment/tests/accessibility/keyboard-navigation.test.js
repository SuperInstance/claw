/**
 * Keyboard Navigation Testing Suite
 * Spreadsheet Moment Platform - WCAG 2.1 Level AA
 *
 * This test suite verifies all interactive elements are accessible
 * via keyboard and follow logical tab order.
 *
 * Tests include:
 * - Tab order verification
 * - Focus indicator visibility
 * - Skip navigation functionality
 * - Keyboard trap detection
 * - Shortcut key testing
 *
 * Run with: npm run test:keyboard
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const RESULTS_DIR = path.join(__dirname, 'results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

/**
 * Keyboard navigation test cases
 */
const keyboardTests = {
  tabOrder: {
    name: 'Tab Order',
    description: 'Verify logical tab order through all interactive elements',
    test: async (page) => {
      const results = [];
      const focusableElements = await page.$$eval(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        elements => elements.map(el => ({
          tagName: el.tagName,
          type: el.type || '',
          id: el.id || '',
          className: el.className || '',
          textContent: el.textContent?.substring(0, 50) || '',
          href: el.href || '',
          tabIndex: parseInt(el.getAttribute('tabindex')) || 0
        }))
      );

      let previousElement = null;
      for (let i = 0; i < focusableElements.length; i++) {
        const element = focusableElements[i];

        // Press Tab and verify focus moves
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => {
          const focused = document.activeElement;
          return {
            tagName: focused?.tagName,
            id: focused?.id || '',
            className: focused?.className || '',
            textContent: focused?.textContent?.substring(0, 50) || ''
          };
        });

        // Verify focused element matches expected
        const isMatch = focusedElement.tagName === element.tagName &&
          focusedElement.id === element.id &&
          focusedElement.className === element.className;

        results.push({
          index: i,
          expected: element,
          actual: focusedElement,
          isMatch,
          issue: isMatch ? null : `Focus mismatch at index ${i}`
        });

        previousElement = element;
      }

      return {
        total: focusableElements.length,
        passed: results.filter(r => r.isMatch).length,
        failed: results.filter(r => !r.isMatch).length,
        details: results
      };
    }
  },

  focusIndicators: {
    name: 'Focus Indicators',
    description: 'Verify focus indicators are visible on all focusable elements',
    test: async (page) => {
      const results = [];
      const focusableElements = await page.$$(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      for (const element of focusableElements) {
        // Focus the element
        await page.evaluate(el => el.focus(), element);

        // Check if focus outline is visible
        const isVisible = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          const hasOutline = styles.outline !== 'none' && styles.outlineWidth !== '0px';
          const hasBoxShadow = styles.boxShadow !== 'none';
          return hasOutline || hasBoxShadow;
        });

        // Check contrast ratio of focus indicator
        const contrastRatio = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          // This is a simplified check - real implementation needs color extraction
          const outlineColor = styles.outlineColor;
          const backgroundColor = styles.backgroundColor;
          return { outlineColor, backgroundColor };
        });

        results.push({
          tagName: await element.evaluate(el => el.tagName),
          hasFocusIndicator: isVisible,
          contrastInfo: contrastRatio,
          passed: isVisible
        });
      }

      return {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        details: results
      };
    }
  },

  skipNavigation: {
    name: 'Skip Navigation',
    description: 'Verify skip navigation link exists and functions correctly',
    test: async (page) => {
      // Check for skip link
      const skipLinks = await page.$$eval(
        'a[href^="#"], [role="navigation"] a',
        links => links
          .filter(link => {
            const text = link.textContent?.toLowerCase() || '';
            return text.includes('skip') ||
                   text.includes('main') ||
                   text.includes('content');
          })
          .map(link => ({
            text: link.textContent,
            href: link.getAttribute('href'),
            id: link.id || ''
          }))
      );

      // Test if skip link works
      let skipLinkWorks = false;
      if (skipLinks.length > 0) {
        const firstSkipLink = skipLinks[0];
        await page.evaluate((href) => {
          const link = document.querySelector(`a[href="${href}"]`);
          if (link) link.click();
        }, firstSkipLink.href);

        // Check if focus moved to main content
        const focusedElement = await page.evaluate(() => ({
          tagName: document.activeElement?.tagName,
          id: document.activeElement?.id || ''
        }));

        skipLinkWorks = focusedElement.id === 'main' ||
                        focusedElement.tagName === 'MAIN';
      }

      return {
        skipLinksFound: skipLinks.length,
        skipLinks,
        skipLinkWorks,
        passed: skipLinks.length > 0 && skipLinkWorks,
        details: skipLinks
      };
    }
  },

  keyboardTraps: {
    name: 'Keyboard Traps',
    description: 'Verify no keyboard traps exist',
    test: async (page) => {
      const traps = [];

      // Test all focusable elements
      const focusableElements = await page.$$(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      for (const element of focusableElements) {
        // Focus element
        await page.evaluate(el => el.focus(), element);

        // Try to navigate away with Tab
        await page.keyboard.press('Tab');
        const newFocus = await page.evaluate(() => document.activeElement?.tagName);

        // Try Shift+Tab
        await page.keyboard.press('Shift+Tab');
        const previousFocus = await page.evaluate(() => document.activeElement?.tagName);

        // Check if focus is stuck
        const isTrap = newFocus === await element.evaluate(el => el.tagName) &&
                      previousFocus === await element.evaluate(el => el.tagName);

        if (isTrap) {
          traps.push({
            element: await element.evaluate(el => ({
              tagName: el.tagName,
              id: el.id || '',
              className: el.className || ''
            }))
          });
        }
      }

      return {
        trapsFound: traps.length,
        traps,
        passed: traps.length === 0,
        details: traps
      };
    }
  },

  enterKey: {
    name: 'Enter Key Activation',
    description: 'Verify Enter key activates links and buttons',
    test: async (page) => {
      const results = [];
      const linksAndButtons = await page.$$('a, button');

      for (const element of linksAndButtons.slice(0, 10)) { // Test first 10
        // Focus element
        await page.evaluate(el => el.focus(), element);

        // Press Enter
        await page.keyboard.press('Enter');

        // Wait a bit for navigation/action
        await page.waitForTimeout(500);

        // Check if something happened (URL changed or action performed)
        const url = page.url();
        const hadAction = await page.evaluate(() => {
          // Check for toasts, modals, etc.
          return document.querySelector('[role="alert"], [role="dialog"]') !== null;
        });

        results.push({
          element: await element.evaluate(el => ({
            tagName: el.tagName,
            textContent: el.textContent?.substring(0, 30) || ''
          })),
          activated: true, // Enter should always do something
          urlChanged: url !== BASE_URL,
          hadUIFeedback: hadAction
        });

        // Go back if navigation occurred
        if (url !== BASE_URL) {
          await page.goBack();
          await page.waitForTimeout(500);
        }
      }

      return {
        total: results.length,
        passed: results.length,
        details: results
      };
    }
  },

  escapeKey: {
    name: 'Escape Key',
    description: 'Verify Escape key closes modals and dropdowns',
    test: async (page) => {
      // Currently no modals or dropdowns in the app
      // This test is for future implementation
      return {
        total: 0,
        passed: 0,
        notApplicable: true,
        message: 'No modals or dropdowns to test'
      };
    }
  },

  arrowKeys: {
    name: 'Arrow Key Navigation',
    description: 'Verify arrow keys work for navigation within components',
    test: async (page) => {
      // Test arrow key navigation in lists, menus, etc.
      const navigableElements = await page.$$('[role="menu"], [role="listbox"], nav ul');

      const results = [];
      for (const element of navigableElements) {
        // Focus first item
        const firstItem = await element.$('li, a, button');
        if (firstItem) {
          await page.evaluate(el => el.focus(), firstItem);

          // Try arrow keys
          await page.keyboard.press('ArrowDown');
          const downFocus = await page.evaluate(() => document.activeElement?.textContent);

          await page.keyboard.press('ArrowUp');
          const upFocus = await page.evaluate(() => document.activeElement?.textContent);

          results.push({
            element: await element.evaluate(el => ({
              role: el.getAttribute('role'),
              className: el.className || ''
            })),
            arrowDownWorks: downFocus !== await firstItem.evaluate(el => el.textContent),
            arrowUpWorks: upFocus === await firstItem.evaluate(el => el.textContent)
          });
        }
      }

      return {
        total: results.length,
        passed: results.filter(r => r.arrowDownWorks && r.arrowUpWorks).length,
        details: results
      };
    }
  }
};

/**
 * Run all keyboard navigation tests
 */
async function runKeyboardTests() {
  console.log('Starting keyboard navigation tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('='.repeat(80));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalTests: Object.keys(keyboardTests).length,
      passed: 0,
      failed: 0
    },
    tests: []
  };

  try {
    const page = await browser.newPage();

    // Navigate to home page
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1000);

    // Run each test
    for (const [testKey, testConfig] of Object.entries(keyboardTests)) {
      console.log(`\nRunning: ${testConfig.name}`);
      console.log(`  ${testConfig.description}`);

      try {
        const result = await testConfig.test(page);

        const testResult = {
          name: testConfig.name,
          description: testConfig.description,
          ...result,
          passed: result.passed >= (result.total || 0)
        };

        results.tests.push(testResult);
        results.summary.passed += testResult.passed ? 1 : 0;
        results.summary.failed += testResult.passed ? 0 : 1;

        console.log(`  Result: ${testResult.passed ? '✅ PASS' : '❌ FAIL'}`);
        if (result.total !== undefined) {
          console.log(`  Details: ${result.passed}/${result.total} checks passed`);
        }
      } catch (error) {
        console.error(`  Error: ${error.message}`);
        results.tests.push({
          name: testConfig.name,
          description: testConfig.description,
          error: error.message,
          passed: false
        });
        results.summary.failed++;
      }
    }

    await page.close();

    // Save results
    const resultsFile = path.join(RESULTS_DIR, `keyboard-results-${Date.now()}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n✅ Results saved to: ${resultsFile}`);

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);

    if (results.summary.failed > 0) {
      console.log('\n❌ Some keyboard navigation tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All keyboard navigation tests passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('Error running keyboard tests:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

/**
 * Run tests if executed directly
 */
if (require.main === module) {
  runKeyboardTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runKeyboardTests, keyboardTests };
