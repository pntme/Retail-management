#!/bin/bash

# Retail Management Android APK Builder
# This script builds a debug APK for testing

set -e  # Exit on error

echo "=========================================="
echo "Retail Management - APK Builder"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js and npm are installed${NC}"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${YELLOW}Warning: Java is not found in PATH${NC}"
    echo "You may need to install JDK 11 or higher"
fi

echo ""

# Step 2: Install dependencies
echo "Step 2: Installing npm dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing packages (this may take a few minutes)..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo ""

# Step 3: Clean previous builds
echo "Step 3: Cleaning previous builds..."
cd android
./gradlew clean
cd ..
echo -e "${GREEN}✓ Build cleaned${NC}"

echo ""

# Step 4: Build the APK
echo "Step 4: Building debug APK..."
echo "This may take several minutes on first build..."
cd android
./gradlew assembleDebug
cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Build Complete!${NC}"
echo "=========================================="
echo ""

# Find the APK
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "APK Location: $APK_PATH"
    echo "APK Size: $APK_SIZE"
    echo ""
    echo "To install on your device:"
    echo "1. Enable 'Unknown Sources' in Android Settings"
    echo "2. Transfer the APK to your device"
    echo "3. Open and install the APK"
    echo ""
    echo "Or use ADB:"
    echo "  adb install $APK_PATH"
    echo ""

    # Copy to easy location
    cp "$APK_PATH" "./RetailManagement-debug.apk"
    echo -e "${GREEN}✓ APK also copied to: ./RetailManagement-debug.apk${NC}"
else
    echo -e "${RED}Error: APK was not created${NC}"
    echo "Check the build output above for errors"
    exit 1
fi

echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Make sure your backend server is running"
echo "2. Update API_BASE_URL in src/services/api.ts"
echo "   - For emulator: http://10.0.2.2:3000"
echo "   - For physical device: http://YOUR_IP:3000"
echo "3. Install the APK on your Android device"
echo "4. Login with: admin / admin123"
echo ""
