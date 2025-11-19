# React Native Mobile App - Quick Start Guide

This document provides a quick overview of the Android mobile app conversion for the Retail Management System.

## Overview

We've successfully converted the React web application to a **React Native Android app** that provides full access to all retail management features on mobile devices.

## What's Included

### ✅ Features Implemented

1. **Authentication**
   - JWT-based login system
   - Secure token storage with AsyncStorage
   - Auto-logout on token expiration

2. **Dashboard**
   - Real-time statistics (customers, products, sales, revenue)
   - Low stock alerts with color indicators
   - Recent sales feed
   - Pull-to-refresh functionality

3. **Customer Management**
   - Create, edit, delete customers
   - Search functionality
   - Vehicle information tracking
   - Credit limit management

4. **Product/Inventory Management**
   - Full CRUD operations
   - Stock level tracking
   - Color-coded stock indicators (Red/Yellow/Green)
   - Vendor and rack location tracking

5. **Sales/POS**
   - Create multi-item sales
   - Multiple payment methods (Cash, Card, UPI, Other)
   - Real-time total calculation
   - Sales history

6. **Job Cards**
   - View job cards
   - Filter by status (All, Open, In Progress, Completed, Billed)
   - Status-based color coding

7. **Bills**
   - View all bills
   - Mark bills as paid
   - Payment status tracking

## Project Location

```
/home/user/Retail-management/RetailManagementApp/
```

## Quick Start

### Prerequisites

1. Install Node.js (v18+)
2. Install JDK 11+
3. Install Android Studio with Android SDK

### Setup Steps

1. **Navigate to the mobile app directory**:
   ```bash
   cd RetailManagementApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API URL** (Important!):

   Edit `src/services/api.ts`:

   ```typescript
   // For Android Emulator:
   const API_BASE_URL = 'http://10.0.2.2:3000';

   // For Physical Device (use your computer's IP):
   // const API_BASE_URL = 'http://192.168.1.XXX:3000';
   ```

4. **Start the backend server** (in the main project directory):
   ```bash
   cd ..
   npm start
   ```

5. **Start Metro Bundler** (in RetailManagementApp directory):
   ```bash
   npm start
   ```

6. **Run on Android**:
   ```bash
   npm run android
   ```

## Key Technical Details

### Architecture

- **Framework**: React Native 0.73.2
- **Navigation**: React Navigation (Native Stack)
- **State Management**: React Context API (AuthContext, MessageContext)
- **HTTP Client**: Axios with interceptors
- **Storage**: AsyncStorage for token persistence
- **UI**: Custom components (no external UI library dependencies)

### API Integration

The mobile app uses the **same Express backend** as the web app. All API endpoints are wrapped in `src/services/api.ts`:

- Automatic JWT token injection
- 401 error handling with auto-logout
- 30-second request timeout
- Centralized error handling

### File Structure

```
RetailManagementApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── MessageToast.tsx
│   │   └── QuickNav.tsx
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── MessageContext.tsx
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/             # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── CustomersScreen.tsx
│   │   ├── ProductsScreen.tsx
│   │   ├── SalesScreen.tsx
│   │   ├── JobCardsScreen.tsx
│   │   └── BillsScreen.tsx
│   └── services/
│       └── api.ts           # API client
├── android/                 # Android native configuration
├── App.tsx                  # Main app component
├── index.js                 # Entry point
└── package.json             # Dependencies
```

## Dependencies

### Core Dependencies
- `react-native`: 0.73.2
- `@react-navigation/native`: Navigation
- `@react-navigation/native-stack`: Stack navigator
- `@react-native-async-storage/async-storage`: Local storage
- `axios`: HTTP client

### Planned Dependencies (for future updates)
- `react-native-document-picker`: File uploads
- `react-native-pdf`: PDF generation
- `react-native-share`: Sharing functionality
- `react-native-vector-icons`: Icons

## Important Notes

### 1. API URL Configuration

The most common issue is incorrect API URL configuration:

- **Android Emulator**: Use `10.0.2.2` (not `localhost`)
- **Physical Device**: Use your computer's actual IP address
- **Production**: Use your deployed backend URL (e.g., Railway)

### 2. Backend Server Must Be Running

The mobile app requires the Express backend to be running. Make sure:
```bash
# In the main project directory
npm start
# Server running on http://localhost:3000
```

### 3. Network Permissions

The Android app requires internet permission (already configured in AndroidManifest.xml).

### 4. Development vs Production

For development:
- Use `http://` for local connections
- Ensure firewall allows connections

For production:
- Use `https://` only
- Update API_BASE_URL to production URL
- Build release APK with proper signing

## Features Not Yet Implemented

The following features are planned for future releases:

- ❌ PDF generation (bills and job cards)
- ❌ Full job card creation/editing
- ❌ Document uploads
- ❌ Offline mode
- ❌ Push notifications
- ❌ Barcode scanning
- ❌ Printer integration

These features were not critical for the initial release but can be added incrementally.

## Testing the App

1. **Login**: Use credentials `admin` / `admin123`
2. **Dashboard**: Verify stats are loaded
3. **Customers**: Try creating, editing, and deleting
4. **Products**: Add a product and check stock indicator
5. **Sales**: Create a sale with multiple products
6. **Job Cards**: Filter by status
7. **Bills**: Mark a bill as paid

## Building for Production

### Generate Release APK

1. Generate keystore:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Build release:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. APK location:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

## Troubleshooting

### "Unable to connect to server"
- Check backend is running
- Verify API_BASE_URL is correct
- For physical device, ensure same WiFi network

### "Metro bundler error"
```bash
npm start -- --reset-cache
```

### "Build failed"
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### "Module not found"
```bash
rm -rf node_modules
npm install
```

## Performance

The app is optimized for mobile with:
- Minimal dependencies
- Efficient rendering with React hooks
- Lazy loading where appropriate
- AsyncStorage for fast local data access

## Security

- JWT tokens stored securely in AsyncStorage
- All passwords hashed with bcrypt on backend
- Input validation on forms
- XSS protection via React's built-in escaping

## Next Steps

1. **Install dependencies**: `cd RetailManagementApp && npm install`
2. **Configure API URL**: Update `src/services/api.ts`
3. **Start backend**: `cd .. && npm start`
4. **Run app**: `cd RetailManagementApp && npm run android`

## Additional Resources

- Full README: `RetailManagementApp/README.md`
- React Native Docs: https://reactnative.dev
- React Navigation: https://reactnavigation.org
- API Documentation: See main project README

## Summary

The mobile app provides a complete retail management solution for Android devices with all core features of the web app. It uses the same backend API, ensuring data consistency between web and mobile platforms. The app is ready for development testing and can be built for production deployment.

For detailed setup instructions, troubleshooting, and advanced configuration, see `RetailManagementApp/README.md`.
