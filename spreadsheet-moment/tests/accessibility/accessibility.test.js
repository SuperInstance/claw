/**
 * Automated Accessibility Testing Suite
 * Spreadsheet Moment Platform - WCAG 2.1 Level AA
 *
 * This test suite uses Puppeteer and axe-core to automatically
 * test all pages for WCAG 2.1 Level AA compliance.
 *
 * Run with: npm test (or npm run test:a11y)
 */

const AxeBuilder = require('@axe-core/react');
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
 * Pages to test
 */
const pages = [
  { path: '/', name: 'Home' },
  { path: '/features', name: 'Features' },
  { path: '/docs', name: 'Documentation' },
  { path: '/examples', name: 'Examples' },
  { path: '/download', name: 'Download' }
];

/**
 * Test configuration
 */
const config = {
  // Viewports to test
  viewports: [
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ],

  // WCAG 2.1 Level AA tags
  tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],

  // Rules to disable (false positives for this app)
  disabledRules: [
    'color-contrast-enhanced', // Level AAA
    'meta-viewport-large' // Level AAA
  ]
};

/**
 * Main test function
 */
async function runAccessibilityTests() {
  console.log('Starting WCAG 2.1 Level AA accessibility tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Testing ${pages.length} pages across ${config.viewports.length} viewports`);
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
      violations: 0,
      passes: 0,
      incomplete: 0,
      inapplicable: 0
    },
    pages: []
  };

  try {
    for (const page of pages) {
      console.log(`\nTesting: ${page.name} (${page.path})`);
      console.log('-'.repeat(80));

      const pageResult = {
        name: page.name,
        path: page.path,
        viewports: []
      };

      for (const viewport of config.viewports) {
        console.log(`  Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);

        const browserPage = await browser.newPage();
        await browserPage.setViewport(viewport);
        await browserPage.goto(`${BASE_URL}${page.path}`, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        // Wait for React to render
        await browserPage.waitForTimeout(1000);

        // Run axe-core
        const axeResults = await new AxeBuilder({ page: browserPage })
          .withTags(config.tags)
          .disableRules(config.disabledRules)
          .analyze();

        const viewportResult = {
          viewport: viewport.name,
          width: viewport.width,
          height: viewport.height,
          violations: axeResults.violations,
          passes: axeResults.passes,
          incomplete: axeResults.incomplete,
          inapplicable: axeResults.inapplicable
        };

        // Update summary
        results.summary.totalTests++;
        results.summary.violations += axeResults.violations.length;
        results.summary.passes += axeResults.passes.length;
        results.summary.incomplete += axeResults.incomplete.length;
        results.summary.inapplicable += axeResults.inapplicable.length;

        // Log results
        if (axeResults.violations.length > 0) {
          console.log(`    ❌ ${axeResults.violations.length} violations found`);
          axeResults.violations.forEach(violation => {
            console.log(`       - ${violation.id}: ${violation.description}`);
          });
        } else {
          console.log(`    ✅ No violations found`);
        }

        console.log(`    📊 ${axeResults.passes.length} passes, ${axeResults.incomplete.length} incomplete`);

        pageResult.viewports.push(viewportResult);
        await browserPage.close();
      }

      results.pages.push(pageResult);
    }

    // Save results to file
    const resultsFile = path.join(RESULTS_DIR, `accessibility-results-${Date.now()}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n✅ Results saved to: ${resultsFile}`);

    // Generate HTML report
    await generateHTMLReport(results);
    console.log(`✅ HTML report generated: ${path.join(RESULTS_DIR, 'report.html')}`);

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Violations: ${results.summary.violations}`);
    console.log(`Passes: ${results.summary.passes}`);
    console.log(`Incomplete: ${results.summary.incomplete}`);
    console.log(`Inapplicable: ${results.summary.inapplicable}`);

    // Exit with error code if violations found
    if (results.summary.violations > 0) {
      console.log('\n❌ Accessibility tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All accessibility tests passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('Error running accessibility tests:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

/**
 * Generate HTML report from test results
 */
async function generateHTMLReport(results) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Test Report - Spreadsheet Moment</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      background: #6366f1;
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      opacity: 0.9;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .summary-card h3 {
      font-size: 0.875rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }

    .summary-card .value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #6366f1;
    }

    .summary-card.violations .value {
      color: #ef4444;
    }

    .summary-card.passes .value {
      color: #10b981;
    }

    .page-section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .page-section h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #1e293b;
    }

    .viewport-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 4px;
    }

    .viewport-section h3 {
      font-size: 1.125rem;
      margin-bottom: 1rem;
      color: #475569;
    }

    .violation {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
    }

    .violation h4 {
      color: #991b1b;
      margin-bottom: 0.5rem;
    }

    .violation p {
      color: #7f1d1d;
      margin-bottom: 0.5rem;
    }

    .violation ul {
      margin-left: 1.5rem;
      color: #7f1d1d;
    }

    .pass {
      color: #10b981;
      margin: 0.5rem 0;
    }

    .incomplete {
      color: #f59e0b;
      margin: 0.5rem 0;
    }

    footer {
      text-align: center;
      padding: 2rem;
      color: #666;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Accessibility Test Report</h1>
      <p class="subtitle">Spreadsheet Moment - WCAG 2.1 Level AA Compliance</p>
      <p class="subtitle">Generated: ${new Date(results.timestamp).toLocaleString()}</p>
    </div>
  </header>

  <div class="container">
    <div class="summary">
      <div class="summary-card violations">
        <h3>Violations</h3>
        <div class="value">${results.summary.violations}</div>
      </div>
      <div class="summary-card passes">
        <h3>Passes</h3>
        <div class="value">${results.summary.passes}</div>
      </div>
      <div class="summary-card">
        <h3>Incomplete</h3>
        <div class="value">${results.summary.incomplete}</div>
      </div>
      <div class="summary-card">
        <h3>Inapplicable</h3>
        <div class="value">${results.summary.inapplicable}</div>
      </div>
    </div>

    ${results.pages.map(page => `
      <div class="page-section">
        <h2>${page.name} (${page.path})</h2>
        ${page.viewports.map(viewport => `
          <div class="viewport-section">
            <h3>${viewport.viewport} (${viewport.width}x${viewport.height})</h3>
            ${viewport.violations.length > 0 ? `
              ${viewport.violations.map(violation => `
                <div class="violation">
                  <h4>${violation.id} - ${violation.impact || 'Unknown'} Impact</h4>
                  <p>${violation.description}</p>
                  <p><strong>Help:</strong> ${violation.help}</p>
                  <p><strong>Help URL:</strong> <a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a></p>
                  ${violation.nodes.length > 0 ? `
                    <p><strong>Affected elements:</strong></p>
                    <ul>
                      ${violation.nodes.slice(0, 5).map(node => `
                        <li><code>${node.html || node.target.join(', ')}</code></li>
                      `).join('')}
                      ${violation.nodes.length > 5 ? `<li>... and ${violation.nodes.length - 5} more</li>` : ''}
                    </ul>
                  ` : ''}
                </div>
              `).join('')}
            ` : '<p class="pass">No violations found!</p>'}
            <p class="incomplete">${viewport.incomplete.length} tests require manual review</p>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>

  <footer>
    <p>Generated by axe-core and Puppeteer | WCAG 2.1 Level AA Standard</p>
    <p>For questions, contact the accessibility team</p>
  </footer>
</body>
</html>
  `;

  const reportPath = path.join(RESULTS_DIR, 'report.html');
  fs.writeFileSync(reportPath, html);
}

/**
 * Run tests if executed directly
 */
if (require.main === module) {
  runAccessibilityTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAccessibilityTests, generateHTMLReport };
