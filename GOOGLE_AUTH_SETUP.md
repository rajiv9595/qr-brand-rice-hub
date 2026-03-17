# Google Authentication Setup for RiceApp

## ✅ What Has Been Implemented

### 1. **Primary Login Method: Google Sign In**
- Users can now sign in with their Gmail account
- No OTP costs - completely free authentication
- Fast and simple one-tap login
- Works on both Android and iOS (when web version is released)

### 2. **Secondary Login Method: Phone OTP**
- Still available as a backup for users without Gmail
- Optional for users who prefer phone-based authentication

### 3. **Multi-Language Support**
- Login screen supports Telugu (తెలుగు), Hindi (हिंदी), and English
- All buttons and labels are properly localized
- Language selection persists across sessions

### 4. **Role Selection**
- Users can choose during login: Customer or Supplier
- Roles are sent to backend for proper user categorization

---

## 📦 Installation Steps

### Step 1: Install Dependencies
```bash
cd RiceApp
npm install
```

This will install the new Google Sign In package:
- `@react-native-google-signin/google-signin` - For native Android/iOS integration

### Step 2: Rebuild Android
```bash
cd RiceApp
npm run android
# or
cd android
./gradlew.bat assembleDebug
```

---

## 🔑 Configuration

### Backend Already Configured ✓
The backend has the necessary Google OAuth endpoint at `/api/auth/google` that:
1. Receives the Google ID Token
2. Verifies it with Google's API
3. Creates or updates user in database
4. Returns JWT token for app authentication

**Backend Endpoint:**
```
POST /api/auth/google
Body: { idToken, role }
Response: { token, user }
```

### Frontend Configuration ✓
The RiceApp has Google Client ID configured in `.env`:
```
GOOGLE_CLIENT_ID=560560528502-tmn1ipqd55a0or1r6ss8j5uurb5cssj7.apps.googleusercontent.com
```

---

## 🎯 How It Works

### User Flow:
1. **App Starts** → Login Screen appears with language/role options
2. **User Taps "Sign in with Google"** → System opens Google Sign In dialog
3. **User Authenticates** → Google returns ID Token to app
4. **App Sends Token to Backend** → `/api/auth/google` endpoint
5. **Backend Verifies & Creates User** → Returns JWT token
6. **App Stores Token** → User logged in, redirect to home screen

---

## 📁 Files Modified

### 1. **RiceApp/src/screens/auth/LoginScreen.jsx** (UPDATED)
- Added Google Sign In button as PRIMARY login method
- Kept phone OTP as SECONDARY method
- Enhanced UI with role selector
- Added message: "💡 Pro Tip: Login with Gmail - Faster & Simpler - No OTP needed"

### 2. **RiceApp/src/api/authService.js** (UPDATED)
- Added `googleSignIn()` method - handles Google authentication
- Added `googleSignOut()` method - handles logout
- Uses Firebase + Google Sign In SDK
- Sends ID Token to backend's `/api/auth/google`

### 3. **RiceApp/.env** (CREATED)
- Added API_BASE_URL for backend
- Added GOOGLE_CLIENT_ID for Android authentication
- Environment variables now properly managed

### 4. **RiceApp/package.json** (UPDATED)
- Added `@react-native-google-signin/google-signin` dependency

---

## 🚀 Testing the Google Login

### On Android Phone:
1. Install the debug APK we built earlier
2. Open the app
3. See the new Login Screen with Google button
4. Tap "Sign in with Google"
5. Google Sign In dialog appears
6. Select your Google account
7. User logs in successfully

### On Emulator:
1. Make sure Google Play Services are installed
2. Follow same steps as above

---

## 💡 Backend Integration Reference

### From Frontend (Web):
```javascript
// frontend/src/services/authService.js
googleAuth: async (idToken, role) => {
  const res = await api.post('/auth/google', { idToken, role });
  return res.data.data;
}
```

### From Backend:
```javascript
// backend/controllers/authController.js
exports.googleAuth = asyncHandler(async (req, res) => {
  const { idToken, role } = req.body;
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  // ... verify, create user, return token
});
```

### Mobile App (Now Same):
```javascript
// RiceApp/src/api/authService.js
googleSignIn: async (role) => {
  const { idToken } = await GoogleSignin.signIn();
  const res = await client.post('/auth/google', { idToken, role });
  return res.data.data;
}
```

---

## ⚠️ Important Notes

### Google Cloud Console Setup
If you ever need to regenerate Google OAuth credentials:
1. Go to https://console.cloud.google.com
2. Create a new OAuth 2.0 Client ID
3. For Android, add your app's package name and signing certificate SHA-1
4. Update the Client ID in `.env`

### No OTP Costs!
- Google Sign In is **completely free**
- No SMS charges
- Saves significant money on SMS gateways
- Users appreciate simpler login

### Supported Devices
- Android 6.0+ (with Google Play Services)
- iOS 11+ (when web version is converted to mobile)
- Web (using existing `@react-oauth/google`)

---

## 🔄 Next Steps (Optional)

1. **Add Social Login Icons**: Consider adding more social providers (GitHub, Apple)
2. **Anonymous Login**: For quick browsing without authentication
3. **Email/Password**: For users without Gmail
4. **Biometric Auth**: Fingerprint/Face recognition for faster login on subsequent visits

---

## 📞 Support

If issues occur:
1. Check backend is running: `https://qr-brand-rice-hub-api.onrender.com/api`
2. Verify Google Client ID in `.env`
3. Make sure Google Play Services installed on device
4. Check network connectivity (Google API must be reachable)

