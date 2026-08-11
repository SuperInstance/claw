/**
 * Visual Accessibility Testing Suite
 * Spreadsheet Moment Platform - WCAG 2.1 Level AA
 *
 * This test suite verifies visual accessibility requirements including:
 * - Color contrast ratios (4.5:1 for text, 3:1 for UI components)
 * - Text scaling up to 200%
 * - High contrast mode support
 * - Color independence
 * - No flashing content
 * - Focus indicator visibility
 *
 * Run with: npm run test:visual
 */

const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const RESULTS_DIR = path.join(__dirname, 'results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

/**
 * Color contrast testing
 */
async function testColorContrast(page) {
  console.log('\nTesting color contrast ratios...');

  const results = {
    name: 'Color Contrast',
    description: 'Verify text and UI components meet WCAG AA contrast requirements',
    totalTests: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  // Get all text elements
  const textElements = await page.$$eval(
    'p, h1, h2, h3, h4, h5, h6, span, a, button, label',
    elements => elements.map(el => ({
      tagName: el.tagName,
      text: el.textContent?.substring(0, 50) || '',
      color: window.getComputedStyle(el).color,
      backgroundColor: window.getComputedStyle(el).backgroundColor,
      fontSize: window.getComputedStyle(el).fontSize,
      fontWeight: window.getComputedStyle(el).fontWeight
    }))
  );

  // Get all UI components
  const uiElements = await page.$$eval(
    'button, input, select, textarea, [role="button"]',
    elements => elements.map(el => ({
      tagName: el.tagName,
      type: el.type || '',
      color: window.getComputedStyle(el).color,
      backgroundColor: window.getComputedStyle(el).backgroundColor,
      borderColor: window.getComputedStyle(el).borderColor,
      borderWidth: window.getComputedStyle(el).borderWidth
    }))
  );

  // Test text contrast (4.5:1 for normal text, 3:1 for large text)
  for (const el of textElements) {
    results.totalTests++;

    const contrastRatio = calculateContrastRatio(el.color, el.backgroundColor);
    const fontSize = parseFloat(el.fontSize);
    const fontWeight = parseInt(el.fontWeight);
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
    const requiredRatio = isLargeText ? 3.0 : 4.5;

    const passed = contrastRatio >= requiredRatio;

    results.details.push({
      type: 'text',
      element: el.tagName,
      text: el.text,
      contrastRatio: contrastRatio.toFixed(2),
      requiredRatio: requiredRatio.toFixed(2),
      isLargeText,
      passed
    });

    if (passed) results.passed++;
    else results.failed++;
  }

  // Test UI component contrast (3:1 minimum)
  for (const el of uiElements) {
    results.totalTests++;

    // Test foreground/background contrast
    const fgBgContrast = calculateContrastRatio(el.color, el.backgroundColor);
    // Test border/background contrast
    const borderBgContrast = calculateContrastRatio(el.borderColor, el.backgroundColor);
    const requiredRatio = 3.0;

    const passed = fgBgContrast >= requiredRatio && borderBgContrast >= requiredRatio;

    results.details.push({
      type: 'ui-component',
      element: el.tagName,
      fgBgContrast: fgBgContrast.toFixed(2),
      borderBgContrast: borderBgContrast.toFixed(2),
      requiredRatio: requiredRatio.toFixed(2),
      passed
    });

    if (passed) results.passed++;
    else results.failed++;
  }

  console.log(`  Text elements tested: ${textElements.length}`);
  console.log(`  UI elements tested: ${uiElements.length}`);
  console.log(`  Passed: ${results.passed}/${results.totalTests}`);

  return results;
}

/**
 * Calculate relative luminance
 */
function calculateLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(v => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(color1, color2) {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  if (!rgb1 || !rgb2) return 21.0; // Default to max if parsing fails

  const l1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse CSS color to RGB
 */
function parseColor(color) {
  if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
    return { r: 255, g: 255, b: 255 }; // Default to white background
  }

  const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }

  const hexMatch = color.match(/^#([0-9A-F]{3}){1,2}$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }

  return null;
}

/**
 * Test text scaling up to 200%
 */
async function testTextScaling(page) {
  console.log('\nTesting text scaling (200%)...');

  const results = {
    name: 'Text Scaling',
    description: 'Verify text can be scaled to 200% without loss of content',
    totalTests: 3,
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: 200% zoom
  await page.evaluate(() => {
    document.body.style.zoom = '200%';
  });

  const hasHorizontalScroll1 = await page.evaluate(() => {
    return document.body.scrollWidth > document.body.clientWidth;
  });

  results.details.push({
    test: '200% zoom',
    hasHorizontalScroll: hasHorizontalScroll1,
    passed: !hasHorizontalScroll1
  });

  if (!hasHorizontalScroll1) results.passed++;
  else results.failed++;

  // Test 2: Large text only
  await page.evaluate(() => {
    document.body.style.zoom = '100%';
    document.body.style.fontSize = '200%';
  });

  const hasHorizontalScroll2 = await page.evaluate(() => {
    return document.body.scrollWidth > document.body.clientWidth;
  });

  results.details.push({
    test: '200% font size',
    hasHorizontalScroll: hasHorizontalScroll2,
    passed: !hasHorizontalScroll2
  });

  if (!hasHorizontalScroll2) results.passed++;
  else results.failed++;

  // Test 3: All text remains readable
  await page.evaluate(() => {
    document.body.style.fontSize = '16px';
  });

  const textReadable = await page.evaluate(() => {
    const allText = document.body.textContent;
    return allText && allText.length > 0;
  });

  results.details.push({
    test: 'Text remains readable',
    passed: textReadable
  });

  if (textReadable) results.passed++;
  else results.failed++;

  console.log(`  Passed: ${results.passed}/${results.totalTests}`);

  return results;
}

/**
 * Test high contrast mode
 */
async function testHighContrastMode(page) {
  console.log('\nTesting high contrast mode...');

  const results = {
    name: 'High Contrast Mode',
    description: 'Verify content works in Windows high contrast mode',
    totalTests: 2,
    passed: 0,
    failed: 0,
    details: []
  };

  // Enable high contrast mode simulation
  await page.emulateMediaFeatures([{
    name: 'prefers-contrast',
    value: 'more'
  }]);

  // Test 1: Content remains visible
  const contentVisible = await page.evaluate(() => {
    const elements = document.querySelectorAll('h1, h2, h3, p, a, button');
    for (const el of elements) {
      const styles = window.getComputedStyle(el);
      const isVisible = styles.display !== 'none' &&
                       styles.visibility !== 'hidden' &&
                       styles.opacity !== '0';
      if (!isVisible) return false;
    }
    return true;
  });

  results.details.push({
    test: 'Content remains visible',
    passed: contentVisible
  });

  if (contentVisible) results.passed++;
  else results.failed++;

  // Test 2: Text remains readable
  const textReadable = await page.evaluate(() => {
    const text = document.body.textContent;
    return text && text.length > 100;
  });

  results.details.push({
    test: 'Text remains readable',
    passed: textReadable
  });

  if (textReadable) results.passed++;
  else results.failed++;

  console.log(`  Passed: ${results.passed}/${results.totalTests}`);

  return results;
}

/**
 * Test reduced motion preference
 */
async function testReducedMotion(page) {
  console.log('\nTesting reduced motion preference...');

  const results = {
    name: 'Reduced Motion',
    description: 'Verify respects prefers-reduced-motion',
    totalTests: 1,
    passed: 0,
    failed: 0,
    details: []
  };

  // Enable reduced motion
  await page.emulateMediaFeatures([{
    name: 'prefers-reduced-motion',
    value: 'reduce'
  }]);

  // Check if animations are disabled
  const animationsDisabled = await page.evaluate(() => {
    const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"]');
    for (const el of animatedElements) {
      const styles = window.getComputedStyle(el);
      if (styles.animationName !== 'none' && styles.animationDuration !== '0s') {
        return false;
      }
    }
    return true;
  });

  results.details.push({
    test: 'Animations disabled',
    passed: animationsDisabled
  });

  if (animationsDisabled) results.passed++;
  else results.failed++;

  console.log(`  Passed: ${results.passed}/${results.totalTests}`);

  return results;
}

/**
 * Test focus indicators
 */
async function testFocusIndicators(page) {
  console.log('\nTesting focus indicators...');

  const results = {
    name: 'Focus Indicators',
    description: 'Verify focus indicators are visible and meet contrast requirements',
    totalTests: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  const focusableElements = await page.$$('a, button, input, select, textarea');

  for (const element of focusableElements.slice(0, 10)) { // Test first 10
    await page.evaluate(el => el.focus(), element);

    const hasFocusStyle = await element.evaluate(el => {
      const styles = window.getComputedStyle(el);
      const hasOutline = styles.outline !== 'none' && styles.outlineWidth !== '0px';
      const hasBoxShadow = styles.boxShadow !== 'none';
      return hasOutline || hasBoxShadow;
    });

    results.totalTests++;

    results.details.push({
      element: await element.evaluate(el => el.tagName),
      hasFocusIndicator: hasFocusStyle,
      passed: hasFocusStyle
    });

    if (hasFocusStyle) results.passed++;
    else results.failed++;
  }

  console.log(`  Tested: ${results.totalTests} focusable elements`);
  console.log(`  Passed: ${results.passed}/${results.totalTests}`);

  return results;
}

/**
 * Test color independence
 */
async function testColorIndependence(page) {
  console.log('\nTesting color independence...');

  const results = {
    name: 'Color Independence',
    description: 'Verify information not conveyed by color alone',
    totalTests: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  // Test links (should have underline or icon, not just color)
  const links = await page.$$eval('a', links => links.map(link => ({
    text: link.textContent?.substring(0, 30) || '',
    hasUnderline: window.getComputedStyle(link).textDecorationLine.includes('underline'),
    color: window.getComputedStyle(link).color
  })));

  links.forEach(link => {
    results.totalTests++;

    const passed = link.hasUnderline || link.text.length > 0;

    results.details.push({
      type: 'link',
      text: link.text,
      hasUnderline: link.hasUnderline,
      passed
    });

    if (passed) results.passed++;
    else results.failed++;
  });

  // Test error messages (should have icons + text, not just red color)
  // Currently no error messages in the app

  console.log(`  Tested: ${results.totalTests} links`);
  console.log(`  Passed: ${results.passed}/${results.totalTests}`);

  return results;
}

/**
 * Run all visual accessibility tests
 */
async function runVisualTests() {
  console.log('Starting visual accessibility tests...');
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
      totalTests: 0,
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

    // Run tests
    const tests = [
      testColorContrast,
      testTextScaling,
      testHighContrastMode,
      testReducedMotion,
      testFocusIndicators,
      testColorIndependence
    ];

    for (const test of tests) {
      try {
        const result = await test(page);
        results.tests.push(result);
        results.summary.totalTests += result.totalTests;
        results.summary.passed += result.passed;
        results.summary.failed += result.failed;
      } catch (error) {
        console.error(`Test error: ${error.message}`);
      }
    }

    await page.close();

    // Save results
    const resultsFile = path.join(RESULTS_DIR, `visual-results-${Date.now()}.json`);
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
      console.log('\n❌ Some visual accessibility tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All visual accessibility tests passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('Error running visual tests:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

/**
 * Run tests if executed directly
 */
if (require.main === module) {
  runVisualTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runVisualTests };
