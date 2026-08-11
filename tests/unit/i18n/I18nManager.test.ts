/**
 * I18nManager Unit Tests
 * Testing internationalization, locale management, and translations
 */

import { I18nManager, Locale, TranslationResource } from '../../../src/i18n/I18nManager';

describe('I18nManager', () => {
  let i18n: I18nManager;

  beforeEach(() => {
    i18n = new I18nManager({
      defaultLocale: 'en-US',
      fallbackLocale: 'en-US',
      supportedLocales: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'],
      enableCache: true,
    });
  });

  afterEach(() => {
    i18n.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const defaultI18n = new I18nManager();
      expect(defaultI18n).toBeInstanceOf(I18nManager);
      defaultI18n.cleanup();
    });

    it('should initialize with custom config', () => {
      const customI18n = new I18nManager({
        defaultLocale: 'es-ES',
        fallbackLocale: 'en-US',
      });
      expect(customI18n).toBeInstanceOf(I18nManager);
      customI18n.cleanup();
    });

    it('should load default translations', async () => {
      await i18n.initialize();
      const locales = i18n.getLoadedLocales();
      expect(loales.length).toBeGreaterThan(0);
    });

    it('should validate supported locales', () => {
      expect(i18n.isLocaleSupported('en-US')).toBe(true);
      expect(i18n.isLocaleSupported('xx-XX')).toBe(false);
    });

    it('should set default locale', () => {
      i18n.setDefaultLocale('es-ES');
      expect(i18n.getDefaultLocale()).toBe('es-ES');
    });

    it('should throw error for unsupported default locale', () => {
      expect(() => {
        i18n.setDefaultLocale('xx-XX');
      }).toThrow('Unsupported locale');
    });
  });

  describe('Locale Detection', () => {
    it('should detect locale from browser', () => {
      const locale = i18n.detectLocale('en-US,en;q=0.9,es;q=0.8');
      expect(locale).toBe('en-US');
    });

    it('should fallback to default for unsupported locale', () => {
      const locale = i18n.detectLocale('xx-XX');
      expect(locale).toBe('en-US');
    });

    it('should parse Accept-Language header', () => {
      const locales = i18n.parseAcceptLanguage('en-US,en;q=0.9,es-ES;q=0.8');
      expect(locales).toEqual(['en-US', 'en', 'es-ES']);
    });

    it('should respect quality values', () => {
      const locale = i18n.detectLocale('en;q=0.5,es-ES;q=0.9');
      expect(locale).toBe('es-ES');
    });

    it('should detect locale from URL', () => {
      const locale = i18n.detectLocaleFromURL('/es/path');
      expect(locale).toBe('es-ES');
    });

    it('should detect locale from cookie', () => {
      const locale = i18n.detectLocaleFromCookie('locale=fr-FR');
      expect(locale).toBe('fr-FR');
    });

    it('should detect locale from localStorage', () => {
      localStorage.setItem('locale', 'de-DE');
      const locale = i18n.detectLocaleFromStorage();
      expect(locale).toBe('de-DE');
      localStorage.removeItem('locale');
    });
  });

  describe('Locale Switching', () => {
    beforeEach(async () => {
      await i18n.initialize();
    });

    it('should switch locale', async () => {
      await i18n.switchLocale('es-ES');
      expect(i18n.getCurrentLocale()).toBe('es-ES');
    });

    it('should load translations on switch', async () => {
      await i18n.switchLocale('fr-FR');
      const loaded = i18n.isLocaleLoaded('fr-FR');
      expect(loaded).toBe(true);
    });

    it('should emit locale change event', (done) => {
      i18n.on('localeChange', (newLocale: string) => {
        expect(newLocale).toBe('es-ES');
        done();
      });

      i18n.switchLocale('es-ES');
    });

    it('should persist locale to storage', async () => {
      await i18n.switchLocale('de-DE');
      const stored = localStorage.getItem('locale');
      expect(stored).toBe('de-DE');
    });

    it('should fallback to default for invalid locale', async () => {
      await expect(i18n.switchLocale('xx-XX' as any)).rejects.toThrow();
      expect(i18n.getCurrentLocale()).toBe('en-US');
    });
  });

  describe('Translation Retrieval', () => {
    beforeEach(async () => {
      await i18n.initialize();
    });

    it('should translate simple key', () => {
      const translated = i18n.t('common.yes');
      expect(translated).toBe('Yes');
    });

    it('should translate nested key', () => {
      const translated = i18n.t('common.submit');
      expect(translated).toBe('Submit');
    });

    it('should return key for missing translation', () => {
      const translated = i18n.t('missing.key');
      expect(translated).toBe('missing.key');
    });

    it('should interpolate variables', () => {
      const translated = i18n.t('greeting', { name: 'John' });
      expect(translated).toContain('John');
    });

    it('should handle pluralization', () => {
      const singular = i18n.t('items', { count: 1 });
      const plural = i18n.t('items', { count: 5 });

      expect(singular).not.toBe(plural);
    });

    it('should handle gender', () => {
      const male = i18n.t('actor', { gender: 'male' });
      const female = i18n.t('actor', { gender: 'female' });

      expect(male).not.toBe(female);
    });

    it('should support date formatting', () => {
      const date = new Date('2024-03-14');
      const formatted = i18n.formatDate(date);
      expect(formatted).toBeDefined();
    });

    it('should support number formatting', () => {
      const formatted = i18n.formatNumber(1234.56);
      expect(formatted).toContain(',');
    });

    it('should support currency formatting', () => {
      const formatted = i18n.formatCurrency(99.99, 'USD');
      expect(formatted).toContain('$');
    });

    it('should support percent formatting', () => {
      const formatted = i18n.formatPercent(0.85);
      expect(formatted).toContain('%');
    });

    it('should support relative time formatting', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 3600000);
      const formatted = i18n.formatRelativeTime(past);
      expect(formatted).toBeDefined();
    });
  });

  describe('Translation Loading', () => {
    it('should load translation file', async () => {
      await i18n.loadTranslations('es-ES', {
        common: {
          yes: 'Sí',
          no: 'No',
        },
      });

      const loaded = i18n.isLocaleLoaded('es-ES');
      expect(loaded).toBe(true);
    });

    it('should merge translations', async () => {
      await i18n.loadTranslations('es-ES', {
        common: { yes: 'Sí' },
      });

      await i18n.loadTranslations('es-ES', {
        common: { no: 'No' },
      });

      expect(i18n.t('common.yes', {}, 'es-ES')).toBe('Sí');
      expect(i18n.t('common.no', {}, 'es-ES')).toBe('No');
    });

    it('should load translations from URL', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        json: async () => ({
          common: { yes: 'Oui' },
        }),
      } as Response);

      await i18n.loadTranslationsFromURL('/locales/fr-FR.json', 'fr-FR');
      expect(fetchSpy).toHaveBeenCalledWith('/locales/fr-FR.json');

      fetchSpy.mockRestore();
    });

    it('should handle loading errors', async () => {
      await expect(
        i18n.loadTranslationsFromURL('/invalid/path', 'xx-XX')
      ).rejects.toThrow();
    });

    it('should cache loaded translations', async () => {
      await i18n.loadTranslations('de-DE', {
        common: { yes: 'Ja' },
      });

      const cached = i18n.hasCachedTranslations('de-DE');
      expect(cached).toBe(true);
    });
  });

  describe('Resource Management', () => {
    beforeEach(async () => {
      await i18n.initialize();
    });

    it('should add translation resource', () => {
      i18n.addResource('test', { key: 'value' });
      expect(i18n.t('test.key')).toBe('value');
    });

    it('should add resource to specific locale', () => {
      i18n.addResource('es-test', { clave: 'valor' }, 'es-ES');
      expect(i18n.t('es-test.clave', {}, 'es-ES')).toBe('valor');
    });

    it('should remove translation resource', () => {
      i18n.addResource('temp', { key: 'value' });
      i18n.removeResource('temp');
      expect(i18n.t('temp.key')).toBe('temp.key');
    });

    it('should check if resource exists', () => {
      i18n.addResource('exists', { key: 'value' });
      expect(i18n.hasResource('exists')).toBe(true);
      expect(i18n.hasResource('missing')).toBe(false);
    });

    it('should get all resources', () => {
      i18n.addResource('r1', { k1: 'v1' });
      i18n.addResource('r2', { k2: 'v2' });

      const resources = i18n.getResources();
      expect(Object.keys(resources)).toContain('r1');
      expect(Object.keys(resources)).toContain('r2');
    });
  });

  describe('Fallback Handling', () => {
    beforeEach(async () => {
      await i18n.initialize();
    });

    it('should fallback to default locale', () => {
      const translated = i18n.t('missing.key', {}, 'es-ES');
      expect(translated).toBe('missing.key');
    });

    it('should use fallback for missing keys', () => {
      i18n.addResource('common', { yes: 'Yes' }, 'en-US');

      const translated = i18n.t('common.yes', {}, 'es-ES');
      expect(translated).toBe('Yes');
    });

    it('should chain fallback locales', () => {
      const customI18n = new I18nManager({
        defaultLocale: 'en-US',
        fallbackLocales: ['es-ES', 'en-US'],
      });

      customI18n.addResource('test', { key: 'value' }, 'en-US');
      customI18n.cleanup();
    });
  });

  describe('Date and Time Formatting', () => {
    beforeEach(async () => {
      await i18n.initialize();
    });

    it('should format short date', () => {
      const date = new Date('2024-03-14');
      const formatted = i18n.formatDate(date, 'short');
      expect(formatted).toBeDefined();
    });

    it('should format long date', () => {
      const date = new Date('2024-03-14');
      const formatted = i18n.formatDate(date, 'long');
      expect(formatted).toBeDefined();
    });

    it('should format full date', () => {
      const date = new Date('2024-03-14');
      const formatted = i18n.formatDate(date, 'full');
      expect(formatted).toBeDefined();
    });

    it('should format time', () => {
      const date = new Date('2024-03-14T15:30:00');
      const formatted = i18n.formatTime(date);
      expect(formatted).toBeDefined();
    });

    it('should format date and time', () => {
      const date = new Date('2024-03-14T15:30:00');
      const formatted = i18n.formatDateTime(date);
      expect(formatted).toBeDefined();
    });

    it('should respect locale formatting', async () => {
      await i18n.switchLocale('de-DE');
      const date = new Date('2024-03-14');
      const formatted = i18n.formatDate(date);
      expect(formatted).toContain('2024');
    });
  });

  describe('Number Formatting', () => {
    beforeEach(async () => {
      await i18n.initialize();
    });

    it('should format integer', () => {
      const formatted = i18n.formatNumber(1234);
      expect(formatted).toBeDefined();
    });

    it('should format decimal', () => {
      const formatted = i18n.formatNumber(1234.56, { minimumFractionDigits: 2 });
      expect(formatted).toContain('.');
    });

    it('should format percentage', () => {
      const formatted = i18n.formatPercent(0.8543, { maximumFractionDigits: 2 });
      expect(formatted).toContain('%');
    });

    it('should format currency', () => {
      const formatted = i18n.formatCurrency(1234.56, 'USD');
      expect(formatted).toContain('$');
    });

    it('should format currency with symbol', () => {
      const formatted = i18n.formatCurrency(1234.56, 'EUR');
      expect(formatted).toContain('€');
    });

    it('should format large numbers', () => {
      const formatted = i18n.formatNumber(1000000);
      expect(formatted).toBeDefined();
    });

    it('should format small numbers', () => {
      const formatted = i18n.formatNumber(0.001);
      expect(formatted).toBeDefined();
    });
  });

  describe('Pluralization', () => {
    beforeEach(async () => {
      await i18n.initialize();
    });

    it('should handle singular form', () => {
      const translated = i18n.t('item', { count: 1 });
      expect(translated).toBeDefined();
    });

    it('should handle plural form', () => {
      const translated = i18n.t('item', { count: 2 });
      expect(translated).toBeDefined();
    });

    it('should handle zero', () => {
      const translated = i18n.t('item', { count: 0 });
      expect(translated).toBeDefined();
    });

    it('should handle language-specific plural rules', async () => {
      await i18n.switchLocale('ru-RU');
      const translated = i18n.t('item', { count: 5 });
      expect(translated).toBeDefined();
    });
  });

  describe('Caching', () => {
    it('should cache translations', async () => {
      await i18n.loadTranslations('cache-test', {
        common: { yes: 'Cached' },
      });

      const cached = i18n.hasCachedTranslations('cache-test');
      expect(cached).toBe(true);
    });

    it('should clear cache', async () => {
      await i18n.loadTranslations('temp', {
        common: { yes: 'Temp' },
      });

      i18n.clearCache();
      const cached = i18n.hasCachedTranslations('temp');
      expect(cached).toBe(false);
    });

    it('should disable caching', () => {
      const noCacheI18n = new I18nManager({
        enableCache: false,
      });

      noCacheI18n.cleanup();
    });
  });

  describe('Namespaces', () => {
    beforeEach(async () => {
      await i18n.initialize();
    });

    it('should load namespace', async () => {
      await i18n.loadNamespace('common');
      expect(i18n.isNamespaceLoaded('common')).toBe(true);
    });

    it('should load multiple namespaces', async () => {
      await i18n.loadNamespaces(['common', 'validation']);
      expect(i18n.isNamespaceLoaded('common')).toBe(true);
      expect(i18n.isNamespaceLoaded('validation')).toBe(true);
    });

    it('should translate from namespace', async () => {
      await i18n.loadNamespace('common');
      const translated = i18n.t('common:yes');
      expect(translated).toBeDefined();
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      await i18n.initialize();
    });

    it('should emit on locale change', (done) => {
      i18n.on('localeChange', (locale) => {
        expect(locale).toBe('es-ES');
        done();
      });

      i18n.switchLocale('es-ES');
    });

    it('should emit on translation loaded', (done) => {
      i18n.on('translationLoaded', (locale, namespace) => {
        expect(locale).toBe('fr-FR');
        done();
      });

      i18n.loadTranslations('fr-FR', { test: { key: 'value' } });
    });

    it('should emit on translation missing', (done) => {
      i18n.on('translationMissing', (key, locale) => {
        expect(key).toBe('missing.key');
        done();
      });

      i18n.t('missing.key');
    });

    it('should remove event listener', () => {
      const listener = jest.fn();
      i18n.on('localeChange', listener);
      i18n.off('localeChange', listener);

      i18n.switchLocale('es-ES');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translations gracefully', () => {
      const translated = i18n.t('completely.missing.key');
      expect(translated).toBe('completely.missing.key');
    });

    it('should handle invalid locale codes', () => {
      expect(() => {
        i18n.setDefaultLocale('INVALID' as any);
      }).toThrow();
    });

    it('should handle loading failures', async () => {
      await expect(
        i18n.loadTranslationsFromURL('/nonexistent', 'xx-XX')
      ).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should retrieve translations quickly', async () => {
      await i18n.initialize();

      const start = performance.now();
      i18n.t('common.yes');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10);
    });

    it('should batch load translations efficiently', async () => {
      const start = performance.now();
      await Promise.all([
        i18n.loadTranslations('l1', { k: 'v1' }),
        i18n.loadTranslations('l2', { k: 'v2' }),
        i18n.loadTranslations('l3', { k: 'v3' }),
      ]);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });
});
