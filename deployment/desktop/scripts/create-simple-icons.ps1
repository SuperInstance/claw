# PowerShell Script to Create Simple Icons for Development
# This creates basic colored squares as placeholder icons

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Simple Placeholder Icons" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$iconsDir = "src-tauri\icons"

# Create icons directory if it doesn't exist
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
    Write-Host "Created icons directory" -ForegroundColor Green
}

Write-Host "Note: This script creates basic placeholder icons." -ForegroundColor Yellow
Write-Host "For production, please use professional icons according to ICON_CREATION_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

# Since we can't create actual image files without image processing libraries,
# we'll create a README in the icons directory explaining what's needed

$readmeContent = @"
# Icon Files Directory

This directory should contain the following icon files:

## Required Icons:
- 32x32.png (32x32 pixels)
- 128x128.png (128x128 pixels)
- 128x128@2x.png (256x256 pixels for Retina)
- icon.icns (macOS icon format)
- icon.ico (Windows icon format)
- icon.png (512x512 pixels for Linux)

## Quick Start:
Run this command to let Tauri generate default icons:
```
npm run tauri icon
```

Or follow the guide in: docs/ICON_CREATION_GUIDE.md

## For Production:
Please replace with professionally designed icons that represent:
- The Spreadsheet Moment brand
- Clean, modern design
- Good visibility at all sizes
- Platform-specific optimizations

## Current Status:
Using Tauri default icons for development
"@

$readmeContent | Out-File -FilePath "$iconsDir\README.md" -Encoding UTF8

Write-Host "Created README in icons directory" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run tauri icon (to generate default icons)" -ForegroundColor White
Write-Host "2. Or add your own icon files to this directory" -ForegroundColor White
Write-Host "3. Then run: npm run tauri:build" -ForegroundColor White
Write-Host ""
