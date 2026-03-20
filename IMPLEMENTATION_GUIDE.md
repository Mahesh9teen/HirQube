# HirQube Implementation Guide - Step by Step

## Your Tech Stack
- **Backend:** Node.js (v18+)
- **Frontend:** React
- **Database:** MongoDB (Atlas)
- **APIs:** Adzuna (jobs), Logo.dev (company logos)
- **Automation:** n8n (Google Sheets sync, AI ATS check, job recommendations)
- **Version Control:** Git

---

## PROJECT OVERVIEW

HirQube is a job aggregation platform that:
1. Fetches jobs from Adzuna API
2. Stores them in MongoDB
3. Displays jobs on React frontend with company logos
4. Allows users to search/filter jobs
5. Uses AI (via n8n) to:
   - Check resume compatibility (ATS check)
   - Recommend jobs based on seeker profile
   - Match candidates to recruiter requirements

---

## PHASE 1: PROJECT INITIALIZATION (Step 1-2)

### Step 1: Initialize Git Repository & Project Structure

```bash
cd c:\Users\mahes\OneDrive\Pictures\Documents\GitHub\HirQube
git init
git config user.name "Your Name"
git config user.email "your@email.com"
```

**Create the folder structure:**
```
HirQube/
├── backend/                 # Node.js server
│   ├── src/
│   │   ├── controllers/     # Express route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── services/        # Business logic (API calls, scraping)
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, validators
│   │   └── server.js        # Entry point
│   ├── .env                 # Environment variables (API keys, DB URL)
│   ├── .gitignore           # (node_modules, .env)
│   └── package.json
│
├── frontend/                # React app
│   ├── src/
│   │   ├── components/      # JobCard, JobDetail, SearchBar
│   │   ├── pages/           # Home, Jobs, Dashboard
│   │   ├── services/        # API calls (axios/fetch)
│   │   └── App.js
│   └── package.json
│
├── n8n-workflows/           # n8n automation workflows
│   ├── resume-ats-check.json
│   ├── job-recommendations.json
│   └── candidate-matching.json
│
└── IMPLEMENTATION_GUIDE.md  # This file
```

### Step 2: Initialize Backend (Node.js)

**2a. Create backend directory and package.json:**
```bash
mkdir backend
cd backend
npm init -y
```

**2b. Install dependencies:**
```bash
npm install express mongoose dotenv cors axios node-cron
npm install -D nodemon
```

**2c. Create .env file (backend/.env):**
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hirqube?retryWrites=true&w=majority
ADZUNA_API_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key
LOGODEV_API_KEY=your_logo_dev_api_key
NODE_ENV=development
```

**2d. Create backend/package.json scripts:**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

---

## PHASE 2: DATABASE & DATA MODELS (Step 3)

### Step 3: Create MongoDB Schema & Job Model

**Create backend/src/models/Job.js:**
```javascript
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Core job details
  title: { type: String, required: true, index: true },
  company: { type: String, required: true, index: true },
  location: { type: String, required: true, index: true },
  
  // Full description
  description: { type: String },
  requirements: { type: String },
  
  // Application & source
  applyUrl: { type: String, required: true },
  source: { type: String, enum: ['adzuna', 'usajobs', 'scraper'], default: 'adzuna' },
  sourceId: { type: String, unique: true, sparse: true },
  
  // Company info
  companyLogo: { type: String },
  companyDomain: { type: String },
  companyLinkedin: { type: String },
  
  // Recruiter/HR info (if available from source)
  recruiterName: { type: String },
  recruiterLinkedin: { type: String },
  
  // Additional metadata
  postedDate: { type: Date, default: Date.now, index: true },
  salary: { type: String },
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'freelance'] },
  
  // Deduplication & tracking
  fingerprint: { type: String, unique: true, sparse: true },
  sourceUrls: [{ type: String }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for deduplication
jobSchema.index({ title: 1, company: 1, location: 1 });

// Index for search
jobSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text' 
});

module.exports = mongoose.model('Job', jobSchema);
```

---

## PHASE 3: BACKEND API SETUP (Step 4-5)

### Step 4: Create Express Server & Database Connection

**Create backend/src/server.js:**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB error:', err));

// Routes
app.use('/api/jobs', require('./routes/jobRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 5: Create Adzuna Integration Service

**Create backend/src/services/adzunaService.js:**
```javascript
const axios = require('axios');
const crypto = require('crypto');

const ADZUNA_API_URL = 'https://api.adzuna.com/v1/api/jobs';
const APP_ID = process.env.ADZUNA_API_ID;
const APP_KEY = process.env.ADZUNA_API_KEY;

/**
 * Fetch jobs from Adzuna API
 * @param {Object} options - { keyword, location, pageSize, pageNum }
 */
async function fetchJobsFromAdzuna(options = {}) {
  const {
    keyword = 'developer',
    location = 'US',
    pageSize = 50,
    pageNum = 1,
  } = options;

  try {
    const url = `${ADZUNA_API_URL}/gb/search/${pageNum}`;
    
    const response = await axios.get(url, {
      params: {
        app_id: APP_ID,
        app_key: APP_KEY,
        results_per_page: pageSize,
        full_time: true,
        what: keyword,
        where: location,
      },
    });

    const jobs = response.data.results || [];
    
    // Map Adzuna fields to your schema
    return jobs.map((job) => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      description: job.description || '',
      applyUrl: job.redirect_url,
      source: 'adzuna',
      sourceId: job.id,
      postedDate: new Date(job.created),
      salary: job.salary_min ? `${job.salary_min} - ${job.salary_max}` : null,
      fingerprint: generateFingerprint(job.title, job.company.display_name, job.location.display_name),
    }));
  } catch (error) {
    console.error('Error fetching from Adzuna:', error.message);
    throw error;
  }
}

/**
 * Generate unique fingerprint for deduplication
 */
function generateFingerprint(title, company, location) {
  const combined = `${title}|${company}|${location}`.toLowerCase();
  return crypto.createHash('sha256').update(combined).digest('hex');
}

module.exports = {
  fetchJobsFromAdzuna,
  generateFingerprint,
};
```

**Create backend/src/services/logoService.js:**
```javascript
const axios = require('axios');

const LOGO_API_URL = 'https://api.logo.dev/logos';
const LOGO_API_KEY = process.env.LOGODEV_API_KEY;

/**
 * Fetch company logo using Logo.dev API
 */
async function getCompanyLogo(companyDomain) {
  if (!companyDomain) return null;

  try {
    const response = await axios.get(`${LOGO_API_URL}/${companyDomain}`, {
      params: { apikey: LOGO_API_KEY },
    });

    return response.data.logo || null;
  } catch (error) {
    console.error(`Error fetching logo for ${companyDomain}:`, error.message);
    return null; // Fallback: no logo
  }
}

module.exports = { getCompanyLogo };
```

**Create backend/src/controllers/jobController.js:**
```javascript
const Job = require('../models/Job');
const { fetchJobsFromAdzuna } = require('../services/adzunaService');
const { getCompanyLogo } = require('../services/logoService');

/**
 * GET /api/jobs - Fetch all jobs with search/filter
 */
async function getJobs(req, res) {
  try {
    const { search, location, page = 1, limit = 20 } = req.query;

    let query = {};
    
    if (search) {
      query = { $text: { $search: search } };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(query)
      .sort({ postedDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/jobs/:id - Fetch single job detail
 */
async function getJobDetail(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/jobs/sync-adzuna - Fetch and store jobs from Adzuna
 */
async function syncAdzunaJobs(req, res) {
  try {
    const { keyword = 'developer', location = 'US' } = req.body;

    console.log(`Syncing jobs for: ${keyword} in ${location}`);
    
    const adzunaJobs = await fetchJobsFromAdzuna({ keyword, location, pageSize: 50 });

    let insertedCount = 0;
    let duplicateCount = 0;

    // Store in DB with deduplication
    for (const jobData of adzunaJobs) {
      const existingJob = await Job.findOne({ fingerprint: jobData.fingerprint });

      if (existingJob) {
        duplicateCount++;
        continue; // Skip duplicate
      }

      // Fetch company logo
      const domain = new URL(jobData.applyUrl).hostname;
      const logoUrl = await getCompanyLogo(domain);

      const newJob = new Job({
        ...jobData,
        companyDomain: domain,
        companyLogo: logoUrl,
      });

      await newJob.save();
      insertedCount++;
    }

    res.json({
      message: 'Sync completed',
      inserted: insertedCount,
      duplicates: duplicateCount,
      total: adzunaJobs.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getJobs,
  getJobDetail,
  syncAdzunaJobs,
};
```

**Create backend/src/routes/jobRoutes.js:**
```javascript
const express = require('express');
const {
  getJobs,
  getJobDetail,
  syncAdzunaJobs,
} = require('../controllers/jobController');

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobDetail);
router.post('/sync-adzuna', syncAdzunaJobs);

module.exports = router;
```

---

## PHASE 4: JOB SCHEDULER (Step 6)

### Step 6: Set Up Daily Job Fetch (Node-Cron)

**Create backend/src/scheduler/jobScheduler.js:**
```javascript
const cron = require('node-cron');
const { fetchJobsFromAdzuna } = require('../services/adzunaService');
const { getCompanyLogo } = require('../services/logoService');
const Job = require('../models/Job');

/**
 * Schedule job sync every day at 2 AM
 */
function startJobScheduler() {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled job sync...');
    
    try {
      const keywords = ['developer', 'react', 'nodejs', 'fullstack'];
      const locations = ['US', 'UK', 'IN'];

      for (const keyword of keywords) {
        for (const location of locations) {
          const adzunaJobs = await fetchJobsFromAdzuna({
            keyword,
            location,
            pageSize: 50,
          });

          for (const jobData of adzunaJobs) {
            const existingJob = await Job.findOne({ fingerprint: jobData.fingerprint });

            if (!existingJob) {
              const domain = new URL(jobData.applyUrl).hostname;
              const logoUrl = await getCompanyLogo(domain);

              const newJob = new Job({
                ...jobData,
                companyDomain: domain,
                companyLogo: logoUrl,
              });

              await newJob.save();
            }
          }

          console.log(`Synced ${keyword} jobs from ${location}`);
        }
      }

      console.log('Job sync completed');
    } catch (error) {
      console.error('Scheduled job sync error:', error.message);
    }
  });

  // Optional: Run immediately on startup
  console.log('Job scheduler started. Next run: tomorrow at 2 AM');
}

module.exports = { startJobScheduler };
```

Add to **backend/src/server.js**:
```javascript
const { startJobScheduler } = require('./scheduler/jobScheduler');

// After MongoDB connection is established
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    startJobScheduler(); // Start the scheduler
  })
  .catch((err) => console.log('MongoDB error:', err));
```

---

## PHASE 5: REACT FRONTEND (Step 7-8)

### Step 7: Initialize React App

```bash
cd ..
npx create-react-app frontend
cd frontend
npm install axios
```

### Step 8: Create Job Components

**Create frontend/src/components/JobCard.js:**
```javascript
import React from 'react';
import '../styles/JobCard.css';

function JobCard({ job, onClick }) {
  const isNew = new Date() - new Date(job.postedDate) < 24 * 60 * 60 * 1000;

  return (
    <div className="job-card" onClick={onClick}>
      {isNew && <span className="badge-new">New</span>}
      
      <div className="job-header">
        {job.companyLogo ? (
          <img src={job.companyLogo} alt={job.company} className="company-logo" />
        ) : (
          <div className="logo-placeholder">{job.company.charAt(0)}</div>
        )}
        
        <div className="job-title-section">
          <h3>{job.title}</h3>
          <p className="company-name">{job.company}</p>
        </div>
      </div>

      <div className="job-meta">
        <span className="location">{job.location}</span>
        {job.salary && <span className="salary">{job.salary}</span>}
      </div>

      <p className="job-desc">{job.description.substring(0, 120)}...</p>

      <div className="job-footer">
        <span className="posted-date">
          {new Date(job.postedDate).toLocaleDateString()}
        </span>
        <span className="source">{job.source}</span>
      </div>
    </div>
  );
}

export default JobCard;
```

**Create frontend/src/components/JobDetail.js:**
```javascript
import React from 'react';

function JobDetail({ job, onClose }) {
  return (
    <div className="job-detail-modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="detail-header">
          {job.companyLogo && (
            <img src={job.companyLogo} alt={job.company} className="detail-logo" />
          )}
          <div>
            <h1>{job.title}</h1>
            <p className="company">{job.company}</p>
          </div>
        </div>

        <div className="detail-meta">
          <span>{job.location}</span>
          {job.salary && <span>{job.salary}</span>}
          <span>{new Date(job.postedDate).toLocaleDateString()}</span>
        </div>

        <div className="detail-body">
          <h3>Description</h3>
          <div dangerHTML={{__html: job.description}} />

          {job.requirements && (
            <>
              <h3>Requirements</h3>
              <div dangerHTML={{__html: job.requirements}} />
            </>
          )}

          {job.recruiterName && (
            <div className="recruiter-info">
              <p><strong>Recruiter:</strong> {job.recruiterName}</p>
              {job.recruiterLinkedin && (
                <a href={job.recruiterLinkedin} target="_blank" rel="noreferrer">
                  View on LinkedIn
                </a>
              )}
            </div>
          )}
        </div>

        <div className="detail-footer">
          <a href={job.applyUrl} target="_blank" rel="noreferrer" className="apply-btn">
            Apply Now →
          </a>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
```

**Create frontend/src/pages/JobsPage.js:**
```javascript
import React, { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import JobDetail from '../components/JobDetail';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/jobs';

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, [search, location, page]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: { search, location, page, limit: 20 },
      });
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    setLoading(false);
  }

  return (
    <div className="jobs-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={() => setPage(1)}>Search</button>
      </div>

      {loading && <p>Loading jobs...</p>}

      <div className="jobs-grid">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onClick={() => setSelectedJob(job)}
          />
        ))}
      </div>

      {selectedJob && (
        <JobDetail
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      <div className="pagination">
        <button onClick={() => setPage(Math.max(1, page - 1))}>Previous</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export default JobsPage;
```

**Create frontend/src/styles/JobCard.css:**
```css
.job-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.job-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.badge-new {
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
}

.job-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.company-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.logo-placeholder {
  width: 50px;
  height: 50px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.job-title-section h3 {
  margin: 0;
  font-size: 18px;
}

.company-name {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}

.job-meta {
  display: flex;
  gap: 16px;
  margin: 8px 0;
  font-size: 14px;
}

.job-desc {
  color: #666;
  margin: 8px 0;
  line-height: 1.5;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
```

---

## PHASE 6: N8N AI AUTOMATION (Step 9)

### Step 9: Set Up n8n Workflows

**Create n8n-workflows/resume-ats-check.json:**
```json
{
  "name": "Resume ATS Check",
  "nodes": [
    {
      "parameters": {},
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "model": "gpt-3.5-turbo",
        "messages": {
          "values": [
            {
              "content": "You are an ATS recruiter bot. Check if the resume matches the job requirements. Respond with:\n1. Match Score (0-100)\n2. Missing skills\n3. Recommendation (yes/no/maybe)\n\nResume: {{$node.Webhook.json.resume}}\nJob Requirements: {{$node.Webhook.json.jobRequirements}}"
            }
          ]
        }
      },
      "name": "OpenAI Chat",
      "type": "n8n-nodes-base.openai",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:5000/api/ats-result",
        "sendBody": true,
        "body": "{\n  \"resumeId\": \"{{$node.Webhook.json.resumeId}}\",\n  \"atsScore\": \"{{$node['OpenAI Chat'].json.choices[0].message.content}}\"\n}"
      },
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "OpenAI Chat", "type": "main", "index": 0}]]
    },
    "OpenAI Chat": {
      "main": [[{"node": "HTTP Request", "type": "main", "index": 0}]]
    }
  }
}
```

---

## QUICK START COMMANDS

```bash
# 1. Backend setup
cd backend
npm install
npm run dev

# 2. In another terminal, Start MongoDB
# If using local: mongod
# If using Atlas: connection string in .env

# 3. Test API
curl http://localhost:5000/api/health

# 4. Sync jobs (first time)
curl -X POST http://localhost:5000/api/jobs/sync-adzuna \
  -H "Content-Type: application/json" \
  -d '{"keyword":"developer","location":"US"}'

# 5. Frontend setup
cd ../frontend
npm start

# Frontend will open at http://localhost:3000
```

---

## GETTING API KEYS

### Adzuna API Key
1. Go to https://developer.adzuna.com
2. Sign up and create an app
3. Copy your **App ID** and **App Key**

### Logo.dev API Key
1. Go to https://logo.dev
2. Sign up (free tier available)
3. Create API key

### MongoDBAtlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string and add to backend/.env

---

## NEXT STEPS AFTER BASIC SETUP

✅ **Phase 1-6 Complete:** You'll have working job feed
🔄 **Phase 7-9:** 
- Add resume upload & ATS check via n8n
- Google Sheets sync (store candidate profiles)
- Job recommendations algorithm (ML-based matching)
- Candidate matching for recruiters

---

## YOUR IMMEDIATE STARTING POINT

**You are at: STEP 0 (Project Setup)**

**All code files above are ready to copy. Follow the structure and create each file in order.**

**Next action:** Create the folder structure and initialize Git. Then move to Step 1-2.

