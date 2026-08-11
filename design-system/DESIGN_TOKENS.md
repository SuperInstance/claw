# Spreadsheet Moment - Design Tokens

## Design Token Philosophy

Design tokens are the visual atoms of our design system—the single source of truth for design decisions. They enable:

- **Consistency** - Unified visual language across platforms
- **Scalability** - Easy updates and maintenance
- **Collaboration** - Shared language between design and development
- **Theming** - Support for multiple themes (light, dark, high contrast)
- **Automation** - Automatic updates across platforms

---

## Token Structure

### Token Categories

1. **Color Tokens** - All color values
2. **Typography Tokens** - Font sizes, weights, line heights
3. **Spacing Tokens** - Margins, padding, gaps
4. **Size Tokens** - Widths, heights, border radii
5. **Motion Tokens** - Durations, easings, delays
6. **Shadow Tokens** - Box shadows, elevation
7. **Z-Index Tokens** - Layer stacking order

### Token Naming Convention

Format: `[category]-[subcategory]-[property]-[variant]`

Examples:
- `color-primary-default` - Primary color, default variant
- `spacing-sm` - Spacing, small variant
- `font-size-h1` - Font size, heading 1
- `motion-duration-fast` - Motion duration, fast variant

---

## Color Tokens

### Semantic Color Tokens

```css
:root {
  /* Primary Brand Color */
  --color-primary-default: #4F46E5;
  --color-primary-hover: #4338CA;
  --color-primary-active: #3730A3;
  --color-primary-disabled: #A5B4FC;
  --color-primary-light: #EEF2FF;
  --color-primary-dark: #312E81;

  /* Secondary Brand Color */
  --color-secondary-default: #0D9488;
  --color-secondary-hover: #0F766E;
  --color-secondary-active: #115E59;
  --color-secondary-disabled: #5EEAD4;
  --color-secondary-light: #F0FDFA;
  --color-secondary-dark: #134E4A;

  /* Accent Color */
  --color-accent-default: #F59E0B;
  --color-accent-hover: #D97706;
  --color-accent-active: #B45309;
  --color-accent-disabled: #FCD34D;
  --color-accent-light: #FFFBEB;
  --color-accent-dark: #78350F;

  /* Neutral Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #4B5563;
  --color-text-tertiary: #9CA3AF;
  --color-text-disabled: #D1D5DB;
  --color-text-inverse: #FFFFFF;

  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-bg-tertiary: #F3F4F6;
  --color-bg-elevated: #FFFFFF;
  --color-bg-overlay: rgba(0, 0, 0, 0.5);
  --color-bg-inverse: #111827;

  --color-border-default: #E5E7EB;
  --color-border-emphasis: #D1D5DB;
  --color-border-subtle: #F3F4F6;
  --color-border-inverse: #374151;

  /* Semantic Colors */
  --color-success-default: #10B981;
  --color-success-light: #D1FAE5;
  --color-success-dark: #065F46;

  --color-warning-default: #F97316;
  --color-warning-light: #FFEDD5;
  --color-warning-dark: #9A3412;

  --color-error-default: #EF4444;
  --color-error-light: #FEE2E2;
  --color-error-dark: #991B1B;

  --color-info-default: #3B82F6;
  --color-info-light: #DBEAFE;
  --color-info-dark: #1E40AF;
}

[data-theme="dark"] {
  --color-primary-default: #6366F1;
  --color-primary-hover: #818CF8;
  --color-primary-active: #4F46E5;
  --color-primary-disabled: #4338CA;
  --color-primary-light: #312E81;
  --color-primary-dark: #EEF2FF;

  --color-text-primary: #F9FAFB;
  --color-text-secondary: #9CA3AF;
  --color-text-tertiary: #6B7280;
  --color-text-disabled: #4B5563;
  --color-text-inverse: #111827;

  --color-bg-primary: #111827;
  --color-bg-secondary: #1F2937;
  --color-bg-tertiary: #374151;
  --color-bg-elevated: #1F2937;
  --color-bg-overlay: rgba(0, 0, 0, 0.7);
  --color-bg-inverse: #FFFFFF;

  --color-border-default: #374151;
  --color-border-emphasis: #4B5563;
  --color-border-subtle: #1F2937;
  --color-border-inverse: #E5E7EB;
}
```

---

## Typography Tokens

### Font Family Tokens

```css
:root {
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-secondary: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  --font-family-accent: 'Cal Sans', 'Inter', -apple-system, sans-serif;
}
```

### Font Size Tokens

```css
:root {
  --font-size-display-1: 4.5rem;        /* 72px */
  --font-size-display-2: 3.75rem;       /* 60px */
  --font-size-display-3: 3rem;          /* 48px */
  --font-size-h1: 2.5rem;               /* 40px */
  --font-size-h2: 2rem;                 /* 32px */
  --font-size-h3: 1.5rem;               /* 24px */
  --font-size-h4: 1.25rem;              /* 20px */
  --font-size-h5: 1rem;                 /* 16px */
  --font-size-h6: 0.875rem;             /* 14px */
  --font-size-body-large: 1.125rem;     /* 18px */
  --font-size-body: 1rem;               /* 16px */
  --font-size-body-small: 0.875rem;     /* 14px */
  --font-size-caption: 0.75rem;         /* 12px */
  --font-size-code: 0.875rem;           /* 14px */
}
```

### Font Weight Tokens

```css
:root {
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Line Height Tokens

```css
:root {
  --line-height-tight: 1.1;
  --line-height-snug: 1.2;
  --line-height-normal: 1.3;
  --line-height-relaxed: 1.4;
  --line-height-loose: 1.5;
  --line-height-code: 1.6;
}
```

### Letter Spacing Tokens

```css
:root {
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
  --letter-spacing-widest: 0.1em;
}
```

---

## Spacing Tokens

### Spacing Scale (Base 4px)

```css
:root {
  --spacing-0: 0;
  --spacing-px: 1px;
  --spacing-0_5: 0.125rem;    /* 2px */
  --spacing-1: 0.25rem;       /* 4px */
  --spacing-1_5: 0.375rem;    /* 6px */
  --spacing-2: 0.5rem;        /* 8px */
  --spacing-2_5: 0.625rem;    /* 10px */
  --spacing-3: 0.75rem;       /* 12px */
  --spacing-3_5: 0.875rem;    /* 14px */
  --spacing-4: 1rem;          /* 16px */
  --spacing-5: 1.25rem;       /* 20px */
  --spacing-6: 1.5rem;        /* 24px */
  --spacing-7: 1.75rem;       /* 28px */
  --spacing-8: 2rem;          /* 32px */
  --spacing-9: 2.25rem;       /* 36px */
  --spacing-10: 2.5rem;       /* 40px */
  --spacing-11: 2.75rem;      /* 44px */
  --spacing-12: 3rem;         /* 48px */
  --spacing-14: 3.5rem;       /* 56px */
  --spacing-16: 4rem;         /* 64px */
  --spacing-20: 5rem;         /* 80px */
  --spacing-24: 6rem;         /* 96px */
  --spacing-28: 7rem;         /* 112px */
  --spacing-32: 8rem;         /* 128px */
  --spacing-36: 9rem;         /* 144px */
  --spacing-40: 10rem;        /* 160px */
  --spacing-44: 11rem;        /* 176px */
  --spacing-48: 12rem;        /* 192px */
  --spacing-52: 13rem;        /* 208px */
  --spacing-56: 14rem;        /* 224px */
  --spacing-60: 15rem;        /* 240px */
  --spacing-64: 16rem;        /* 256px */
  --spacing-72: 18rem;        /* 288px */
  --spacing-80: 20rem;        /* 320px */
  --spacing-96: 24rem;        /* 384px */
}
```

### Semantic Spacing Tokens

```css
:root {
  /* Component Spacing */
  --spacing-component-xs: var(--spacing-1);    /* 4px */
  --spacing-component-sm: var(--spacing-2);    /* 8px */
  --spacing-component-md: var(--spacing-4);    /* 16px */
  --spacing-component-lg: var(--spacing-6);    /* 24px */
  --spacing-component-xl: var(--spacing-8);    /* 32px */

  /* Layout Spacing */
  --spacing-layout-sm: var(--spacing-4);       /* 16px */
  --spacing-layout-md: var(--spacing-8);       /* 32px */
  --spacing-layout-lg: var(--spacing-12);      /* 48px */
  --spacing-layout-xl: var(--spacing-16);      /* 64px */
  --spacing-layout-2xl: var(--spacing-24);     /* 96px */

  /* Section Spacing */
  --spacing-section-sm: var(--spacing-12);     /* 48px */
  --spacing-section-md: var(--spacing-16);     /* 64px */
  --spacing-section-lg: var(--spacing-24);     /* 96px */
  --spacing-section-xl: var(--spacing-32);     /* 128px */
}
```

---

## Size Tokens

### Border Radius Tokens

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;      /* 2px */
  --radius-md: 0.25rem;       /* 4px */
  --radius-lg: 0.5rem;        /* 8px */
  --radius-xl: 0.75rem;       /* 12px */
  --radius-2xl: 1rem;         /* 16px */
  --radius-3xl: 1.5rem;       /* 24px */
  --radius-full: 9999px;      /* Pill shape */
}
```

### Border Width Tokens

```css
:root {
  --border-width-none: 0;
  --border-width-thin: 1px;
  --border-width-normal: 2px;
  --border-width-thick: 4px;
}
```

### Component Size Tokens

```css
:root {
  /* Button Heights */
  --size-button-sm: 2rem;      /* 32px */
  --size-button-md: 2.5rem;    /* 40px */
  --size-button-lg: 3rem;      /* 48px */

  /* Input Heights */
  --size-input-sm: 2rem;       /* 32px */
  --size-input-md: 2.5rem;     /* 40px */
  --size-input-lg: 3rem;       /* 48px */

  /* Icon Sizes */
  --size-icon-xs: 1rem;        /* 16px */
  --size-icon-sm: 1.25rem;     /* 20px */
  --size-icon-md: 1.5rem;      /* 24px */
  --size-icon-lg: 2rem;        /* 32px */
  --size-icon-xl: 3rem;        /* 48px */

  /* Avatar Sizes */
  --size-avatar-xs: 1.5rem;    /* 24px */
  --size-avatar-sm: 2rem;      /* 32px */
  --size-avatar-md: 2.5rem;    /* 40px */
  --size-avatar-lg: 3.5rem;    /* 56px */
  --size-avatar-xl: 5rem;      /* 80px */

  /* Container Widths */
  --size-container-sm: 42rem;    /* 672px */
  --size-container-md: 48rem;    /* 768px */
  --size-container-lg: 64rem;    /* 1024px */
  --size-container-xl: 80rem;    /* 1280px */
  --size-container-2xl: 96rem;   /* 1536px */
}
```

---

## Motion Tokens

### Duration Tokens

```css
:root {
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  --duration-slowest: 1000ms;
}
```

### Easing Tokens

```css
:root {
  --easing-linear: linear;
  --easing-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Motion Presets

```css
:root {
  --motion-hover: var(--duration-fast) var(--easing-out);
  --motion-enter: var(--duration-normal) var(--easing-out);
  --motion-exit: var(--duration-fast) var(--easing-in);
  --motion-modal: var(--duration-slow) var(--easing-in-out);
  --motion-slide: var(--duration-normal) var(--easing-in-out);
}
```

---

## Shadow Tokens

### Elevation Shadows

```css
:root {
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  --shadow-none: 0 0 #0000;
}
```

### Semantic Shadow Tokens

```css
:root {
  --shadow-card: var(--shadow-sm);
  --shadow-card-hover: var(--shadow-md);
  --shadow-dropdown: var(--shadow-lg);
  --shadow-modal: var(--shadow-xl);
  --shadow-tooltip: var(--shadow-md);
  --shadow-popover: var(--shadow-lg);
}
```

---

## Z-Index Tokens

### Layer Stacking Order

```css
:root {
  --z-index-base: 0;
  --z-index-raised: 10;
  --z-index-dropdown: 100;
  --z-index-sticky: 200;
  --z-index-fixed: 300;
  --z-index-modal-backdrop: 400;
  --z-index-modal: 500;
  --z-index-popover: 600;
  --z-index-tooltip: 700;
  --z-index-toast: 800;
  --z-index-max: 9999;
}
```

---

## Breakpoint Tokens

### Responsive Breakpoints

```css
:root {
  --breakpoint-xs: 20rem;      /* 320px */
  --breakpoint-sm: 24rem;      /* 384px */
  --breakpoint-md: 30rem;      /* 480px */
  --breakpoint-lg: 48rem;      /* 768px */
  --breakpoint-xl: 64rem;      /* 1024px */
  --breakpoint-2xl: 80rem;     /* 1280px */
  --breakpoint-3xl: 96rem;     /* 1536px */
}
```

---

## Token Usage Examples

### CSS Usage

```css
.button-primary {
  background-color: var(--color-primary-default);
  color: var(--color-text-inverse);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  transition: all var(--motion-hover);
}

.button-primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}
```

### React/Styled Components Usage

```javascript
import styled from 'styled-components';

const PrimaryButton = styled.button`
  background-color: var(--color-primary-default);
  color: var(--color-text-inverse);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  transition: all var(--motion-hover);

  &:hover {
    background-color: var(--color-primary-hover);
    box-shadow: var(--shadow-md);
  }
`;
```

### Tailwind Integration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary-default)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
        },
        // ... other colors
      },
      spacing: {
        xs: 'var(--spacing-component-xs)',
        sm: 'var(--spacing-component-sm)',
        md: 'var(--spacing-component-md)',
        lg: 'var(--spacing-component-lg)',
        xl: 'var(--spacing-component-xl)',
      },
    },
  },
};
```

---

## Token Management

### Update Process

1. **Proposal**
   - Submit token change proposal
   - Include rationale and impact analysis
   - Design team reviews

2. **Testing**
   - Test token changes across components
   - Verify contrast ratios
   - Test in both light and dark modes

3. **Approval**
   - Design lead approval required
   - Document breaking changes
   - Create migration guide if needed

4. **Implementation**
   - Update token definitions
   - Update dependent components
   - Release with version bump

### Version Control

- Tokens are versioned with the design system
- Breaking changes require major version bump
- Maintain token change log
- Provide migration guides

---

## Token Best Practices

### Do's
✅ Use tokens instead of hardcoded values
✅ Follow token naming conventions
✅ Test tokens across all use cases
✅ Document token usage and intent
✅ Maintain semantic token aliases

### Don'ts
❌ Don't bypass tokens with hardcoded values
❌ Don't create arbitrary token values
❌ Don't use tokens for unintended purposes
❌ Don't modify tokens without proper process
❌ Don't create duplicate or redundant tokens

---

## Platform-Specific Tokens

### Web (CSS)
```css
:root {
  --platform-web-font-smoothing: antialiased;
  --platform-web-rendering: optimizeLegibility;
}
```

### Desktop (Tauri)
```css
:root {
  --platform-desktop-title-bar-height: 32px;
  --platform-desktop-border-radius: 8px;
}
```

### Mobile
```css
:root {
  --platform-mobile-min-touch-target: 44px;
  --platform-mobile-safe-area-top: env(safe-area-inset-top);
  --platform-mobile-safe-area-bottom: env(safe-area-inset-bottom);
}
```

---

## Token Accessibility

### Contrast Requirements
All color tokens must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 contrast ratio

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
    --motion-hover: none;
    --motion-enter: none;
    --motion-exit: none;
  }
}
```

---

## Evolution Strategy

### Phase 1: Launch (v1.0)
- Core token library (colors, spacing, typography)
- Light and dark theme support
- Basic documentation

### Phase 2: Expansion (v1.x)
- Add semantic token aliases
- Platform-specific tokens
- Enhanced documentation

### Phase 3: Maturity (v2.0)
- Advanced theming support
- Custom theme builder
- Token management tool

---

## Resources

### Design Tools
- Figma token library
- Sketch token library
- Design token parser

### Developer Resources
- Style Dictionary configuration
- Token transformation scripts
- Component library integration

### Documentation
- Token reference guide
- Token usage patterns
- Token best practices

---

**Last Updated:** 2026-03-15
**Version:** 1.0
**Owner:** Spreadsheet Moment Design System Team
