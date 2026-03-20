const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Core job details
  title: { 
    type: String, 
    required: true, 
    index: true 
  },
  company: { 
    type: String, 
    required: true, 
    index: true 
  },
  location: { 
    type: String, 
    required: true, 
    index: true 
  },
  
  // Full description
  description: { 
    type: String,
    default: ''
  },
  requirements: { 
    type: String,
    default: ''
  },
  
  // Application & source
  applyUrl: { 
    type: String, 
    required: true 
  },
  source: { 
    type: String, 
    enum: ['adzuna', 'usajobs', 'scraper'], 
    default: 'adzuna' 
  },
  sourceId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  
  // Company info
  companyLogo: { 
    type: String,
    default: null
  },
  companyDomain: { 
    type: String,
    default: null
  },
  companyLinkedin: { 
    type: String,
    default: null
  },
  
  // Recruiter/HR info (if available from source)
  recruiterName: { 
    type: String,
    default: null
  },
  recruiterLinkedin: { 
    type: String,
    default: null
  },
  
  // Additional metadata
  postedDate: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  salary: { 
    type: String,
    default: null
  },
  jobType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'unknown'],
    default: 'unknown'
  },
  
  // Deduplication & tracking
  fingerprint: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  sourceUrls: [{ 
    type: String 
  }],
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for deduplication
jobSchema.index({ title: 1, company: 1, location: 1 });

// Index for text search
jobSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text' 
});

module.exports = mongoose.model('Job', jobSchema);
