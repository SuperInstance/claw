/**
 * Spreadsheet Moment - i18n Usage Examples
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { i18n, useI18n } from './InternationalizationManager';
import { CurrencyFormatter, DateFormatter, NumberFormatter, ListFormatter } from './formatters';
import { isRTL, getTextDirection, flipAlignment, flipSpacing } from './rtl';
import type { Locale } from './types';

// ==================== Basic Translation Examples ====================

/**
 * Example 1: Basic translation usage
 */
function basicTranslationExample() {
  // Using the singleton
  const welcome = i18n.t('common.welcome'); // "Welcome" (in English)
  const save = i18n.t('common.save'); // "Save"

  // Using React hook
  function MyComponent() {
    const { t, locale } = useI18n();
    return (
      <div>
        <h1>{t('common.appName')}</h1>
        <p>{t('common.welcome')}</p>
        <p>Current locale: {locale}</p>
      </div>
    );
  }
}

/**
 * Example 2: Translation with parameters
 */
function parameterizedTranslationExample() {
  // Pluralization
  const cellCount1 = i18n.t('spreadsheet.cell', { count: 1 }); // "1 cell"
  const cellCount5 = i18n.t('spreadsheet.cell', { count: 5 }); // "5 cells"

  // Custom parameters
  const minLength = i18n.t('errors.minLength', { min: 5 }); // "Minimum length is 5 characters"
  const maxValue = i18n.t('errors.maxValue', { max: 100 }); // "Maximum value is 100"

  // In React component
  function ValidationError({ error }: { error: { min?: number; max?: number } }) {
    const { t } = useI18n();
    return (
      <span className="error">
        {error.min && t('errors.minLength', { min: error.min })}
        {error.max && t('errors.maxValue', { max: error.max })}
      </span>
    );
  }
}

// ==================== Locale Switching Example ====================

/**
 * Example 3: Changing locale
 */
function localeSwitchingExample() {
  // Get current locale
  const currentLocale = i18n.getLocale(); // e.g., 'en'

  // Set new locale
  i18n.setLocale('de'); // Switch to German
  i18n.setLocale('ar'); // Switch to Arabic (RTL)

  // Detect browser locale
  const detectedLocale = i18n.detectLocale();
  i18n.setLocale(detectedLocale);

  // In React component
  function LanguageSelector() {
    const { locale, setLocale, getSupportedLocales } = useI18n();
    const locales = getSupportedLocales();

    return (
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        {Object.entries(locales).map(([code, config]) => (
          <option key={code} value={code}>
            {config.nativeName}
          </option>
        ))}
      </select>
    );
  }
}

// ==================== Number Formatting Examples ====================

/**
 * Example 4: Currency formatting
 */
function currencyFormattingExample() {
  // Basic currency formatting
  const priceUSD = CurrencyFormatter.format(99.99, 'USD', 'en'); // "$99.99"
  const priceEUR = CurrencyFormatter.format(99.99, 'EUR', 'de'); // "99,99 €"
  const priceJPY = CurrencyFormatter.format(1000, 'JPY', 'ja'); // "¥1,000"

  // Custom display options
  const priceCode = CurrencyFormatter.format(99.99, 'USD', 'en', {
    display: 'code', // "USD 99.99"
  });

  // Currency range
  const range = CurrencyFormatter.formatRange(10, 100, 'USD', 'en'); // "$10 - $100"

  // Get currency symbol
  const symbol = CurrencyFormatter.getSymbol('USD', 'en'); // "$"

  // Parse currency string
  const parsed = CurrencyFormatter.parse('$99.99', 'en'); // 99.99

  // In React component
  function PriceDisplay({ amount, currency }: { amount: number; currency: string }) {
    const { locale } = useI18n();
    return <span>{CurrencyFormatter.format(amount, currency as any, locale)}</span>;
  }
}

/**
 * Example 5: Number formatting
 */
function numberFormattingExample() {
  // Basic number formatting
  const number = NumberFormatter.format(1234567.89, 'en'); // "1,234,567.89"
  const german = NumberFormatter.format(1234567.89, 'de'); // "1.234.567,89"

  // Precision
  const precise = NumberFormatter.formatPrecision(3.14159, 'en', 2); // "3.14"

  // Percentage
  const percent = NumberFormatter.formatPercent(75.5, 'en', 1); // "75.5%"

  // Compact notation
  const compact = NumberFormatter.formatCompact(1500000, 'en'); // "1.5M"

  // Units
  const distance = NumberFormatter.formatUnit(100, 'kilometer', 'en'); // "100 km"
  const storage = NumberFormatter.formatUnit(50, 'gigabyte', 'en'); // "50 GB"

  // In React component
  function MetricDisplay({ value, unit }: { value: number; unit: string }) {
    const { locale } = useI18n();
    return <span>{NumberFormatter.formatUnit(value, unit, locale)}</span>;
  }
}

// ==================== Date/Time Formatting Examples ====================

/**
 * Example 6: Date formatting
 */
function dateFormattingExample() {
  const now = new Date();

  // Basic date formatting
  const usDate = DateFormatter.format(now, 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }); // "March 14, 2026"

  const germanDate = DateFormatter.format(now, 'de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }); // "14. März 2026"

  // Preset styles
  const full = DateFormatter.formatWithStyle(now, 'en', 'full'); // "Saturday, March 14, 2026"
  const long = DateFormatter.formatWithStyle(now, 'en', 'long'); // "March 14, 2026"
  const medium = DateFormatter.formatWithStyle(now, 'en', 'medium'); // "Mar 14, 2026"
  const short = DateFormatter.formatWithStyle(now, 'en', 'short'); // "3/14/26"

  // Time formatting
  const time = DateFormatter.formatTime(now, 'en', 'short'); // "9:41 PM"

  // Date and time
  const dateTime = DateFormatter.formatDateTime(now, 'en'); // "3/14/26, 9:41 PM"

  // Relative time
  const past = new Date(Date.now() - 3600000); // 1 hour ago
  const relative = DateFormatter.formatRelative(past, 'en'); // "1 hour ago"

  // Date range
  const start = new Date(2026, 2, 1);
  const end = new Date(2026, 2, 31);
  const range = DateFormatter.formatRange(start, end, 'en'); // "Mar 1 - 31, 2026"

  // Weekday and month names
  const weekday = DateFormatter.getWeekday(now, 'en'); // "Saturday"
  const month = DateFormatter.getMonth(now, 'en'); // "March"

  // In React component
  function DateDisplay({ date }: { date: Date }) {
    const { locale } = useI18n();
    return <time dateTime={date.toISOString()}>{DateFormatter.formatWithStyle(date, locale, 'long')}</time>;
  }
}

// ==================== List Formatting Examples ====================

/**
 * Example 7: List formatting
 */
function listFormattingExample() {
  const items = ['Apple', 'Banana', 'Cherry'];

  // Conjunction (and)
  const conjunction = ListFormatter.format(items, 'en', 'conjunction'); // "Apple, Banana, and Cherry"

  // Disjunction (or)
  const disjunction = ListFormatter.format(items, 'en', 'disjunction'); // "Apple, Banana, or Cherry"

  // Different styles
  const short = ListFormatter.format(items, 'en', 'conjunction', 'short'); // "Apple, Banana, & Cherry"
  const narrow = ListFormatter.format(items, 'en', 'conjunction', 'narrow'); // "Apple, Banana, Cherry"

  // With units
  const measurements = [
    { value: 5, unit: 'kilogram' },
    { value: 10, unit: 'kilogram' },
    { value: 15, unit: 'kilogram' },
  ];
  const withUnits = ListFormatter.formatWithUnits(measurements, 'en'); // "5 kilograms, 10 kilograms, and 15 kilograms"

  // In React component
  function TagList({ tags }: { tags: string[] }) {
    const { locale } = useI18n();
    return <span>{ListFormatter.format(tags, locale)}</span>;
  }
}

// ==================== RTL Support Examples ====================

/**
 * Example 8: RTL layout handling
 */
function rtlSupportExample() {
  // Check if locale is RTL
  const isArabicRTL = isRTL('ar'); // true
  const isEnglishLTR = isRTL('en'); // false

  // Get text direction
  const direction = getTextDirection('ar'); // "rtl"

  // Flip alignment for RTL
  const leftAlignInLTR = flipAlignment('left', 'en'); // "left"
  const leftAlignInRTL = flipAlignment('left', 'ar'); // "right"

  // Flip CSS spacing
  const spacingLTR = flipSpacing('margin-left: 10px;', 'en'); // "margin-left: 10px;"
  const spacingRTL = flipSpacing('margin-left: 10px;', 'ar'); // "margin-right: 10px;"

  // In React component
  function DirectionAwareComponent() {
    const { locale, isRTL } = useI18n();
    const direction = getTextDirection(locale);

    return (
      <div dir={direction}>
        <p style={{ textAlign: isRTL() ? 'right' : 'left' }}>
          Content automatically adapts to text direction
        </p>
      </div>
    );
  }
}

// ==================== Complete Component Example ====================

/**
 * Example 9: Complete i18n-enabled component
 */
function CompleteExample() {
  function ProductCard({
    product,
  }: {
    product: {
      name: string;
      description: string;
      price: number;
      currency: string;
      stock: number;
      lastUpdated: Date;
    };
  }) {
    const { t, locale, isRTL } = useI18n();

    return (
      <div dir={getTextDirection(locale)} className="product-card">
        <h2>{product.name}</h2>
        <p>{product.description}</p>

        <div className="price">
          {t('common.price')}: {CurrencyFormatter.format(product.price, product.currency as any, locale)}
        </div>

        <div className="stock">
          {t('common.quantity')}: {NumberFormatter.format(product.stock, locale)}
        </div>

        <div className="updated">
          {t('common.modified')}: {DateFormatter.formatRelative(product.lastUpdated, locale)}
        </div>

        <div className="actions">
          <button>{t('common.add')}</button>
          <button>{t('common.save')}</button>
        </div>

        {isRTL() && <div className="rtl-badge">RTL</div>}
      </div>
    );
  }
}

// ==================== Advanced Examples ====================

/**
 * Example 10: Advanced pluralization
 */
function advancedPluralizationExample() {
  const { t } = useI18n();

  // English (simple plural)
  const enItems = t('spreadsheet.cell', { count: 5 }); // "5 cells"

  // Arabic (6 plural forms)
  i18n.setLocale('ar');
  const arZero = t('spreadsheet.cell', { count: 0 }); // "٠ خلية" (zero)
  const arOne = t('spreadsheet.cell', { count: 1 }); // "خلية واحدة" (one)
  const arTwo = t('spreadsheet.cell', { count: 2 }); // "خليتان" (two)
  const arFew = t('spreadsheet.cell', { count: 5 }); // "{{count}} خلايا" (few)
  const arMany = t('spreadsheet.cell', { count: 15 }); // "{{count}} خلية" (many)
  const arOther = t('spreadsheet.cell', { count: 100 }); // "{{count}} خلية" (other)

  // Russian (complex plural)
  i18n.setLocale('ru');
  const ruOne = t('spreadsheet.cell', { count: 1 }); // "1 ячейка"
  const ruFew = t('spreadsheet.cell', { count: 2 }); // "2 ячейки"
  const ruMany = t('spreadsheet.cell', { count: 5 }); // "5 ячеек"

  // Chinese (no plural)
  i18n.setLocale('zh');
  const zhItems = t('spreadsheet.cell', { count: 5 }); // "5 个单元格"
}

/**
 * Example 11: Calendar systems
 */
function calendarSystemsExample() {
  const now = new Date();

  // Gregorian calendar (most locales)
  const gregorian = DateFormatter.formatCalendar(now, 'en', 'gregory');

  // Buddhist calendar (Thai)
  const buddhist = DateFormatter.formatCalendar(now, 'th', 'buddhist');

  // Persian calendar (Farsi)
  const persian = DateFormatter.formatCalendar(now, 'fa', 'persian');

  // Get date parts for different calendars
  const persianDateParts = DateFormatter.getDateParts(now, 'fa', 'persian');
}

/**
 * Example 12: Error messages with context
 */
function errorMessagesExample() {
  function FormErrors({ errors }: { errors: Record<string, any> }) {
    const { t } = useI18n();

    return (
      <div className="errors">
        {errors.required && <p className="error">{t('errors.required')}</p>}
        {errors.email && <p className="error">{t('errors.invalidEmail')}</p>}
        {errors.minLength && (
          <p className="error">{t('errors.minLength', { min: errors.minLength })}</p>
        )}
        {errors.maxLength && (
          <p className="error">{t('errors.maxLength', { max: errors.maxLength })}</p>
        )}
        {errors.minValue && (
          <p className="error">{t('errors.minValue', { min: errors.minValue })}</p>
        )}
        {errors.maxValue && (
          <p className="error">{t('errors.maxValue', { max: errors.maxValue })}</p>
        )}
      </div>
    );
  }
}

// Export examples
export {
  basicTranslationExample,
  parameterizedTranslationExample,
  localeSwitchingExample,
  currencyFormattingExample,
  numberFormattingExample,
  dateFormattingExample,
  listFormattingExample,
  rtlSupportExample,
  CompleteExample,
  advancedPluralizationExample,
  calendarSystemsExample,
  errorMessagesExample,
};
