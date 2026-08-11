# Accessibility Testing Suite

Comprehensive WCAG 2.1 Level AA accessibility testing infrastructure for Spreadsheet Moment platform.

---

## Overview

This testing suite provides automated and manual testing procedures to ensure WCAG 2.1 Level AA compliance across all Spreadsheet Moment platform components.

### Testing Coverage

- **Automated Testing:** axe-core, Pa11y, Puppeteer
- **Keyboard Navigation:** Tab order, focus management, shortcuts
- **Screen Readers:** NVDA, JAWS, VoiceOver, TalkBack
- **Visual Accessibility:** Color contrast, text scaling, high contrast
- **Cognitive Accessibility:** Error handling, clear language, consistency

---

## Quick Start

### Installation

```bash
cd website
npm install
```

### Run Tests

```bash
# Run all accessibility tests
npm run test:a11y:all

# Run specific test suite
npm run test:a11y        # Automated axe-core tests
npm run test:keyboard    # Keyboard navigation tests
npm run test:visual      # Visual accessibility tests
npm run test:pa11y       # Pa11y tests

# Run with custom URL
BASE_URL=https://staging.example.com npm run test:a11y
```

---

## Test Suites

### 1. Automated Accessibility Tests (accessibility.test.js)

**Purpose:** Comprehensive automated WCAG 2.1 Level AA testing

**Tools:** axe-core, Puppeteer

**Coverage:**
- All pages (Home, Features, Docs, Examples, Download)
- Multiple viewports (desktop, tablet, mobile)
- WCAG 2.1 Level AA rules

**Output:** JSON and HTML reports

**Run:**
```bash
npm run test:a11y
```

**Results:** `tests/accessibility/results/accessibility-results-{timestamp}.json`

---

### 2. Keyboard Navigation Tests (keyboard-navigation.test.js)

**Purpose:** Verify keyboard accessibility

**Tests:**
- Tab order verification
- Focus indicator visibility
- Skip navigation functionality
- Keyboard trap detection
- Enter key activation
- Escape key functionality
- Arrow key navigation

**Run:**
```bash
npm run test:keyboard
```

**Results:** `tests/accessibility/results/keyboard-results-{timestamp}.json`

---

### 3. Visual Accessibility Tests (visual-accessibility.test.js)

**Purpose:** Verify visual accessibility requirements

**Tests:**
- Color contrast ratios (4.5:1 text, 3:1 UI)
- Text scaling (200%)
- High contrast mode
- Reduced motion preference
- Focus indicator visibility
- Color independence

**Run:**
```bash
npm run test:visual
```

**Results:** `tests/accessibility/results/visual-results-{timestamp}.json`

---

### 4. Pa11y Tests (pa11y.config.js)

**Purpose:** Headless Chrome accessibility testing

**Coverage:**
- WCAG 2.1 Level AA
- Section 508
- Best practices

**Run:**
```bash
npm run test:pa11y
```

**Results:** `tests/accessibility/results/pa11y-report.{json,html}`

---

## Manual Testing

### Screen Reader Testing

See [Screen Reader Testing Guide](screen-reader-test-guide.md) for comprehensive testing procedures.

**Quick Start:**
1. Install NVDA (Windows) or enable VoiceOver (macOS)
2. Navigate to http://localhost:3000
3. Follow test scenarios in guide
4. Document results

### Keyboard Testing

**Procedure:**
1. Unplug mouse (or move it out of reach)
2. Navigate entire site with keyboard only
3. Test all interactive elements
4. Verify logical tab order
5. Check focus indicators visible

**Keyboard Shortcuts:**
- `Tab` - Next element
- `Shift+Tab` - Previous element
- `Enter` - Activate link/button
- `Space` - Toggle checkbox/button
- `Escape` - Close modal/dropdown
- `Arrow keys` - Navigate within components

---

## Configuration Files

### axe.config.js

Configuration for axe-core testing rules and tags.

**Key Settings:**
- WCAG 2.1 Level AA tags enabled
- Level AAA rules disabled
- Best practices enabled
- Custom rules configured

### pa11y.config.js

Configuration for Pa11y testing.

**Key Settings:**
- WCAG 2.1 Level AA standard
- Multiple viewport sizes
- Custom actions and waits
- HTML and JSON output

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd website
          npm ci
      - name: Build site
        run: |
          cd website
          npm run build
      - name: Start server
        run: |
          cd website
          npm run preview &
          npx wait-on http://localhost:4173
      - name: Run accessibility tests
        run: |
          cd website
          BASE_URL=http://localhost:4173 npm run test:a11y:all
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: accessibility-results
          path: tests/accessibility/results/
```

---

## Fixing Common Issues

### Missing Alt Text

**Issue:** Images lack alt attributes

**Fix:**
```jsx
// Before
<img src="/logo.png" />

// After
<img src="/logo.png" alt="Spreadsheet Moment logo" />
```

### Poor Color Contrast

**Issue:** Text or UI elements fail contrast requirements

**Fix:**
```css
/* Before */
--border-color: #e2e8f0; /* 1.2:1 - FAILS */

/* After */
--border-color: #94a3b8; /* 4.8:1 - PASSES */
```

### Missing Focus Indicators

**Issue:** Can't see where keyboard focus is

**Fix:**
```css
:focus-visible {
  outline: 3px solid #6366f1;
  outline-offset: 2px;
}
```

### No Skip Navigation Link

**Issue:** Must tab through entire navigation on each page

**Fix:**
```jsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<main id="main-content" tabIndex={-1}>
  {/* content */}
</main>
```

---

## WCAG 2.1 Level AA Checklist

See [WCAG 2.1 AA Checklist](wcag-21-aa-checklist.md) for complete checklist of all WCAG 2.1 Level AA success criteria.

**Quick Reference:**
- 1.1.1 Non-text Content
- 1.3.1 Info and Relationships
- 1.4.3 Contrast (Minimum)
- 1.4.11 Non-text Contrast
- 2.1.1 Keyboard
- 2.4.1 Bypass Blocks
- 2.4.2 Page Title
- 2.4.7 Focus Visible
- 3.1.1 Language of Page
- 4.1.2 Name, Role, Value

---

## Accessibility Statement

When your site achieves WCAG 2.1 Level AA compliance, create an accessibility statement:

```markdown
# Accessibility Statement

Spreadsheet Moment is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

## Compliance Status

We are partially conformant with WCAG 2.1 Level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.

## Known Issues

- [List known accessibility issues]
- [List planned fixes]

## Feedback

We welcome your feedback on the accessibility of Spreadsheet Moment. Please let us know if you encounter accessibility barriers:

Email: accessibility@superinstance.ai
```

---

## Resources

### Documentation
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Communities
- [WebAIM Mailing List](https://webaim.org/discussion/)
- [A11y Slack](https://web-a11y.slack.com/)
- [Accessibility Project](https://www.a11yproject.com/)

---

## Support

For questions about accessibility testing:

- **Email:** accessibility@superinstance.ai
- **Documentation:** See [ACCESSIBILITY_COMPLIANCE_REPORT.md](../../ACCESSIBILITY_COMPLIANCE_REPORT.md)
- **Issues:** Create issue in repository

---

**Remember:** Accessibility is not a one-time task but an ongoing commitment to inclusive design. Test early, test often, and involve users with disabilities in your testing process.
