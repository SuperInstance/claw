# Spreadsheet Moment - Internationalization (i18n) System

Comprehensive internationalization support for 40 languages with RTL layout, currency formatting, date/time localization, and pluralization.

## Features

- **40 Languages Supported**: English, German, French, Spanish, Italian, Portuguese, Dutch, Polish, Russian, Ukrainian, Czech, Greek, Swedish, Norwegian, Finnish, Danish, Romanian, Hungarian, Chinese (Simplified & Traditional), Japanese, Korean, Thai, Vietnamese, Indonesian, Malay, Hindi, Bengali, Tamil, Telugu, Marathi, Arabic, Hebrew, Farsi, Urdu, Turkish, Swahili

- **RTL Layout Support**: Full right-to-left layout support for Arabic, Hebrew, Farsi, and Urdu

- **150+ Currencies**: Comprehensive currency formatting for global markets

- **Multiple Calendar Systems**: Gregorian, Buddhist, Persian, and Islamic calendars

- **Advanced Pluralization**: Language-specific plural forms (6 forms for Arabic, 3 for Slavic languages, etc.)

- **Locale-Aware Formatting**: Numbers, dates, times, percentages, and lists formatted according to locale conventions

## Installation

The i18n system is included in the Spreadsheet Moment package. No additional installation required.

## Quick Start

### Basic Usage

```typescript
import { i18n } from './i18n/InternationalizationManager';

// Simple translation
const welcome = i18n.t('common.welcome'); // "Welcome"

// With parameters
const cellCount = i18n.t('spreadsheet.cell', { count: 5 }); // "5 cells"

// Change locale
i18n.setLocale('de'); // Switch to German
```

### React Hook

```typescript
import { useI18n } from './i18n/InternationalizationManager';

function MyComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('common.welcome')}</p>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}
```

## Core Components

### 1. InternationalizationManager

Main i18n manager providing translation and locale management.

```typescript
import { i18n } from './i18n/InternationalizationManager';

// Locale management
i18n.getLocale(); // Get current locale
i18n.setLocale('fr'); // Set locale
i18n.detectLocale(); // Detect from browser
i18n.isRTL(); // Check if RTL

// Translations
i18n.t('common.save'); // Simple translation
i18n.t('errors.minLength', { min: 5 }); // With parameters

// Locale info
i18n.getLocaleConfig('ar'); // Get locale configuration
i18n.getSupportedLocales(); // All supported locales
i18n.getAvailableLocales(); // Available locale codes
```

### 2. Formatters

Locale-aware formatters for currencies, dates, numbers, and lists.

#### CurrencyFormatter

```typescript
import { CurrencyFormatter } from './i18n/formatters';

// Basic formatting
CurrencyFormatter.format(99.99, 'USD', 'en'); // "$99.99"
CurrencyFormatter.format(99.99, 'EUR', 'de'); // "99,99 €"

// Custom options
CurrencyFormatter.format(99.99, 'USD', 'en', {
  display: 'code', // "USD 99.99"
});

// Range
CurrencyFormatter.formatRange(10, 100, 'USD', 'en'); // "$10 - $100"

// Parse
CurrencyFormatter.parse('$99.99', 'en'); // 99.99
```

#### DateFormatter

```typescript
import { DateFormatter } from './i18n/formatters';

// Basic formatting
DateFormatter.format(new Date(), 'en', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}); // "March 14, 2026"

// Preset styles
DateFormatter.formatWithStyle(new Date(), 'en', 'full'); // "Saturday, March 14, 2026"
DateFormatter.formatWithStyle(new Date(), 'en', 'short'); // "3/14/26"

// Time
DateFormatter.formatTime(new Date(), 'en', 'short'); // "9:41 PM"

// Relative time
DateFormatter.formatRelative(new Date(Date.now() - 3600000), 'en'); // "1 hour ago"

// Calendar systems
DateFormatter.formatCalendar(new Date(), 'fa', 'persian'); // Persian calendar
```

#### NumberFormatter

```typescript
import { NumberFormatter } from './i18n/formatters';

// Basic formatting
NumberFormatter.format(1234567.89, 'en'); // "1,234,567.89"
NumberFormatter.format(1234567.89, 'de'); // "1.234.567,89"

// Precision
NumberFormatter.formatPrecision(3.14159, 'en', 2); // "3.14"

// Percentage
NumberFormatter.formatPercent(75.5, 'en', 1); // "75.5%"

// Compact notation
NumberFormatter.formatCompact(1500000, 'en'); // "1.5M"

// Units
NumberFormatter.formatUnit(100, 'kilometer', 'en'); // "100 km"
```

#### ListFormatter

```typescript
import { ListFormatter } from './i18n/formatters';

// Conjunction (and)
ListFormatter.format(['A', 'B', 'C'], 'en', 'conjunction'); // "A, B, and C"

// Disjunction (or)
ListFormatter.format(['A', 'B', 'C'], 'en', 'disjunction'); // "A, B, or C"

// Different styles
ListFormatter.format(['A', 'B', 'C'], 'en', 'conjunction', 'short'); // "A, B, & C"
```

### 3. RTL Utilities

Right-to-left layout support utilities.

```typescript
import { isRTL, getTextDirection, flipAlignment, flipSpacing } from './i18n/rtl';

// Check RTL
isRTL('ar'); // true
isRTL('en'); // false

// Get direction
getTextDirection('he'); // "rtl"

// Flip alignment
flipAlignment('left', 'ar'); // "right"
flipAlignment('left', 'en'); // "left"

// Flip CSS spacing
flipSpacing('margin-left: 10px;', 'ar'); // "margin-right: 10px;"
```

### 4. Locale-Aware Components

React components that automatically adapt to RTL layouts.

```typescript
import { RTLProvider, useRTL, LanguageSelector } from './i18n/LocaleAwareComponents';

// Wrap app with RTL provider
function App() {
  return (
    <RTLProvider locale="ar">
      <MyComponent />
    </RTLProvider>
  );
}

// Use RTL context
function MyComponent() {
  const { isRTL, direction } = useRTL();
  return <div dir={direction}>Content</div>;
}

// Language selector
<LanguageSelector />
```

## Translation Files

Translation files are located in `i18n/locales/` as JSON files:

```
i18n/locales/
├── en.json           # English (complete)
├── de.json           # German (complete)
├── ar.json           # Arabic (stub)
├── zh.json           # Chinese (stub)
└── ...
```

### Translation Structure

```json
{
  "common": {
    "appName": "Spreadsheet Moment",
    "welcome": "Welcome",
    "save": "Save"
  },
  "spreadsheet": {
    "cell": {
      "one": "1 cell",
      "other": "{{count}} cells"
    },
    "formula": "Formula"
  },
  "errors": {
    "minLength": "Minimum length is {{min}} characters"
  }
}
```

### Contributing Translations

Most translation files are stubs marked with `_status: "stub"`. To contribute:

1. Fork the repository
2. Update the translation file for your language
3. Remove the `_status` field when complete
4. Submit a pull request

```bash
# Example: Update French translations
cd i18n/locales
# Edit fr.json
git add fr.json
git commit -m "docs: Complete French translations"
git push
```

## Supported Languages

| Code | Language | Native Name | Direction |
|------|----------|-------------|-----------|
| `en` | English | English | LTR |
| `en-GB` | English (UK) | English (UK) | LTR |
| `en-AU` | English (Australia) | English (Australia) | LTR |
| `de` | German | Deutsch | LTR |
| `fr` | French | Français | LTR |
| `es` | Spanish | Español | LTR |
| `it` | Italian | Italiano | LTR |
| `pt` | Portuguese | Português | LTR |
| `pt-BR` | Portuguese (Brazil) | Português (Brasil) | LTR |
| `nl` | Dutch | Nederlands | LTR |
| `pl` | Polish | Polski | LTR |
| `ru` | Russian | Русский | LTR |
| `uk` | Ukrainian | Українська | LTR |
| `cs` | Czech | Čeština | LTR |
| `el` | Greek | Ελληνικά | LTR |
| `sv` | Swedish | Svenska | LTR |
| `no` | Norwegian | Norsk | LTR |
| `fi` | Finnish | Suomi | LTR |
| `da` | Danish | Dansk | LTR |
| `ro` | Romanian | Română | LTR |
| `hu` | Hungarian | Magyar | LTR |
| `zh` | Chinese (Simplified) | 简体中文 | LTR |
| `zh-TW` | Chinese (Traditional) | 繁體中文 | LTR |
| `ja` | Japanese | 日本語 | LTR |
| `ko` | Korean | 한국어 | LTR |
| `th` | Thai | ไทย | LTR |
| `vi` | Vietnamese | Tiếng Việt | LTR |
| `id` | Indonesian | Bahasa Indonesia | LTR |
| `ms` | Malay | Bahasa Melayu | LTR |
| `hi` | Hindi | हिन्दी | LTR |
| `bn` | Bengali | বাংলা | LTR |
| `ta` | Tamil | தமிழ் | LTR |
| `te` | Telugu | తెలుగు | LTR |
| `mr` | Marathi | मराठी | LTR |
| `ar` | Arabic | العربية | RTL |
| `he` | Hebrew | עברית | RTL |
| `fa` | Farsi (Persian) | فارسی | RTL |
| `ur` | Urdu | اردو | RTL |
| `tr` | Turkish | Türkçe | LTR |
| `sw` | Swahili | Kiswahili | LTR |

## Pluralization Rules

Different languages have different pluralization rules:

### English (2 forms)
- `one`: 1
- `other`: everything else

### French (2 forms)
- `one`: 0, 1
- `other`: everything else

### Russian (3 forms)
- `one`: 1, 21, 31, ...
- `few`: 2-4, 22-24, 32-34, ...
- `many`: 5-20, 25-30, 35-40, ...

### Arabic (6 forms)
- `zero`: 0
- `one`: 1
- `two`: 2
- `few`: 3-10
- `many`: 11-99
- `other`: 100+

### Chinese/Japanese/Korean (1 form)
- `other`: everything else (no plural distinction)

## Calendar Systems

Supported calendar systems:

- **Gregorian**: Most Western countries (default)
- **Buddhist**: Thailand
- **Persian**: Iran/Afghanistan
- **Islamic**: Muslim countries

## Currency Support

150+ currencies supported including:

- Major: USD, EUR, GBP, JPY, CNY
- Americas: CAD, AUD, BRL, MXN, ARS
- Europe: CHF, SEK, NOK, DKK, PLN, RUB
- Asia: KRW, TWD, HKD, SGD, INR, THB, VND
- Middle East: ILS, SAR, AED, QAR, KWD
- Africa: ZAR, NGN, EGP, KES

## Best Practices

### 1. Always use translation keys

```typescript
// ❌ Bad
<h1>Welcome</h1>

// ✅ Good
<h1>{t('common.welcome')}</h1>
```

### 2. Use parameters for dynamic content

```typescript
// ❌ Bad
const message = `Minimum length is ${min} characters`;

// ✅ Good
const message = t('errors.minLength', { min });
```

### 3. Handle RTL layouts

```typescript
// ✅ Good
const { isRTL } = useI18n();
<div dir={isRTL() ? 'rtl' : 'ltr'}>Content</div>
```

### 4. Use locale-aware formatters

```typescript
// ❌ Bad
const price = `$${amount.toFixed(2)}`;

// ✅ Good
const price = formatCurrency(amount, 'USD', locale);
```

### 5. Test with different locales

```typescript
// Test RTL layouts
i18n.setLocale('ar');
// Test pluralization
i18n.t('spreadsheet.cell', { count: 1 });
i18n.t('spreadsheet.cell', { count: 5 });
```

## API Reference

### InternationalizationManager

| Method | Description |
|--------|-------------|
| `t(key, params?)` | Get translation |
| `getLocale()` | Get current locale |
| `setLocale(locale)` | Set locale |
| `detectLocale()` | Detect browser locale |
| `isRTL(locale?)` | Check if RTL |
| `formatCurrency(amount, currency?)` | Format currency |
| `formatNumber(num, options?)` | Format number |
| `formatPercent(value, decimals?)` | Format percentage |
| `formatDate(date, options?)` | Format date |
| `formatTime(date, options?)` | Format time |
| `formatDateTime(date, options?)` | Format date/time |
| `formatRelativeTime(date)` | Format relative time |
| `formatList(items)` | Format list |
| `getLocaleConfig(locale?)` | Get locale config |
| `getSupportedLocales()` | Get all locales |
| `getAvailableLocales()` | Get locale codes |

### useI18n Hook

```typescript
const {
  t,              // Translation function
  locale,         // Current locale
  setLocale,      // Set locale
  formatCurrency, // Format currency
  formatNumber,   // Format number
  formatPercent,  // Format percentage
  formatDate,     // Format date
  formatTime,     // Format time
  formatDateTime, // Format date/time
  formatRelativeTime, // Format relative time
  formatList,     // Format list
  isRTL,          // Check RTL
  getLocaleConfig, // Get locale config
  getSupportedLocales, // Get all locales
  getAvailableLocales, // Get locale codes
} = useI18n();
```

## Examples

See `i18n/examples.ts` for comprehensive usage examples including:

- Basic translations
- Parameterized translations
- Locale switching
- Currency/number/date formatting
- List formatting
- RTL support
- Complete components
- Advanced pluralization
- Calendar systems
- Error messages

## License

MIT License - Copyright (c) 2026 SuperInstance Research Team

## Contributing

Contributions welcome! Please see the translation files in `i18n/locales/` for languages that need translation.

## Support

For issues or questions, please open an issue on GitHub.
