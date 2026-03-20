// Dev.to API Service
const axios = require('axios');
const crypto = require('crypto');

const DEVTO_API = 'https://dev.to/api/articles';

/**
 * Fetch job listings from Dev.to (Free API)
 */
async function fetchJobsFromDevTo({ keyword, pageNum = 1 }) {
  try {
    console.log(`🔄 Fetching from Dev.to: "${keyword}"`);

    // Dev.to uses tag-based search
    const params = {
      tag: 'jobs', // Main jobs tag
      page: pageNum,
      per_page: 50,
    };

    const response = await axios.get(DEVTO_API, {
      params,
      timeout: 10000,
      headers: {
        'api-key': process.env.DEVTO_API_KEY || '', // Optional API key for higher rate limits
      },
    });

    if (!Array.isArray(response.data)) {
      console.warn('Invalid Dev.to response');
      return [];
    }

    // Filter for actual job postings
    const jobs = response.data
      .filter((article) => article.tags?.includes('jobs'))
      .map((article) => {
        // Extract company name and job details from article
        const title = article.title || 'N/A';
        const company = extractCompanyName(article.user?.name || 'N/A', article.title);

        return {
          title: title,
          company: company,
          location: 'Check listing',
          description: article.description || article.body_markdown || '',
          applyUrl: article.url || '',
          source: 'devto',
          sourceId: article.id?.toString() || `devto_${article.slug}`,
          salary: null,
          jobType: 'Full-time',
          postedDate: new Date(article.published_at || Date.now()),
          fingerprint: generateFingerprint(title, company, 'devto'),
        };
      });

    console.log(`✅ Dev.to: Found ${jobs.length} job articles`);
    return jobs;
  } catch (error) {
    console.error('Dev.to API Error:', error.message);
    return [];
  }
}

/**
 * Extract company name from article
 */
function extractCompanyName(author, title) {
  // Try to extract company from title (e.g., "Backend Engineer at TechCorp")
  const match = title.match(/at\s+(\w+(?:\s+\w+)*)/i);
  return match ? match[1] : author;
}

/**
 * Generate unique fingerprint for deduplication
 */
function generateFingerprint(title, company, source) {
  const combined = `${title}|${company}|${source}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

module.exports = {
  fetchJobsFromDevTo,
  generateFingerprint,
};
