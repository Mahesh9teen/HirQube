# 🎯 HirQube - QUICK COMMAND REFERENCE

## **30-SECOND PROJECT START**

```bash
# Terminal 1: Run initialization
init-project.bat

# Then update backend/.env with your 3 API keys from:
# 1. Adzuna (ADZUNA_API_ID, ADZUNA_API_KEY)
# 2. Logo.dev (LOGODEV_API_KEY)
# 3. MongoDB Atlas (MONGODB_URI)

# Terminal 1: Start Backend
cd backend
npm install
npm run dev

# Terminal 2: Start Frontend (from root directory)
cd frontend
npm install
npm start

# Terminal 3: First job sync
cd backend
curl -X POST http://localhost:5000/api/jobs/sync-adzuna -H "Content-Type: application/json" -d "{\"keyword\":\"developer\",\"location\":\"US\"}"
```

---

## **DAILY WORKFLOW**

```bash
# Start backend
cd backend && npm run dev

# Start frontend (in new terminal)
cd frontend && npm start

# Frontend opens at: http://localhost:3000
# Backend API at: http://localhost:5000/api/jobs
```

---

## **BACKEND API ENDPOINTS**

```bash
# Get all jobs with pagination
GET http://localhost:5000/api/jobs?page=1&limit=20

# Search jobs by keyword
GET http://localhost:5000/api/jobs?search=react&location=US

# Get single job details
GET http://localhost:5000/api/jobs/[job_id]

# Sync jobs from Adzuna (manual trigger)
POST http://localhost:5000/api/jobs/sync-adzuna
Body: {"keyword":"nodejs","location":"UK"}

# Health check
GET http://localhost:5000/api/health
```

---

## **DATABASE QUERIES** (MongoDB)

```bash
# Connect to MongoDB Atlas Compass or MongoDB Shell

# View all jobs
db.jobs.find({})

# Search by title
db.jobs.find({title: {$regex: "React", $options: "i"}})

# Count total jobs
db.jobs.countDocuments({})

# Find jobs by company
db.jobs.find({company: "Google"})

# Delete old jobs (older than 30 days)
db.jobs.deleteMany({postedDate: {$lt: new Date(Date.now() - 30*24*60*60*1000)}})
```

---

## **PROJECT STRUCTURE**

```
HirQube/
├── backend/                       # Node.js API
│   ├── src/
│   │   ├── controllers/jobController.js      # Route handlers
│   │   ├── models/Job.js                     # MongoDB schema
│   │   ├── services/
│   │   │   ├── adzunaService.js              # Fetch from Adzuna
│   │   │   └── logoService.js                # Fetch company logos
│   │   ├── routes/jobRoutes.js               # API endpoints
│   │   ├── scheduler/jobScheduler.js         # Cron jobs (daily sync)
│   │   └── server.js                         # Express app entry
│   ├── .env                       # API keys (KEEP SECRET)
│   └── package.json
│
├── frontend/                      # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── JobCard.js         # Single job display
│   │   │   └── JobDetail.js       # Full job modal
│   │   ├── pages/
│   │   │   └── JobsPage.js        # Main jobs list
│   │   ├── services/
│   │   │   └── api.js             # Axios calls to backend
│   │   └── App.js
│   └── package.json
│
├── n8n-workflows/                # AI automation (Phase 2)
│   ├── resume-ats-check.json
│   ├── job-recommendations.json
│   └── candidate-matching.json
│
├── IMPLEMENTATION_GUIDE.md        # Detailed setup
├── GETTING_STARTED.md             # Step-by-step guide
└── init-project.bat               # Auto setup (Windows)
```

---

## **FILE PURPOSES**

| File | Purpose |
|------|---------|
| `backend/src/server.js` | Express server, MongoDB connection, start scheduler |
| `backend/src/models/Job.js` | Job document schema (title, company, logo, etc) |
| `backend/src/services/adzunaService.js` | Fetch jobs from Adzuna API |
| `backend/src/services/logoService.js` | Fetch company logos from Logo.dev |
| `backend/src/controllers/jobController.js` | GET /jobs, POST /sync-adzuna handlers |
| `backend/src/routes/jobRoutes.js` | Map endpoints to controllers |
| `backend/src/scheduler/jobScheduler.js` | Daily auto-sync at 2 AM |
| `frontend/src/components/JobCard.js` | Single job card component |
| `frontend/src/components/JobDetail.js` | Full job detail modal |
| `frontend/src/pages/JobsPage.js` | Main jobs list page with search |

---

## **ENVIRONMENT VARIABLES (.env)**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hirqube?retryWrites=true&w=majority

# Adzuna API (get from https://developer.adzuna.com)
ADZUNA_API_ID=your_app_id
ADZUNA_API_KEY=your_api_key

# Logo.dev API (get from https://logo.dev)
LOGODEV_API_KEY=your_api_key
```

---

## **DEPENDENCIES EXPLAINED**

### **Backend (Node.js)**
- `express` - Web server framework
- `mongoose` - MongoDB connection & schemas
- `axios` - HTTP requests to APIs
- `dotenv` - Load environment variables
- `cors` - Allow frontend to call backend
- `node-cron` - Schedule daily job syncs

### **Frontend (React)**
- `axios` - HTTP requests to backend
- `react` - UI framework

### **Development**
- `nodemon` - Auto-reload on code changes

---

## **COMMON ISSUES & FIXES**

| Issue | Fix |
|-------|-----|
| `Cannot find module 'express'` | Run `npm install` in backend folder |
| `MongoDB connection failed` | Check MONGODB_URI in .env (password, IP whitelist) |
| `Adzuna API 403 error` | Verify API_ID and API_KEY are correct |
| `Port 5000 already in use` | Change PORT in .env or `taskkill /IM node.exe` |
| `React page is blank` | Check browser console (F12 > Console) for errors |
| `No jobs showing` | Run manual sync command in Terminal 3 |

---

## **PHASE CHECKLIST**

- [x] **Phase 1:** Project initialization
- [x] **Phase 2:** MongoDB + Job schema
- [x] **Phase 3:** Express server + API routes
- [x] **Phase 4:** Adzuna integration + logo service
- [x] **Phase 5:** Job scheduler (daily sync)
- [x] **Phase 6:** React components (JobCard, JobDetail, JobsPage)
- [ ] **Phase 7:** Deployment (Render backend, Vercel frontend)
- [ ] **Phase 8:** n8n setup (resume ATS check, job recommendations)
- [ ] **Phase 9:** Google Sheets integration + AI automation

---

## **NEXT: DEPLOY TO PRODUCTION**

Once everything works locally:

1. **Backend → Render.com** (free tier available)
2. **Frontend → Vercel.com** (free tier available)
3. **Schedule on cloud:** AWS Lambda or Render cron

See IMPLEMENTATION_GUIDE.md for deployment steps.

---

## **CONTACTS FOR SUPPORT**

- **Adzuna Issues:** https://developer.adzuna.com/docs
- **MongoDB Issues:** https://docs.mongodb.com/manual/
- **Logo.dev Issues:** https://logo.dev/docs
- **React Issues:** https://react.dev

