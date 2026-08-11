# Create basic icon files for Tauri build
Add-Type -AssemblyName System.Drawing

$iconsDir = "src-tauri\icons"

# Create 32x32 PNG
$bmp32 = New-Object System.Drawing.Bitmap 32,32
$g32 = [System.Drawing.Graphics]::FromImage($bmp32)
$g32.Clear([System.Drawing.Color]::FromArgb(59,130,246))
$bmp32.Save("$iconsDir\32x32.png")
$g32.Dispose()
$bmp32.Dispose()

# Create 128x128 PNG
$bmp128 = New-Object System.Drawing.Bitmap 128,128
$g128 = [System.Drawing.Graphics]::FromImage($bmp128)
$g128.Clear([System.Drawing.Color]::FromArgb(59,130,246))
$bmp128.Save("$iconsDir\128x128.png")
$g128.Dispose()
$bmp128.Dispose()

# Create 512x512 PNG
$bmp512 = New-Object System.Drawing.Bitmap 512,512
$g512 = [System.Drawing.Graphics]::FromImage($bmp512)
$g512.Clear([System.Drawing.Color]::FromArgb(59,130,246))
$bmp512.Save("$iconsDir\icon.png")
$g512.Dispose()
$bmp512.Dispose()

# Create 256x256 PNG for 128x128@2x
$bmp256 = New-Object System.Drawing.Bitmap 256,256
$g256 = [System.Drawing.Graphics]::FromImage($bmp256)
$g256.Clear([System.Drawing.Color]::FromArgb(59,130,246))
$bmp256.Save("$iconsDir\128x128@2x.png")
$g256.Dispose()
$bmp256.Dispose()

Write-Host "Basic PNG icons created successfully"

# For ICO and ICNS, we'll need to note that they need to be created properly
Write-Host "Note: icon.ico and icon.icns need to be created with proper tools"
Write-Host "For now, copying PNG as placeholder (this won't work for production)"

Copy-Item "$iconsDir\icon.png" "$iconsDir\icon.ico" -Force
Copy-Item "$iconsDir\icon.png" "$iconsDir\icon.icns" -Force
