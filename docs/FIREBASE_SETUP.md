# 🔥 NEW FIREBASE PROJECT SETUP GUIDE FOR ADUBIBLE
**Purpose:** User Authentication, Anonymous Sanctuary Access & Cloud Study Vault Sync  
**Scale Target:** 4 Billion Readers  
**Cost Control Strategy:** Delta-only writes, Local-First IndexedDB caching, Zero egress for scripture reading

---

## 1. Create the New Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Project Name: `adubible-prod` (or your preferred name, e.g. `elohim-bible-hub`).
4. Google Analytics: Enable Google Analytics (free, unlimited telemetry).
5. Click **Create project**.

---

## 2. Register Web App & Retrieve Credentials

1. In the Project Overview page, click the **Web icon (`</>`)** to add a web app.
2. App nickname: `AduBible Web Workstation`.
3. Check the box: **"Also set up Firebase Hosting for this app"**.
4. Click **Register app**.
5. Firebase will display your config credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "adubible-prod.firebaseapp.com",
     projectId: "adubible-prod",
     storageBucket: "adubible-prod.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef...",
     measurementId: "G-XXXXXXXXXX"
   };
   ```
6. Copy these values into your project `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=adubible-prod.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=adubible-prod
   VITE_FIREBASE_STORAGE_BUCKET=adubible-prod.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef...
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

---

## 3. Enable Authentication Providers

AduBible provides zero-friction access so readers can use the app without requiring an account, and upgrade at any time to sync across devices:

1. In Firebase Console, go to **Build** > **Authentication** > **Get started**.
2. In the **Sign-in method** tab:
   - **Anonymous**: Click **Enable** > **Save** *(Essential: allows instant study notes creation without password prompts)*.
   - **Google**: Click **Enable**, set support email, and click **Save**.
   - **Email/Password**: Click **Enable** (disable Email link / passwordless if desired) > **Save**.

---

## 4. Enable Cloud Firestore & Deploy Security Rules

1. In Firebase Console, go to **Build** > **Firestore Database** > **Create database**.
2. Select **Production mode** (we enforce security rules below).
3. Choose the closest Cloud Firestore location to your core audience (e.g. `eur3` Europe or `nam5` US).
4. Click **Enable**.

### Deploy Production Security Rules
The security rules ensure that users can **only** read and write their own study items:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{subcollection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy via Firebase CLI:
```powershell
firebase deploy --only firestore:rules
```

---

## 5. Connect Firebase Hosting & Custom Domain (adubible.org)

1. In `.firebaserc`, update the project ID to your new project:
   ```json
   {
     "projects": {
       "default": "adubible-prod"
     }
   }
   ```
2. Build and deploy:
   ```powershell
   npm run build
   firebase deploy --only hosting
   ```
3. In Firebase Console > **Hosting** > Click **Add custom domain**.
4. Enter `adubible.org` (and `www.adubible.org`).
5. Firebase will provide 2 `A` records (e.g. `199.36.158.100`).
6. Add these records in your Cloudflare DNS settings (Proxied through Cloudflare).
