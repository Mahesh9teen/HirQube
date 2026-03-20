const { db } = require('../config/firebase');
const { fetchJobsFromAdzuna } = require('../services/adzunaService');
const { fetchJobsFromRemoteOK } = require('../services/remoteokService');
const { fetchJobsFromGitHub } = require('../services/githubJobsService');
const { fetchJobsFromStackOverflow } = require('../services/stackoverflowService');
const { fetchJobsFromDevTo } = require('../services/devtoService');
const { fetchJobsFromLinkedIn, fetchJobsFromIndeed } = require('../services/linkedinScraperService');
const { getCompanyLogo, getFaviconUrl } = require('../services/logoService');

/**
 * GET /api/jobs - Fetch all jobs with search/filter
 */
async function getJobs(req, res) {
  try {
    const { search, location, keyword, page = 1, limit = 20 } = req.query;

    let query = db.collection('jobs');

    // Location filter
    if (location) {
      query = query.where('location', '==', location);
    }

    // Keyword filter (matches job title)
    if (keyword) {
      query = query.where('title', '==', keyword);
    }

    // Get total count (before pagination)
    const totalSnapshot = await query.count().get();
    const total = totalSnapshot.data().count;

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(parseInt(limit), 100));
    const skip = (pageNum - 1) * limitNum;

    // Fetch jobs with pagination
    let jobsSnapshot = await query
      .orderBy('postedDate', 'desc')
      .offset(skip)
      .limit(limitNum)
      .get();

    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Text search in fetched jobs (simple client-side filtering)
    let filteredJobs = jobs;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchLower) ||
        job.company?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      jobs: filteredJobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/jobs/:id - Fetch single job detail
 */
async function getJobDetail(req, res) {
  try {
    const jobDoc = await db.collection('jobs').doc(req.params.id).get();

    if (!jobDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    res.status(200).json({
      success: true,
      job: {
        id: jobDoc.id,
        ...jobDoc.data(),
      },
    });
  } catch (error) {
    console.error('Error fetching job detail:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/jobs/sync-adzuna - Fetch and store jobs from Adzuna
 */
async function syncAdzunaJobs(req, res) {
  try {
    const { keyword = 'developer', location = 'us' } = req.body;

    console.log(`🔄 Syncing Adzuna jobs for: "${keyword}" in ${location}`);

    const adzunaJobs = await fetchJobsFromAdzuna({
      keyword,
      location,
      pageSize: 50,
      pageNum: 1,
    });

    if (adzunaJobs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No jobs found from Adzuna',
        inserted: 0,
        duplicates: 0,
        total: 0,
      });
    }

    let insertedCount = 0;
    let duplicateCount = 0;
    const batch = db.batch();

    // Store in Firestore with deduplication
    for (const jobData of adzunaJobs) {
      try {
        // Check for duplicates using fingerprint
        const existingSnapshot = await db
          .collection('jobs')
          .where('fingerprint', '==', jobData.fingerprint)
          .limit(1)
          .get();

        if (!existingSnapshot.empty) {
          duplicateCount++;
          continue; // Skip duplicate
        }

        // Extract domain from URL
        let domain = null;
        try {
          const url = new URL(jobData.applyUrl);
          domain = url.hostname;
        } catch (e) {
          console.warn('Invalid URL:', jobData.applyUrl);
        }

        // Fetch company logo
        let logoUrl = null;
        if (domain) {
          logoUrl = await getCompanyLogo(domain);
          // Use favicon as fallback
          if (!logoUrl) {
            logoUrl = getFaviconUrl(domain);
          }
        }

        // Prepare job data
        const jobToStore = {
          ...jobData,
          companyDomain: domain,
          companyLogo: logoUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add to batch
        const docRef = db.collection('jobs').doc();
        batch.set(docRef, jobToStore);
        insertedCount++;
      } catch (jobError) {
        console.error('Error processing individual job:', jobError.message);
        continue; // Continue with next job instead of failing entire sync
      }
    }

    // Commit batch
    await batch.commit();

    console.log(
      `✅ Sync completed: ${insertedCount} inserted, ${duplicateCount} duplicates`
    );

    res.status(200).json({
      success: true,
      message: 'Sync completed',
      inserted: insertedCount,
      duplicates: duplicateCount,
      total: adzunaJobs.length,
    });
  } catch (error) {
    console.error('❌ Error syncing jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * DELETE /api/jobs/:id - Delete a job
 */
async function deleteJob(req, res) {
  try {
    const jobDoc = await db.collection('jobs').doc(req.params.id).get();

    if (!jobDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    await db.collection('jobs').doc(req.params.id).delete();

    res.status(200).json({
      success: true,
      message: 'Job deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/stats - Get database statistics
 */
async function getStats(req, res) {
  try {
    // Total jobs
    const totalSnapshot = await db.collection('jobs').count().get();
    const totalJobs = totalSnapshot.data().count;

    // Jobs by source
    const jobsSnapshot = await db.collection('jobs').get();
    const jobs = jobsSnapshot.docs.map(doc => doc.data());

    const jobsBySource = {};
    const jobsByType = {};
    let latestJob = null;

    jobs.forEach(job => {
      // Count by source
      if (job.source) {
        jobsBySource[job.source] = (jobsBySource[job.source] || 0) + 1;
      }

      // Count by type
      if (job.jobType) {
        jobsByType[job.jobType] = (jobsByType[job.jobType] || 0) + 1;
      }

      // Find latest job
      if (
        !latestJob ||
        new Date(job.postedDate) > new Date(latestJob.postedDate)
      ) {
        latestJob = job;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        jobsBySource: Object.entries(jobsBySource).map(([source, count]) => ({
          _id: source,
          count,
        })),
        jobsByType: Object.entries(jobsByType).map(([type, count]) => ({
          _id: type,
          count,
        })),
        latestJobDate: latestJob?.postedDate || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/jobs/sync-all-apis - Fetch and store jobs from all API sources
 * Sources: Adzuna, RemoteOK, GitHub Jobs, Stack Overflow, Dev.to, LinkedIn, Indeed
 */
async function syncAllJobSources(req, res) {
  try {
    const { keyword = 'developer', location = 'us' } = req.body;

    console.log(`🔄 Syncing jobs from ALL sources for: "${keyword}"`);

    let totalInserted = 0;
    let totalDuplicates = 0;
    const sourceStats = {};

    // Prepare all API fetch promises
    const apiPromises = [
      // Adzuna
      fetchJobsFromAdzuna({
        keyword,
        location,
        pageSize: 50,
        pageNum: 1,
      })
        .then((jobs) => ({ source: 'adzuna', jobs }))
        .catch((err) => {
          console.warn(`⚠️  Adzuna error:`, err.message);
          return { source: 'adzuna', jobs: [] };
        }),

      // RemoteOK
      fetchJobsFromRemoteOK({ keyword, pageNum: 1 })
        .then((jobs) => ({ source: 'remoteok', jobs }))
        .catch((err) => {
          console.warn(`⚠️  RemoteOK error:`, err.message);
          return { source: 'remoteok', jobs: [] };
        }),

      // GitHub Jobs
      fetchJobsFromGitHub({ keyword, location, pageNum: 1 })
        .then((jobs) => ({ source: 'github', jobs }))
        .catch((err) => {
          console.warn(`⚠️  GitHub error:`, err.message);
          return { source: 'github', jobs: [] };
        }),

      // Stack Overflow
      fetchJobsFromStackOverflow({ keyword, pageNum: 1 })
        .then((jobs) => ({ source: 'stackoverflow', jobs }))
        .catch((err) => {
          console.warn(`⚠️  Stack Overflow error:`, err.message);
          return { source: 'stackoverflow', jobs: [] };
        }),

      // Dev.to
      fetchJobsFromDevTo({ keyword, pageNum: 1 })
        .then((jobs) => ({ source: 'devto', jobs }))
        .catch((err) => {
          console.warn(`⚠️  Dev.to error:`, err.message);
          return { source: 'devto', jobs: [] };
        }),

      // LinkedIn Alternative
      fetchJobsFromLinkedIn({ keyword, location: 'United States', pageNum: 1 })
        .then((jobs) => ({ source: 'linkedin', jobs }))
        .catch((err) => {
          console.warn(`⚠️  LinkedIn error:`, err.message);
          return { source: 'linkedin', jobs: [] };
        }),

      // Indeed Alternative
      fetchJobsFromIndeed({ keyword, location: 'United States', pageNum: 1 })
        .then((jobs) => ({ source: 'indeed', jobs }))
        .catch((err) => {
          console.warn(`⚠️  Indeed error:`, err.message);
          return { source: 'indeed', jobs: [] };
        }),
    ];

    // Wait for all API calls
    const allResults = await Promise.all(apiPromises);

    const batch = db.batch();
    let batchInserted = 0;

    // Process results from all sources
    for (const result of allResults) {
      const { source, jobs } = result;

      if (jobs.length === 0) {
        sourceStats[source] = 0;
        continue;
      }

      sourceStats[source] = jobs.length;

      for (const jobData of jobs) {
        try {
          // Check for duplicate using fingerprint
          const existingSnapshot = await db
            .collection('jobs')
            .where('fingerprint', '==', jobData.fingerprint)
            .limit(1)
            .get();

          if (!existingSnapshot.empty) {
            totalDuplicates++;
            continue; // Skip duplicate
          }

          // Extract domain from URL
          let domain = null;
          try {
            const url = new URL(jobData.applyUrl);
            domain = url.hostname;
          } catch (e) {
            console.warn('Invalid URL:', jobData.applyUrl);
          }

          // Fetch company logo
          let logoUrl = null;
          if (domain) {
            logoUrl = await getCompanyLogo(domain);
            // Use favicon as fallback
            if (!logoUrl) {
              logoUrl = getFaviconUrl(domain);
            }
          }

          // Prepare job data
          const jobToStore = {
            ...jobData,
            companyDomain: domain,
            companyLogo: logoUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Add to batch
          const docRef = db.collection('jobs').doc();
          batch.set(docRef, jobToStore);
          batchInserted++;
          totalInserted++;
        } catch (jobError) {
          console.error(`Error processing job from ${source}:`, jobError.message);
          continue;
        }
      }

      console.log(`✅ ${source}: Processed ${jobs.length} jobs`);
    }

    // Commit batch
    await batch.commit();

    console.log(
      `✅ Multi-source sync completed: ${totalInserted} inserted, ${totalDuplicates} duplicates`
    );

    res.status(200).json({
      success: true,
      message: 'Multi-source sync completed',
      inserted: totalInserted,
      duplicates: totalDuplicates,
      sourceStats,
    });
  } catch (error) {
    console.error('❌ Error syncing from all sources:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getJobs,
  getJobDetail,
  syncAdzunaJobs,
  syncAllJobSources,
  deleteJob,
  getStats,
};

