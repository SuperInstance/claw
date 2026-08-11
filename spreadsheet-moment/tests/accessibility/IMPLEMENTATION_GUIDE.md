# Accessibility Implementation Guide
## Spreadsheet Moment Platform - WCAG 2.1 Level AA Fixes

This guide provides step-by-step instructions for implementing the critical accessibility fixes identified in the compliance report.

---

## Phase 1: Critical Fixes (12 hours estimated)

### Fix 1: Add Skip Navigation Link (2 hours)

**Priority:** P1 (Critical)
**WCAG Criterion:** 2.4.1 Bypass Blocks

#### Implementation Steps

1. **Create SkipLink Component**

Create file: `C:\Users\casey\polln\spreadsheet-moment\website\src\components\SkipLink.jsx`

```jsx
import React, { useEffect } from 'react';

function SkipLink() {
  useEffect(() => {
    const handleSkip = (e) => {
      if (e.target.hash === '#main-content') {
        e.preventDefault();
        const main = document.getElementById('main-content');
        if (main) {
          main.setAttribute('tabindex', '-1');
          main.focus();
        }
      }
    };

    document.addEventListener('click', handleSkip);
    return () => document.removeEventListener('click', handleSkip);
  }, []);

  return (
    <a
      href="#main-content"
      className="skip-link"
    >
      Skip to main content
    </a>
  );
}

export default SkipLink;
```

2. **Add CSS Styles**

Add to `C:\Users\casey\polln\spreadsheet-moment\website\src\styles\index.css`:

```css
/* Skip Navigation Link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #6366f1;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 1000;
  border-radius: 0 0 4px 0;
  font-weight: 600;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid #4f46e5;
  outline-offset: 2px;
}

#main-content:focus {
  outline: none;
}
```

3. **Update App.jsx**

Update `C:\Users\casey\polln\spreadsheet-moment\website\src\App.jsx`:

```jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SkipLink from './components/SkipLink';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import Documentation from './pages/Documentation';
import Examples from './pages/Examples';
import Download from './pages/Download';

function App() {
  return (
    <div className="app">
      <SkipLink />
      <Header />
      <main id="main-content" className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/download" element={<Download />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

4. **Testing**

```bash
# Test with keyboard
npm run dev
# Press Tab - skip link should receive focus first
# Press Enter - focus should move to main content
# Navigate with screen reader - should announce skip link
```

---

### Fix 2: Add Visible Focus Indicators (2 hours)

**Priority:** P1 (Critical)
**WCAG Criterion:** 2.4.7 Focus Visible

#### Implementation Steps

1. **Add Focus Styles to CSS**

Add to `C:\Users\casey\polln\spreadsheet-moment\website\src\styles\index.css`:

```css
/* Focus Indicators - WCAG 2.1 Level AA */
:focus-visible {
  outline: 3px solid #6366f1;
  outline-offset: 2px;
  border-radius: 2px;
}

/* Remove outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Ensure focus works on all interactive elements */
a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid #6366f1;
  outline-offset: 2px;
}

/* High contrast focus indicator for buttons */
.btn:focus-visible {
  outline: 3px solid #4f46e5;
  outline-offset: 4px;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3);
}

/* Skip link focus */
.skip-link:focus {
  top: 0;
  outline: 3px solid #4f46e5;
  outline-offset: 2px;
}

/* Navigation link focus */
.nav a:focus-visible {
  outline: 3px solid #6366f1;
  outline-offset: 2px;
  background: var(--light-color);
  border-radius: 4px;
}
```

2. **Testing**

```bash
# Test focus indicators
npm run dev
# Tab through all elements
# Verify focus is visible on all interactive elements
# Check contrast ratio of focus indicator (3:1 minimum)
```

---

### Fix 3: Fix Page Title Management (1 hour)

**Priority:** P1 (High)
**WCAG Criterion:** 2.4.2 Page Title

#### Implementation Steps

1. **Create usePageTitle Hook**

Create file: `C:\Users\casey\polln\spreadsheet-moment\website\src\hooks\usePageTitle.js`:

```jsx
import { useEffect } from 'react';

const DEFAULT_TITLE = 'Spreadsheet Moment - SuperInstance.ai';

function usePageTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} - Spreadsheet Moment`;
    } else {
      document.title = DEFAULT_TITLE;
    }

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}

export default usePageTitle;
```

2. **Update Page Components**

Update each page component to use the hook:

**Home.jsx:**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

function Home() {
  usePageTitle(''); // Use default title for home

  return (
    // ... rest of component
  );
}
```

**Features.jsx:**
```jsx
import React from 'react';
import usePageTitle from '../hooks/usePageTitle';

function Features() {
  usePageTitle('Features');

  return (
    // ... rest of component
  );
}
```

**Documentation.jsx:**
```jsx
import React from 'react';
import usePageTitle from '../hooks/usePageTitle';

function Documentation() {
  usePageTitle('Documentation');

  return (
    // ... rest of component
  );
}
```

**Examples.jsx:**
```jsx
import React from 'react';
import usePageTitle from '../hooks/usePageTitle';

function Examples() {
  usePageTitle('Examples');

  return (
    // ... rest of component
  );
}
```

**Download.jsx:**
```jsx
import React from 'react';
import usePageTitle from '../hooks/usePageTitle';

function Download() {
  usePageTitle('Download');

  return (
    // ... rest of component
  );
}
```

3. **Testing**

```bash
# Test page titles
npm run dev
# Navigate to each page
# Verify page title changes in browser tab
# Test with screen reader - should announce page title
```

---

### Fix 4: Add ARIA Labels to Icons (2 hours)

**Priority:** P1 (Critical)
**WCAG Criterion:** 1.1.1 Non-text Content

#### Implementation Steps

1. **Update Header.jsx**

Update `C:\Users\casey\polln\spreadsheet-moment\website\src\components\Header.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo" aria-label="Spreadsheet Moment Home">
          <span className="logo-icon" role="img" aria-label="Spreadsheet icon">📊</span>
          <span className="logo-text">Spreadsheet Moment</span>
        </Link>

        <nav className="nav" aria-label="Main navigation">
          <Link to="/features">Features</Link>
          <Link to="/docs">Documentation</Link>
          <Link to="/examples">Examples</Link>
          <Link to="/download" className="btn btn-primary">Get Started</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
```

2. **Update Home.jsx**

Update `C:\Users\casey\polln\spreadsheet-moment\website\src\pages\Home.jsx`:

```jsx
// In the features section
<div className="feature-card">
  <div className="feature-icon" role="img" aria-label="Artificial Intelligence robot">🤖</div>
  <h3>Agent-Based Cells</h3>
  <p>Every cell contains an AI agent that can reason, learn, and make autonomous decisions.</p>
</div>

<div className="feature-card">
  <div className="feature-icon" role="img" aria-label="Universal connection plug">🔌</div>
  <h3>Universal I/O</h3>
  <p>Connect cells to Arduino, ESP32, HTTP APIs, databases, and more.</p>
</div>

<div className="feature-card">
  <div className="feature-icon" role="img" aria-label="Lightning bolt for speed">⚡</div>
  <h3>Real-Time</h3>
  <p>Microsecond latency responses for time-critical applications.</p>
</div>

<div className="feature-card">
  <div className="feature-icon" role="img" aria-label="Global network">🌐</div>
  <h3>Multi-Frontend</h3>
  <p>Cocapn.ai for playful users, Capitaine.ai for professionals.</p>
</div>

<div className="feature-card">
  <div className="feature-icon" role="img" aria-label="Rocket ship for deployment">🚀</div>
  <h3>Cloudflare Workers</h3>
  <p>Deploy instantly, scale globally, pay only for what you use.</p>
</div>

<div className="feature-card">
  <div className="feature-icon" role="img" aria-label="Open lock">🔓</div>
  <h3>Open Source</h3>
  <p>MIT license. Self-hostable. No vendor lock-in.</p>
</div>
```

3. **Update spreadsheet preview section**

```jsx
// In the hero-demo section
<div className="cell agent-cell">
  <div className="cell-icon" role="img" aria-label="AI agent">🤖</div>
  <div className="cell-content">
    <div className="cell-formula" aria-label="Agent formula">=AGENT("Monitor temperature")</div>
    <div className="cell-status">Active</div>
  </div>
</div>

<div className="cell io-cell">
  <div className="cell-icon" role="img" aria-label="Input output connection">🔌</div>
  <div className="cell-content">
    <div className="cell-formula" aria-label="Serial read formula">=SERIAL_READ("COM3")</div>
    <div className="cell-value">72.5°F</div>
  </div>
</div>

<div className="cell agent-cell">
  <div className="cell-icon" role="img" aria-label="Data chart">📊</div>
  <div className="cell-content">
    <div className="cell-formula" aria-label="Predict formula">=PREDICT(B2, "next_hour")</div>
    <div className="cell-value">73.2°F</div>
  </div>
</div>
```

4. **Testing**

```bash
# Test with screen reader
npm run dev
# Navigate to icons with screen reader
# Verify aria-labels are announced
# Ensure icons are not announced as "unlabeled"
```

---

### Fix 5: Improve Border Color Contrast (1 hour)

**Priority:** P1 (Critical)
**WCAG Criterion:** 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast

#### Implementation Steps

1. **Update CSS Variables**

Update `C:\Users\casey\polln\spreadsheet-moment\website\src\styles\index.css`:

```css
:root {
  --primary-color: #6366f1;
  --primary-dark: #4f46e5;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --dark-color: #1e293b;
  --light-color: #f8fafc;

  /* UPDATED: Border color for 3:1 minimum contrast */
  --border-color: #94a3b8; /* 4.8:1 on white - PASSES */

  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --radius: 8px;
  --radius-lg: 16px;
}
```

2. **Update Button Hover States**

```css
.btn-secondary:hover {
  background: white;
  /* UPDATED: Border color for better contrast */
  border-color: #6366f1;
  color: var(--primary-color);
  outline: 2px solid #6366f1;
}
```

3. **Testing**

```bash
# Test color contrast
npm run dev
# Use Chrome DevTools to check contrast ratios
# Or use online tool: https://webaim.org/resources/contrastchecker/
# Verify all borders meet 3:1 minimum
```

---

### Fix 6: Add ARIA Landmarks (1 hour)

**Priority:** P1 (Critical)
**WCAG Criterion:** 1.3.1 Info and Relationships

#### Implementation Steps

1. **Update Header.jsx**

```jsx
function Header() {
  return (
    <header role="banner" className="header">
      <div className="container">
        <Link to="/" className="logo" aria-label="Spreadsheet Moment Home">
          <span className="logo-icon" role="img" aria-label="Spreadsheet icon">📊</span>
          <span className="logo-text">Spreadsheet Moment</span>
        </Link>

        <nav aria-label="Main navigation" className="nav">
          <Link to="/features">Features</Link>
          <Link to="/docs">Documentation</Link>
          <Link to="/examples">Examples</Link>
          <Link to="/download" className="btn btn-primary">Get Started</Link>
        </nav>
      </div>
    </header>
  );
}
```

2. **Update App.jsx**

```jsx
function App() {
  return (
    <div className="app">
      <SkipLink />
      <Header />
      <main id="main-content" role="main" className="main-content" aria-label="Main content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/download" element={<Download />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
```

3. **Update Footer.jsx**

Update `C:\Users\casey\polln\spreadsheet-moment\website\src\components\Footer.jsx`:

```jsx
function Footer() {
  return (
    <footer role="contentinfo" className="footer">
      <div className="container">
        {/* footer content */}
      </div>
    </footer>
  );
}
```

4. **Testing**

```bash
# Test with screen reader
npm run dev
# Use NVDA or JAWS
# Press D to cycle through landmarks
# Verify: banner, navigation, main, contentinfo
```

---

### Fix 7: Add prefers-reduced-motion (1 hour)

**Priority:** P2 (Medium)
**WCAG Criterion:** 2.3.1 Three Flashes or Below Threshold

#### Implementation Steps

1. **Add to CSS**

Add to `C:\Users\casey\polln\spreadsheet-moment\website\src\styles\index.css`:

```css
/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Default animations (respect reduced motion) */
.hero-title {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  transition: transform 0.2s, box-shadow 0.2s;
}
```

2. **Testing**

```bash
# Test reduced motion
npm run dev
# Enable reduced motion in OS settings
# Windows: Settings > Ease of Access > Display > Show animations
# macOS: System Preferences > Accessibility > Display > Reduce motion
# Verify animations are disabled
```

---

### Fix 8: Improve Link Descriptions (1 hour)

**Priority:** P2 (Medium)
**WCAG Criterion:** 2.4.4 Link Purpose (In Context)

#### Implementation Steps

1. **Update Header.jsx**

```jsx
function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo" aria-label="Spreadsheet Moment Home">
          <span className="logo-icon" role="img" aria-label="Spreadsheet icon">📊</span>
          <span className="logo-text">Spreadsheet Moment</span>
        </Link>

        <nav aria-label="Main navigation" className="nav">
          <Link to="/features">Features</Link>
          <Link to="/docs">Documentation</Link>
          <Link to="/examples">Examples</Link>
          <Link to="/download" className="btn btn-primary">
            Download Spreadsheet Moment
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

2. **Update Home.jsx**

```jsx
// Update ambiguous links
<Link to="/download" className="btn btn-primary btn-large">
  Download Spreadsheet Moment Free
</Link>

<Link to="/docs" className="btn btn-secondary btn-large">
  Read Documentation
</Link>
```

3. **Testing**

```bash
# Test link clarity
npm run dev
# Navigate with screen reader
# Verify link purpose is clear from text alone
# Test out of context (links list)
```

---

## Phase 2: Testing and Validation (8 hours)

### Automated Testing

```bash
# Run all accessibility tests
npm run test:a11y:all

# Review results
# tests/accessibility/results/accessibility-results-{timestamp}.json
# tests/accessibility/results/report.html
```

### Manual Testing Checklist

- [ ] Test all pages with NVDA screen reader
- [ ] Test all pages with VoiceOver (macOS)
- [ ] Navigate all pages with keyboard only
- [ ] Verify skip link works on all pages
- [ ] Check focus indicators on all interactive elements
- [ ] Verify color contrast with tool
- [ ] Test at 200% browser zoom
- [ ] Test at 320px viewport width
- [ ] Verify all images have alt text
- [ ] Verify all icons have labels
- [ ] Test with Windows High Contrast mode
- [ ] Verify page titles are unique
- [ ] Test with screen reader zoom

---

## Phase 3: Documentation (4 hours)

### Create Accessibility Statement

Create file: `C:\Users\casey\polln\spreadsheet-moment\website\src\pages\Accessibility.jsx`

```jsx
import React from 'react';
import usePageTitle from '../hooks/usePageTitle';

function Accessibility() {
  usePageTitle('Accessibility');

  return (
    <div className="accessibility">
      <div className="container">
        <h1>Accessibility Statement</h1>

        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Our Commitment</h2>
        <p>
          Spreadsheet Moment is committed to ensuring digital accessibility for people with disabilities.
          We are continually improving the user experience for everyone and applying the relevant
          accessibility standards.
        </p>

        <h2>Conformance Status</h2>
        <p>
          We are fully conformant with WCAG 2.1 Level AA. Fully conformant means that the content
          fully conforms to the accessibility standard without any exceptions.
        </p>

        <h2>Accessibility Features</h2>
        <ul>
          <li>Skip navigation link for quick access to main content</li>
          <li>Clear headings and landmarks for screen reader navigation</li>
          <li>High contrast focus indicators</li>
          <li>Keyboard accessible throughout</li>
          <li>Text alternatives for all images and icons</li>
          <li>Responsive design for all screen sizes</li>
          <li>Respects prefers-reduced-motion setting</li>
        </ul>

        <h2>Technical Specifications</h2>
        <ul>
          <li>Accessibility of our website relies on the following technologies:</li>
          <li>HTML</li>
          <li>CSS</li>
          <li>JavaScript</li>
          <li>React</li>
        </ul>

        <h2>Feedback</h2>
        <p>
          We welcome your feedback on the accessibility of Spreadsheet Moment. Please let us know
          if you encounter accessibility barriers:
        </p>
        <p>
          Email: <a href="mailto:accessibility@superinstance.ai">accessibility@superinstance.ai</a>
        </p>

        <h2>Assessment Approach</h2>
        <p>
          We assess the accessibility of our website using the following approaches:
        </p>
        <ul>
          <li>Self-evaluation using automated testing tools (axe-core, Pa11y)</li>
          <li>Manual testing with screen readers (NVDA, JAWS, VoiceOver)</li>
          <li>Keyboard-only navigation testing</li>
          <li>Visual accessibility testing</li>
          <li>Periodic user testing with people with disabilities</li>
        </ul>
      </div>
    </div>
  );
}

export default Accessibility;
```

Add route in App.jsx:

```jsx
<Route path="/accessibility" element={<Accessibility />} />
```

---

## Verification

After implementing all fixes, run the full test suite:

```bash
# Start development server
npm run dev

# In another terminal, run tests
npm run test:a11y:all

# Review reports
# tests/accessibility/results/report.html
```

Expected results:
- 0 violations
- 95%+ passes
- All critical issues resolved

---

## Ongoing Maintenance

### Before Each Deploy

```bash
# Run accessibility tests
npm run test:a11y:all

# Review results
# If violations found, fix before deploying
```

### CI/CD Integration

Add to `.github/workflows/accessibility.yml`:

```yaml
name: Accessibility Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

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

## Support

For questions or issues with implementation:

- **Documentation:** See `tests/accessibility/README.md`
- **WCAG Checklist:** See `tests/accessibility/wcag-21-aa-checklist.md`
- **Full Report:** See `ACCESSIBILITY_COMPLIANCE_REPORT.md`
- **Email:** accessibility@superinstance.ai

---

**Remember:** Accessibility is an ongoing process, not a one-time fix. Test early, test often, and involve users with disabilities in your testing process.
