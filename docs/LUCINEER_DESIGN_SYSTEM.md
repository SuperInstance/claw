# Lucineer Design System

**Project:** Lucineer Hardware Acceleration Platform
**Last Updated:** 2026-03-14
**Status:** Production Reference

---

## Executive Summary

Lucineer uses a sophisticated cyberpunk aesthetic built on modern web technologies with a focus on accessibility, performance, and visual consistency. This design system serves as the reference for all SuperInstance properties.

---

## Technology Stack

- **Framework:** Next.js 15 with React 19
- **Styling:** Tailwind CSS 4.0 with custom CSS variables
- **Components:** shadcn/ui (Radix UI primitives)
- **Animations:** Framer Motion 12.23.2
- **Icons:** Lucide React 0.525.0
- **Fonts:** Geist Sans & Geist Mono (Google Fonts)

---

## Color Palette (OKLCH)

### Primary Colors
```css
--color-background:  oklch(0.08 0.01 145);     /* Very dark teal/green */
--color-foreground:  oklch(0.98 0.005 145);    /* Near-white */
--color-card:        oklch(0.12 0.01 145);     /* Dark surface */
```

### Accent Colors
```css
--color-primary:     oklch(0.72 0.19 145);     /* Bright teal/green */
--color-secondary:   oklch(0.18 0.02 145);     /* Muted teal */
--color-tertiary:    oklch(0.22 0.02 200);     /* Blue-leaning teal */
```

### UI Colors
```css
--color-muted:       oklch(0.18 0.01 145);     /* Subtle background */
--color-muted-text:  oklch(0.65 0.02 145);     /* Grayed text */
--color-accent:      oklch(0.72 0.19 145);     /* Bright accent */
--color-destructive: oklch(0.55 0.22 27);      /* Red-orange */
--color-border:      oklch(0.25 0.02 145);     /* Subtle borders */
--color-input:       oklch(0.20 0.02 145);     /* Form inputs */
--color-ring:        oklch(0.72 0.19 145);     /* Focus rings */
```

### Chart Colors
```css
--color-chart-1: oklch(0.72 0.19 145);        /* Primary green */
--color-chart-2: oklch(0.65 0.15 180);        /* Cyan */
--color-chart-3: oklch(0.70 0.18 90);         /* Yellow-green */
--color-chart-4: oklch(0.68 0.20 30);         /* Orange */
--color-chart-5: oklch(0.65 0.15 270);        /* Purple */
```

---

## Typography

### Font Families
```css
--font-sans:  'Geist', system-ui, sans-serif;
--font-mono:  'Geist Mono', 'Fira Code', monospace;
```

### Type Scale
```
Hero:        text-6xl (76px) / font-bold
Heading:     text-4xl (36px) / font-semibold
Subheading:  text-2xl (24px) / font-medium
Body:        text-base (16px) / font-normal
Small:       text-sm (14px) / font-normal
Micro:       text-xs (12px) / font-normal
```

---

## Border Radius System

```css
--radius-sm:  8px;
--radius-md:  10px;
--radius-lg:  12px;
--radius-xl:  16px;
--radius-2xl: 24px;
--radius-3xl: 32px;
```

---

## Spacing System

```css
--spacing-1:  4px;
--spacing-2:  8px;
--spacing-3:  12px;
--spacing-4:  16px;
--spacing-6:  24px;
--spacing-8:  32px;
--spacing-12: 48px;
--spacing-16: 64px;
--spacing-20: 80px;
```

---

## Component Patterns

### Primary Button
```tsx
<button className="flex items-center gap-2 w-full py-4 rounded-xl
  bg-gradient-to-r from-primary to-cyan-400 text-black
  font-bold text-lg hover:opacity-90">
  Button Text
</button>
```

### Secondary Button
```tsx
<button className="inline-flex items-center gap-2 px-8 py-4
  text-lg border-2 border-primary rounded-xl hover:bg-primary/10">
  Button Text
</button>
```

### Card
```tsx
<div className="bg-card border border-border rounded-2xl p-6">
  Card Content
</div>
```

### Interactive Card
```tsx
<div className="block group p-6 rounded-2xl bg-card
  border-2 border-primary/30 card-hover h-full">
  Card Content
</div>
```

### Badge
```tsx
<div className="inline-flex items-center gap-2 px-3 py-1.5
  bg-primary/10 rounded-full text-sm text-primary
  border border-primary/30">
  Badge Text
</div>
```

---

## Visual Effects

### Gradient Background
```css
.animated-gradient-bg {
  background: linear-gradient(-45deg,
    oklch(0.08 0.02 145),
    oklch(0.10 0.03 160),
    oklch(0.08 0.02 180),
    oklch(0.10 0.03 145)
  );
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
}
```

### Glow Effect
```css
.glow-green {
  box-shadow: 0 0 30px oklch(0.72 0.19 145 / 0.4),
              0 0 60px oklch(0.72 0.19 145 / 0.15);
}
```

### Gradient Border
```css
.border-gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg,
    oklch(0.72 0.19 145),
    oklch(0.65 0.18 230)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

---

## Animation Patterns (Framer Motion)

### Fade In Up
```tsx
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
```

### Stagger Children
```tsx
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

### Scale on Hover
```tsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

---

## Layout Patterns

### Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  Content
</div>
```

### Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  Grid Items
</div>
```

### Section
```tsx
<section className="py-20 px-4 sm:px-6 lg:px-8">
  Section Content
</section>
```

---

## Icon System

### Icon Containers
```tsx
// Small
<div className="w-10 h-10 rounded-lg bg-primary/10
  flex items-center justify-center">
  <Icon className="w-5 h-5 text-primary" />
</div>

// Large
<div className="w-14 h-14 rounded-xl bg-primary/10
  flex items-center justify-center">
  <Icon className="w-7 h-7 text-primary" />
</div>
```

---

## Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: oklch(0.10 0.01 145);
}

::-webkit-scrollbar-thumb {
  background: oklch(0.30 0.02 145);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: oklch(0.40 0.02 145);
}
```

---

## Accessibility Features

### Focus States
```css
*:focus-visible {
  outline: 2px solid oklch(0.72 0.19 145);
  outline-offset: 2px;
}
```

### High Contrast
All text meets WCAG AA standards with OKLCH color space.

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable or slow animations */
}
```

---

## Cyberpunk Aesthetic Elements

1. **Dark Mode First** - Near-black backgrounds (8% lightness)
2. **Neon Accent Colors** - Bright teal/green with glowing effects
3. **Terminal/Monospace Fonts** - Geist Mono for code
4. **Grid-Based Layouts** - Bento-box style cards
5. **Animated Backgrounds** - Slow-shifting gradients
6. **Glass Morphism** - Backdrop blur, semi-transparent backgrounds

---

## Adaptation for Business/Professional Use

### Toning Down Cyberpunk

**More Professional Background:**
```css
--background: oklch(0.12 0.005 145);  /* Lighter, less saturated */
```

**Muted Primary:**
```css
--primary: oklch(0.65 0.15 145);      /* Less saturated */
```

**Slower Animations:**
```css
transition: all 0.3s ease-in-out;  /* Was 0.5s */
```

**Subtler Glows:**
```css
box-shadow: 0 0 15px oklch(0.72 0.19 145 / 0.2);  /* Was 0.4 opacity */
```

---

## Key Takeaways

### What to Adopt
- OKLCH color system
- Component structure
- Border radius scale
- Spacing system
- Typography scale
- Lucide icons

### What to Adapt for Business
- Color saturation (more muted)
- Animation speed (slower)
- Gradient usage (fewer, subtle)
- Glow effects (optional, sparing)
- Copy tone (professional)

---

**Design System Version:** 1.0
**Last Updated:** 2026-03-14
