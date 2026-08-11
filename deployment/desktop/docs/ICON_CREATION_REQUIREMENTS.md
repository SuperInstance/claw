# Icon Creation Requirements - Desktop Application

## Overview

This document outlines the icon creation requirements for the Spreadsheet Moment Desktop application v1.0.0 release.

## Current Status

**Status**: Icons are development placeholders
**Priority**: High - Required for professional release
**Deadline**: Before v1.0.1 release

---

## Icon Specifications

### Required Icons

#### PNG Icons (Universal)
- **32x32.png** - 32×32 pixels, for small displays
- **128x128.png** - 128×128 pixels, standard size
- **128x128@2x.png** - 256×256 pixels, Retina/High-DPI displays
- **icon.png** - 512×512 pixels, Linux and general use

#### Windows-Specific
- **icon.ico** - Windows icon format containing multiple sizes:
  - 16×16
  - 32×32
  - 48×48
  - 256×256

#### macOS-Specific
- **icon.icns** - macOS icon format containing multiple sizes:
  - 16×16
  - 32×32
  - 128×128
  - 256×256
  - 512×512
  - 1024×1024

---

## Design Guidelines

### Visual Style

The Spreadsheet Moment icon should reflect:
- **Professional spreadsheet functionality**
- **AI-powered capabilities**
- **Modern, clean design**
- **Cross-platform compatibility**

### Color Palette

#### Primary Colors
- **Blue**: #3B82F6 (RGB: 59, 130, 246) - Trust and technology
- **Green**: #10B981 (RGB: 16, 185, 129) - Data and success

#### Accent Colors
- **Amber**: #F59E0B (RGB: 245, 158, 11) - Highlights and important elements

#### Dark Mode Support
- Provide versions optimized for both light and dark backgrounds
- Ensure good contrast in both modes

### Design Concepts

#### Concept 1: Grid-Based Design
- Spreadsheet grid pattern
- Subtle gradient or texture
- Clean, minimalist approach
- Modern flat design

#### Concept 2: Data Visualization
- Chart or graph integrated with grid
- Dynamic, visual representation
- Emphasizes analytical capabilities

#### Concept 3: AI Integration
- Circuit patterns or neural network hints
- Futuristic, tech-forward design
- Emphasizes AI capabilities

#### Concept 4: Document Metaphor
- File or document with grid overlay
- Familiar, accessible design
- Easy to recognize

---

## Technical Requirements

### File Formats

#### PNG Requirements
- **Format**: PNG-24 with alpha channel
- **Transparency**: Required for 32×32 and 128×128
- **Compression**: Optimize for file size
- **Color depth**: 24-bit RGB + 8-bit alpha

#### ICO Requirements (Windows)
- **Format**: ICO with embedded PNG
- **Sizes**: Multi-resolution (16, 32, 48, 256)
- **Compression**: Uncompressed or PNG compressed
- **Color depth**: 32-bit (RGBA)

#### ICNS Requirements (macOS)
- **Format**: ICNS (Apple Icon Format)
- **Sizes**: Multi-resolution (16 to 1024)
- **Compression**: PNG compression
- **Retina support**: Required (@2x versions)

### Size Specifications

#### Small Sizes (16-48px)
- **Must be recognizable** at small sizes
- **Simplified design** - avoid fine details
- **High contrast** - for visibility
- **Clear shapes** - no ambiguity

#### Medium Sizes (128-256px)
- **Moderate detail** - show more features
- **Better clarity** - smoother curves
- **Balanced design** - not too simple or complex

#### Large Sizes (512-1024px)
- **Full detail** - showcase design elements
- **Smooth gradients** - professional finish
- **Crisp edges** - vector-like quality

---

## Creation Process

### Step 1: Design Master Icon
1. **Create** 1024×1024 pixel canvas
2. **Design** using vector shapes (SVG, AI, etc.)
3. **Export** as SVG for scalability
4. **Test** at various sizes

### Step 2: Create Size Variants
1. **Resize** master icon to required sizes
2. **Optimize** each size for clarity
3. **Adjust** details for smaller sizes
4. **Test** on different backgrounds

### Step 3: Platform-Specific Formats

#### Windows ICO
```bash
# Using ImageMagick
magick convert icon.svg \
  \( -clone 0 -resize 16x16 \) \
  \( -clone 0 -resize 32x32 \) \
  \( -clone 0 -resize 48x48 \) \
  \( -clone 0 -resize 256x256 \) \
  -delete 0 -alpha on -colors 256 icon.ico
```

#### macOS ICNS
```bash
# Create iconset directory
mkdir icon.iconset

# Generate all required sizes
sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png

# Convert to ICNS (macOS only)
iconutil -c icns icon.iconset
```

### Step 4: Testing
1. **Visual test** - View at actual sizes
2. **Platform test** - Test on each OS
3. **Background test** - Test on light/dark backgrounds
4. **Context test** - Test in file manager, dock, etc.

---

## Tools & Resources

### Professional Tools
1. **Adobe Illustrator** - Vector design
2. **Sketch** - macOS design tool
3. **Figma** - Collaborative design
4. **Affinity Designer** - Professional vector design

### Free/Open Source Tools
1. **Inkscape** - Free vector graphics editor
2. **GIMP** - Free image editor
3. **Krita** - Free digital painting
4. **Photopea** - Free online photo editor

### Command Line Tools
1. **ImageMagick** - Command-line image processing
2. **png2ico** - Convert PNG to ICO
3. **iconutil** - Convert to ICNS (macOS)

### Online Converters
1. **CloudConvert** - https://cloudconvert.com/
2. **ICO Convert** - https://icoconvert.com/
3. **ConvertICO** - https://convertico.com/

---

## Design Inspiration

### Spreadsheet Icons
- **Google Sheets** - Clean, green, grid-based
- **Microsoft Excel** - Professional, green X
- **Apple Numbers** - Modern, table-like
- **LibreOffice Calc** - Simple, spreadsheet metaphor

### AI/Tech Icons
- **ChatGPT** - Clean, modern, friendly
- **Notion** - Minimalist, geometric
- **Figma** - Colorful, creative
- **Linear** - Professional, gradient

### Icon Resources
- **Flaticon** - https://www.flaticon.com/
- **Icons8** - https://icons8.com/
- **The Noun Project** - https://thenounproject.com/
- **Iconfinder** - https://www.iconfinder.com/

---

## Delivery Requirements

### File Structure
```
src-tauri/icons/
├── 32x32.png
├── 128x128.png
├── 128x128@2x.png
├── icon.icns
├── icon.ico
├── icon.png
└── icon.svg (source)
```

### File Specifications
- **Format**: As specified above
- **Naming**: Exactly as shown
- **Location**: `deployment/desktop/src-tauri/icons/`
- **Source file**: Include original SVG or AI file

### Quality Checklist
- [ ] All required sizes provided
- [ ] Correct file formats
- [ ] Proper transparency (where required)
- [ ] Optimized file sizes
- [ ] Tested on all platforms
- [ ] Source file included
- [ ] Dark mode compatible (optional but recommended)

---

## Timeline

### Phase 1: Design (Week 1)
- Create master icon design
- Review and refine
- Get stakeholder approval

### Phase 2: Production (Week 1-2)
- Generate all size variants
- Create platform-specific formats
- Test on all platforms

### Phase 3: Integration (Week 2)
- Integrate into build system
- Update documentation
- Final testing and approval

---

## Budget Estimate

### Professional Design Services
- **Icon design**: $200-500 (freelance)
- **Icon design**: $500-2000 (agency)
- **Multiple concepts**: $1000-5000
- **Rush delivery**: +50-100%

### DIY Tools
- **Free tools**: $0 (Inkscape, GIMP)
- **Paid tools**: $50-100 one-time (Affinity Designer)
- **Subscription**: $20-50/month (Adobe Creative Cloud)

### Recommended Approach
1. **Option 1**: DIY with free tools (Budget: $0)
2. **Option 2**: Purchase icon pack (Budget: $50-200)
3. **Option 3**: Hire freelancer (Budget: $200-500)
4. **Option 4**: Hire agency (Budget: $500-2000)

---

## Approval Process

### Stakeholder Review
1. **Design concept approval** - Before production
2. **Size variant approval** - After production
3. **Platform testing approval** - After integration
4. **Final sign-off** - Before release

### Feedback Channels
- **GitHub Discussion**: https://github.com/SuperInstance/polln/discussions
- **Discord**: #design-feedback channel
- **Email**: design@superinstance.ai

---

## Contact & Support

### Questions?
- **Email**: design@superinstance.ai
- **Discord**: https://discord.gg/superinstance
- **GitHub**: https://github.com/SuperInstance/polln/issues

### Submit Icons
- **Email**: icons@superinstance.ai
- **GitHub**: Create pull request
- **Dropbox**: Request shared folder

---

## Appendix: Quick Reference

### Essential Commands

#### ImageMagick
```bash
# Resize PNG
convert icon.png -resize 32x32 32x32.png

# Create ICO
convert icon.png -define icon:auto-resize=256,48,32,16 icon.ico

# Optimize PNG
optipng -o7 32x32.png
```

#### macOS (iconutil)
```bash
# Create ICNS
iconutil -c icns icon.iconset

# Verify ICNS
file icon.icns
```

#### Windows (PowerShell)
```powershell
# Test ICO
Add-Type -Assembly System.Drawing
$img = [System.Drawing.Image]::FromFile("icon.ico")
$img.Size | Format-List
```

---

**Document Version**: 1.0
**Last Updated**: March 15, 2025
**Status**: Ready for Icon Production

**Next Steps**: Begin icon design process immediately for v1.0.1 release

---

**Need help creating icons?** Contact our design team at design@superinstance.ai
