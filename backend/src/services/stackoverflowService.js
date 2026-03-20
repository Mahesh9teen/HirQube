// Stack Overflow API Service
const axios = require('axios');
const crypto = require('crypto');

const STACKOVERFLOW_API = 'https://api.stackexchange.com/2.3/jobs';

/**
 * Fetch jobs from Stack Overflow API (Free, public API with rate limits)
 */
async function fetchJobsFromStackOverflow({ keyword, pageNum = 1 }) {
  try {
    console.log(`🔄 Fetching from Stack Overflow: "${keyword}"`);

    // Stack Overflow API params
    const params = {
      site: 'stackoverflow',
      order: 'desc',
      sort: 'creation',
      tagged: keyword,
      pagesize: 50,
      page: pageNum,
    };

    const response = await axios.get(STACKOVERFLOW_API, {
      params,
      timeout: 10000,
    });

    if (!response.data || !Array.isArray(response.data.items)) {
      console.warn('Invalid Stack Overflow response');
      return [];
    }

    const jobs = response.data.items.map((job) => ({
      title: job.title || 'N/A',
      company: job.company_name || 'N/A',
      location: job.location?.display_name || 'Remote',
      description: job.body || '',
      applyUrl: job.link || '',
      source: 'stackoverflow',
      sourceId: job.job_id?.toString() || `so_${job.title}_${Date.now()}`,
      salary: null, // Stack Overflow doesn't consistently show salary
      jobType: 'Full-time',
      postedDate: new Date(job.creation_date * 1000),
      isRemote: job.is_remote || false,
      fingerprint: generateFingerprint(job.title, job.company_name || 'N/A', 'stackoverflow'),
    }));

    console.log(`✅ Stack Overflow: Found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error('Stack Overflow API Error:', error.message);
    return [];
  }
}

/**
 * Generate unique fingerprint for deduplication
 */
function generateFingerprint(title, company, source) {
  const combined = `${title}|${company}|${source}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

module.exports = {
  fetchJobsFromStackOverflow,
  generateFingerprint,
};
