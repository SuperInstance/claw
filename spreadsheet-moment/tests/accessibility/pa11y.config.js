/**
 * Pa11y Configuration for WCAG 2.1 Level AA Compliance
 * Spreadsheet Moment Platform
 *
 * Pa11y is a automated accessibility testing tool that runs
 * in Headless Chrome and provides detailed reports.
 *
 * Usage: pa11y --config pa11y.config.js http://localhost:3000
 */

module.exports = {
  /**
   * Number of milliseconds to wait before running tests
   * Useful for SPAs that need time to render
   */
  wait: 1000,

  /**
   * Number of milliseconds before timing out
   */
  timeout: 60000,

  /**
   * Viewport width and height in pixels
   * Test multiple viewport sizes for responsive testing
   */
  viewport: {
    width: 1280,
    height: 720
  },

  /**
   * User agent string to use
   */
  userAgent: null,

  /**
   * Basic authentication credentials
   */
  credentials: null,

  /**
   * HTTP headers to send with requests
   */
  headers: {
    'Accept-Language': 'en-US,en;q=0.9'
  },

  /**
   * Actions to perform before running tests
   * Useful for navigating through the application
   */
  actions: [
    // Click elements, wait for navigation, etc.
    // 'click element #selector',
    // 'set field #selector to value',
    // 'check field #selector',
    // 'uncheck field #selector',
    // 'navigate to http://example.com'
  ],

  /**
   * Cookies to set before running tests
   */
  cookies: [],

  /**
   * Screen capture settings
   */
  screenCapture: null,

  /**
   * HTML Code Sniffer (HTMLCS) standard to use
   * Options: Section508, WCAG2A, WCAG2AA, WCAG2AAA
   */
  standard: 'WCAG2AA',

  /**
   * Ignore specific rules
   * Use sparingly - only for false positives
   */
  ignore: [
    // 'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Abs', // Color contrast (handled by axe)
    // 'WCAG2AA.Principle2.Guideline2_4.2_4_1.H64.1', // Frame title
  ],

  /**
   * Pa11y rules configuration
   * https://github.com/pa11y/pa11y#rule-configuration
   */
  rules: [
    'Principle1.Guideline1_1.1_1_1.H30',
    'Principle1.Guideline1_1.1_1_1.H37',
    'Principle1.Guideline1_1.1_1_1.H46',
    'Principle1.Guideline1_1.1_1_1.H67',
    'Principle1.Guideline1_3.1_3_1.H57',
    'Principle1.Guideline1_3.1_3_1.H71',
    'Principle1.Guideline1_3.1_3_2.H44',
    'Principle1.Guideline1_3.1_3_2.H45',
    'Principle1.Guideline1_3.1_3_2.H63',
    'Principle1.Guideline1_3.1_3_2.H64',
    'Principle1.Guideline1_3.1_3_2.H65',
    'Principle1.Guideline1_3.1_3_2.H69',
    'Principle1.Guideline1_3.1_3_2.H73',
    'Principle1.Guideline1_3.1_3_2.H74',
    'Principle1.Guideline1_3.1_3_2.H93',
    'Principle1.Guideline1_3.1_3_2.H94',
    'Principle1.Guideline1_4.1_4_1.G18',
    'Principle1.Guideline1_4.1_4_2.G18',
    'Principle1.Guideline1_4.1_4_3.G145.Abs',
    'Principle1.Guideline1_4.1_4_3_G18.Abs',
    'Principle1.Guideline1_4.1_4_3_G18.BgImage',
    'Principle1.Guideline2.Guideline2_1.2_1_1.G90',
    'Principle2.Guideline2_1.2_1_1.G91',
    'Principle2.Guideline2_1.2_1_1.Obscured',
    'Principle2.Guideline2_1.2_1_1.H91',
    'Principle2.Guideline2_1.2_1_4.H91',
    'Principle2.Guideline2_2.2_2_1.G90',
    'Principle2.Guideline2_2.2_2_1.G187',
    'Principle2.Guideline2_2.2_2_1.G188',
    'Principle2.Guideline2_2.2_2_1.G189',
    'Principle2.Guideline2_2.2_2_1.H28',
    'Principle2.Guideline2_2.2_2_2.H24',
    'Principle2.Guideline2_2.2_2_2.H32',
    'Principle2.Guideline2_3.2_3_1.G19',
    'Principle2.Guideline2_3.2_3_1.G20',
    'Principle2.Guideline2_3.2_3_1.G21',
    'Principle2.Guideline2_3.2_3_1.G22',
    'Principle2.Guideline2_3.2_3_1.H35',
    'Principle2.Guideline2_4.2_4_1.G1',
    'Principle2.Guideline2_4.2_4_1.G123',
    'Principle2.Guideline2_4.2_4_1.G124',
    'Principle2.Guideline2_4.2_4_1.H64',
    'Principle2.Guideline2_4.2_4_2.H25',
    'Principle2.Guideline2_4.2_4_2.H77',
    'Principle2.Guideline2_4.2_4_2.H78',
    'Principle2.Guideline2_4.2_4_2.H80',
    'Principle2.Guideline2_4.2_4_2.H81',
    'Principle2.Guideline2_4.2_4_4.H77',
    'Principle2.Guideline2_4.2_4_4.H78',
    'Principle2.Guideline2_4.2_4_4.H80',
    'Principle2.Guideline2_4.2_4_4.H81',
    'Principle2.Guideline2_4.2_4_5.G97',
    'Principle2.Guideline2_4.2_4_5.G96',
    'Principle2.Guideline2_4.2_4_5.H30',
    'Principle2.Guideline2_4.2_4_6.G91',
    'Principle2.Guideline2_4.2_4_7.H42',
    'Principle2.Guideline2_4.2_4_7.H49',
    'Principle2.Guideline2_4.2_4_8.H59',
    'Principle2.Guideline2_4.2_4_9.H70',
    'Principle2.Guideline2_4.2_4_9.H73',
    'Principle2.Guideline2_4.2_4_9.H84',
    'Principle2.Guideline2_4.2_4_9.H85',
    'Principle2.Guideline3.Guideline3_1.3_1_1.H57',
    'Principle3.Guideline3_1.3_1_2.H58',
    'Principle3.Guideline3_2.3_2_1.G131',
    'Principle3.Guideline3_2.3_2_2.G132',
    'Principle3.Guideline3_2.3_2_3.G135',
    'Principle3.Guideline3_2.3_2_3.G136',
    'Principle3.Guideline3_2.3_2_3.G138',
    'Principle3.Guideline3_2.3_2_3.G139',
    'Principle3.Guideline3_2.3_2_4.G83',
    'Principle3.Guideline3_2.3_2_3.G143',
    'Principle3.Guideline3_2.3_2_3.G144',
    'Principle3.Guideline3_2.3_2_3.G168',
    'Principle3.Guideline3_3.3_3_1.G83',
    'Principle3.Guideline3_3.3_3_1.G85',
    'Principle3.Guideline3_3.3_3_1.G84',
    'Principle3.Guideline3_3.3_3_2.G89',
    'Principle3.Guideline3_3.3_3_2.G192',
    'Principle3.Guideline3_3.3_3_3.G194',
    'Principle3.Guideline3_3.3_3_4.G196',
    'Principle4.Guideline4_1.4_1_1.F77',
    'Principle4.Guideline4_1.4_1_1.F78',
    'Principle4.Guideline4_1.4_1_1.F79',
    'Principle4.Guideline4_1.4_1_1.F80',
    'Principle4.Guideline4_1.4_1_1.F81',
    'Principle4.Guideline4_1.4_1_1.F82',
    'Principle4.Guideline4_1.4_1_1.F83',
    'Principle4.Guideline4_1.4_1_1.F84',
    'Principle4.Guideline4_1.4_1_1.F85',
    'Principle4.Guideline4_1.4_1_1.F86',
    'Principle4.Guideline4_1.4_1_1.F87',
    'Principle4.Guideline4_1.4_1_1.F88',
    'Principle4.Guideline4_1.4_1_1.F89',
    'Principle4.Guideline4_1.4_1_2.F90',
    'Principle4.Guideline4_1.4_1_2.F91',
    'Principle4.Guideline4_1.4_1_2.F92'
  ],

  /**
   * Output format
   * Options: cli, csv, json, html, tsv
   */
  format: 'json',

  /**
   * Output file path
   * If null, outputs to stdout
   */
  output: './tests/accessibility/results/pa11y-report.json',

  /**
   * Reporter to use
   * Options: cli, csv, json, html, tsv, markdown
   */
  reporters: [
    'cli',
    {
      path: './tests/accessibility/results/pa11y-report.json',
      type: 'json'
    },
    {
      path: './tests/accessibility/results/pa11y-report.html',
      type: 'html'
    }
  ],

  /**
   * Chrome configuration
   */
  chromeLaunchConfig: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  },

  /**
   * Custom test runners
   * Can extend Pa11y with custom tests
   */
  runners: [],

  /**
   * Post-processing scripts
   * Run after tests complete
   */
  post: [
    // {
    //   script: 'node ./scripts/process-results.js',
    //   arguments: ['--report', 'pa11y-report.json']
    // }
  ]
};

/**
 * Pa11y configuration for different viewports
 * Run multiple tests with different viewport sizes
 */
module.exports.viewports = {
  desktop: {
    width: 1280,
    height: 720
  },
  laptop: {
    width: 1024,
    height: 768
  },
  tablet: {
    width: 768,
    height: 1024
  },
  mobile: {
    width: 375,
    height: 667
  }
};

/**
 * Pa11y configuration for different pages
 * Test each route in the application
 */
module.exports.pages = {
  home: 'http://localhost:3000',
  features: 'http://localhost:3000/features',
  documentation: 'http://localhost:3000/docs',
  examples: 'http://localhost:3000/examples',
  download: 'http://localhost:3000/download'
};
