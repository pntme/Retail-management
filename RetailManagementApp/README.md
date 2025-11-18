# Retail Management Mobile App (Android)

A React Native Android application for the Retail Management System. This app provides full access to all retail management features including customers, products, sales, job cards, and billing on Android devices.

## Features

- **Dashboard**: View key metrics including total customers, products, today's sales, revenue, and low stock alerts
- **Customer Management**: Create, edit, delete, and search customers with vehicle information
- **Product/Inventory**: Manage products with pricing, stock levels, and vendor information
- **Sales/POS**: Create sales with multiple products and different payment methods
- **Job Cards**: View and manage automotive service job cards with filtering by status
- **Bills**: View bills, mark as paid, and track payment status
- **Authentication**: Secure JWT-based authentication with AsyncStorage persistence

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **JDK** (Java Development Kit 11 or higher)
- **Android Studio** with:
  - Android SDK
  - Android SDK Platform 34
  - Android Virtual Device (AVD) or physical Android device
- **React Native CLI**: `npm install -g react-native-cli`

### Environment Setup

1. **Install Java Development Kit (JDK)**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install openjdk-11-jdk

   # macOS (using Homebrew)
   brew install openjdk@11
   ```

2. **Install Android Studio**:
   - Download from https://developer.android.com/studio
   - During installation, ensure the following are selected:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device

3. **Set up Android Environment Variables**:
   Add to your `~/.bashrc` or `~/.zshrc`:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Installation

### 1. Install Dependencies

```bash
cd RetailManagementApp
npm install
# or
yarn install
```

### 2. Configure Backend API URL

Edit `src/services/api.ts` and update the `API_BASE_URL`:

```typescript
// For Android Emulator (default - localhost on host machine)
const API_BASE_URL = 'http://10.0.2.2:3000';

// For Physical Android Device (use your computer's IP)
// const API_BASE_URL = 'http://192.168.1.100:3000';

// For Production (use your deployed backend URL)
// const API_BASE_URL = 'https://your-app.railway.app';
```

**Important IP Addresses:**
- `10.0.2.2` - Android emulator's special alias for `localhost` on the host machine
- `192.168.x.x` - Your computer's local network IP (for physical devices)
- Get your local IP:
  - **Linux/macOS**: `ifconfig | grep inet`
  - **Windows**: `ipconfig`

### 3. Ensure Backend Server is Running

Make sure the Express backend server is running:

```bash
# In the main project directory (not RetailManagementApp)
cd ..
npm start
# Server should be running on http://localhost:3000
```

## Running the App

### Start Metro Bundler

```bash
npm start
# or
yarn start
```

### Run on Android Emulator

1. **Start Android Emulator** from Android Studio (AVD Manager)
2. **Run the app**:
   ```bash
   npm run android
   # or
   yarn android
   ```

### Run on Physical Android Device

1. **Enable Developer Options** on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Go to Settings > Developer Options
   - Enable "USB Debugging"

3. **Connect device** via USB and verify:
   ```bash
   adb devices
   # Should show your device
   ```

4. **Update API URL** in `src/services/api.ts` to use your computer's local IP

5. **Run the app**:
   ```bash
   npm run android
   # or
   yarn android
   ```

## Project Structure

```
RetailManagementApp/
├── android/                   # Android native code and configuration
│   ├── app/
│   │   ├── build.gradle      # App-level Gradle config
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── java/com/retailmanagementapp/
│   └── build.gradle          # Project-level Gradle config
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── MessageToast.tsx
│   │   └── QuickNav.tsx
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.tsx   # Authentication state
│   │   └── MessageContext.tsx # Toast notifications
│   ├── navigation/           # Navigation setup
│   │   └── AppNavigator.tsx  # React Navigation config
│   ├── screens/              # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── CustomersScreen.tsx
│   │   ├── ProductsScreen.tsx
│   │   ├── SalesScreen.tsx
│   │   ├── JobCardsScreen.tsx
│   │   └── BillsScreen.tsx
│   ├── services/             # API and services
│   │   └── api.ts            # API client with all endpoints
│   └── utils/                # Utility functions
├── App.tsx                   # Main app component
├── index.js                  # App entry point
├── package.json              # Dependencies
└── README.md                 # This file
```

## Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

**Important**: Change the default password after first login in production!

## API Configuration

The app uses Axios for HTTP requests with automatic token injection. All API calls are defined in `src/services/api.ts`.

### Key Features:
- **Automatic token injection** - JWT token added to all requests
- **401 handling** - Auto-logout on authentication failure
- **30-second timeout** - Configurable timeout for all requests
- **Centralized error handling** - Consistent error responses

## Available Screens

### 1. Dashboard
- Total customers, products, sales, revenue
- Low stock alerts with color-coded indicators
- Recent sales list
- Pull-to-refresh functionality
- Quick navigation bar

### 2. Customers
- List all customers with search
- Create/Edit customer with:
  - Name, phone, email, address
  - Vehicle number and type
  - Credit limit
- Delete customers
- Real-time search

### 3. Products
- List all products with stock indicators
- Create/Edit products with:
  - Name, SKU
  - Sell price, cost price
  - Quantity, reorder level
  - Vendor, rack location
- Delete products
- Color-coded stock levels (Red/Yellow/Green)

### 4. Sales
- View sales history
- Create new sales:
  - Add multiple products
  - Set quantities
  - Choose payment method (Cash/Card/UPI/Other)
  - Automatic inventory deduction
  - Real-time total calculation

### 5. Job Cards
- View job cards with status filtering
- Filter by: All, Open, In Progress, Completed, Billed
- Display job number, customer, vehicle, status, charges
- Color-coded status badges

### 6. Bills
- View all bills
- Mark bills as paid
- Display bill number, customer, date, amount
- Payment status indicators (Paid/Unpaid/Cancelled)

## Features Not Yet Implemented

The following features are planned for future updates:

- **PDF Generation**: Bill and job card PDF downloads
- **Full Job Card Creation**: Create and edit job cards from mobile
- **Document Upload**: Upload and manage documents
- **Offline Mode**: Work without internet connection
- **Push Notifications**: Service reminders and alerts
- **Barcode Scanning**: Quick product lookup
- **Receipt Printing**: Bluetooth/WiFi printer support

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear Metro cache
npm start -- --reset-cache

# Clear watchman (if installed)
watchman watch-del-all

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Android Build Issues

```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

### Network Connection Issues

1. **Check backend is running**: Visit `http://localhost:3000` in browser
2. **Verify API URL**: Ensure `API_BASE_URL` in `src/services/api.ts` is correct
3. **Check firewall**: Ensure firewall allows connections to port 3000
4. **For physical devices**: Ensure device and computer are on same WiFi network

### Common Errors

**"Unable to resolve module"**:
```bash
npm start -- --reset-cache
```

**"SDK location not found"**:
- Create `android/local.properties`:
  ```
  sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk  # macOS
  sdk.dir=/home/YOUR_USERNAME/Android/Sdk           # Linux
  sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk  # Windows
  ```

**"Execution failed for task ':app:installDebug'"**:
```bash
adb kill-server
adb start-server
adb devices
```

## Building Release APK

### 1. Generate Keystore (Production)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Signing

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'YOUR_PASSWORD'
            keyAlias 'my-key-alias'
            keyPassword 'YOUR_PASSWORD'
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

### 3. Build APK

```bash
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Performance Optimization

- Images are lazy-loaded
- Lists use optimized ScrollView components
- API calls are cached where appropriate
- Minimal re-renders with proper React hooks usage

## Security Considerations

- JWT tokens stored in AsyncStorage (encrypted on device)
- HTTPS recommended for production API
- Input validation on all forms
- SQL injection prevention on backend
- XSS protection via React's built-in escaping

## Development Tips

1. **Hot Reload**: Shake device or press `R` twice to reload
2. **Debug Menu**: Shake device or `Cmd+D` (iOS) / `Cmd+M` (Android)
3. **Remote Debugging**: Enable in Debug Menu → "Debug JS Remotely"
4. **React DevTools**: `npm install -g react-devtools` then `react-devtools`

## Contributing

When adding new features:

1. Create components in `src/components/`
2. Add screens to `src/screens/`
3. Update API methods in `src/services/api.ts`
4. Add navigation routes in `src/navigation/AppNavigator.tsx`
5. Test on both emulator and physical device

## License

This project is part of the Retail Management System.

## Support

For issues and questions:
- Check this README
- Review the main project documentation
- Check React Native docs: https://reactnative.dev/

## Changelog

### Version 1.0.0 (Initial Release)
- ✅ Login and authentication
- ✅ Dashboard with statistics
- ✅ Customer management (CRUD)
- ✅ Product management (CRUD)
- ✅ Sales creation and history
- ✅ Job cards viewing with filters
- ✅ Bills management
- ✅ Quick navigation between screens
- ✅ Pull-to-refresh on lists
- ✅ Toast notifications
- ✅ Color-coded status indicators

### Planned for v1.1.0
- Job card creation and editing
- PDF generation for bills and job cards
- Document upload functionality
- Barcode scanning for products
- Advanced search and filtering
- Offline mode support
