/**
 * Spreadsheet Moment - RTL Layout Utilities
 *
 * Utilities for right-to-left language support
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import type { Locale } from './types';

/**
 * RTL locales
 */
export const RTL_LOCALES: Set<Locale> = new Set([
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Farsi (Persian)
  'ur', // Urdu
]);

/**
 * Check if locale is RTL
 */
export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}

/**
 * Get text direction for locale
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Flip horizontal alignment for RTL
 */
export function flipAlignment(
  alignment: 'left' | 'right' | 'center',
  locale: Locale
): 'left' | 'right' | 'center' {
  if (alignment === 'center') return 'center';
  if (isRTL(locale)) {
    return alignment === 'left' ? 'right' : 'left';
  }
  return alignment;
}

/**
 * Flip margin/padding for RTL
 */
export function flipSpacing(
  value: string,
  locale: Locale
): string {
  if (!isRTL(locale)) return value;

  // Flip left/right in CSS spacing properties
  return value
    .replace(/margin-left/g, 'margin-right-TEMP')
    .replace(/margin-right/g, 'margin-left')
    .replace(/margin-right-TEMP/g, 'margin-right')
    .replace(/padding-left/g, 'padding-right-TEMP')
    .replace(/padding-right/g, 'padding-left')
    .replace(/padding-right-TEMP/g, 'padding-right')
    .replace(/border-left/g, 'border-right-TEMP')
    .replace(/border-right/g, 'border-left')
    .replace(/border-right-TEMP/g, 'border-right');
}

/**
 * Get logical CSS property for physical property
 */
export function getLogicalProperty(
  property: string,
  locale: Locale
): string {
  const mapping: Record<string, { ltr: string; rtl: string }> = {
    'margin-left': { ltr: 'margin-left', rtl: 'margin-right' },
    'margin-right': { ltr: 'margin-right', rtl: 'margin-left' },
    'padding-left': { ltr: 'padding-left', rtl: 'padding-right' },
    'padding-right': { ltr: 'padding-right', rtl: 'padding-left' },
    'border-left': { ltr: 'border-left', rtl: 'border-right' },
    'border-right': { ltr: 'border-right', rtl: 'border-left' },
    'border-left-width': { ltr: 'border-left-width', rtl: 'border-right-width' },
    'border-right-width': { ltr: 'border-right-width', rtl: 'border-left-width' },
    'border-left-color': { ltr: 'border-left-color', rtl: 'border-right-color' },
    'border-right-color': { ltr: 'border-right-color', rtl: 'border-left-color' },
    'border-left-style': { ltr: 'border-left-style', rtl: 'border-right-style' },
    'border-right-style': { ltr: 'border-right-style', rtl: 'border-left-style' },
    'left': { ltr: 'left', rtl: 'right' },
    'right': { ltr: 'right', rtl: 'left' },
  };

  const mapped = mapping[property];
  if (!mapped) return property;

  return isRTL(locale) ? mapped.rtl : mapped.ltr;
}

/**
 * Get logical CSS property using CSS logical properties
 */
export function getLogicalPropertyCSS(property: string): string {
  const logicalMapping: Record<string, string> = {
    'margin-left': 'margin-inline-start',
    'margin-right': 'margin-inline-end',
    'padding-left': 'padding-inline-start',
    'padding-right': 'padding-inline-end',
    'border-left': 'border-inline-start',
    'border-right': 'border-inline-end',
    'border-left-width': 'border-inline-start-width',
    'border-right-width': 'border-inline-end-width',
    'border-left-color': 'border-inline-start-color',
    'border-right-color': 'border-inline-end-color',
    'border-left-style': 'border-inline-start-style',
    'border-right-style': 'border-inline-end-style',
    'left': 'inset-inline-start',
    'right': 'inset-inline-end',
  };

  return logicalMapping[property] || property;
}

/**
 * Apply RTL-aware styles to element
 */
export function applyRTLStyles(
  element: HTMLElement,
  locale: Locale
): void {
  element.dir = getTextDirection(locale);

  if (isRTL(locale)) {
    element.style.textAlign = 'right';
  }
}

/**
 * Flip icon for RTL
 */
export function shouldFlipIcon(iconName: string, locale: Locale): boolean {
  // Icons that should be flipped in RTL
  const flippableIcons = new Set([
    'arrow-left',
    'arrow-right',
    'chevron-left',
    'chevron-right',
    'arrow-back',
    'arrow-forward',
    'caret-left',
    'caret-right',
    'angle-left',
    'angle-right',
    'previous',
    'next',
    'first',
    'last',
    'step-back',
    'step-forward',
    'reply',
    'share',
    'send',
  ]);

  return isRTL(locale) && flippableIcons.has(iconName);
}

/**
 * Get flipped icon name
 */
export function getFlippedIcon(iconName: string, locale: Locale): string {
  const iconFlipMap: Record<string, string> = {
    'arrow-left': 'arrow-right',
    'arrow-right': 'arrow-left',
    'chevron-left': 'chevron-right',
    'chevron-right': 'chevron-left',
    'arrow-back': 'arrow-forward',
    'arrow-forward': 'arrow-back',
    'caret-left': 'caret-right',
    'caret-right': 'caret-left',
    'angle-left': 'angle-right',
    'angle-right': 'angle-left',
    'previous': 'next',
    'next': 'previous',
    'first': 'last',
    'last': 'first',
    'step-back': 'step-forward',
    'step-forward': 'step-back',
  };

  if (shouldFlipIcon(iconName, locale)) {
    return iconFlipMap[iconName] || iconName;
  }
  return iconName;
}

/**
 * Transform URL for RTL (not usually needed, but some routing systems may require it)
 */
export function transformURL(url: string, locale: Locale): string {
  // Most URLs should remain the same in RTL
  // This is a placeholder for any URL transformations needed
  return url;
}

/**
 * Get reading order for mixed LTR/RTL content
 */
export function getReadingDirection(
  text: string,
  locale: Locale
): 'ltr' | 'rtl' | 'auto' {
  // Check for strong RTL characters
  const rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  const ltrPattern = /[A-Za-z\u0000-\u00FF]/;

  const hasRTL = rtlPattern.test(text);
  const hasLTR = ltrPattern.test(text);

  if (hasRTL && !hasLTR) return 'rtl';
  if (hasLTR && !hasRTL) return 'ltr';
  if (hasRTL && hasLTR) return 'auto';

  return getTextDirection(locale);
}

/**
 * Wrap mixed direction text with appropriate dir attribute
 */
export function wrapMixedDirection(
  text: string,
  locale: Locale
): { text: string; dir: 'ltr' | 'rtl' } {
  const dir = getReadingDirection(text, locale);
  return { text, dir };
}

/**
 * Bidi (bidirectional) utilities
 */
export class BidiUtils {
  /**
   * Check if text contains RTL characters
   */
  static hasRTLChars(text: string): boolean {
    return /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(text);
  }

  /**
   * Check if text contains LTR characters
   */
  static hasLTRChars(text: string): boolean {
    return /[A-Za-z\u0000-\u00FF]/.test(text);
  }

  /**
   * Get the overall direction of text
   */
  static getTextDirection(text: string): 'ltr' | 'rtl' | 'neutral' {
    const hasRTL = this.hasRTLChars(text);
    const hasLTR = this.hasLTRChars(text);

    if (hasRTL && !hasLTR) return 'rtl';
    if (hasLTR && !hasRTL) return 'ltr';
    return 'neutral';
  }

  /**
   * Visual ordering of text (for debugging or special display cases)
   */
  static visualOrder(text: string, direction: 'ltr' | 'rtl'): string {
    if (direction === 'rtl') {
      // For visual ordering in RTL, we might need to reverse certain characters
      // This is a simplified implementation
      return text.split('').reverse().join('');
    }
    return text;
  }

  /**
   * Insert LRI/PDI (Left-to-Right Isolate / Pop Directional Isolate) marks
   */
  static isolateLTR(text: string): string {
    return `\u2066${text}\u2069`; // LRI + text + PDI
  }

  /**
   * Insert RLI/PDI (Right-to-Left Isolate / Pop Directional Isolate) marks
   */
  static isolateRTL(text: string): string {
    return `\u2067${text}\u2069`; // RLI + text + PDI
  }

  /**
   * Insert LRE/PDF (Left-to-Right Embedding / Pop Directional Format) marks
   */
  static embedLTR(text: string): string {
    return `\u202A${text}\u202C`; // LRE + text + PDF
  }

  /**
   * Insert RLE/PDF (Right-to-Left Embedding / Pop Directional Format) marks
   */
  static embedRTL(text: string): string {
    return `\u202B${text}\u202C`; // RLE + text + PDF
  }
}

/**
 * CSS-in-JS RTL utilities
 */
export class CSSRTL {
  /**
   * Create RTL-aware style object
   */
  static createStyle(
    styles: Record<string, string>,
    locale: Locale
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [property, value] of Object.entries(styles)) {
      const logicalProperty = getLogicalPropertyCSS(property);
      result[logicalProperty] = value;
    }

    return result;
  }

  /**
   * Transform inline styles for RTL
   */
  static transformInlineStyle(
    style: string,
    locale: Locale
  ): string {
    if (!isRTL(locale)) return style;

    return style
      .split(';')
      .map(rule => {
        const [property, value] = rule.split(':').map(s => s.trim());
        if (!property || !value) return '';

        const flippedProperty = getLogicalProperty(property, locale);
        return `${flippedProperty}: ${value}`;
      })
      .filter(Boolean)
      .join('; ');
  }

  /**
   * Generate RTL-aware CSS class name suffix
   */
  static getDirectionSuffix(locale: Locale): string {
    return isRTL(locale) ? '-rtl' : '-ltr';
  }
}

/**
 * Testing utilities for RTL
 */
export class RTLTestUtils {
  /**
   * Check if element has correct direction
   */
  static assertDirection(element: HTMLElement, expectedDir: 'ltr' | 'rtl'): boolean {
    return element.dir === expectedDir || element.getAttribute('dir') === expectedDir;
  }

  /**
   * Check if element has correct text alignment
   */
  static assertAlignment(element: HTMLElement, locale: Locale): boolean {
    const computedStyle = window.getComputedStyle(element);
    const expectedAlign = isRTL(locale) ? 'right' : 'left';
    return computedStyle.textAlign === expectedAlign;
  }

  /**
   * Get all RTL-related attributes of an element
   */
  static getRTLInfo(element: HTMLElement): {
    dir: string;
    textAlign: string;
    hasLogicalProps: boolean;
  } {
    const computedStyle = window.getComputedStyle(element);
    const hasLogicalProps = [
      'margin-inline-start',
      'margin-inline-end',
      'padding-inline-start',
      'padding-inline-end',
      'border-inline-start',
      'border-inline-end',
    ].some(prop => computedStyle.getPropertyValue(prop) !== '');

    return {
      dir: element.dir || element.getAttribute('dir') || 'ltr',
      textAlign: computedStyle.textAlign,
      hasLogicalProps,
    };
  }
}
