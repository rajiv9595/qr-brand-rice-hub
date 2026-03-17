@echo off
REM Get SHA-1 Fingerprint for Android Debug Keystore
REM This script extracts the SHA-1 from your debug keystore

echo.
echo ========================================
echo Getting Android Debug Keystore SHA-1
echo ========================================
echo.

REM Check if keytool exists
where keytool >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: keytool not found. Make sure Java is installed.
    echo Download from: https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)

REM Get the SHA-1
echo Getting SHA-1 from debug keystore...
echo.

keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android | findstr "SHA1"

echo.
echo ========================================
echo Copy the SHA1 fingerprint above
echo Then:
echo 1. Go to: https://console.cloud.google.com
echo 2. Select your project
echo 3. Go to APIs ^& Services ^> Credentials
echo 4. Click your Android OAuth 2.0 Client ID
echo 5. Add package name: com.riceapp
echo 6. Paste the SHA1 fingerprint
echo 7. Click SAVE
echo ========================================
echo.

pause
