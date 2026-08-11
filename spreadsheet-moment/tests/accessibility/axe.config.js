/**
 * axe-core Configuration for WCAG 2.1 Level AA Compliance
 * Spreadsheet Moment Platform
 *
 * This configuration enables all WCAG 2.1 Level AA rules and tags
 * for comprehensive accessibility testing.
 */

module.exports = {
  /**
   * axe-core rules configuration
   * https://www.deque.com/axe/dev-docs/
   */
  rules: {
    // Enable all WCAG 2.1 Level A rules
    'aria-labels': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'bypass': { enabled: true }, // Skip navigation
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: false }, // Level AAA
    'definition-list': { enabled: true },
    'dlitem': { enabled: true },
    'document-title': { enabled: true },
    'empty-heading': { enabled: true },
    'empty-id': { enabled: false }, // Best practice only
    'form-field-multiple-labels': { enabled: true },
    'frame-title': { enabled: true },
    'heading-order': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'image-alt': { enabled: true },
    'image-redundant-alt': { enabled: true },
    'input-button-name': { enabled: true },
    'label': { enabled: true },
    'landmark-banner-is-top-level': { enabled: true },
    'landmark-contentinfo-is-top-level': { enabled: true },
    'landmark-no-duplicate-banner': { enabled: true },
    'landmark-no-duplicate-contentinfo': { enabled: true },
    'landmark-one-main': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'meta-viewport': { enabled: true },
    'meta-viewport-large': { enabled: false }, // Level AAA
    'no-autoplay-audio': { enabled: true },
    'object-alt': { enabled: true },
    'p-as-heading': { enabled: false }, // Best practice
    'region': { enabled: true },

    // WCAG 2.1 Level AA rules
    'aria-conditional-comments': { enabled: true },
    'aria-deprecated-role': { enabled: true },
    'aria-progressbar-name': { enabled: true },
    'aria-prohibited-attr': { enabled: true },
    'aria-roledescription': { enabled: true },
    'aria-text': { enabled: true },
    'aria-toggle-field-name': { enabled: true },
    'aria-tooltip-is-tabbable': { enabled: true },
    'blink': { enabled: true },
    'valid-lang': { enabled: true },
    'css-orientation-lock': { enabled: true }, // 1.3.4 Orientation
    'focus-order-semantics': { enabled: true },
    'frame-tested': { enabled: true },
    'href-no-hash': { enabled: false }, // Best practice
    'identical-links-same-purpose': { enabled: true }, // 2.4.10
    'image-leading-letter': { enabled: true },
    'input-placeholder': { enabled: false }, // Best practice
    'label-content-only-with-placeholder': { enabled: false }, // Best practice
    'landmark-roles': { enabled: true },
    'legend-item': { enabled: true },
    'link-in-text-block': { enabled: true }, // 1.4.1
    'link-name': { enabled: true },
    'listobject': { enabled: true },
    'marquee': { enabled: true },
    'meta-refresh': { enabled: true },
    'meta-refresh-no-exceptions': { enabled: false }, // Level AAA
    'nested-interactive': { enabled: true },
    'no-empty-role': { enabled: true },
    'no-positive-tabindex': { enabled: true }, // 2.4.3
    'object-title': { enabled: true },
    'role-img-alt': { enabled: true },
    'scrollable-region-focusable': { enabled: true },
    'select-name': { enabled: true },
    'server-side-image-map': { enabled: true },
    'skip-link': { enabled: true }, // 2.4.1
    'tabindex': { enabled: true },
    'table-duplicate-name': { enabled: true },
    'table-fake-caption': { enabled: true },
    'target-size': { enabled: true }, // 2.5.5
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'valid-role': { enabled: true },
    'valid-scrollable-semantics': { enabled: true },
    'video-caption': { enabled: true },
    'video-description': { enabled: true },

    // WCAG 2.1 specific rules
    'aria-allowed-role': { enabled: true },
    'aria-braille-equivalent': { enabled: true },
    'aria-combobox-name': { enabled: true },
    'aria-dialog-focus': { enabled: true },
    'aria-grail': { enabled: true },
    'aria-grid-navigation': { enabled: true },
    'aria-input-text-name-label': { enabled: true },
    'aria-listbox-daily': { enabled: true },
    'aria-menuitem-role': { enabled: true },
    'aria-meter-name': { enabled: true },
    'aria-progressbar-name': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-tabs': { enabled: true },
    'aria-text': { enabled: true },
    'aria-treeitem-required': { enabled: true },

    // Best practice rules (optional)
    'accesskeys': { enabled: false },
    'avoid-inline-styles': { enabled: false },
    'css-regex': { enabled: false },
    'duplicate-id': { enabled: true },
    'empty-id': { enabled: false },
    'heading-level': { enabled: true },
    'hidden-explicit-label': { enabled: false },
    'image-map-title': { enabled: false },
    'implicit-label': { enabled: false },
    'input-label-valid': { enabled: false },
    'label-title-only': { enabled: false },
    'layout-table': { enabled: false },
    'scope-attr-valid': { enabled: true },
    'scrollable-region-focusable': { enabled: true },
    'unique-landmark': { enabled: true },
  },

  /**
   * Tag configuration
   * Tags group rules by standard or category
   */
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'section508', 'best-practice'],

  /**
   * Run only rules with these tags
   */
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21aa']
  },

  /**
   * Disable rules that produce false positives
   * for this specific application
   */
  disableOtherRules: false,

  /**
   * Report configuration
   */
  reporter: 'v2',

  /**
   * Result types to include
   */
  resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable'],

  /**
   * Element status
   */
  elementRef: true,
  ancestry: true,
  selectors: true,

  /**
   * Custom context for testing
   * Can be set to specific selectors or entire page
   */
  context: null,

  /**
   * Locale for error messages
   */
  locale: 'en-US'
};
