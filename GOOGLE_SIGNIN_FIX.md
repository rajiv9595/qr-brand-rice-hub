# Google Sign In DEVELOPER_ERROR Fix

## Problem
The app is showing **DEVELOPER_ERROR** when trying to sign in with Google. This happens because:
- The app's signing key SHA-1 fingerprint doesn't match what's registered in Google Cloud Console
- Each Android app build is signed with a unique key, and Google requires that key's SHA-1

---

## Solution: Get Your Debug SHA-1 and Register It

### Step 1: Get Your Debug Keystore SHA-1

**On Windows (PowerShell):**

```powershell
# Navigate to Android folder
cd "RiceApp\android"

# Get the SHA-1 fingerprint
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

Look for this line in the output:
```
SHA1: 12:34:56:78:9A:BC:DE:F0:...
```

**Note:** On first run, you'll see a long list. Find the "SHA1:" line.

### Step 2: Add SHA-1 to Google Cloud Console

1. Go to: https://console.cloud.google.com
2. Select project: **QR Brand Rice Hub** (or create if doesn't exist)
3. Go to **APIs & Services** > **Credentials**
4. Find your **OAuth 2.0 Client ID** for Android
5. Click it to edit
6. Under **Android**, add a new fingerprint:
   - **Package name**: `com.riceapp` (check your AndroidManifest.xml)
   - **SHA-1 certificate fingerprint**: Paste the SHA-1 from Step 1
7. Click **Save**

### Step 3: Download Updated credentials.json

1. Still in Google Cloud Console
2. Click the Android OAuth 2.0 client again
3. Download the credentials JSON
4. Compare the **Client ID** with what's in your `.env` file

### Step 4: Rebuild and Test

```bash
cd RiceApp
npm install
npm run android
```

---

## Quick Debug: Check Your Package Name

Make sure the package name in your app matches Google Console:

**Check in RiceApp/android/app/build.gradle:**
```gradle
android {
    defaultConfig {
        applicationId "com.riceapp"  // This should match Google Console
    }
}
```

---

## Alternative: Use Phone OTP (No Setup)

If you don't want to do the Google Console setup right now, users can:
1. **Skip Google Sign In** on the app
2. Use **"Login with Phone"** OTP method as temporary authentication
3. Once you set up Google Console properly, Google Sign In will work

---

## Error Details

| Error | Cause | Fix |
|-------|-------|-----|
| **DEVELOPER_ERROR (12500)** | SHA-1 mismatch | Add correct SHA-1 to Google Console |
| **NETWORK_ERROR** | Can't reach Google API | Check internet + backend running |
| **USER_CANCELLED** | User closed sign-in dialog | Normal - user can try again |
| **NO_PLAY_SERVICES** | Google Play Services missing | Install Play Services on device |

---

## Verifying It Works

After completing all steps:
1. Restart the Metro bundler: `npm start`
2. Rebuild the app: `npm run android`
3. Tap "Sign in with Google" button
4. Google dialog should appear (no more DEVELOPER_ERROR)
5. Select your Gmail account
6. You should be logged in!

---

## Need Help?

### Check these files:
- `RiceApp/.env` - Has GOOGLE_CLIENT_ID
- `RiceApp/android/app/build.gradle` - Has applicationId (package name)
- `RiceApp/android/app/src/main/AndroidManifest.xml` - Verify package name

### Common Issues:
- ❌ "Package name doesn't match" → Check build.gradle applicationId
- ❌ "SHA-1 not found" → Run keytool command again, copy exactly
- ❌ "Still DEVELOPER_ERROR" → Wait 15 mins for Google to refresh cache, rebuild app
- ❌ "Google dialog won't open" → Make sure Google Play Services installed on phone

---

## Production (Play Store)

When you submit to Play Store, you'll get a **DIFFERENT SHA-1** from Play Store's release signing key. You'll need to:

1. Get the release SHA-1 from Play Store Console
2. Add it to Google Cloud Console as a 2nd fingerprint
3. Your app will work in both debug and production modes

---

## Backend is Working ✓

Good news: Your backend is working fine!
- `LOG: Backend is awake: 200` ✓
- `/api/auth/google` endpoint is ready ✓
- Just need to fix the app's signing key registration

Once this is fixed, Google auth will flow like:
1. User enters Gmail credentials in Google dialog
2. Google returns idToken to app
3. App sends idToken to your backend
4. Backend verifies + creates user
5. User logged in! 🎉
