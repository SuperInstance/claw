/**
 * Spreadsheet Moment - i18n Formatters
 *
 * Currency, date, number, and other locale-aware formatters
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import type { Locale, CurrencyCode, CalendarType, DateFormatOptions, NumberFormatOptions } from './types';

/**
 * Currency formatting with support for 150+ currencies
 */
export class CurrencyFormatter {
  /**
   * Format currency amount
   */
  static format(
    amount: number,
    currency: CurrencyCode,
    locale: Locale,
    options?: {
      display?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    }
  ): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: options?.display || 'symbol',
        minimumFractionDigits: options?.minimumFractionDigits,
        maximumFractionDigits: options?.maximumFractionDigits,
      }).format(amount);
    } catch (error) {
      // Fallback for unsupported currency
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  /**
   * Get currency symbol for a currency code
   */
  static getSymbol(currency: CurrencyCode, locale: Locale = 'en'): string {
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      });
      const parts = formatter.formatToParts(0);
      const symbolPart = parts.find(part => part.type === 'currency');
      return symbolPart?.value || currency;
    } catch {
      return currency;
    }
  }

  /**
   * Format currency range (e.g., "$10 - $100")
   */
  static formatRange(
    min: number,
    max: number,
    currency: CurrencyCode,
    locale: Locale
  ): string {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  /**
   * Parse currency string to number
   */
  static parse(value: string, locale: Locale): number {
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).formatToParts(0);

    const decimalSeparator = parts.find(p => p.type === 'decimal')?.value || '.';
    const groupSeparator = parts.find(p => p.type === 'group')?.value || ',';

    const normalized = value
      .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
      .replace(new RegExp(`\\${decimalSeparator}`), '.');

    return parseFloat(normalized) || 0;
  }
}

/**
 * Date and time formatting with calendar support
 */
export class DateFormatter {
  /**
   * Format date with locale-aware options
   */
  static format(
    date: Date,
    locale: Locale,
    options?: DateFormatOptions
  ): string {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  /**
   * Format date with preset styles
   */
  static formatWithStyle(
    date: Date,
    locale: Locale,
    style: 'full' | 'long' | 'medium' | 'short' = 'medium'
  ): string {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: style,
    }).format(date);
  }

  /**
   * Format time with preset styles
   */
  static formatTime(
    date: Date,
    locale: Locale,
    style: 'full' | 'long' | 'medium' | 'short' = 'short'
  ): string {
    return new Intl.DateTimeFormat(locale, {
      timeStyle: style,
    }).format(date);
  }

  /**
   * Format date and time
   */
  static formatDateTime(
    date: Date,
    locale: Locale,
    options?: DateFormatOptions
  ): string {
    return new Intl.DateTimeFormat(locale, {
      ...options,
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  static formatRelative(
    date: Date,
    locale: Locale,
    options?: { numeric?: 'always' | 'auto'; style?: 'long' | 'short' | 'narrow' }
  ): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, options);

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
   * Format calendar date (supports different calendar types)
   */
  static formatCalendar(
    date: Date,
    locale: Locale,
    calendar: CalendarType
  ): string {
    return new Intl.DateTimeFormat(locale, {
      calendar,
      dateStyle: 'long',
    }).format(date);
  }

  /**
   * Get calendar-specific date parts
   */
  static getDateParts(date: Date, locale: Locale, calendar: CalendarType) {
    const formatter = new Intl.DateTimeFormat(locale, {
      calendar,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });

    const parts = formatter.formatToParts(date);
    return {
      year: parts.find(p => p.type === 'year')?.value,
      month: parts.find(p => p.type === 'month')?.value,
      day: parts.find(p => p.type === 'day')?.value,
    };
  }

  /**
   * Format date range (e.g., "Jan 1 - Jan 31, 2024")
   */
  static formatRange(
    startDate: Date,
    endDate: Date,
    locale: Locale
  ): string {
    const formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    if (typeof Intl.DateTimeFormat.prototype.formatRange === 'function') {
      return (formatter as any).formatRange(startDate, endDate);
    }

    // Fallback for browsers without formatRange support
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  }

  /**
   * Get weekday name
   */
  static getWeekday(date: Date, locale: Locale, style: 'long' | 'short' | 'narrow' = 'long'): string {
    return new Intl.DateTimeFormat(locale, { weekday: style }).format(date);
  }

  /**
   * Get month name
   */
  static getMonth(date: Date, locale: Locale, style: 'long' | 'short' | 'narrow' = 'long'): string {
    return new Intl.DateTimeFormat(locale, { month: style }).format(date);
  }

  /**
   * Get era name (for calendars with eras)
   */
  static getEra(date: Date, locale: Locale): string {
    return new Intl.DateTimeFormat(locale, { era: 'long' }).format(date);
  }
}

/**
 * Number formatting with locale-aware separators
 */
export class NumberFormatter {
  /**
   * Format number with locale-aware options
   */
  static format(
    num: number,
    locale: Locale,
    options?: NumberFormatOptions
  ): string {
    return new Intl.NumberFormat(locale, options).format(num);
  }

  /**
   * Format number with precision
   */
  static formatPrecision(
    num: number,
    locale: Locale,
    decimals: number = 2
  ): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  /**
   * Format percentage
   */
  static formatPercent(
    value: number,
    locale: Locale,
    decimals: number = 2
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }

  /**
   * Format number with compact notation (e.g., "1.2K", "1.5M")
   */
  static formatCompact(
    num: number,
    locale: Locale,
    style: 'short' | 'long' = 'short'
  ): string {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: style,
    }).format(num);
  }

  /**
   * Format number with unit (e.g., "100 km", "50 GB")
   */
  static formatUnit(
    value: number,
    unit: string,
    locale: Locale
  ): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'unit',
        unit,
      }).format(value);
    } catch {
      // Fallback for unsupported units
      return `${value} ${unit}`;
    }
  }

  /**
   * Format number range
   */
  static formatRange(min: number, max: number, locale: Locale): string {
    const formatter = new Intl.NumberFormat(locale);
    if (typeof Intl.NumberFormat.prototype.formatRange === 'function') {
      return (formatter as any).formatRange(min, max);
    }
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  /**
   * Parse number string
   */
  static parse(value: string, locale: Locale): number {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
    const decimalSeparator = parts.find(p => p.type === 'decimal')?.value || '.';
    const groupSeparator = parts.find(p => p.type === 'group')?.value || ',';

    const normalized = value
      .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
      .replace(new RegExp(`\\${decimalSeparator}`), '.');

    return parseFloat(normalized) || 0;
  }

  /**
   * Get decimal separator for locale
   */
  static getDecimalSeparator(locale: Locale): string {
    const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
    return parts.find(p => p.type === 'decimal')?.value || '.';
  }

  /**
   * Get thousands separator for locale
   */
  static getThousandsSeparator(locale: Locale): string {
    const parts = new Intl.NumberFormat(locale).formatToParts(1000);
    return parts.find(p => p.type === 'group')?.value || ',';
  }
}

/**
 * List formatting (e.g., "A, B, and C")
 */
export class ListFormatter {
  /**
   * Format list of items
   */
  static format(
    items: string[],
    locale: Locale,
    type: 'conjunction' | 'disjunction' = 'conjunction',
    style: 'long' | 'short' | 'narrow' = 'long'
  ): string {
    if (typeof Intl !== 'undefined' && 'ListFormat' in Intl) {
      try {
        return new (Intl as any).ListFormat(locale, {
          style,
          type,
        }).format(items);
      } catch {
        // Fallback if ListFormat not supported
      }
    }

    // Manual fallback
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) {
      const separator = type === 'conjunction' ? ' and ' : ' or ';
      return items.join(separator);
    }
    return items.slice(0, -1).join(', ') + (type === 'conjunction' ? ', and ' : ', or ') + items[items.length - 1];
  }

  /**
   * Format list with units (e.g., "1 kg, 2 kg, and 3 kg")
   */
  static formatWithUnits(
    items: { value: number; unit: string }[],
    locale: Locale
  ): string {
    const formatted = items.map(item =>
      NumberFormatter.formatUnit(item.value, item.unit, locale)
    );
    return ListFormatter.format(formatted, locale);
  }
}

/**
 * Display name formatting (language, country, script names)
 */
export class DisplayNameFormatter {
  /**
   * Get display name for a locale
   */
  static locale(localeCode: string, displayLocale: Locale): string {
    try {
      return new Intl.DisplayNames(displayLocale, {
        type: 'language',
      }).of(localeCode.split('-')[0]) || localeCode;
    } catch {
      return localeCode;
    }
  }

  /**
   * Get display name for a region
   */
  static region(regionCode: string, displayLocale: Locale): string {
    try {
      return new Intl.DisplayNames(displayLocale, {
        type: 'region',
      }).of(regionCode) || regionCode;
    } catch {
      return regionCode;
    }
  }

  /**
   * Get display name for a currency
   */
  static currency(currencyCode: CurrencyCode, displayLocale: Locale): string {
    try {
      return new Intl.DisplayNames(displayLocale, {
        type: 'currency',
      }).of(currencyCode) || currencyCode;
    } catch {
      return currencyCode;
    }
  }

  /**
   * Get display name for a script
   */
  static script(scriptCode: string, displayLocale: Locale): string {
    try {
      return new Intl.DisplayNames(displayLocale, {
        type: 'script',
      }).of(scriptCode) || scriptCode;
    } catch {
      return scriptCode;
    }
  }
}

/**
 * Collation for locale-aware string comparison
 */
export class Collator {
  private static collators: Map<Locale, Intl.Collator> = new Map();

  /**
   * Compare strings according to locale rules
   */
  static compare(a: string, b: string, locale: Locale): number {
    if (!Collator.collators.has(locale)) {
      Collator.collators.set(
        locale,
        new Intl.Collator(locale, {
          sensitivity: 'base',
          numeric: true,
        })
      );
    }
    return Collator.collators.get(locale)!.compare(a, b);
  }

  /**
   * Sort array of strings according to locale
   */
  static sort(strings: string[], locale: Locale): string[] {
    return strings.slice().sort((a, b) => Collator.compare(a, b, locale));
  }

  /**
   * Search for string in array according to locale
   */
  static search(strings: string[], query: string, locale: Locale): string[] {
    const collator = new Intl.Collator(locale, {
      sensitivity: 'base',
    });

    return strings.filter(str =>
      collator.compare(str.slice(0, query.length), query) === 0
    );
  }
}
