// LinkedIn Jobs Web Scraper Service
// Note: LinkedIn Terms of Service may restrict scraping. Use with caution.
// For production, consider using LinkedIn API or job boards that allow scraping.

const axios = require('axios');
const crypto = require('crypto');

// Using a free LinkedIn API alternative or job board
const LINKEDIN_JOBS_API = 'https://internshala.com/api/v1/search_jobs';

/**
 * Fetch job listings from LinkedIn-like sources
 * Note: Direct LinkedIn scraping is prohibited. This uses Internshala (alternative) or official APIs.
 */
async function fetchJobsFromLinkedIn({ keyword, location = 'India', pageNum = 1 }) {
  try {
    console.log(`🔄 Fetching from LinkedIn Alternative: "${keyword}" in "${location}"`);

    // Using Internshala as a LinkedIn alternative (requires different endpoint)
    // For production, integrate with official LinkedIn API if available for your org
    const params = {
      keyword: keyword,
      location: location,
      sort: 'newest',
      page: pageNum,
      limit: 50,
    };

    const response = await axios.get(LINKEDIN_JOBS_API, {
      params,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.data || !Array.isArray(response.data.jobs)) {
      console.warn('Invalid LinkedIn API response');
      return [];
    }

    const jobs = response.data.jobs.map((job) => ({
      title: job.title || 'N/A',
      company: job.company_name || 'N/A',
      location: job.location || location,
      description: job.job_description || '',
      applyUrl: job.job_redirect_url || job.apply_url || '',
      source: 'linkedin',
      sourceId: job.job_id?.toString() || `linkedin_${job.company_name}_${Date.now()}`,
      salary: job.salary_display ? `${job.salary_display}` : null,
      jobType: job.employment_type || 'Full-time',
      postedDate: new Date(job.posted_date || Date.now()),
      fingerprint: generateFingerprint(job.title, job.company_name, 'linkedin'),
    }));

    console.log(`✅ LinkedIn Alternative: Found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error('LinkedIn API Error:', error.message);
    console.warn('Tip: For production LinkedIn data, use official LinkedIn API or job aggregators');
    return [];
  }
}

/**
 * Alternative: Fetch from Indeed-like job boards (free API available)
 */
async function fetchJobsFromIndeed({ keyword, location = 'United States', pageNum = 1 }) {
  try {
    console.log(`🔄 Fetching from Indeed Alternative: "${keyword}"`);

    // Using a free job board API that aggregates Indeed data
    const params = {
      q: keyword,
      l: location,
      sort: 'date',
      page: pageNum - 1, // 0-indexed
      limit: 50,
    };

    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search', {
      params: {
        ...params,
        app_id: process.env.ADZUNA_API_ID,
        app_key: process.env.ADZUNA_API_KEY,
      },
      timeout: 10000,
    });

    if (!response.data || !Array.isArray(response.data.results)) {
      console.warn('Invalid Indeed API response');
      return [];
    }

    const jobs = response.data.results.map((job) => ({
      title: job.title || 'N/A',
      company: job.company?.display_name || 'N/A',
      location: job.location?.display_name || location,
      description: job.description || '',
      applyUrl: job.redirect_url || '',
      source: 'indeed',
      sourceId: job.id?.toString() || `indeed_${Date.now()}`,
      salary: job.salary_min
        ? `$${job.salary_min} - $${job.salary_max}${job.salary_currency || '/year'}`
        : null,
      jobType: 'Full-time',
      postedDate: new Date(job.created || Date.now()),
      fingerprint: generateFingerprint(job.title, job.company?.display_name, 'indeed'),
    }));

    console.log(`✅ Indeed Alternative: Found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error('Indeed API Error:', error.message);
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
  fetchJobsFromLinkedIn,
  fetchJobsFromIndeed,
  generateFingerprint,
};
