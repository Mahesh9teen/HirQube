const cron = require('node-cron');
const { db } = require('../config/firebase');
const { fetchJobsFromAdzuna } = require('../services/adzunaService');
const { fetchJobsFromRemoteOK } = require('../services/remoteokService');
const { fetchJobsFromGitHub } = require('../services/githubJobsService');
const { fetchJobsFromStackOverflow } = require('../services/stackoverflowService');
const { fetchJobsFromDevTo } = require('../services/devtoService');
const { fetchJobsFromLinkedIn, fetchJobsFromIndeed } = require('../services/linkedinScraperService');
const { getCompanyLogo, getFaviconUrl } = require('../services/logoService');

/**
 * Schedule job sync every day at 2 AM UTC
 * Integrates jobs from multiple sources: Adzuna, RemoteOK, GitHub, Stack Overflow, Dev.to, LinkedIn, Indeed
 */
function startJobScheduler() {
  // Run daily at 2 AM UTC
  cron.schedule('0 2 * * *', async () => {
    console.log('\n📅 Scheduled multi-source job sync started at 2 AM UTC');

    try {
      // Define search keywords and locations
      const keywords = ['developer', 'react', 'nodejs', 'fullstack', 'python', 'javascript'];
      const locations = ['us', 'gb', 'in'];

      let totalInserted = 0;
      let totalDuplicates = 0;
      const sourceStats = {};

      for (const keyword of keywords) {
        for (const location of locations) {
          try {
            console.log(`\n🔍 Fetching "${keyword}" jobs from ${location} across all sources...`);

            // Fetch from all sources in parallel
            const allJobsPromises = [];

            // 1. Adzuna
            allJobsPromises.push(
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
                })
            );

            // 2. RemoteOK (location independent, adding global-only)
            if (location === 'us') {
              allJobsPromises.push(
                fetchJobsFromRemoteOK({ keyword, pageNum: 1 })
                  .then((jobs) => ({ source: 'remoteok', jobs }))
                  .catch((err) => {
                    console.warn(`⚠️  RemoteOK error:`, err.message);
                    return { source: 'remoteok', jobs: [] };
                  })
              );
            }

            // 3. GitHub Jobs
            allJobsPromises.push(
              fetchJobsFromGitHub({ keyword, location, pageNum: 1 })
                .then((jobs) => ({ source: 'github', jobs }))
                .catch((err) => {
                  console.warn(`⚠️  GitHub error:`, err.message);
                  return { source: 'github', jobs: [] };
                })
            );

            // 4. Stack Overflow
            if (location === 'us') {
              allJobsPromises.push(
                fetchJobsFromStackOverflow({ keyword, pageNum: 1 })
                  .then((jobs) => ({ source: 'stackoverflow', jobs }))
                  .catch((err) => {
                    console.warn(`⚠️  Stack Overflow error:`, err.message);
                    return { source: 'stackoverflow', jobs: [] };
                  })
              );
            }

            // 5. Dev.to
            if (location === 'us') {
              allJobsPromises.push(
                fetchJobsFromDevTo({ keyword, pageNum: 1 })
                  .then((jobs) => ({ source: 'devto', jobs }))
                  .catch((err) => {
                    console.warn(`⚠️  Dev.to error:`, err.message);
                    return { source: 'devto', jobs: [] };
                  })
              );
            }

            // 6. LinkedIn Alternative
            if (location === 'us') {
              allJobsPromises.push(
                fetchJobsFromLinkedIn({ keyword, location: 'United States', pageNum: 1 })
                  .then((jobs) => ({ source: 'linkedin', jobs }))
                  .catch((err) => {
                    console.warn(`⚠️  LinkedIn error:`, err.message);
                    return { source: 'linkedin', jobs: [] };
                  })
              );
            }

            // 7. Indeed Alternative (via Adzuna API)
            if (location === 'us') {
              allJobsPromises.push(
                fetchJobsFromIndeed({ keyword, location: 'United States', pageNum: 1 })
                  .then((jobs) => ({ source: 'indeed', jobs }))
                  .catch((err) => {
                    console.warn(`⚠️  Indeed error:`, err.message);
                    return { source: 'indeed', jobs: [] };
                  })
              );
            }

            // Wait for all API calls to complete
            const allResults = await Promise.all(allJobsPromises);

            const batch = db.batch();
            let batchInserted = 0;

            // Process jobs from all sources
            for (const result of allResults) {
              const { source, jobs } = result;

              if (jobs.length === 0) {
                console.log(`ℹ️  ${source}: No jobs found`);
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
                    continue;
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
                    if (!logoUrl) {
                      logoUrl = getFaviconUrl(domain);
                    }
                  }

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

              console.log(`✅ ${source}: Found ${jobs.length} jobs`);
            }

            // Commit batch
            if (batchInserted > 0) {
              await batch.commit();
              console.log(`✨ Inserted ${batchInserted} new jobs for "${keyword}" in ${location}`);
            } else {
              console.log(`ℹ️  No new jobs inserted for "${keyword}" in ${location}`);
            }
          } catch (groupError) {
            console.error(`❌ Error processing "${keyword}" in ${location}:`, groupError.message);
            continue;
          }
        }
      }

      console.log(`\n✅ Scheduled multi-source job sync completed:`);
      console.log(`   📊 Total inserted: ${totalInserted}`);
      console.log(`   🔄 Total duplicates: ${totalDuplicates}`);
      console.log(`   📈 Source breakdown:`, sourceStats);
      console.log('');
    } catch (error) {
      console.error('❌ Scheduled job sync error:', error.message);
    }
  });

  console.log('⏰ Multi-source job scheduler started. Next run: tomorrow at 2 AM UTC');
}

module.exports = startJobScheduler;
