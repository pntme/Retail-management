# Quick Build Instructions - TL;DR

Can't wait? Here's the fastest way to get your APK:

## 🚀 Super Quick Method (1 command)

### Linux/macOS:
```bash
cd RetailManagementApp
chmod +x build-apk.sh
./build-apk.sh
```

### Windows:
```batch
cd RetailManagementApp
build-apk.bat
```

**Done!** Your APK will be at: `RetailManagement-debug.apk`

---

## 📱 Even Quicker (If you have everything installed)

```bash
cd RetailManagementApp
npm install && cd android && ./gradlew assembleDebug
```

APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## ⚙️ Before You Build - ONE Important Step

**Edit `src/services/api.ts`** and set your backend URL:

```typescript
// For Android Emulator:
const API_BASE_URL = 'http://10.0.2.2:3000';

// For Physical Device (find your IP with 'ipconfig' or 'ifconfig'):
// const API_BASE_URL = 'http://192.168.1.XXX:3000';
```

---

## ✅ Prerequisites (One-time setup)

Need these installed:
1. **Node.js** (v18+) - https://nodejs.org/
2. **Java JDK** (11+) - https://adoptium.net/
3. **Android Studio** - https://developer.android.com/studio

**Set environment variable:**
- `ANDROID_HOME` = Path to your Android SDK

---

## 🎯 Install APK

### On Emulator:
```bash
adb install RetailManagement-debug.apk
```

### On Phone:
1. Transfer APK to phone
2. Enable "Install Unknown Apps" in Settings
3. Open APK file and install

---

## 🔑 Login

- Username: `admin`
- Password: `admin123`

---

## ❌ Build Not Working?

### Check:
1. Node.js installed? → `node --version`
2. Java installed? → `java --version`
3. ANDROID_HOME set? → `echo $ANDROID_HOME`
4. In correct folder? → Should be in `RetailManagementApp/`

### Fix:
```bash
# Clear cache and retry
rm -rf node_modules
npm install
cd android && ./gradlew clean && cd ..
./build-apk.sh
```

---

## 📖 Need More Help?

See **BUILD-GUIDE.md** for detailed instructions and troubleshooting.

---

## 🚨 App Can't Connect?

1. Make sure backend server is running:
   ```bash
   cd .. && npm start
   ```

2. Check API URL in `src/services/api.ts`

3. For physical device: Use your computer's IP, not `localhost`

---

**That's it! Build takes ~10 minutes first time, ~2 minutes after that.**
