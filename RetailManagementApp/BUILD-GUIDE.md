# How to Build the Android APK

This guide walks you through building the Android APK for the Retail Management app.

## Prerequisites

Before building, ensure you have:

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Java Development Kit (JDK 11 or higher)**
   - Download: https://www.oracle.com/java/technologies/downloads/
   - Or use OpenJDK: https://adoptium.net/
   - Verify: `java --version`

4. **Android SDK** (via Android Studio)
   - Download Android Studio: https://developer.android.com/studio
   - During setup, install:
     - Android SDK
     - Android SDK Platform 34
     - Android SDK Build-Tools

### Environment Variables (Important!)

Set these environment variables:

**Linux/macOS** (`~/.bashrc` or `~/.zshrc`):
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

**Windows** (System Environment Variables):
```
ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

## Method 1: Using Build Scripts (Easiest)

We've created automated build scripts for you:

### On Linux/macOS:

```bash
cd RetailManagementApp
chmod +x build-apk.sh
./build-apk.sh
```

### On Windows:

```batch
cd RetailManagementApp
build-apk.bat
```

The script will:
1. Check prerequisites
2. Install npm dependencies
3. Clean previous builds
4. Build the debug APK
5. Copy APK to `RetailManagement-debug.apk`

**That's it!** The APK will be ready to install.

---

## Method 2: Manual Build Steps

If you prefer to build manually:

### Step 1: Install Dependencies

```bash
cd RetailManagementApp
npm install
```

This installs all React Native dependencies. First run may take 5-10 minutes.

### Step 2: Configure API URL (Important!)

Edit `src/services/api.ts` and update the backend URL:

```typescript
// For Android Emulator (testing on emulator)
const API_BASE_URL = 'http://10.0.2.2:3000';

// For Physical Device (testing on real phone)
// Replace with your computer's IP address
// const API_BASE_URL = 'http://192.168.1.100:3000';

// For Production (deployed backend)
// const API_BASE_URL = 'https://your-app.railway.app';
```

**Find your local IP:**
- **Windows**: `ipconfig` (look for IPv4 Address)
- **macOS**: `ifconfig en0 | grep inet`
- **Linux**: `ip addr show` or `ifconfig`

### Step 3: Build the APK

```bash
# Clean previous builds (optional but recommended)
cd android
./gradlew clean        # Linux/macOS
gradlew.bat clean      # Windows

# Build debug APK
./gradlew assembleDebug        # Linux/macOS
gradlew.bat assembleDebug      # Windows
```

First build takes 10-15 minutes. Subsequent builds are faster.

### Step 4: Find Your APK

The APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

File size: ~30-50 MB

---

## Method 3: Build with React Native CLI

If you have React Native CLI installed:

```bash
cd RetailManagementApp
npm install
react-native build-android --mode=debug
```

---

## Building Release APK (For Production)

Release builds are smaller and optimized:

### 1. Generate a Signing Key

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Enter a strong password and remember it!

### 2. Configure Gradle

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'YOUR_KEYSTORE_PASSWORD'
            keyAlias 'my-key-alias'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

### 3. Build Release APK

```bash
cd android
./gradlew assembleRelease        # Linux/macOS
gradlew.bat assembleRelease      # Windows
```

Release APK location:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Installing the APK

### On Android Emulator

```bash
adb install path/to/app-debug.apk
```

Or drag and drop the APK onto the emulator window.

### On Physical Android Device

#### Option 1: Via ADB (Recommended)

1. Enable USB Debugging on your device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

2. Connect device via USB

3. Install:
   ```bash
   adb devices  # Verify device is connected
   adb install path/to/app-debug.apk
   ```

#### Option 2: Direct Install

1. Transfer APK to your device (email, USB, cloud)
2. On device, go to Settings → Security
3. Enable "Install Unknown Apps" for your file manager
4. Open the APK file on your device
5. Tap "Install"

---

## Troubleshooting

### "npm install" fails

**Solution 1:** Clear npm cache
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

**Solution 2:** Use yarn instead
```bash
npm install -g yarn
yarn install
```

### Gradle build fails

**Solution 1:** Clean and rebuild
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

**Solution 2:** Check Java version
```bash
java --version  # Should be 11 or higher
```

**Solution 3:** Increase Gradle memory
Edit `android/gradle.properties`:
```
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

### "SDK location not found"

Create `android/local.properties`:

**macOS:**
```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

**Linux:**
```
sdk.dir=/home/YOUR_USERNAME/Android/Sdk
```

**Windows:**
```
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### Build works but app crashes on startup

**Check:**
1. Backend server is running
2. API URL is correct in `src/services/api.ts`
3. Device/emulator can reach the backend:
   ```bash
   # From your device's browser, visit:
   http://YOUR_IP:3000
   # Should show something (not connection refused)
   ```

### "Unable to connect to server" error in app

1. **Backend not running**
   - Start server: `npm start` in main project directory
   - Verify: Open `http://localhost:3000` in browser

2. **Wrong API URL**
   - For emulator: Use `10.0.2.2:3000`
   - For device: Use your computer's actual IP
   - Verify IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

3. **Firewall blocking**
   - Allow port 3000 through firewall
   - On same WiFi network (for physical device)

### Large APK size

Debug APKs are larger (~30-50MB). Release builds are smaller (~20-30MB).

To reduce size:
1. Build release APK (see above)
2. Enable Proguard minification
3. Enable app bundle instead of APK

---

## Testing the APK

After installing:

1. **Open the app**
2. **Login**: Use `admin` / `admin123`
3. **Test features**:
   - ✓ Dashboard loads with stats
   - ✓ Create a customer
   - ✓ Add a product
   - ✓ Make a sale
   - ✓ View job cards
   - ✓ Check bills

If anything doesn't work, check the API URL configuration first!

---

## Build Outputs

### Debug Build
- **Location**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Size**: ~30-50 MB
- **Use**: Testing and development
- **Signing**: Debug keystore (pre-configured)

### Release Build
- **Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Size**: ~20-30 MB
- **Use**: Production distribution
- **Signing**: Requires release keystore

---

## Next Steps After Building

1. **Test thoroughly** on both emulator and physical device
2. **Configure production API URL** for release builds
3. **Set up proper signing** for Play Store release
4. **Create app bundle** (AAB) for Play Store:
   ```bash
   ./gradlew bundleRelease
   ```

---

## Quick Reference

### Common Commands

```bash
# Install dependencies
npm install

# Clean build
cd android && ./gradlew clean && cd ..

# Build debug APK
cd android && ./gradlew assembleDebug && cd ..

# Build release APK
cd android && ./gradlew assembleRelease && cd ..

# Install on device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View connected devices
adb devices

# View app logs
adb logcat | grep ReactNative
```

### Important Files

- `src/services/api.ts` - Backend API URL
- `android/app/build.gradle` - Android build config
- `android/gradle.properties` - Gradle settings
- `package.json` - npm dependencies

---

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review the main README.md
3. Check React Native docs: https://reactnative.dev
4. Check Android build logs: `android/app/build/outputs/logs/`

---

## Build Checklist

Before building:
- [ ] Node.js installed (v18+)
- [ ] Java JDK installed (11+)
- [ ] Android SDK installed
- [ ] Environment variables set
- [ ] Dependencies installed (`npm install`)
- [ ] API URL configured
- [ ] Backend server accessible

Ready to build? Run:
```bash
./build-apk.sh        # Linux/macOS
build-apk.bat         # Windows
```

Happy building! 🚀
