@echo off
REM Code Signing Script for Windows
REM This script signs the Windows executable

set EXE_PATH=src-tauri\target\release\Spreadsheet Moment.exe
set TIMESTAMP_URL=http://timestamp.digicert.com

REM Check if certificate thumbprint is set
if "%SPREADSHEET_MOMENT_CERT_THUMBPRINT%"=="" (
    echo ERROR: Certificate thumbprint not set
    echo Please set SPREADSHEET_MOMENT_CERT_THUMBPRINT environment variable
    exit /b 1
)

echo ========================================
echo Signing Windows Executable
echo ========================================
echo.

REM Sign the executable
signtool sign /f %SPREADSHEET_MOMENT_CERT_THUMBPRINT% /tr %TIMESTAMP_URL% /td sha256 /fd sha256 "%EXE_PATH%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Successfully signed executable!
    echo ========================================
) else (
    echo.
    echo ERROR: Failed to sign executable
    exit /b 1
)
