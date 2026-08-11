/**
 * Spreadsheet Moment - Comprehensive Internationalization (i18n) System
 *
 * Round 14: Full internationalization support for 25+ languages
 * Features: RTL layout support, locale formatting, pluralization, translations
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import type { Locale, TranslationKey, PluralForm, CurrencyCode, CalendarType, LocaleConfig } from './types';

/**
 * Supported locales with their configurations
 */
export const SUPPORTED_LOCALES: Record<Locale, LocaleConfig> = {
  // English variants
  'en': { name: 'English', nativeName: 'English', direction: 'ltr', calendar: 'gregory', currency: 'USD' },
  'en-GB': { name: 'English (UK)', nativeName: 'English (UK)', direction: 'ltr', calendar: 'gregory', currency: 'GBP' },
  'en-AU': { name: 'English (Australia)', nativeName: 'English (Australia)', direction: 'ltr', calendar: 'gregory', currency: 'AUD' },

  // European languages
  'de': { name: 'German', nativeName: 'Deutsch', direction: 'ltr', calendar: 'gregory', currency: 'EUR' },
  'fr': { name: 'French', nativeName: 'Français', direction: 'ltr', calendar: 'gregory', currency: 'EUR' },
  'es': { name: 'Spanish', nativeName: 'Español', direction: 'ltr', calendar: 'gregory', currency: 'EUR' },
  'it': { name: 'Italian', nativeName: 'Italiano', direction: 'ltr', calendar: 'gregory', currency: 'EUR' },
  'pt': { name: 'Portuguese', nativeName: 'Português', direction: 'ltr', calendar: 'gregory', currency: 'EUR' },
  'pt-BR': { name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', direction: 'ltr', calendar: 'gregory', currency: 'BRL' },
  'nl': { name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', calendar: 'gregory', currency: 'EUR' },
  'pl': { name: 'Polish', nativeName: 'Polski', direction: 'ltr', calendar: 'gregory', currency: 'PLN' },
  'ru': { name: 'Russian', nativeName: 'Русский', direction: 'ltr', calendar: 'gregory', currency: 'RUB' },
  'uk': { name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', calendar: 'gregory', currency: 'UAH' },
  'cs': { name: 'Czech', nativeName: 'Čeština', direction: 'ltr', calendar: 'gregory', currency: 'CZK' },
  'el': { name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr', calendar: 'gregory', currency: 'EUR' },
  'sv': { name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', calendar: 'gregory', currency: 'SEK' },
  'no': { name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', calendar: 'gregory', currency: 'NOK' },
  'fi': { name: 'Finnish', nativeName: 'Suomi', direction: 'ltr', calendar: 'gregory', currency: 'EUR' },
  'da': { name: 'Danish', nativeName: 'Dansk', direction: 'ltr', calendar: 'gregory', currency: 'DKK' },
  'ro': { name: 'Romanian', nativeName: 'Română', direction: 'ltr', calendar: 'gregory', currency: 'RON' },
  'hu': { name: 'Hungarian', nativeName: 'Magyar', direction: 'ltr', calendar: 'gregory', currency: 'HUF' },

  // Asian languages
  'zh': { name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr', calendar: 'gregory', currency: 'CNY' },
  'zh-TW': { name: 'Chinese (Traditional)', nativeName: '繁體中文', direction: 'ltr', calendar: 'gregory', currency: 'TWD' },
  'ja': { name: 'Japanese', nativeName: '日本語', direction: 'ltr', calendar: 'gregory', currency: 'JPY' },
  'ko': { name: 'Korean', nativeName: '한국어', direction: 'ltr', calendar: 'gregory', currency: 'KRW' },
  'th': { name: 'Thai', nativeName: 'ไทย', direction: 'ltr', calendar: 'buddhist', currency: 'THB' },
  'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', calendar: 'gregory', currency: 'VND' },
  'id': { name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', calendar: 'gregory', currency: 'IDR' },
  'ms': { name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', calendar: 'gregory', currency: 'MYR' },
  'hi': { name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', calendar: 'gregory', currency: 'INR' },
  'bn': { name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', calendar: 'gregory', currency: 'BDT' },
  'ta': { name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', calendar: 'gregory', currency: 'INR' },
  'te': { name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', calendar: 'gregory', currency: 'INR' },
  'mr': { name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', calendar: 'gregory', currency: 'INR' },

  // Middle Eastern languages (RTL)
  'ar': { name: 'Arabic', nativeName: 'العربية', direction: 'rtl', calendar: 'gregory', currency: 'SAR' },
  'he': { name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', calendar: 'gregory', currency: 'ILS' },
  'fa': { name: 'Farsi (Persian)', nativeName: 'فارسی', direction: 'rtl', calendar: 'persian', currency: 'IRR' },
  'ur': { name: 'Urdu', nativeName: 'اردو', direction: 'rtl', calendar: 'gregory', currency: 'PKR' },

  // Other languages
  'tr': { name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', calendar: 'gregory', currency: 'TRY' },
  'sw': { name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', calendar: 'gregory', currency: 'KES' },
};

/**
 * Translation database structure
 */
interface TranslationDatabase {
  [locale: string]: {
    [key: string]: string | { [pluralForm: string]: string };
  };
}

/**
 * Pluralization rules by language
 */
const PLURAL_RULES: Record<Locale, (n: number) => PluralForm> = {
  'en': (n) => n === 1 ? 'one' : 'other',
  'en-GB': (n) => n === 1 ? 'one' : 'other',
  'en-AU': (n) => n === 1 ? 'one' : 'other',

  // Slavic languages have complex plural forms
  'ru': (n) => {
    const lastTwo = n % 100;
    const lastOne = n % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return 'many';
    if (lastOne === 1) return 'one';
    if (lastOne >= 2 && lastOne <= 4) return 'few';
    return 'many';
  },
  'uk': (n) => {
    const lastTwo = n % 100;
    const lastOne = n % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return 'many';
    if (lastOne === 1) return 'one';
    if (lastOne >= 2 && lastOne <= 4) return 'few';
    return 'many';
  },
  'pl': (n) => {
    if (n === 1) return 'one';
    const lastTwo = n % 100;
    const lastOne = n % 10;
    if (lastTwo >= 12 && lastTwo <= 14) return 'many';
    if (lastOne >= 2 && lastOne <= 4) return 'few';
    return 'many';
  },

  // Arabic has 6 plural forms
  'ar': (n) => {
    if (n === 0) return 'zero';
    if (n === 1) return 'one';
    if (n === 2) return 'two';
    if (n % 100 >= 3 && n % 100 <= 10) return 'few';
    if (n % 100 >= 11 && n % 100 <= 99) return 'many';
    return 'other';
  },

  // Default for most languages
  'de': (n) => n === 1 ? 'one' : 'other',
  'fr': (n) => n === 0 || n === 1 ? 'one' : 'other',
  'es': (n) => n === 1 ? 'one' : 'other',
  'it': (n) => n === 1 ? 'one' : 'other',
  'pt': (n) => n === 1 ? 'one' : 'other',
  'pt-BR': (n) => n === 1 ? 'one' : 'other',
  'nl': (n) => n === 1 ? 'one' : 'other',
  'cs': (n) => {
    if (n === 1) return 'one';
    if (n >= 2 && n <= 4) return 'few';
    return 'many';
  },
  'el': (n) => n === 1 ? 'one' : 'other',
  'sv': (n) => n === 1 ? 'one' : 'other',
  'no': (n) => n === 1 ? 'one' : 'other',
  'fi': (n) => n === 1 ? 'one' : 'other',
  'da': (n) => n === 1 ? 'one' : 'other',
  'ro': (n) => {
    if (n === 1) return 'one';
    const lastOne = n % 100;
    if (n === 0 || lastOne >= 1 && lastOne <= 20) return 'few';
    return 'many';
  },
  'hu': (n) => n === 1 ? 'one' : 'other',

  // Asian languages (no plural forms)
  'zh': () => 'other',
  'zh-TW': () => 'other',
  'ja': () => 'other',
  'ko': () => 'other',
  'th': () => 'other',
  'vi': () => 'other',
  'id': () => 'other',
  'ms': () => 'other',
  'hi': (n) => n === 1 ? 'one' : 'other',
  'bn': (n) => n === 1 ? 'one' : 'other',
  'ta': (n) => n === 1 ? 'one' : 'other',
  'te': (n) => n === 1 ? 'one' : 'other',
  'mr': (n) => n === 1 ? 'one' : 'other',

  // RTL languages
  'he': (n) => n === 1 ? 'one' : 'other',
  'fa': (n) => n === 1 ? 'one' : 'other',
  'ur': (n) => n === 1 ? 'one' : 'other',

  // Others
  'tr': (n) => n === 1 ? 'one' : 'other',
  'sw': (n) => n === 1 ? 'one' : 'other',
};

/**
 * Main internationalization manager
 */
export class I18nManager {
  private translations: TranslationDatabase = {};
  private currentLocale: Locale = 'en';
  private fallbackLocale: Locale = 'en';
  private cache: Map<string, string> = new Map();
  private localeConfigs: Map<Locale, LocaleConfig> = new Map();

  constructor() {
    this.initializeLocaleConfigs();
    this.loadTranslations();
    this.detectAndSetLocale();
  }

  /**
   * Initialize locale configurations
   */
  private initializeLocaleConfigs(): void {
    Object.entries(SUPPORTED_LOCALES).forEach(([locale, config]) => {
      this.localeConfigs.set(locale as Locale, config);
    });
  }

  /**
   * Load translation files for all supported locales
   */
  private async loadTranslations(): Promise<void> {
    // Load translations dynamically from JSON files
    try {
      const localeKeys = Object.keys(SUPPORTED_LOCALES) as Locale[];

      for (const locale of localeKeys) {
        try {
          // Dynamic import for translation files
          const translationModule = await import(`./locales/${locale}.json`);
          this.translations[locale] = translationModule.default || translationModule;
        } catch (error) {
          // If translation file doesn't exist, fall back to English
          console.warn(`Translation file for ${locale} not found, using fallback`);
          if (locale === this.fallbackLocale) {
            // Load English inline as fallback
            this.translations[locale] = this.getEnglishTranslations();
          }
        }
      }

      // Ensure fallback locale has translations
      if (!this.translations[this.fallbackLocale]) {
        this.translations[this.fallbackLocale] = this.getEnglishTranslations();
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to inline translations
      this.translations = {
        'en': this.getEnglishTranslations(),
      };
    }
  }

  /**
   * Detect and set user's preferred locale
   */
  private detectAndSetLocale(): void {
    const detectedLocale = this.detectLocale();
    this.setLocale(detectedLocale);
  }

  /**
   * Get translation for a key
   */
  t(key: TranslationKey, params?: Record<string, any>): string {
    const cacheKey = `${this.currentLocale}:${key}:${JSON.stringify(params)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let translation = this.getRawTranslation(key, this.currentLocale);

    // Handle pluralization
    if (params?.count !== undefined && typeof translation === 'object') {
      const pluralForm = PLURAL_RULES[this.currentLocale]?.(params.count) || 'other';
      translation = translation[pluralForm] || translation.other || '';
    }

    if (typeof translation !== 'string') {
      translation = String(translation);
    }

    // Replace parameters
    if (params) {
      translation = this.replaceParams(translation, params);
    }

    this.cache.set(cacheKey, translation);
    return translation;
  }

  /**
   * Get raw translation from database
   */
  private getRawTranslation(key: string, locale: Locale): string | Record<string, string> {
    const keys = key.split('.');
    let result: any = this.translations[locale];

    for (const k of keys) {
      if (result && typeof result === 'object') {
        result = result[k];
      } else {
        // Fall back to English
        result = this.translations[this.fallbackLocale];
        for (const fallbackKey of keys) {
          if (result && typeof result === 'object') {
            result = result[fallbackKey];
          }
        }
        break;
      }
    }

    return result || key;
  }

  /**
   * Replace parameters in translation string
   */
  private replaceParams(str: string, params: Record<string, any>): string {
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
    });
  }

  /**
   * Set current locale
   */
  setLocale(locale: Locale): void {
    if (!SUPPORTED_LOCALES[locale]) {
      console.warn(`Locale ${locale} not supported, falling back to ${this.fallbackLocale}`);
      this.currentLocale = this.fallbackLocale;
      return;
    }
    this.currentLocale = locale;
    this.cache.clear();
    document.documentElement.lang = locale;
    document.documentElement.dir = SUPPORTED_LOCALES[locale].direction;
  }

  /**
   * Get current locale
   */
  getLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency?: CurrencyCode): string {
    const locale = this.currentLocale;
    const code = currency || SUPPORTED_LOCALES[locale].currency;

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
      }).format(amount);
    } catch {
      return `${code} ${amount.toFixed(2)}`;
    }
  }

  /**
   * Format number
   */
  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(num);
  }

  /**
   * Format percentage
   */
  formatPercent(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }

  /**
   * Format date
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
  }

  /**
   * Format time
   */
  formatTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, {
      ...options,
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  }

  /**
   * Format date and time
   */
  formatDateTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, {
      ...options,
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  }

  /**
   * Format list (e.g., "A, B, and C")
   */
  formatList(items: string[]): string {
    if (typeof Intl !== 'undefined' && 'ListFormat' in Intl) {
      return new (Intl as any).ListFormat(this.currentLocale, {
        style: 'long',
        type: 'conjunction',
      }).format(items);
    }
    return items.join(', ');
  }

  /**
   * Detect user's preferred locale from browser
   */
  detectLocale(): Locale {
    if (typeof navigator === 'undefined') return this.fallbackLocale;

    const browserLang = navigator.language || (navigator as any).userLanguage;
    const baseLocale = browserLang.split('-')[0] as Locale;

    // Check exact match first
    if (SUPPORTED_LOCALES[browserLang as Locale]) {
      return browserLang as Locale;
    }

    // Check base locale
    if (SUPPORTED_LOCALES[baseLocale]) {
      return baseLocale;
    }

    return this.fallbackLocale;
  }

  /**
   * Get locale configuration
   */
  getLocaleConfig(locale?: Locale): LocaleConfig | undefined {
    return this.localeConfigs.get(locale || this.currentLocale);
  }

  /**
   * Get all supported locales
   */
  getSupportedLocales(): Record<Locale, LocaleConfig> {
    return SUPPORTED_LOCALES;
  }

  /**
   * Check if locale is RTL
   */
  isRTL(locale?: Locale): boolean {
    const loc = locale || this.currentLocale;
    return SUPPORTED_LOCALES[loc]?.direction === 'rtl' || false;
  }

  /**
   * Get available locales list
   */
  getAvailableLocales(): Locale[] {
    return Object.keys(SUPPORTED_LOCALES) as Locale[];
  }

  /**
   * Export all translations for a locale (for contribution workflow)
   */
  exportTranslations(locale: Locale): Record<string, any> {
    return this.translations[locale] || {};
  }

  /**
   * Import translations (for community contributions)
   */
  async importTranslations(locale: Locale, translations: Record<string, any>): Promise<boolean> {
    try {
      // Validate translations structure
      this.validateTranslations(translations);

      // Merge with existing translations
      this.translations[locale] = {
        ...this.translations[locale],
        ...translations,
      };

      return true;
    } catch (error) {
      console.error('Failed to import translations:', error);
      return false;
    }
  }

  /**
   * Validate translation structure
   */
  private validateTranslations(translations: Record<string, any>): void {
    // Ensure all required keys exist
    const requiredKeys = ['common', 'spreadsheet', 'ui', 'errors', 'messages'];
    for (const key of requiredKeys) {
      if (!translations[key]) {
        throw new Error(`Missing required translation key: ${key}`);
      }
    }
  }

  /**
   * Get missing translations for a locale
   */
  getMissingTranslations(locale: Locale): string[] {
    const missing: string[] = [];
    const baseTranslations = this.translations[this.fallbackLocale];
    const targetTranslations = this.translations[locale];

    const findMissing = (obj: any, prefix: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          findMissing(value, fullPath);
        } else if (!targetTranslations) {
          missing.push(fullPath);
        } else {
          const keys = fullPath.split('.');
          let current: any = targetTranslations;
          for (const k of keys) {
            if (!current[k]) {
              missing.push(fullPath);
              break;
            }
            current = current[k];
          }
        }
      }
    };

    findMissing(baseTranslations);
    return missing;
  }

  // ========== Sample Translation Data ==========

  private getEnglishTranslations(): Record<string, any> {
    return {
      common: {
        appName: 'Spreadsheet Moment',
        welcome: 'Welcome',
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        export: 'Export',
        import: 'Import',
        share: 'Share',
        settings: 'Settings',
        help: 'Help',
        about: 'About',
      },
      spreadsheet: {
        cell: {
          one: '1 cell',
          other: '{{count}} cells',
        },
        row: {
          one: '1 row',
          other: '{{count}} rows',
        },
        column: {
          one: '1 column',
          other: '{{count}} columns',
        },
        formula: 'Formula',
        value: 'Value',
        format: 'Format',
        insertRow: 'Insert Row',
        insertColumn: 'Insert Column',
        deleteRow: 'Delete Row',
        deleteColumn: 'Delete Column',
        mergeCells: 'Merge Cells',
        unmergeCells: 'Unmerge Cells',
      },
      ui: {
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        reports: 'Reports',
        collaborators: 'Collaborators',
        notifications: 'Notifications',
        profile: 'Profile',
        logout: 'Logout',
      },
      errors: {
        generic: 'An error occurred',
        network: 'Network error',
        unauthorized: 'Unauthorized access',
        forbidden: 'Access forbidden',
        notFound: 'Not found',
        serverError: 'Server error',
      },
      messages: {
        saved: 'Changes saved',
        deleted: 'Item deleted',
        shared: 'Shared successfully',
        copied: 'Copied to clipboard',
      },
    };
  }

  private getGermanTranslations(): Record<string, any> {
    return {
      common: {
        appName: 'Spreadsheet Moment',
        welcome: 'Willkommen',
        loading: 'Laden...',
        save: 'Speichern',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        create: 'Erstellen',
        update: 'Aktualisieren',
        search: 'Suchen',
        filter: 'Filtern',
        sort: 'Sortieren',
        export: 'Exportieren',
        import: 'Importieren',
        share: 'Teilen',
        settings: 'Einstellungen',
        help: 'Hilfe',
        about: 'Über',
      },
      spreadsheet: {
        cell: {
          one: '1 Zelle',
          other: '{{count}} Zellen',
        },
        row: {
          one: '1 Zeile',
          other: '{{count}} Zeilen',
        },
        column: {
          one: '1 Spalte',
          other: '{{count}} Spalten',
        },
        formula: 'Formel',
        value: 'Wert',
        format: 'Format',
        insertRow: 'Zeile einfügen',
        insertColumn: 'Spalte einfügen',
        deleteRow: 'Zeile löschen',
        deleteColumn: 'Spalte löschen',
        mergeCells: 'Zellen verbinden',
        unmergeCells: 'Zellen trennen',
      },
    };
  }

  private getFrenchTranslations(): Record<string, any> {
    return {
      common: {
        appName: 'Spreadsheet Moment',
        welcome: 'Bienvenue',
        loading: 'Chargement...',
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        create: 'Créer',
        update: 'Mettre à jour',
        search: 'Rechercher',
        filter: 'Filtrer',
        sort: 'Trier',
        export: 'Exporter',
        import: 'Importer',
        share: 'Partager',
        settings: 'Paramètres',
        help: 'Aide',
        about: 'À propos',
      },
      spreadsheet: {
        cell: {
          one: '1 cellule',
          other: '{{count}} cellules',
        },
        formula: 'Formule',
        value: 'Valeur',
        format: 'Format',
      },
    };
  }

  private getSpanishTranslations(): Record<string, any> {
    return {
      common: {
        appName: 'Spreadsheet Moment',
        welcome: 'Bienvenido',
        loading: 'Cargando...',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        create: 'Crear',
        update: 'Actualizar',
        search: 'Buscar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        export: 'Exportar',
        import: 'Importar',
        share: 'Compartir',
        settings: 'Configuración',
        help: 'Ayuda',
        about: 'Acerca de',
      },
      spreadsheet: {
        cell: {
          one: '1 celda',
          other: '{{count}} celdas',
        },
        formula: 'Fórmula',
        value: 'Valor',
        format: 'Formato',
      },
    };
  }

  private getChineseTranslations(): Record<string, any> {
    return {
      common: {
        appName: 'Spreadsheet Moment',
        welcome: '欢迎',
        loading: '加载中...',
        save: '保存',
        cancel: '取消',
        delete: '删除',
        edit: '编辑',
        create: '创建',
        update: '更新',
        search: '搜索',
        filter: '筛选',
        sort: '排序',
        export: '导出',
        import: '导入',
        share: '分享',
        settings: '设置',
        help: '帮助',
        about: '关于',
      },
      spreadsheet: {
        cell: {
          other: '{{count}} 个单元格',
        },
        formula: '公式',
        value: '值',
        format: '格式',
      },
    };
  }

  private getJapaneseTranslations(): Record<string, any> {
    return {
      common: {
        appName: 'Spreadsheet Moment',
        welcome: 'ようこそ',
        loading: '読み込み中...',
        save: '保存',
        cancel: 'キャンセル',
        delete: '削除',
        edit: '編集',
        create: '作成',
        update: '更新',
        search: '検索',
        filter: 'フィルター',
        sort: '並べ替え',
        export: 'エクスポート',
        import: 'インポート',
        share: '共有',
        settings: '設定',
        help: 'ヘルプ',
        about: 'について',
      },
      spreadsheet: {
        cell: {
          other: '{{count}}個のセル',
        },
        formula: '数式',
        value: '値',
        format: '形式',
      },
    };
  }

  private getArabicTranslations(): Record<string, any> {
    return {
      common: {
        appName: 'الجدول اللحظي',
        welcome: 'مرحباً',
        loading: 'جاري التحميل...',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        create: 'إنشاء',
        update: 'تحديث',
        search: 'بحث',
        filter: 'تصفية',
        sort: 'ترتيب',
        export: 'تصدير',
        import: 'استيراد',
        share: 'مشاركة',
        settings: 'الإعدادات',
        help: 'مساعدة',
        about: 'حول',
      },
      spreadsheet: {
        cell: {
          zero: '٠ خلية',
          one: 'خلية واحدة',
          two: 'خليتان',
          few: '{{count}} خلايا',
          many: '{{count}} خلية',
          other: '{{count}} خلية',
        },
        formula: 'معادلة',
        value: 'قيمة',
        format: 'تنسيق',
      },
    };
  }

  private getHebrewTranslations(): Record<string, any> {
    return {
      common: {
        appName: 'גיליון אלקטרוני רגע',
        welcome: 'ברוכים הבאים',
        loading: 'טוען...',
        save: 'שמור',
        cancel: 'בטל',
        delete: 'מחק',
        edit: 'ערוך',
        create: 'צור',
        update: 'עדכן',
        search: 'חפש',
        filter: 'סנן',
        sort: 'מיין',
        export: 'ייצוא',
        import: 'ייבוא',
        share: 'שתף',
        settings: 'הגדרות',
        help: 'עזרה',
        about: 'אודות',
      },
      spreadsheet: {
        cell: {
          one: 'תא אחד',
          other: '{{count}} תאים',
        },
        formula: 'נוסחה',
        value: 'ערך',
        format: 'פורמט',
      },
    };
  }
}

// Create singleton instance
export const i18n = new I18nManager();

/**
 * React hook for using i18n
 */
export function useI18n() {
  return {
    t: (key: TranslationKey, params?: Record<string, any>) => i18n.t(key, params),
    locale: i18n.getLocale(),
    setLocale: (locale: Locale) => i18n.setLocale(locale),
    formatCurrency: (amount: number, currency?: CurrencyCode) => i18n.formatCurrency(amount, currency),
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => i18n.formatNumber(num, options),
    formatPercent: (value: number, decimals?: number) => i18n.formatPercent(value, decimals),
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => i18n.formatDate(date, options),
    formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => i18n.formatTime(date, options),
    formatDateTime: (date: Date, options?: Intl.DateTimeFormatOptions) => i18n.formatDateTime(date, options),
    formatRelativeTime: (date: Date) => i18n.formatRelativeTime(date),
    formatList: (items: string[]) => i18n.formatList(items),
    isRTL: () => i18n.isRTL(),
    getLocaleConfig: (locale?: Locale) => i18n.getLocaleConfig(locale),
    getSupportedLocales: () => i18n.getSupportedLocales(),
    getAvailableLocales: () => i18n.getAvailableLocales(),
  };
}
