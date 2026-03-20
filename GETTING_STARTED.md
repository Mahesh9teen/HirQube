# 🚀 GETTING STARTED - HirQube Project

## **YOUR FIRST STEP: Run the Initialization Script**

### Windows Users (You):

1. **Open PowerShell or Command Prompt** in your HirQube folder
2. **Run this command:**
   ```bash
   init-project.bat
   ```
   This will automatically:
   - Create all folders (backend, frontend, n8n-workflows)
   - Create all package.json and .env files
   - Initialize Git repository
   - Download React dependencies

3. **Wait 2-3 minutes** for it to complete

---

## **STEP 1: Get Your API Keys (5 minutes)**

### **A) Adzuna API Key** (Job listings source)

1. Go to: https://developer.adzuna.com/
2. Click **"Sign Up"** (top right)
3. Fill in: Name, Email, Password
4. **Verify your email** (check inbox)
5. Login and go to "Applications"
6. Click **"Create Application"**
7. Fill in: App Name = "HirQube"
8. **Copy your App ID and API Key** (save these!)
9. Open `backend/.env` and update:
   ```
   ADZUNA_API_ID=your_app_id_here
   ADZUNA_API_KEY=your_api_key_here
   ```

### **B) Logo.dev API Key** (Company logos)

1. Go to: https://logo.dev/
2. Click **"Get started free"**
3. Enter your email and password
4. Check email and verify
5. Login → Go to **"API Key"**
6. Copy your API key
7. Update `backend/.env`:
   ```
   LOGODEV_API_KEY=your_key_here
   ```

### **C) MongoDB Atlas** (Database)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"**
3. Sign up with email
4. **Verify email**
5. Create a new project: Name = "HirQube"
6. Create a Cluster: Choose **"M0 (FREE)"**
7. Choose Region: **US-EAST-1** (or nearest)
8. Wait 2-3 minutes for cluster to be created
9. Click **"Connect"**
10. Add IP address: Click "Add My Current IP Address"
11. Create database user: 
    - Username: `hirqube_user`
    - Password: **save this!**
12. Click **"Choose Connection Method"** → **"Drivers"** → **"Node.js"**
13. Copy the connection string
14. Replace `password` with your actual password
15. Update `backend/.env`:
    ```
    MONGODB_URI=mongodb+srv://hirqube_user:your_password@cluster0.xxxxx.mongodb.net/hirqube?retryWrites=true&w=majority
    ```

---

## **STEP 2: Install Dependencies & Start Backend**

### **Terminal 1: Backend Setup**

```bash
# Navigate to backend folder
cd backend

# Install dependencies (takes 2-3 minutes)
npm install

# Run the development server
npm run dev
```

**You should see:**
```
✅ MongoDB connected
✅ Server running on http://localhost:5000
✅ Job scheduler started. Next run: tomorrow at 2 AM
```

If you see errors:
- Check that MongoDB URI is correct in `.env`
- Check that Adzuna keys are correct in `.env`
- Make sure port 5000 is available

---

## **STEP 3: Start Frontend**

### **Terminal 2: Frontend Setup**

```bash
# Navigate to frontend folder (from root, not backend)
cd frontend

# Install dependencies (takes 2-3 minutes)
npm install

# Start React app
npm start
```

**You should see:**
```
Compiled successfully!

Local: http://localhost:3000
```

**Browser will automatically open** showing a blank React page.

---

## **STEP 4: Test Your First Job Sync**

### **Terminal 3: Test API**

```bash
# Navigate to backend folder
cd backend

# Fetch jobs from Adzuna and store in MongoDB
curl -X POST http://localhost:5000/api/jobs/sync-adzuna ^
  -H "Content-Type: application/json" ^
  -d "{\"keyword\":\"developer\",\"location\":\"US\"}"
```

**You should see:**
```json
{
  "message": "Sync completed",
  "inserted": 45,
  "duplicates": 0,
  "total": 50
}
```

---

## **STEP 5: View Jobs in Frontend**

1. Go to: **http://localhost:3000**
2. You should see a jobs page with:
   - Search bar
   - Company logos (from Logo.dev)
   - Job titles, companies, locations
   - "Posted" date
   - Pagination

**Click on any job** to see full details and "Apply Now" button!

---

## **STEP 6: Set Up Automatic Daily Sync**

The backend **automatically syncs jobs daily at 2 AM** (UTC).

You can also **manually trigger** it from Terminal 3:

```bash
# Sync different keywords/locations
curl -X POST http://localhost:5000/api/jobs/sync-adzuna ^
  -H "Content-Type: application/json" ^
  -d "{\"keyword\":\"react\",\"location\":\"UK\"}"
```

---

## **STEP 7: Next Phase - AI Automation (n8n)**

Once backend + frontend are working:

### **Set up n8n for AI Resume Check:**

1. Install n8n globally:
   ```bash
   npm install -g n8n
   ```

2. Start n8n:
   ```bash
   n8n start
   ```

3. Go to: **http://localhost:5678**

4. Create a new workflow (follow templates in `n8n-workflows/`)

5. Add OpenAI node for AI resume checking

6. Connect it to your backend via webhook

---

## **TROUBLESHOOTING**

### **"MongoDB connection failed"**
- Check MongoDB password has no special characters (encode if needed)
- Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for development)
- Wait 5 minutes after creating user

### **"Adzuna API error"**
- Verify API ID and Key in `.env`
- Check API quota (free tier has limits)

### **Port 5000 already in use**
- Change `PORT=5001` in `backend/.env`
- Or kill process: `taskkill /PID <process_id> /F`

### **React not showing jobs**
- Check browser console (F12 > Console tab)
- Check backend logs for errors
- Run API test in Terminal 3

---

## **FILE STRUCTURE CREATED**

```
HirQube/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── scheduler/
│   │   └── server.js
│   ├── .env           👈 Update with keys
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── n8n-workflows/     👈 For AI automation
├── IMPLEMENTATION_GUIDE.md
├── GETTING_STARTED.md  👈 You are here
└── .gitignore
```

---

## **QUICK REFERENCE COMMANDS**

```bash
# Terminal 1: Start Backend
cd backend && npm run dev

# Terminal 2: Start Frontend
cd frontend && npm start

# Terminal 3: Test API
curl -X POST http://localhost:5000/api/jobs/sync-adzuna ^
  -H "Content-Type: application/json" ^
  -d "{\"keyword\":\"developer\",\"location\":\"US\"}"

# View all jobs via API
curl http://localhost:5000/api/jobs

# Search jobs
curl "http://localhost:5000/api/jobs?search=python&location=US"
```

---

## **NEXT STEPS AFTER BASIC SETUP WORKS**

Once backend + frontend are running and you can see jobs:

1. ✅ **Phase 1-5:** Basic job listing (you just completed!)
2. 🔄 **Phase 6:** Add resume upload & ATS check (n8n)
3. 🔄 **Phase 7:** Google Sheets integration (store candidate profiles)
4. 🔄 **Phase 8:** Job recommendation algorithm
5. 🔄 **Phase 9:** Recruiter dashboard & candidate matching

---

## **SUPPORT**

- Check logs in browser console (F12)
- Check backend logs in Terminal 1
- Check MongoDB Atlas dashboard for connection
- See IMPLEMENTATION_GUIDE.md for more details

---

**You're ready! Run `init-project.bat` and follow the steps above.** 🎉

