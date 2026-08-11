/**
 * Spreadsheet Moment - RTL-Aware UI Components
 *
 * React components that automatically adapt to LTR/RTL layouts
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { i18n, Locale, useI18n } from './InternationalizationManager';

/**
 * RTL context for component tree
 */
interface RTLContextValue {
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  locale: Locale;
}

const RTLContext = createContext<RTLContextValue>({
  isRTL: false,
  direction: 'ltr',
  locale: 'en',
});

/**
 * Provider for RTL context
 */
export function RTLProvider({ children, locale }: { children: React.ReactNode; locale?: Locale }) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale || i18n.getLocale());
  const direction = i18n.getLocale().startsWith('ar') ||
                   i18n.getLocale().startsWith('he') ||
                   i18n.getLocale().startsWith('fa') ||
                   i18n.getLocale().startsWith('ur') ? 'rtl' : 'ltr';

  useEffect(() => {
    if (locale) {
      setCurrentLocale(locale);
      i18n.setLocale(locale);
    }
  }, [locale]);

  const value: RTLContextValue = {
    isRTL: direction === 'rtl',
    direction,
    locale: currentLocale,
  };

  return (
    <RTLContext.Provider value={value}>
      <div dir={direction} lang={currentLocale}>
        {children}
      </div>
    </RTLContext.Provider>
  );
}

/**
 * Hook to access RTL context
 */
export function useRTL() {
  return useContext(RTLContext);
}

/**
 * Language selector component
 */
export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const locales = Object.entries({
    // European
    'en': '🇺🇸 English',
    'de': '🇩🇪 Deutsch',
    'fr': '🇫🇷 Français',
    'es': '🇪🇸 Español',
    'it': '🇮🇹 Italiano',
    'pt': '🇵🇹 Português',
    'nl': '🇳🇱 Nederlands',
    'pl': '🇵🇱 Polski',
    'ru': '🇷🇺 Русский',
    // Asian
    'zh': '🇨🇳 简体中文',
    'ja': '🇯🇵 日本語',
    'ko': '🇰🇷 한국어',
    'hi': '🇮🇳 हिन्दी',
    'th': '🇹🇭 ไทย',
    'vi': '🇻🇳 Tiếng Việt',
    'id': '🇮🇩 Bahasa Indonesia',
    // Middle Eastern (RTL)
    'ar': '🇸🇦 العربية',
    'he': '🇮🇱 עברית',
    'fa': '🇮🇷 فارسی',
    'ur': '🇵🇰 اردو',
    // Others
    'tr': '🇹🇷 Türkçe',
    'sw': '🇰🇪 Kiswahili',
  });

  const groupedLocales = {
    european: ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru'],
    asian: ['zh', 'ja', 'ko', 'hi', 'th', 'vi', 'id'],
    middleEastern: ['ar', 'he', 'fa', 'ur'],
    other: ['tr', 'sw'],
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Select language"
      >
        <span className="text-lg">{locales[locale]?.split(' ')[0] || '🌐'}</span>
        <span className="text-sm font-medium">{locales[locale]?.split(' ').slice(1).join(' ') || 'Language'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {Object.entries(groupedLocales).map(([group, groupLocales]) => (
              <div key={group} className="mb-4 last:mb-0">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {group === 'european' && 'European'}
                  {group === 'asian' && 'Asian'}
                  {group === 'middleEastern' && 'Middle Eastern (RTL)'}
                  {group === 'other' && 'Other'}
                </div>
                {groupLocales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocale(loc as Locale);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                      locale === loc
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl">{locales[loc as Locale]?.split(' ')[0]}</span>
                    <span className="text-sm">{locales[loc as Locale]?.split(' ').slice(1).join(' ')}</span>
                    {locale === loc && (
                      <svg className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * RTL-aware flex container that automatically reverses order in RTL
 */
export function Flex({
  children,
  className = '',
  reverse = false,
  align = 'items-center',
  justify = 'justify-start',
  gap = 'gap-4',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  reverse?: boolean;
  align?: string;
  justify?: string;
  gap?: string;
}) {
  const { direction } = useRTL();

  // In RTL, flex-row automatically reverses visual order
  // flex-row-reverse in RTL becomes visually the same as flex-row in LTR
  const flexDirection = reverse
    ? direction === 'rtl'
      ? 'flex-row'
      : 'flex-row-reverse'
    : 'flex-row';

  return (
    <div
      className={`flex ${flexDirection} ${align} ${justify} ${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * RTL-aware icon container - flips icons in RTL
 */
export function FlippableIcon({
  children,
  flipInRTL = true,
  className = '',
}: {
  children: React.ReactNode;
  flipInRTL?: boolean;
  className?: string;
}) {
  const { isRTL } = useRTL();

  return (
    <span
      className={`inline-flex ${flipInRTL && isRTL ? 'scale-x-[-1]' : ''} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * RTL-aware card component
 */
export function Card({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * RTL-aware button with icon support
 */
export function Button({
  children,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}) {
  const { isRTL } = useRTL();

  // Flip icon position in RTL
  const actualIconPosition = isRTL
    ? iconPosition === 'left' ? 'right' : 'left'
    : iconPosition;

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {actualIconPosition === 'left' && icon && (
        <FlippableIcon>{icon}</FlippableIcon>
      )}
      {children}
      {actualIconPosition === 'right' && icon && (
        <FlippableIcon>{icon}</FlippableIcon>
      )}
    </button>
  );
}

/**
 * RTL-aware breadcrumb component
 */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  const { isRTL } = useRTL();

  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <FlippableIcon flipInRTL={true}>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </FlippableIcon>
            )}
            {item.href ? (
              <a
                href={item.href}
                className={`text-sm font-medium ${
                  index === items.length - 1
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {item.label}
              </a>
            ) : (
              <span
                className={`text-sm font-medium ${
                  index === items.length - 1
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * RTL-aware input with icon support
 */
export function Input({
  label,
  icon,
  error,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}) {
  const { isRTL } = useRTL();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
              isRTL ? 'right-3' : 'left-3'
            }`}
          >
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-2 rounded-lg border ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          } focus:ring-2 focus:outline-none dark:bg-gray-700 ${
            icon ? (isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4') : ''
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

/**
 * RTL-aware table component
 */
export function Table({
  headers,
  data,
  className = '',
}: {
  headers: { key: string; label: string }[];
  data: Record<string, any>[];
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header) => (
                <td
                  key={header.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                >
                  {row[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * RTL-aware modal/dialog component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full ${className}`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label={t('common.close') || 'Close'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Text direction aware component wrapper
 */
export function TextDir({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { direction } = useRTL();

  return (
    <span className={className} dir={direction} {...props}>
      {children}
    </span>
  );
}
