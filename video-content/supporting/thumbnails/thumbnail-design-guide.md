# POLLN Video Thumbnail Design Guide
**Professional thumbnail templates and design specifications**

---

## Design Specifications

### Technical Requirements
- **Resolution:** 1280x720 pixels (16:9 ratio)
- **Format:** JPG (recommended) or PNG
- **File Size:** Under 2MB (ideally under 500KB)
- **Color Space:** sRGB
- **Aspect Ratio:** 16:9

### Safe Zones
```
┌────────────────────────────────────┐
│         Safe Title Zone            │
│      (Avoid YouTube UI)           │
│  ┌──────────────────────────┐    │
│  │                            │    │
│  │     Content Area          │    │
│  │                            │    │
│  │                            │    │
│  └──────────────────────────┘    │
│                                   │
│  [Time] [Duration]     [Quality] │
└────────────────────────────────────┘
```

---

## Brand Guidelines

### Color Palette
```css
/* Primary Colors */
--polln-blue: #3B82F6;
--polln-green: #10B981;
--polln-purple: #8B5CF6;
--polln-orange: #F59E0B;

/* Neutral Colors */
--bg-dark: #0F172A;
--bg-card: #1E293B;
--text-primary: #F8FAFC;
--text-secondary: #94A3B8;

/* Accent Colors */
--accent-cyan: #06B6D4;
--accent-pink: #EC4899;
```

### Typography
- **Headings:** Inter, Roboto, or Montserrat
- **Weights:** Bold (700) or Extra Bold (800)
- **Case:** Title Case or UPPERCASE
- **Shadow:** Always use drop shadow for readability

---

## Thumbnail Templates

### Template 1: Tutorial/How-To
**Use Case:** Educational content, step-by-step guides

**Layout:**
```
┌────────────────────────────────────┐
│                                    │
│  [Screenshot/CODE]  [TEXT BLOCK]   │
│                                    │
│  "Build Your First Agent"          │
│  in 10 Minutes | POLLN Tutorial    │
│                                    │
└────────────────────────────────────┘
```

**Elements:**
- Left (40%): Screenshot or code snippet
- Right (60%): Text overlay on gradient
- Background: Dark gradient (top-left to bottom-right)
- Accent color: Blue border or highlight

**Example Text:**
- "Build Your First Agent"
- "POLLN in 10 Minutes"
- "Complete Getting Started Guide"

### Template 2: Feature Showcase
**Use Case:** Product features, capabilities

**Layout:**
```
┌────────────────────────────────────┐
│                                    │
│      [FEATURE ANIMATION]           │
│                                    │
│    Real-Time Collaboration         │
│         with POLLN                 │
│                                    │
└────────────────────────────────────┘
```

**Elements:**
- Center: Feature visualization or animation
- Bottom: Feature name + tagline
- Background: Solid brand color
- Overlay: Subtle pattern or grid

**Example Text:**
- "Real-Time Collaboration"
- "Federated Learning"
- "Unlimited Scaling"

### Template 3: Comparison/VS
**Use Case:** Before/after, comparisons

**Layout:**
```
┌────────────────────────────────────┐
│                                    │
│   [TRADITIONAL]     VS   [POLLN]   │
│                                    │
│      Centralized    →   Distributed │
│                                    │
└────────────────────────────────────┘
```

**Elements:**
- Split screen (50/50)
- Visual differentiation
- Arrow or VS in center
- Contrasting colors

### Template 4: Announcement/Launch
**Use Case:** Product launches, major updates

**Layout:**
```
┌────────────────────────────────────┐
│                                    │
│         [LOGO + GLOW]              │
│                                    │
│      POLLN v2.0 IS HERE           │
│    New Features + Performance     │
│                                    │
└────────────────────────────────────┘
```

**Elements:**
- Large, centered logo
- Glow effect or particles
- Bold announcement text
- Limited additional text

### Template 5: Interview/Talking Head
**Use Case:** Developer interviews, Q&A

**Layout:**
```
┌────────────────────────────────────┐
│                                    │
│  [PORTRAIT]   [QUOTE/NAME]        │
│                                    │
│  "Building the Future of AI"      │
│       with @devname               │
│                                    │
└────────────────────────────────────┘
```

**Elements:**
- Left: Portrait photo
- Right: Quote or name
- Background: Blurred version of portrait
- Accent: Color bar on side

---

## Design Principles

### High Contrast
- Always ensure text is readable
- Use dark backgrounds with light text
- Add drop shadows to text (always!)
- Test at small sizes

### Minimal Text
- Maximum 3-4 words per line
- Maximum 2 lines of text
- Use font size 80px+
- Omit unnecessary words

### Face Rule (When Applicable)
- Include human face when relevant
- Eye contact with camera
- Expressive emotion
- Crop above shoulders

### Bright Colors
- Use saturated colors
- Avoid muted or pastel tones
- High contrast between elements
- Brand colors for consistency

### Composition
- Rule of thirds for placement
- Balanced visual weight
- Clear focal point
- Negative space for readability

---

## Text Guidelines

### Effective Copy
```
✅ GOOD:
"Build Distributed AI in Minutes"
"10 POLLN Features You Need"
"Real-Time Agents Tutorial"

❌ BAD:
"How to build a distributed artificial intelligence system"
"Ten features of the POLLN platform"
"A tutorial about real-time agent systems"
```

### Copywriting Tips
1. **Be Specific:** Use numbers and timeframes
2. **Create Curiosity:** Hint at value inside
3. **Show Benefit:** What will viewers gain?
4. **Use Power Words:** Complete, Master, Ultimate
5. **Avoid Clickbait:** Deliver on promises

### Font Guidelines
- **Size:** 80-120px for main text
- **Weight:** Bold or Extra Bold
- **Color:** White (#FFFFFF) or brand color
- **Shadow:** Black, 60% opacity, 4px blur

---

## Image Assets

### Required Elements
- [ ] POLLN logo (SVG or high-res PNG)
- [ ] Screenshots (high quality, annotated)
- [ ] Code snippets (syntax highlighted)
- [ ] Architecture diagrams
- [ ] Team photos (for interviews)

### Stock Photography
When using stock photos:
- Choose diverse representation
- Authentic tech/settings
- Professional quality
- Proper licensing

### Screenshots
```bash
# Chrome screenshot
Cmd+Shift+4 (Mac) or Win+Shift+S (Windows)

# Recommended tools:
- CleanShot X (Mac)
- ShareX (Windows)
- Lightshot (Cross-platform)
```

**Screenshot Tips:**
- Use 2x or 3x resolution
- Clean up browser UI
- Highlight important elements
- Add subtle drop shadow

---

## Design Tools

### Free Tools
1. **Canva:** Drag-and-drop design
2. **Figma:** Professional design tool
3. **Photopea:** Browser-based Photoshop
4. **GIMP:** Open-source image editor

### Paid Tools (Recommended)
1. **Photoshop:** Industry standard
2. **Illustrator:** Vector graphics
3. **Sketch:** Mac design tool
4. **Affinity Photo:** One-time purchase

### Thumbnail Generators
- **TubeBuddy:** YouTube-specific
- **VidIQ:** YouTube optimization
- **Fotor:** Quick edits
- **Snappa:** Template-based

---

## Thumbnail Optimization

### A/B Testing
Test different versions:
- Different text
- Color variations
- Layout changes
- Image selections

**Tools:**
- TubeBuddy A/B testing
- VidIQ A/B testing
- YouTube Analytics comparison

### Platform Optimization

**YouTube (16:9):**
- Focus on title and main visual
- Optimize for homepage feed
- Test at small sizes

**Twitter (16:9):**
- Larger text for mobile
- Bold, simple visuals
- Clear call to action

**LinkedIn (16:9):**
- More professional tone
- Business-focused imagery
- Cleaner design

---

## Production Workflow

### Template Creation
1. Create base templates in Figma/Photoshop
2. Set up reusable components
3. Create style guide
4. Document naming conventions

### Thumbnail Creation Process
```
1. Brief: Define message and audience
2. Concept: Sketch 2-3 ideas
3. Design: Create in design tool
4. Review: Check against guidelines
5. Export: Optimize for web
6. Test: View at small sizes
7. Iterate: Make improvements
```

### Quality Checklist
- [ ] High contrast text
- [ ] Readable at small size
- [ ] On-brand colors
- [ ] Accurate representation
- [ ] Under 2MB file size
- [ ] Correct dimensions (1280x720)
- [ ] No typos or errors
- [ ] Optimized for mobile

---

## Examples

### Tutorial Thumbnail
```
Background: Dark gradient (blue to purple)
Left: Code snippet (40% width)
Right: "Build Your First
       Agent in 10 Minutes"
Accent: Green border
```

### Feature Thumbnail
```
Background: Solid blue
Center: Animated agent network
Bottom: "Real-Time Collaboration
        with CRDTs"
Accent: White text with shadow
```

### Comparison Thumbnail
```
Split: Left (gray), Right (blue)
Left: "Traditional AI"
Right: "POLLN Distributed"
Center: "VS" circle
Accent: Arrow pointing right
```

---

## Common Mistakes to Avoid

### Don't:
- ❌ Use low-resolution images
- ❌ Crowded text (too many words)
- ❌ Low contrast (hard to read)
- ❌ Misleading content (clickbait)
- ❌ Inconsistent branding
- ❌ Cluttered design

### Do:
- ✅ Keep it simple and bold
- ✅ Use high contrast
- ✅ Test at small sizes
- ✅ Maintain brand consistency
- ✅ Deliver on promises
- ✅ Focus on one main idea

---

This guide ensures consistent, professional thumbnails that accurately represent POLLN and attract viewers across all platforms.