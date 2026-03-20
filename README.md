# 🚀 HirQube - Job Aggregation Platform

A modern job aggregation platform that fetches jobs from multiple sources, stores them in MongoDB, and provides a beautiful React frontend with company logos and advanced filtering.

## Features

✨ **Core Features**
- 📊 Aggregate jobs from Adzuna API
- 🔍 Full-text search and advanced filtering
- 📍 Location-based filtering
- 💼 Company logo integration (via Logo.dev)
- 📅 Automatic daily job sync (Cron scheduler)
- 🔄 Deduplication of job listings
- ⚡ Fast pagination and pagination
- 📱 Fully responsive design

🎯 **Future Features**
- 🤖 AI resume ATS checking (n8n)
- 💡 Job recommendations (ML-based)
- 📊 Google Sheets integration
- 👥 Recruiter dashboard
- 📈 Analytics dashboard

## Tech Stack

### Backend
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Axios** - HTTP client
- **Node-Cron** - Job scheduling
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** (v18+) - UI library
- **Axios** - HTTP requests
- **CSS3** - Modern styling

### External APIs
- **Adzuna API** - Job listings
- **Logo.dev API** - Company logos

## Project Structure

```
HirQube/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API routes
│   │   ├── scheduler/        # Cron jobs
│   │   └── server.js         # Express app
│   ├── package.json
│   ├── .env                  # API keys (not committed)
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API calls
│   │   ├── styles/           # CSS files
│   │   └── App.js
│   ├── public/
│   ├── package.json
│   └── .gitignore
│
├── n8n-workflows/            # AI automation
├── GETTING_STARTED.md       # Setup guide
├── COMMANDS.md              # Command reference
├── ARCHITECTURE.md          # System architecture
└── README.md                # This file
```

## Quick Start

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (free tier)
- Adzuna API key
- Logo.dev API key

### Installation

#### 1. Clone and Setup
```bash
git clone <your-repo-url> HirQube
cd HirQube
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file with your keys
# PORT=5000
# MONGODB_URI=mongodb+srv://...
# ADZUNA_API_ID=...
# ADZUNA_API_KEY=...
# LOGODEV_API_KEY=...
# NODE_ENV=development

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Jobs
```bash
# Get all jobs (with pagination)
GET /api/jobs?page=1&limit=20

# Search jobs
GET /api/jobs?search=react&location=US

# Get single job
GET /api/jobs/:id

# Sync from Adzuna
POST /api/jobs/sync-adzuna
Body: {"keyword": "developer", "location": "us"}

# Get statistics
GET /api/stats

# Delete job
DELETE /api/jobs/:id
```

### Health
```bash
GET /api/health
```

## Database Schema

### Job Document
```javascript
{
  title: String,              // Job title
  company: String,            // Company name
  location: String,           // Location (e.g., "New York, NY, USA")
  description: String,        // Full job description
  requirements: String,       // Job requirements
  applyUrl: String,          // Original application URL
  source: String,            // Source (adzuna, usajobs, etc)
  sourceId: String,          // ID from source
  companyLogo: String,       // Logo URL
  companyDomain: String,     // Company domain
  recruiterName: String,     // Recruiter name (if available)
  recruiterLinkedin: String, // Recruiter LinkedIn URL
  postedDate: Date,          // Posted date
  salary: String,            // Salary range
  jobType: String,           // Job type (full-time, etc)
  fingerprint: String,       // SHA256 hash for deduplication
  sourceUrls: [String],      // All source URLs
  createdAt: Date,
  updatedAt: Date
}
```

## Getting API Keys

### Adzuna API
1. Visit https://developer.adzuna.com
2. Sign up for free account
3. Create application
4. Copy your App ID and API Key

### Logo.dev
1. Visit https://logo.dev
2. Sign up for free tier
3. Get your API key from dashboard

### MongoDB Atlas
1. Visit https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create M0 cluster
4. Get connection string
5. Create database user

## Scheduler

Jobs are automatically synced daily at **2 AM UTC**.

### Keywords Synced
- developer
- react
- nodejs
- fullstack
- python
- javascript

### Locations Synced
- us (United States)
- gb (United Kingdom)
- in (India)

Modify keywords/locations in `backend/src/scheduler/jobScheduler.js`

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hirqube

# APIs
ADZUNA_API_ID=your_app_id
ADZUNA_API_KEY=your_api_key
LOGODEV_API_KEY=your_logo_key
```

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd ../frontend
npm test
```

### Building for Production
```bash
# Backend (no build needed, Node runs directly)
cd backend
npm start

# Frontend
cd ../frontend
npm run build
```

## Deployment

### Backend (Render.com)
1. Connect GitHub repo
2. Create new web service
3. Build: `npm install`
4. Start: `npm start`
5. Add environment variables

### Frontend (Vercel)
1. Import project
2. Select frontend folder
3. Build settings auto-detected
4. Add environment variable: `REACT_APP_API_URL=<backend-url>`

## Troubleshooting

### MongoDB Connection Failed
- Check password doesn't have special characters (URL encode if needed)
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Adzuna API Errors
- Verify API ID and Key are correct
- Check API rate limits
- Ensure API is active (not suspended)

### Port Already in Use
- Change PORT in .env
- Or kill process: `taskkill /IM node.exe`

### Jobs Not Showing
- Check browser console for errors (F12)
- Check backend logs
- Run sync manually: `POST /api/jobs/sync-adzuna`
- Verify MongoDB connection

## Performance Tips

- Use pagination (default: 20 jobs per page)
- Add text indexes for faster search
- Cache logo URLs in database
- Monitor API rate limits
- Use CDN for static frontend files

## Security

- ✅ API keys in .env (never committed)
- ✅ CORS enabled for frontend
- ✅ Input validation on backend
- ✅ Rate limiting (native with Adzuna quotes)
- ✅ No sensitive data in logs

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## License

MIT License - feel free to use for personal or commercial projects

## Support

- 📖 See GETTING_STARTED.md for detailed setup
- 📋 See COMMANDS.md for command reference
- 🏗️ See ARCHITECTURE.md for system design
- 📚 Check API documentation at `http://localhost:5000`

## Roadmap

- [ ] UI/UX improvements
- [ ] Advanced filtering options
- [ ] User authentication
- [ ] Job bookmarking
- [ ] Email notifications
- [ ] Mobile app
- [ ] Multiple job sources
- [ ] AI recommendations
- [ ] Analytics dashboard

## Contact

For questions or issues, please open a GitHub issue.

---

**Built with ❤️ using Node.js, React, and MongoDB**
