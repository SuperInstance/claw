/**
 * i18n System Validation Script
 *
 * Validates the internationalization implementation
 */

import { i18n } from './InternationalizationManager';
import { SUPPORTED_LOCALES } from './InternationalizationManager';
import { isRTL, getTextDirection } from './rtl';
import { CurrencyFormatter, DateFormatter, NumberFormatter } from './formatters';

interface ValidationResult {
  success: boolean;
  tests: {
    name: string;
    passed: boolean;
    message: string;
  }[];
}

export function validateI18n(): ValidationResult {
  const results: ValidationResult = {
    success: true,
    tests: [],
  };

  function test(name: string, passed: boolean, message: string) {
    results.tests.push({ name, passed, message });
    if (!passed) results.success = false;
    console.log(`${passed ? '✓' : '✗'} ${name}: ${message}`);
  }

  console.log('\n=== i18n System Validation ===\n');

  // Test 1: Locale availability
  test(
    'Locale Availability',
    Object.keys(SUPPORTED_LOCALES).length === 40,
    `Found ${Object.keys(SUPPORTED_LOCALES).length} locales (expected 40)`
  );

  // Test 2: RTL locales
  const rtlLocales = Object.entries(SUPPORTED_LOCALES)
    .filter(([_, config]) => config.direction === 'rtl')
    .map(([code]) => code);

  test(
    'RTL Locales',
    rtlLocales.length === 4 && JSON.stringify(rtlLocales.sort()) === JSON.stringify(['ar', 'fa', 'he', 'ur']),
    `RTL locales: ${rtlLocales.join(', ')}`
  );

  // Test 3: Translation function
  const enTranslation = i18n.t('common.welcome');
  test(
    'English Translation',
    enTranslation === 'Welcome',
    `"common.welcome" in English: "${enTranslation}"`
  );

  // Test 4: Pluralization (English)
  const cellOne = i18n.t('spreadsheet.cell', { count: 1 });
  const cellFive = i18n.t('spreadsheet.cell', { count: 5 });
  test(
    'English Pluralization',
    cellOne === '1 cell' && cellFive === '5 cells',
    `One: "${cellOne}", Five: "${cellFive}"`
  );

  // Test 5: Currency formatting
  const usdPrice = CurrencyFormatter.format(99.99, 'USD', 'en');
  const eurPrice = CurrencyFormatter.format(99.99, 'EUR', 'de');
  test(
    'Currency Formatting',
    usdPrice.includes('$') && eurPrice.includes('€'),
    `USD: "${usdPrice}", EUR: "${eurPrice}"`
  );

  // Test 6: Number formatting
  const usNumber = NumberFormatter.format(1234567.89, 'en');
  const deNumber = NumberFormatter.format(1234567.89, 'de');
  test(
    'Number Formatting',
    usNumber.includes(',') && deNumber.includes('.'),
    `US: "${usNumber}", DE: "${deNumber}"`
  );

  // Test 7: Date formatting
  const date = new Date();
  const usDate = DateFormatter.formatWithStyle(date, 'en', 'long');
  test(
    'Date Formatting',
    usDate.length > 0,
    `US date: "${usDate}"`
  );

  // Test 8: RTL detection
  const isArabicRTL = isRTL('ar');
  const isEnglishRTL = isRTL('en');
  test(
    'RTL Detection',
    isArabicRTL && !isEnglishRTL,
    `Arabic RTL: ${isArabicRTL}, English RTL: ${isEnglishRTL}`
  );

  // Test 9: Text direction
  const arabicDirection = getTextDirection('ar');
  const englishDirection = getTextDirection('en');
  test(
    'Text Direction',
    arabicDirection === 'rtl' && englishDirection === 'ltr',
    `Arabic: "${arabicDirection}", English: "${englishDirection}"`
  );

  // Test 10: Locale switching
  i18n.setLocale('de');
  const germanWelcome = i18n.t('common.welcome');
  i18n.setLocale('en'); // Reset to English
  test(
    'Locale Switching',
    germanWelcome === 'Willkommen',
    `German welcome: "${germanWelcome}"`
  );

  // Test 11: Parameter interpolation
  const minLengthError = i18n.t('errors.minLength', { min: 5 });
  test(
    'Parameter Interpolation',
    minLengthError.includes('5'),
    `Result: "${minLengthError}"`
  );

  // Test 12: List formatting
  const list = i18n.formatList(['Apple', 'Banana', 'Cherry']);
  test(
    'List Formatting',
    list.includes('Apple') && list.includes('Banana') && list.includes('Cherry'),
    `Result: "${list}"`
  );

  // Test 13: Relative time
  const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
  const relativeTime = i18n.formatRelativeTime(pastDate);
  test(
    'Relative Time',
    relativeTime.includes('hour') || relativeTime.includes('1'),
    `Result: "${relativeTime}"`
  );

  // Test 14: All locales have configs
  const allLocalesHaveConfig = Object.entries(SUPPORTED_LOCALES).every(
    ([_, config]) =>
      config.name &&
      config.nativeName &&
      config.direction &&
      config.calendar &&
      config.currency
  );
  test(
    'Locale Configurations',
    allLocalesHaveConfig,
    'All locales have complete configurations'
  );

  // Test 15: Currency codes are valid
  const validCurrencies = Object.values(SUPPORTED_LOCALES).every(config =>
    /^[A-Z]{3}$/.test(config.currency)
  );
  test(
    'Currency Codes',
    validCurrencies,
    'All currency codes are valid ISO 4217 codes'
  );

  console.log('\n=== Validation Complete ===\n');
  console.log(`Passed: ${results.tests.filter(t => t.passed).length}/${results.tests.length}`);
  console.log(`Failed: ${results.tests.filter(t => !t.passed).length}/${results.tests.length}`);

  return results;
}

// Run validation if executed directly
if (require.main === module) {
  const result = validateI18n();
  process.exit(result.success ? 0 : 1);
}

export default validateI18n;
