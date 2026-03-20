// GitHub Jobs API Service
const axios = require('axios');
const crypto = require('crypto');

const GITHUB_JOBS_API = 'https://jobs.github.com/positions.json';

/**
 * Fetch jobs from GitHub Jobs API (Free, public API)
 */
async function fetchJobsFromGitHub({ keyword, location = '', pageNum = 1 }) {
  try {
    console.log(`🔄 Fetching from GitHub Jobs: "${keyword}" in ${location}`);

    const params = {
      description: keyword,
      page: pageNum,
    };

    if (location && location !== 'all') {
      params.location = location;
    }

    const response = await axios.get(GITHUB_JOBS_API, {
      params,
      timeout: 10000,
    });

    if (!Array.isArray(response.data)) {
      console.warn('Invalid GitHub Jobs response');
      return [];
    }

    const jobs = response.data.map((job) => ({
      title: job.title || 'N/A',
      company: job.company || 'N/A',
      location: job.location || 'Remote',
      description: job.description || job.how_to_apply || '',
      applyUrl: job.url || job.company_url || '',
      source: 'github_jobs',
      sourceId: job.id || `github_${job.title}_${Date.now()}`,
      salary: null, // GitHub Jobs doesn't provide salary
      jobType: job.type || 'Full-time',
      postedDate: new Date(job.created_at || Date.now()),
      companyUrl: job.company_url,
      fingerprint: generateFingerprint(job.title, job.company, job.location),
    }));

    console.log(`✅ GitHub Jobs: Found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error('GitHub Jobs API Error:', error.message);
    return [];
  }
}

/**
 * Generate unique fingerprint for deduplication
 */
function generateFingerprint(title, company, location) {
  const combined = `${title}|${company}|${location}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

module.exports = {
  fetchJobsFromGitHub,
  generateFingerprint,
};
