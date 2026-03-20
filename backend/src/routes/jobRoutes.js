const express = require('express');
const {
  getJobs,
  getJobDetail,
  syncAdzunaJobs,
  syncAllJobSources,
  deleteJob,
  getStats,
} = require('../controllers/jobController');

const router = express.Router();

// GET all jobs with filtering
router.get('/', getJobs);

// GET statistics (must be before /:id to avoid matching as ID)
router.get('/stats', getStats);

// POST - Sync jobs from Adzuna only (must be before /:id)
router.post('/sync-adzuna', syncAdzunaJobs);

// POST - Sync jobs from ALL sources (must be before /:id)
router.post('/sync-all-apis', syncAllJobSources);

// GET single job by ID (dynamic route - must be last)
router.get('/:id', getJobDetail);

// DELETE job by ID
router.delete('/:id', deleteJob);

module.exports = router;
