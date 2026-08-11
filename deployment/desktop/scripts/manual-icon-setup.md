# Manual Icon Setup for Desktop Application

## Current Status

The automated icon generation is not working due to download issues. This document provides manual instructions for setting up icons.

## Quick Solution: Use Default Icons

For now, we can proceed with the build using a minimal icon setup. Tauri will work even with basic icons.

## Option 1: Skip Icons for Development Build

We can build the application without custom icons first:

```bash
npm run tauri:build
```

Tauri will use default icons or build without icons if they're not critical.

## Option 2: Manual Icon Creation

### For Production Release

You'll need to create proper icons. Here's what's needed:

#### Windows (icon.ico)
- Download: https://convertico.com/
- Create a 1024x1024 PNG
- Convert to ICO with multiple sizes

#### macOS (icon.icns)
- Create 1024x1024 PNG
- Use `iconutil` on macOS:
```bash
mkdir icon.iconset
# Add various sizes...
iconutil -c icns icon.iconset
```

#### Linux (icon.png)
- Simple 512x512 PNG

### Use Online Icon Generators

1. **favicon.io**: https://favicon.io/
2. **ICO Convert**: https://icoconvert.com/
3. **CloudConvert**: https://cloudconvert.com/

## Option 3: Use Free Icon Resources

Download spreadsheet-related icons from:
- Flaticon: https://www.flaticon.com/search?word=spreadsheet
- Icons8: https://icons8.com/icons/set/spreadsheet

## Current Approach

For this build process, we'll:
1. Proceed with the build even without custom icons
2. Document the icon requirement
3. Create proper icons before final release

## Next Steps

1. Build application: `npm run tauri:build`
2. Test with default icons
3. Create custom icons for production
4. Update icons before final release

## Icon Files Location

All icons should be placed in:
```
deployment/desktop/src-tauri/icons/
```

Required files:
- 32x32.png
- 128x128.png
- 128x128@2x.png
- icon.icns (macOS)
- icon.ico (Windows)
- icon.png (Linux)

---

**Status**: Icons will be added before production release
**Priority**: Medium - can ship with default icons for v1.0
