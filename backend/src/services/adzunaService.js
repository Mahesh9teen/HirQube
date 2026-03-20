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
    location = 'us',
    pageSize = 50,
    pageNum = 1,
  } = options;

  try {
    const url = `${ADZUNA_API_URL}/${location}/search/${pageNum}`;
    
    const response = await axios.get(url, {
      params: {
        app_id: APP_ID,
        app_key: APP_KEY,
        results_per_page: pageSize,
        full_time: true,
        what: keyword,
      },
      timeout: 10000,
    });

    const jobs = response.data.results || [];
    
    console.log(`✅ Fetched ${jobs.length} jobs from Adzuna for "${keyword}" in ${location}`);
    
    // Map Adzuna fields to your schema
    return jobs.map((job) => ({
      title: job.title || '',
      company: job.company.display_name || 'Unknown',
      location: job.location.display_name || '',
      description: job.description || '',
      applyUrl: job.redirect_url || '',
      source: 'adzuna',
      sourceId: job.id || null,
      postedDate: new Date(job.created),
      salary: job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : null,
      fingerprint: generateFingerprint(
        job.title, 
        job.company.display_name, 
        job.location.display_name
      ),
    }));
  } catch (error) {
    console.error(`❌ Error fetching from Adzuna (${keyword}, ${location}):`, error.message);
    return [];
  }
}

/**
 * Generate unique fingerprint for deduplication
 */
function generateFingerprint(title, company, location) {
  const combined = `${title}|${company}|${location}`.toLowerCase().trim();
  return crypto.createHash('sha256').update(combined).digest('hex');
}

module.exports = {
  fetchJobsFromAdzuna,
  generateFingerprint,
};
