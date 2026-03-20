# 🔥 Firebase Migration - QUICK START (5 Minutes)

## What Changed?

✅ **MongoDB** → ❌  
✅ **Firebase Firestore** → ✅

---

## What You Need to Do NOW

### Step 1: Create Firebase Project (2 min)

```
1. Go to: https://console.firebase.google.com
2. Click: "Add project"
3. Name: HirQube
4. Continue → Create
5. Wait for initialization ⏳
```

---

### Step 2: Download Firebase Key (2 min)

```
1. Project Settings ⚙️ → Service Accounts
2. Click: "Generate New Private Key"
3. File downloads
4. Copy to: backend/firebase-key.json ✅
```

**Make sure:**
```bash
backend/firebase-key.json  # File exists here
```

---

### Step 3: Enable Firestore (1 min)

```
1. Build → Firestore Database
2. Click: "Create Database"
3. Choose: Start in test mode
4. Region: us-central1
5. Create ✅
```

---

### Step 4: Update Backend (instantly)

```bash
cd backend

# Install new Firebase package
npm install firebase-admin

# Uninstall old Mongoose package
npm uninstall mongoose

# Done ✅
```

---

### Step 5: Start Backend (1 min)

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Server running on http://localhost:5000
📊 Database: Firebase Firestore
```

---

## Test It Works

```bash
# In new terminal (backend still running):
curl http://localhost:5000/api/health

# Should return:
# {"status":"Server is running","database":"Firebase Firestore",...}
```

---

## Files Updated

| File | Change | Why |
|------|--------|-----|
| `backend/src/server.js` | Uses Firebase | No MongoDB connection |
| `backend/src/config/firebase.js` | NEW | Firebase initialization |
| `backend/src/controllers/jobController.js` | Uses Firestore queries | Replace MongoDB queries |
| `backend/src/scheduler/jobScheduler.js` | Uses Firestore batch writes | Database operations |
| `backend/package.json` | firebase-admin instead of mongoose | Dependencies |
| `backend/.env` | FIREBASE_KEY_PATH instead of MONGODB_URI | Configuration |
| `.gitignore` | Added firebase-key.json | Protect secrets |

---

## Database Structure

No changes to your data! Same job fields:

```json
{
  "title": "React Developer",
  "company": "TechCorp",
  "location": "us",
  "applyUrl": "https://...",
  "description": "...",
  "createdAt": "2024-03-19T...",
  ...
}
```

Just stored differently (Firestore instead of MongoDB).

---

## Frontend - NO CHANGES! ✅

React code stays exactly the same. It talks to your API, doesn't care about database.

```bash
cd frontend
npm start
# Still works! 🎉
```

---

## What If Error?

### "Cannot find module 'mongoose'"
```bash
npm uninstall mongoose
npm install firebase-admin
npm run dev
```

### "firebase-key.json not found"
```bash
# Check file exists in backend folder:
ls backend/firebase-key.json

# If missing, download again from Firebase Console
```

### "Permission denied on Firestore"
- Firebase Console → Firestore → Rules tab
- Should show "Test Mode" (allows all reads/writes)
- If production rules: edit to test mode

---

## Next: Sync Data

```bash
# When backend is running:
curl -X POST http://localhost:5000/api/jobs/sync-adzuna \
  -H "Content-Type: application/json" \
  -d '{"keyword":"developer","location":"us"}'

# Response:
# {"success":true,"inserted":25,"duplicates":0}
```

Jobs now in Firebase! ✅

---

## Summary

```
MongoDB ❌ → Firebase ✅
Mongoose ❌ → Firebase Admin ✅  
MONGODB_URI ❌ → FIREBASE_KEY_PATH ✅

npm run dev → Your HirQube backend is running on Firebase 🔥
```

**Need more details?** Read [MIGRATION_MONGODB_TO_FIREBASE.md](./MIGRATION_MONGODB_TO_FIREBASE.md)
