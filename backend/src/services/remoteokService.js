// RemoteOK Job Service
const axios = require('axios');
const crypto = require('crypto');

const REMOTEOK_API_URL = 'https://remoteok.com/api';

/**
 * Fetch jobs from RemoteOK API (Free, no auth required)
 */
async function fetchJobsFromRemoteOK({ keyword, pageNum = 1 }) {
  try {
    console.log(`🔄 Fetching from RemoteOK: "${keyword}"`);

    // RemoteOK returns all jobs, filter by keyword locally
    const response = await axios.get(`${REMOTEOK_API_URL}`, {
      timeout: 10000,
    });

    if (!response.data || !Array.isArray(response.data)) {
      console.warn('Invalid RemoteOK response');
      return [];
    }

    // Filter jobs by keyword
    const jobs = response.data
      .filter(
        (job) =>
          job.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          job.company?.toLowerCase().includes(keyword.toLowerCase())
      )
      .slice(0, 50)
      .map((job) => ({
        title: job.title || 'N/A',
        company: job.company || 'N/A',
        location: job.location || 'Remote',
        description: job.description || job.excerpt || '',
        applyUrl: job.url || job.apply_url || '',
        source: 'remoteok',
        sourceId: job.id?.toString() || `remoteok_${job.title}_${Date.now()}`,
        salary: job.salary ? `$${job.salary}` : null,
        jobType: job.job_type || 'Full-time',
        postedDate: new Date(job.date_posted || Date.now()),
        fingerprint: generateFingerprint(
          job.title || 'N/A',
          job.company || 'N/A',
          'remote'
        ),
      }));

    console.log(`✅ RemoteOK: Found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error('RemoteOK API Error:', error.message);
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
  fetchJobsFromRemoteOK,
  generateFingerprint,
};
