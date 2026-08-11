/**
 * Spreadsheet Moment - i18n Type Definitions
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

/**
 * All supported locale codes
 */
export type Locale =
  // English
  | 'en' | 'en-GB' | 'en-AU'
  // European
  | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'pt-BR' | 'nl' | 'pl' | 'ru' | 'uk'
  | 'cs' | 'el' | 'sv' | 'no' | 'fi' | 'da' | 'ro' | 'hu'
  // Asian
  | 'zh' | 'zh-TW' | 'ja' | 'ko' | 'th' | 'vi' | 'id' | 'ms'
  | 'hi' | 'bn' | 'ta' | 'te' | 'mr'
  // Middle Eastern (RTL)
  | 'ar' | 'he' | 'fa' | 'ur'
  // Others
  | 'tr' | 'sw';

/**
 * ISO 4217 currency codes
 */
export type CurrencyCode =
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'INR' | 'AUD' | 'CAD' | 'CHF'
  | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'RUB' | 'UAH' | 'CZK' | 'RON' | 'HUF'
  | 'BRL' | 'MXN' | 'ARS' | 'CLP' | 'COP' | 'PEN' | 'UYU' | 'VES'
  | 'KRW' | 'TWD' | 'HKD' | 'SGD' | 'MYR' | 'THB' | 'VND' | 'IDR' | 'PHP'
  | 'ILS' | 'SAR' | 'AED' | 'QAR' | 'KWD' | 'BHD' | 'OMR' | 'JOD'
  | 'TRY' | 'ZAR' | 'NGN' | 'EGP' | 'KES' | 'GHS' | 'MAD' | 'TND'
  | 'PKR' | 'BDT' | 'LKR' | 'NPR' | 'AFN' | 'IQD' | 'IRR' | 'LYD' | 'DZD';

/**
 * Calendar types
 */
export type CalendarType = 'gregory' | 'buddhist' | 'persian' | 'islamic' | 'japanese' | 'chinese' | 'indian';

/**
 * Plural forms for different languages
 */
export type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * Translation key paths
 */
export type TranslationKey =
  // Common UI
  | 'common.appName'
  | 'common.welcome'
  | 'common.loading'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.create'
  | 'common.update'
  | 'common.search'
  | 'common.filter'
  | 'common.sort'
  | 'common.export'
  | 'common.import'
  | 'common.share'
  | 'common.settings'
  | 'common.help'
  | 'common.about'
  // Spreadsheet
  | 'spreadsheet.cell'
  | 'spreadsheet.row'
  | 'spreadsheet.column'
  | 'spreadsheet.formula'
  | 'spreadsheet.value'
  | 'spreadsheet.format'
  | 'spreadsheet.insertRow'
  | 'spreadsheet.insertColumn'
  | 'spreadsheet.deleteRow'
  | 'spreadsheet.deleteColumn'
  | 'spreadsheet.mergeCells'
  | 'spreadsheet.unmergeCells'
  // UI
  | 'ui.dashboard'
  | 'ui.analytics'
  | 'ui.reports'
  | 'ui.collaborators'
  | 'ui.notifications'
  | 'ui.profile'
  | 'ui.logout'
  // Errors
  | 'errors.generic'
  | 'errors.network'
  | 'errors.unauthorized'
  | 'errors.forbidden'
  | 'errors.notFound'
  | 'errors.serverError'
  // Messages
  | 'messages.saved'
  | 'messages.deleted'
  | 'messages.shared'
  | 'messages.copied';

/**
 * Locale configuration
 */
export interface LocaleConfig {
  /** English name of the locale */
  name: string;
  /** Native name of the locale */
  nativeName: string;
  /** Text direction */
  direction: 'ltr' | 'rtl';
  /** Calendar system */
  calendar: CalendarType;
  /** Default currency */
  currency: CurrencyCode;
  /** Date format */
  dateFormat?: string;
  /** Time format */
  timeFormat?: '12h' | '24h';
  /** Number formatting options */
  numberFormat?: {
    decimalSeparator: '.' | ',';
    thousandsSeparator: ',' | '.' | ' ' | '';
  };
}

/**
 * Translation entry
 */
export interface TranslationEntry {
  /** Translation key path */
  key: string;
  /** Translated text or plural forms */
  value: string | Record<PluralForm, string>;
  /** Context for translators */
  context?: string;
  /** Whether translation is missing */
  missing?: boolean;
}

/**
 * Translation namespace
 */
export interface TranslationNamespace {
  /** Namespace name */
  name: string;
  /** Translation entries */
  translations: TranslationEntry[];
  /** Last updated timestamp */
  lastUpdated?: Date;
  /** Contributors */
  contributors?: TranslatorInfo[];
}

/**
 * Translator information
 */
export interface TranslatorInfo {
  /** Translator name */
  name: string;
  /** Translator email */
  email?: string;
  /** Translation percentage */
  contribution: number;
}

/**
 * i18n configuration
 */
export interface I18nConfig {
  /** Default locale */
  defaultLocale: Locale;
  /** Fallback locale */
  fallbackLocale: Locale;
  /** Available locales */
  availableLocales: Locale[];
  /** Whether to detect locale from browser */
  detectLocale?: boolean;
  /** Cache translations */
  cache?: boolean;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Date formatting options
 */
export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  /** Calendar system */
  calendar?: CalendarType;
  /** Time zone */
  timeZone?: string;
}

/**
 * Number formatting options
 */
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  /** Currency code */
  currency?: CurrencyCode;
  /** Currency display */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
}

/**
 * Relative time format options
 */
export interface RelativeTimeFormatOptions {
  /** Numeric style */
  numeric?: 'always' | 'auto';
  /** Style */
  style?: 'long' | 'short' | 'narrow';
}

/**
 * Locale data structure
 */
export interface LocaleData {
  /** Locale code */
  locale: Locale;
  /** Locale configuration */
  config: LocaleConfig;
  /** Translations */
  translations: Record<string, string | Record<PluralForm, string>>;
  /** Pluralization rule */
  pluralRule: (n: number) => PluralForm;
}

/**
 * Translation contribution
 */
export interface TranslationContribution {
  /** Contributor name */
  contributor: string;
  /** Contributor email */
  email?: string;
  /** Locale code */
  locale: Locale;
  /** Translation changes */
  changes: {
    /** Translation key */
    key: string;
    /** Old value */
    old?: string;
    /** New value */
    new: string;
  }[];
  /** Timestamp */
  timestamp: Date;
  /** Status */
  status: 'pending' | 'approved' | 'rejected';
}
