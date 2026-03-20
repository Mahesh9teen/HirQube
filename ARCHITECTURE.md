# HirQube Architecture Diagram & Data Flow

## **System Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                       USER BROWSER                               │
│                   http://localhost:3000                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              REACT FRONTEND (port 3000)                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  │   JobsPage   │  │  JobCard     │  │  JobDetail Modal │  │
│  │  │              │  │              │  │                  │  │
│  │  │ - Search bar │  │ - Logo image │  │ - Full desc      │  │
│  │  │ - Filter     │  │ - Title      │  │ - Requirements   │  │
│  │  │ - Pagination │  │ - Company    │  │ - Apply button   │  │
│  │  └──────────────┘  │ - Location   │  └──────────────────┘  │
│  │                    │ - Date       │                         │
│  │                    └──────────────┘                         │
│  └────────────────────────────────────────────────────────────┘
│                            │ API calls
│                            ▼
└─────────────────────────────────────────────────────────────────┘
                            │
                    Axios HTTP Requests
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
   ┌─────────────────┐              ┌──────────────────┐
   │  BACKEND API    │              │  EXTERNAL APIS   │
   │ (port 5000)     │              │                  │
   │                 │              │ ┌──────────────┐ │
   │ Express Routes: │              │ │  Adzuna API  │ │
   │ ┌─────────────┐ │              │ │              │ │
   │ │ GET /jobs   │◄──────────────►│ │ - Search jobs│ │
   │ │             │ │              │ │ - Get listing│ │
   │ │ POST /sync  │ │              │ └──────────────┘ │
   │ │             │─────────────┐  │                  │
   │ │ GET /health │ │           │  │ ┌──────────────┐ │
   │ └─────────────┘ │           │  │ │  Logo.dev    │ │
   │                 │           └─►│ │              │ │
   │ Controllers:    │              │ │ - Fetch logos│ │
   │ ┌─────────────┐ │              │ │ - By domain  │ │
   │ │ jobCtrlr.js ├─┼──────────────┤ └──────────────┘ │
   │ └─────────────┘ │              │                  │
   │                 │              └──────────────────┘
   │ Models:         │
   │ ┌─────────────┐ │
   │ │ Job.js      │ │
   │ │ (MongoDB)   │ │
   │ └─────────────┘ │
   │                 │
   │ Services:       │
   │ ┌─────────────┐ │
   │ │ adzunaServ. │─────────────┐
   │ │ logoServ.   │ │           │
   │ └─────────────┘ │           │
   │                 │           │
   │ Scheduler:      │           │
   │ ┌─────────────┐ │           │
   │ │ Cron jobs   │ │           │
   │ │ 2 AM daily  │─┼───────────┘
   │ └─────────────┘ │
   └─────────────────┘
        │
        │ Read/Write
        │
        ▼
   ┌──────────────────────┐
   │  MONGODB ATLAS       │
   │                      │
   │  Database: hirqube   │
   │  Collection: jobs    │
   │                      │
   │  Documents:          │
   │  {                   │
   │    _id               │
   │    title             │
   │    company           │
   │    companyLogo       │
   │    description       │
   │    applyUrl          │
   │    location          │
   │    postedDate        │
   │    source            │
   │    fingerprint       │
   │    ... more fields   │
   │  }                   │
   │                      │
   └──────────────────────┘


```

---

## **DATA FLOW - Job Sync Process**

```
1️⃣  SCHEDULER TRIGGER
    ┌─────────────────────┐
    │  Node-cron (2 AM)   │
    │  jobScheduler.js    │
    └──────────┬──────────┘
               │
               ▼
2️⃣  FETCH FROM ADZUNA
    ┌─────────────────────┐
    │ adzunaService.js    │
    │                     │
    │ axios.get(          │
    │  Adzuna API URL,    │
    │  {                  │
    │   app_id,           │
    │   app_key,          │
    │   keyword,          │
    │   location          │
    │  }                  │
    │ )                   │
    └──────────┬──────────┘
               │
               ▼ Returns jobs
3️⃣  PARSE & MAP DATA
    ┌─────────────────────────────────────┐
    │ Extract from Adzuna response:       │
    │                                     │
    │ Adzuna Field    → HirQube Field    │
    │ ─────────────────────────────────── │
    │ title           → title             │
    │ company.name    → company           │
    │ location.name   → location          │
    │ description     → description       │
    │ redirect_url    → applyUrl          │
    │ created         → postedDate        │
    │ salary_min/max  → salary            │
    │                                     │
    │ Generate fingerprint (SHA-256)      │
    │ Title + Company + Location hash     │
    └──────────┬──────────────────────────┘
               │
               ▼
4️⃣  CHECK FOR DUPLICATES
    ┌─────────────────────────────────────┐
    │ FOR each job in results:            │
    │                                     │
    │ SELECT * FROM jobs                 │
    │ WHERE fingerprint = job.fingerprint │
    │                                     │
    │ IF EXISTS → Skip (duplicate)        │
    │ IF NOT → Go to step 5               │
    └──────────┬──────────────────────────┘
               │
               ▼
5️⃣  FETCH COMPANY LOGO
    ┌─────────────────────┐
    │ logoService.js      │
    │                     │
    │ Extract domain from │
    │ applyUrl            │
    │                     │
    │ axios.get(          │
    │  Logo.dev API,      │
    │  domain,            │
    │  apikey             │
    │ )                   │
    └──────────┬──────────┘
               │
               ▼ Logo URL or null
6️⃣  SAVE TO MONGODB
    ┌─────────────────────────────────────┐
    │ Create Job document:                │
    │                                     │
    │ const newJob = new Job({            │
    │   title,                            │
    │   company,                          │
    │   location,                         │
    │   description,                      │
    │   applyUrl,                         │
    │   source: 'adzuna',                 │
    │   companyLogo,  // from Logo.dev    │
    │   postedDate,                       │
    │   fingerprint,  // dedup key        │
    │   createdAt: now                    │
    │ })                                  │
    │                                     │
    │ newJob.save()                       │
    └──────────┬──────────────────────────┘
               │
               ▼
7️⃣  REPEAT FOR NEXT JOB
    ┌─────────────────────┐
    │ Loop to step 4      │
    │ until all processed │
    └──────────┬──────────┘
               │
               ▼
8️⃣  COMPLETE
    ┌──────────────────────────────────┐
    │ Log result:                      │
    │ - Inserted: 45 new jobs          │
    │ - Duplicates: 5 skipped          │
    │ - Total: 50 processed            │
    └──────────────────────────────────┘

```

---

## **USER JOURNEY - Finding a Job**

```
┌──────────────────┐
│  User opens      │
│  localhost:3000  │
└────────┬─────────┘
         │
         ▼
┌───────────────────────────────────────┐
│  FRONTEND: React App Loads            │
│  - Fetch initial jobs from backend    │
│  - axios.get('/api/jobs?page=1')      │
└────────┬────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────┐
│  BACKEND: jobController.getJobs()     │
│  - Query MongoDB                      │
│  - Sort by postedDate DESC            │
│  - Return 20 jobs + pagination        │
└────────┬────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────┐
│  FRONTEND: Display JobCards           │
│  For each job:                        │
│  - Show logo image                    │
│  - Show title, company, location      │
│  - Show "NEW" badge if <24 hrs old    │
│  - Add click listener                 │
└────────┬────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  User enters search term              │
│  e.g., "react developer"              │
│  Clicks Search                        │
└────────┬───────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────┐
│  FRONTEND: Call Backend               │
│  axios.get('/api/jobs?                │
│    search=react developer&             │
│    location=US'                        │
│  )                                    │
└────────┬────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────┐
│  BACKEND: Search in MongoDB           │
│  db.jobs.find({                       │
│    $text: {$search: "react"}          │
│  })                                   │
│                                       │
│  (Text index on title, company, desc) │
└────────┬────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  FRONTEND: Show filtered JobCards      │
│  User clicks on a job card            │
└────────┬─────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  FRONTEND: Open JobDetail Modal        │
│  Display:                              │
│  - Full description                    │
│  - Requirements                        │
│  - Company info (logo, name, location) │
│  - "Apply Now" button                  │
└────────┬─────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  User clicks "Apply Now" button        │
└────────┬─────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Opens job applyUrl in new tab         │
│  Examples:                             │
│  - Company career page                 │
│  - Adzuna job posting                  │
│  - LinkedIn job listing                │
└────────────────────────────────────────┘

```

---

## **Database Schema**

```javascript
Job {
  _id: ObjectId,                    // MongoDB ID
  
  // Core job details
  title: String,                    // "React Developer"
  company: String,                  // "TechCorp"
  location: String,                 // "New York, NY, USA"
  
  // Full content
  description: String,              // HTML or plain text (extracted)
  requirements: String,             // Skills/experience needed
  
  // Apply
  applyUrl: String,                 // Original job posting URL
  source: String,                   // "adzuna" | "usajobs" | "scraper"
  sourceId: String,                 // Unique ID from source
  
  // Company
  companyLogo: String,              // URL to logo (from Logo.dev)
  companyDomain: String,            // "techcorp.com"
  companyLinkedin: String,          // LinkedIn URL (if available)
  
  // Recruiter (optional)
  recruiterName: String,            // If from source
  recruiterLinkedin: String,        // LinkedIn profile
  
  // Metadata
  postedDate: Date,                 // When job was posted
  salary: String,                   // "$80k - $120k/year"
  jobType: String,                  // "full-time" | "part-time" | etc
  
  // Deduplication
  fingerprint: String,              // SHA256(title+company+location)
  sourceUrls: [String],             // All sources with this job
  
  // Tracking
  createdAt: Date,                  // When added to DB
  updatedAt: Date,                  // Last update
}

// Indexes
- title (for text search)
- company (for filtering)
- location (for filtering)
- postedDate (for sorting)
- fingerprint (for deduplication - UNIQUE)
- Full text: {title, company, description}
```

---

## **API Response Format**

```json
// GET /api/jobs?search=developer&location=US&page=1&limit=20

{
  "jobs": [
    {
      "_id": "65f3c4b2d3e4f5a6b7c8d9e0",
      "title": "Senior React Developer",
      "company": "TechCorp",
      "location": "New York, NY, USA",
      "description": "We are looking for a skilled React developer...",
      "applyUrl": "https://techcorp.com/careers/react-dev",
      "companyLogo": "https://logo.dev/logo?domain=techcorp.com",
      "postedDate": "2024-03-18T10:30:00Z",
      "salary": "$120k - $150k/year",
      "jobType": "full-time",
      "source": "adzuna",
      "recruiterName": "John Doe",
      "recruiterLinkedin": "https://linkedin.com/in/johndoe"
    },
    // ... more jobs
  ],
  "pagination": {
    "total": 342,
    "page": 1,
    "pages": 18
  }
}
```

---

## **Component Props Flow**

```
JobsPage (parent)
├── state: jobs[], search, location, page
├── fetch jobs from API
└── renders:
    │
    ├─► JobCard (props: job, onClick)
    │   ├─ Displays: logo, title, company, location
    │   ├─ Shows "New" badge if recent
    │   └─ onClick → setState(selectedJob)
    │
    └─► JobDetail Modal (props: job, onClose)
        ├─ Displays: full description, requirements
        ├─ Shows recruiter info (if available)
        ├─ "Apply Now" button → window.open(applyUrl)
        └─ Close button → onClose()
```

---

## **Scheduler Timeline**

```
┌─ Every Day at 2:00 AM UTC
│
├─ Fetch "developer" jobs from Adzuna (US, UK, IN)
├─ Fetch "react" jobs from Adzuna (US, UK, IN)  
├─ Fetch "nodejs" jobs from Adzuna (US, UK, IN)
├─ Fetch "fullstack" jobs from Adzuna (US, UK, IN)
│
└─ For each fetched job:
   ├─ Generate fingerprint
   ├─ Check for duplicates in MongoDB
   ├─ If new: fetch logo from Logo.dev
   ├─ Save to MongoDB
   └─ Log results

✅ Completely autonomous
✅ Runs in background
✅ No manual intervention needed
✅ Respects API rate limits
```

