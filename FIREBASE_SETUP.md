# 🔥 Firebase Setup Guide (Replacing MongoDB)

## Step 1: Create Firebase Project (Free)

### Go to Firebase Console
```
1. Visit: https://console.firebase.google.com
2. Click "Add project"
3. Project name: HirQube
4. Continue
5. Disable Google Analytics (or enable if you want)
6. Click "Create project"
7. ⏳ Wait 1-2 minutes
```

---

## Step 2: Enable Firestore Database

```
1. From Firebase console home
2. Left sidebar: "Build" → "Firestore Database"
3. Click "Create database"
4. Choose:
   - ✅ Start in test mode (for development)
   - Region: us-central1 (or closest)
5. Click "Create"
6. ⏳ Wait for initialization
```

---

## Step 3: Get Your Firebase Credentials

```
1. Left sidebar: ⚙️ Settings (gear icon)
2. Click "Project Settings"
3. Go to "Service Accounts" tab
4. Language: Node.js (already selected)
5. Click "Generate new private key"
   - A JSON file downloads: 
   - Save it as: firebase-key.json
6. Keep this file SECRET (add to .gitignore)
```

---

## Step 4: Get Your Firebase Config

```
1. Back to Project Settings
2. Go to "General" tab
3. Under "Your apps" section
4. Click your web app (or create one)
5. Copy the config object:

{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

---

## Step 5: Update backend/.env

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=from_json_file
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=from_json_file
FIREBASE_CLIENT_ID=from_json_file
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=from_json_file
```

---

## Or Use the JSON File Directly

### Easier Method:

1. Download the JSON file from Firebase
2. Rename it: `firebase-key.json`
3. Place it in: `backend/firebase-key.json`
4. Update backend/.env:
   ```env
   FIREBASE_KEY_PATH=./firebase-key.json
   FIREBASE_PROJECT_ID=your_project_id
   ```
5. Add to `.gitignore`:
   ```
   firebase-key.json
   ```

---

## Step 6: Firestore Database Structure

Firebase will automatically create collections when you write data.

Your data structure:
```
Firestore
└── jobs (collection)
    ├── job1 (document)
    │   ├── title: "React Developer"
    │   ├── company: "TechCorp"
    │   ├── location: "New York"
    │   └── ... more fields
    ├── job2 (document)
    └── job3 (document)
```

---

## ⚠️ Important: .gitignore Updates

Make sure `.gitignore` includes:
```
firebase-key.json
.env
node_modules/
```

Never commit your Firebase key file! 🔐

---

## ✅ Verification

After setup, your .env should have:
- [ ] FIREBASE_PROJECT_ID (not mongoDB_URI)
- [ ] FIREBASE_PRIVATE_KEY or FIREBASE_KEY_PATH
- [ ] All other env variables

---

## 🆘 Troubleshooting

### "Can't find firebase-key.json"
- Check file is in `backend/` folder
- Check filename exactly: `firebase-key.json`
- Check it's NOT in `.gitignore` mistake

### "Permission denied on Firestore"
- Check you're in "test mode" (not production)
- Firestore rules should allow all reads/writes for dev

### "Firebase client email not found"
- Regenerate private key from Service Accounts
- Download new JSON file
- Update firebase-key.json

---

**Next: I'll update all backend code files to use Firebase!** ✨
