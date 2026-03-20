# 🎬 EXACT COMMANDS TO RUN - Phase by Phase

## **PHASE 1: SETUP (5 minutes)**

### **Your First Command**
```bash
init-project.bat
```

✅ This creates entire folder structure automatically, then STOP and update .env first

---

## **PHASE 2: GET API KEYS (15 minutes)**

### **From Your Browser - Get 3 Keys**

**1. Adzuna API:**
```
https://developer.adzuna.com → Sign up → Create App → Copy ID & Key
```

**2. Logo.dev API:**
```
https://logo.dev → Sign up → API Key section → Copy key
```

**3. MongoDB Atlas:**
```
https://mongodb.com/cloud/atlas → Create account → Create cluster → Get connection string
```

### **Update Your File:**

Open: `backend/.env`

Replace with your actual keys:
```env
PORT=5000
MONGODB_URI=mongodb+srv://hirqube_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hirqube?retryWrites=true&w=majority
ADZUNA_API_ID=YOUR_APP_ID
ADZUNA_API_KEY=YOUR_APP_KEY
LOGODEV_API_KEY=YOUR_LOGO_KEY
NODE_ENV=development
```

---

## **PHASE 3: INSTALL DEPENDENCIES (5-10 minutes)**

### **Terminal 1: Backend Setup**
```bash
cd HirQube
cd backend
npm install
```

You should see:
```
added 156 packages in 2m
```

### **Terminal 2: Frontend Setup** (while Terminal 1 installs)
```bash
cd HirQube
cd frontend
npm install
```

You should see:
```
added 1234 packages in 3m
```

---

## **PHASE 4: START SERVERS (2 terminals)**

### **Terminal 1: Start Node.js Backend**
```bash
cd HirQube/backend
npm run dev
```

You should see:
```
✅ MongoDB connected
✅ Server running on http://localhost:5000
✅ Job scheduler started
```

**Leave this running in background**

---

### **Terminal 2: Start React Frontend**
```bash
cd HirQube/frontend
npm start
```

You should see:
```
Compiled successfully!

Local: http://localhost:3000
```

**Browser automatically opens at http://localhost:3000**

---

## **PHASE 5: TEST FIRST JOB SYNC (Terminal 3)**

### **Terminal 3: Manual Job Sync**
```bash
cd HirQube/backend
curl -X POST http://localhost:5000/api/jobs/sync-adzuna ^
  -H "Content-Type: application/json" ^
  -d "{\"keyword\":\"developer\",\"location\":\"US\"}"
```

You should see:
```json
{
  "message": "Sync completed",
  "inserted": 45,
  "duplicates": 0,
  "total": 50
}
```

If you get errors:
- Check backend logs in Terminal 1
- Verify API keys in `.env`
- Verify MongoDB connection

---

## **PHASE 6: VIEW JOBS IN FRONTEND**

Go to: **http://localhost:3000**

You should see:
- Search bar with location filter
- Grid of job cards
- Company logos (if fetched successfully)
- Job titles, companies, locations
- Posted dates
- Pagination buttons

Click any card → Full details modal pops up

Click "Apply Now" → Opens original job URL

---

## **PHASE 7: SYNC MORE KEYWORDS (Terminal 3)**

Try different searches:
```bash
# Python jobs
curl -X POST http://localhost:5000/api/jobs/sync-adzuna ^
  -H "Content-Type: application/json" ^
  -d "{\"keyword\":\"python\",\"location\":\"US\"}"

# JavaScript jobs
curl -X POST http://localhost:5000/api/jobs/sync-adzuna ^
  -H "Content-Type: application/json" ^
  -d "{\"keyword\":\"javascript\",\"location\":\"UK\"}"

# Jobs in India
curl -X POST http://localhost:5000/api/jobs/sync-adzuna ^
  -H "Content-Type: application/json" ^
  -d "{\"keyword\":\"nodejs\",\"location\":\"IN\"}"
```

---

## **PHASE 8: CHECK JOBS IN DATABASE (Terminal 3)**

### **Option A: View via API**
```bash
# Get all jobs
curl http://localhost:5000/api/jobs

# Get specific page (20 per page)
curl "http://localhost:5000/api/jobs?page=1&limit=20"

# Search by keyword
curl "http://localhost:5000/api/jobs?search=react&location=US"

# Get single job details
curl http://localhost:5000/api/jobs/[PASTE_JOB_ID_HERE]
```

### **Option B: View via MongoDB Atlas Dashboard**
```
Go to: https://www.mongodb.com/cloud/atlas
→ Your project → Collections
→ hirqube database → jobs collection
→ Browse all documents
```

---

## **PHASE 9: AUTOMATIC DAILY SYNC**

The scheduler runs **automatically at 2 AM UTC daily**.

Edit keywords in `backend/src/scheduler/jobScheduler.js`:
```javascript
const keywords = ['developer', 'react', 'nodejs', 'fullstack'];
const locations = ['US', 'UK', 'IN'];
// Add more keywords/locations as needed
```

---

## **PHASE 10: DEPLOYMENT (when ready)**

### **Deploy Backend to Render.com (free)**
```bash
# 1. Create account at render.com
# 2. New → Web Service → Connect GitHub
# 3. Build command: npm install
# 4. Start command: npm start
# 5. Add environment variables from .env
# 6. Deploy
```

### **Deploy Frontend to Vercel (free)**
```bash
# 1. Create account at vercel.com
# 2. Import Project → Select frontend folder
# 3. Build settings auto-detected
# 4. Add environment variable:
#    REACT_APP_API_URL=https://your-render-backend-url.com
# 5. Deploy
```

---

## **DAILY WORKFLOW (After First Setup)**

```bash
# Every day, you just need 2 terminals:

# Terminal 1: Start Backend
cd HirQube/backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm start

# That's it! Jobs sync automatically at 2 AM
# New jobs will be in database without manual sync
```

---

## **TROUBLESHOOTING COMMANDS**

### **Check if ports are in use**
```bash
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

### **Kill a process using a port**
```bash
taskkill /PID 12345 /F  # Replace 12345 with actual PID
```

### **Test MongoDB connection**
```bash
mongosh "mongodb+srv://hirqube_user:PASSWORD@cluster.mongodb.net/hirqube"
```

### **View Node logs**
```bash
# In Terminal 1 (backend) - logs appear as they run
# Press Ctrl+C to stop backend
```

### **Clear browser cache if not seeing updates**
```
F12 → Application → Cookies → Clear all
Refresh page
```

### **Restart backend after code changes**
```bash
# Terminal 1: Press Ctrl+C
# Terminal 1: npm run dev  (nodemon auto-restarts)
```

---

## **QUICK REFERENCE - Common Tasks**

| Task | Command |
|------|---------|
| Start backend | `cd backend` → `npm run dev` |
| Start frontend | `cd frontend` → `npm start` |
| Sync jobs manually | `curl -X POST localhost:5000/api/jobs/sync-adzuna -H "Content-Type: application/json" -d "{\"keyword\":\"developer\",\"location\":\"US\"}"` |
| Get all jobs | `curl localhost:5000/api/jobs` |
| Search jobs | `curl "localhost:5000/api/jobs?search=react"` |
| View MongoDB | Visit Atlas dashboard |
| Install new package | `npm install package-name` |
| Update .env | Edit `backend/.env` then restart backend |
| View backend logs | Look at Terminal 1 output |
| View frontend errors | Open browser DevTools (F12 → Console) |

---

## **COMPLETE STARTUP SEQUENCE**

### **First Time (takes 30 mins)**
```
1. init-project.bat
2. Get 3 API keys
3. Update backend/.env
4. Terminal 1: cd backend && npm install
5. Terminal 2: cd frontend && npm install
6. Terminal 1: npm run dev (backend running)
7. Terminal 2: npm start (frontend opens at :3000)
8. Terminal 3: sync jobs via curl
9. View jobs in browser
```

### **Every Other Day (takes 30 seconds)**
```
1. Open 2 terminals
2. Terminal 1: cd backend && npm run dev
3. Terminal 2: cd frontend && npm start
4. Wait for http://localhost:3000 to open
5. Jobs automatically sync at 2 AM
```

---

## **NEXT STEPS AFTER SETUP WORKS**

Once you have jobs showing in frontend:

1. **Add more Adzuna keywords** in jobScheduler.js
2. **Deploy to production** (Render + Vercel)
3. **Set up n8n** for AI resume checking
4. **Add Google Sheets integration** for candidate profiles
5. **Implement job recommendations** (ML matching)
6. **Add recruiter dashboard** for candidate matching

---

## **YOU ARE HERE**

✅ Step 1: Complete this command list
✅ Step 2: All jobs showing in React app
⏳ Step 3: Deploy when ready
⏳ Step 4: Add AI features (n8n)

**Next action: Run `init-project.bat` now!**

