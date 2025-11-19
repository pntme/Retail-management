@echo off
REM Retail Management Android APK Builder for Windows
REM This script builds a debug APK for testing

echo ==========================================
echo Retail Management - APK Builder
echo ==========================================
echo.

REM Step 1: Check prerequisites
echo Step 1: Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed
    pause
    exit /b 1
)

echo [OK] Node.js and npm are installed
echo.

REM Step 2: Install dependencies
echo Step 2: Installing npm dependencies...
if not exist "node_modules" (
    echo Installing packages (this may take a few minutes)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: npm install failed
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)

echo.

REM Step 3: Clean previous builds
echo Step 3: Cleaning previous builds...
cd android
call gradlew.bat clean
cd ..
echo [OK] Build cleaned
echo.

REM Step 4: Build the APK
echo Step 4: Building debug APK...
echo This may take several minutes on first build...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo Error: Build failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ==========================================
echo [OK] Build Complete!
echo ==========================================
echo.

REM Find the APK
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk

if exist "%APK_PATH%" (
    echo APK Location: %APK_PATH%
    echo.
    echo To install on your device:
    echo 1. Enable 'Unknown Sources' in Android Settings
    echo 2. Transfer the APK to your device
    echo 3. Open and install the APK
    echo.
    echo Or use ADB:
    echo   adb install %APK_PATH%
    echo.

    REM Copy to easy location
    copy "%APK_PATH%" "RetailManagement-debug.apk"
    echo [OK] APK also copied to: RetailManagement-debug.apk
) else (
    echo Error: APK was not created
    echo Check the build output above for errors
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Next Steps:
echo ==========================================
echo 1. Make sure your backend server is running
echo 2. Update API_BASE_URL in src\services\api.ts
echo    - For emulator: http://10.0.2.2:3000
echo    - For physical device: http://YOUR_IP:3000
echo 3. Install the APK on your Android device
echo 4. Login with: admin / admin123
echo.

pause
