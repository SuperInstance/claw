/**
 * Spreadsheet Moment - i18n System Entry Point
 *
 * Main exports for the internationalization system
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

// Core manager
export { i18n, I18nManager, useI18n, SUPPORTED_LOCALES } from './InternationalizationManager';

// Formatters
export {
  CurrencyFormatter,
  DateFormatter,
  NumberFormatter,
  ListFormatter,
  DisplayNameFormatter,
  Collator,
} from './formatters';

// RTL utilities
export {
  isRTL,
  getTextDirection,
  flipAlignment,
  flipSpacing,
  getLogicalProperty,
  getLogicalPropertyCSS,
  applyRTLStyles,
  shouldFlipIcon,
  getFlippedIcon,
  transformURL,
  getReadingDirection,
  wrapMixedDirection,
  BidiUtils,
  CSSRTL,
  RTLTestUtils,
  RTL_LOCALES,
} from './rtl';

// React components
export {
  RTLProvider,
  useRTL,
  LanguageSelector,
  Flex,
  FlippableIcon,
  Card,
  Button,
  Breadcrumb,
  Input,
  Table,
  Modal,
  TextDir,
} from './LocaleAwareComponents';

// Types
export type {
  Locale,
  CurrencyCode,
  CalendarType,
  PluralForm,
  TranslationKey,
  LocaleConfig,
  TranslationEntry,
  TranslationNamespace,
  TranslatorInfo,
  I18nConfig,
  DateFormatOptions,
  NumberFormatOptions,
  RelativeTimeFormatOptions,
  LocaleData,
  TranslationContribution,
} from './types';
