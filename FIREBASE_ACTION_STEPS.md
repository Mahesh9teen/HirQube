# 📋 MongoDB to Firebase - Step-by-Step Action List

## 🎯 Your Checklist

Follow these steps in order. Copy-paste the commands. ✅

---

## Part 1: Firebase Setup (5 minutes)

### Step 1: Create Firebase Project

```
🔗 Go to: https://console.firebase.google.com

1. Click: "Add project" (blue button)
2. Project name: HirQube
3. Click: "Continue"
4. Google Analytics: (Skip or Enable - doesn't matter)
5. Click: "Create project"
6. ⏳ Wait 1-2 minutes for initialization
```

**You'll see:** Project dashboard with "HirQube" at top

---

### Step 2: Enable Firestore Database

```
1. Left sidebar: "Build" menu
2. Click: "Firestore Database"
3. Click: "Create database" (blue button)
4. Choose location:
   - ✅ Start in test mode
   - Region: us-central1 (or closest to you)
5. Click: "Create"
6. ⏳ Wait 30 seconds
```

**You'll see:** Firestore console with empty database

---

### Step 3: Download Firebase Credentials

```
1. Top right: ⚙️ Settings (gear icon)
2. Click: "Project Settings"
3. Go to: "Service Accounts" tab (middle tabs)
4. Language: "Node.js" (should already be selected)
5. Click: "Generate New Private Key" (blue button)
6. ⏳ File downloads: hirqube-xxxxx-firebase-adminsdk-xxxxx.json
```

**Important:** This file contains your database password! Keep it secret! 🔐

---

### Step 4: Save Firebase Key in Backend Folder

```
📁 File Downloaded: hirqube-xxxxx-firebase-adminsdk-xxxxx.json

👉 DO THIS:
1. Open your file explorer / Finder
2. Go to: HirQube/backend/
3. Paste the downloaded JSON file there
4. Rename it to: firebase-key.json

Result: backend/firebase-key.json ✅
```

**Verify it exists:**
```bash
# Mac/Linux:
ls backend/firebase-key.json

# Windows PowerShell:
Test-Path backend/firebase-key.json
```

---

## Part 2: Update Your Code (automatically done!)

### ✅ Already Updated:

These files were already updated for you:

- ✅ `backend/src/server.js` - Uses Firebase
- ✅ `backend/src/config/firebase.js` - Firebase initialization (NEW)
- ✅ `backend/src/controllers/jobController.js` - Firestore queries
- ✅ `backend/src/scheduler/jobScheduler.js` - Firestore batch writes
- ✅ `backend/package.json` - firebase-admin instead of mongoose
- ✅ `backend/.env` - Firebase config
- ✅ `backend/.env.example` - Firebase template
- ✅ `.gitignore` - Protects firebase-key.json

---

## Part 3: Install Dependencies (3 minutes)

### Step 5: Open Terminal in Backend Folder

```bash
# Navigate to backend:
cd HirQube/backend

# Or if you're elsewhere:
cd c:\Users\mahes\OneDrive\Pictures\Documents\GitHub\HirQube\backend
```

---

### Step 6: Install Firebase Package

```bash
npm install firebase-admin
```

**Expected output:**
```
added X packages
```

**Takes:** 2-3 minutes ⏳

---

### Step 7: Remove Old MongoDB Package

```bash
npm uninstall mongoose
```

**Expected output:**
```
removed X package
```

---

### Step 8: Verify Installation

```bash
npm list firebase-admin
npm list | grep firebase

# Should show: firebase-admin@11.8.0
```

---

## Part 4: Start Your Backend (1 minute)

### Step 9: Start Backend Server

```bash
# From backend folder:
npm run dev
```

**Expected console output:**
```
✅ Server running on http://localhost:5000
📊 Database: Firebase Firestore
🕐 Job Scheduler: Starting...
⏰ Job scheduler started. Next run: tomorrow at 2 AM UTC
```

**If you see this:** Backend is running! ✅

---

### Step 10: Test Connection

**In a NEW terminal (keep backend running in first terminal):**

```bash
# Test 1: Health check
curl http://localhost:5000/api/health

# Expected response:
# {"status":"Server is running","database":"Firebase Firestore",...}
```

---

## Part 5: Sync First Jobs (2 minutes)

### Step 11: Trigger First Job Sync

```bash
# Still in new terminal:
curl -X POST http://localhost:5000/api/jobs/sync-adzuna \
  -H "Content-Type: application/json" \
  -d '{"keyword":"developer","location":"us"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Sync completed",
  "inserted": 25,
  "duplicates": 0,
  "total": 50
}
```

**What happened:** Firebase now has 25 real job listings! 🎉

---

### Step 12: Verify Jobs in Firebase

```bash
# Check jobs stored:
curl "http://localhost:5000/api/jobs?limit=5"

# Expected response:
# List of 5 jobs with their details
```

---

## Part 6: Start Frontend (2 minutes)

### Step 13: Open New Terminal for Frontend

```bash
# Open a 3rd terminal window/tab

# Navigate to frontend:
cd HirQube/frontend

# Or from root:
cd c:\Users\mahes\OneDrive\Pictures\Documents\GitHub\HirQube\frontend
```

---

### Step 14: Start Frontend Server

```bash
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view hirqube in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://xxx.xxx.x.xxx:3000
```

**Browser opens automatically** to http://localhost:3000 ✅

---

### Step 15: Test Full Application

```
1. Browser should show: HirQube job listings
2. Search box at top
3. Job cards displaying
4. Click on a job → See details
5. Click "Apply Now" → Opens external link

All working? ✅ You're done!
```

---

## Summary: Your 3 Terminal Sessions

By end, you should have **3 running terminal windows:**

| Terminal | Command | What It Does |
|----------|---------|--------------|
| **Terminal 1** | `cd backend && npm run dev` | Backend API (port 5000) |
| **Terminal 2** | `curl ...` commands | Testing API |
| **Terminal 3** | `cd frontend && npm start` | React frontend (port 3000) |

**Result:** Jobs flowing from Adzuna → Firebase → React UI 🎉

---

## ✅ Completion Checklist

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] firebase-key.json downloaded to backend/
- [ ] `npm install firebase-admin` completed
- [ ] `npm uninstall mongoose` completed
- [ ] Backend starts with `npm run dev` ✅
- [ ] Health check returns Firebase status ✅
- [ ] Job sync returns success ✅
- [ ] Frontend starts with `npm start` ✅
- [ ] Jobs display in browser ✅

---

## 🆘 Quick Troubleshooting

### Backend won't start

```bash
# Error: "Cannot find module 'firebase-admin'"
npm install firebase-admin

# Error: "firebase-key.json not found"
# → Check file is actually in backend/ folder
ls backend/firebase-key.json  # or on Windows: dir backend\firebase-key.json
```

---

### Jobs not syncing

```bash
# 1. Check backend health
curl http://localhost:5000/api/health
# Should show "Firebase Firestore"

# 2. Manually trigger sync
curl -X POST http://localhost:5000/api/jobs/sync-adzuna \
  -H "Content-Type: application/json" \
  -d '{"keyword":"developer","location":"us"}'
```

---

### Frontend won't load jobs

```bash
# 1. Check backend is running:
curl http://localhost:5000/api/jobs

# 2. Check frontend .env has correct API URL:
cat frontend/.env.example
# Should show: REACT_APP_API_URL=http://localhost:5000
```

---

## 🎉 You Did It!

**MongoDB → Firebase migration complete!**

### What Works Now:

✅ Backend: Express API using Firebase Firestore  
✅ Frontend: React showing real job listings  
✅ Scheduler: Automatic daily job syncing  
✅ Search: Find jobs by keyword and location  
✅ Database: Free tier, no credit card needed  

### Next Steps (Optional):

- Deploy to production (Render + Vercel)
- Add AI feature (n8n) for resume ATS
- Add more search filters
- Implement user authentication

---

**Questions?** Check these docs:
- [FIREBASE_QUICK_START.md](./FIREBASE_QUICK_START.md) - 5 min overview
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Detailed setup
- [FIREBASE_MIGRATION_SUMMARY.md](./FIREBASE_MIGRATION_SUMMARY.md) - What changed
