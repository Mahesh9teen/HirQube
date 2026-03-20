import React, { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import JobDetail from '../components/JobDetail';
import { fetchJobs, syncJobsFromAdzuna } from '../services/api';
import '../styles/JobsPage.css';

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);
  const limit = 20;

  // Fetch jobs on mount and when filters change
  useEffect(() => {
    fetchJobsData();
  }, [search, location, keyword, page]);

  const fetchJobsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
      };
      if (search) params.search = search;
      if (location) params.location = location;
      if (keyword) params.keyword = keyword;

      const response = await fetchJobs(params);
      
      if (response.success) {
        setJobs(response.jobs);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Error fetching jobs. Please try again.');
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const response = await syncJobsFromAdzuna(keyword || 'developer', location || 'us');
      
      if (response.success) {
        alert(`✅ Sync completed!\nInserted: ${response.inserted}\nDuplicates: ${response.duplicates}`);
        setPage(1);
        fetchJobsData();
      }
    } catch (err) {
      console.error('Error syncing jobs:', err);
      setError('Error syncing jobs. Check your API keys.');
    }
    setSyncing(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobsData();
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
    setKeyword('');
    setPage(1);
  };

  return (
    <div className="jobs-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🚀 HirQube</h1>
          <p>Your Daily Job Feed Aggregator</p>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Search job titles, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Keyword (React, Python, etc.)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Location (US, UK, IN, etc.)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-search">
              🔍 Search
            </button>
            <button 
              type="button" 
              onClick={handleReset} 
              className="btn btn-reset"
            >
              🔄 Reset
            </button>
            <button 
              type="button" 
              onClick={handleSync} 
              disabled={syncing}
              className="btn btn-sync"
            >
              {syncing ? '⏳ Syncing...' : '⬇️ Sync'}
            </button>
          </div>
        </form>

        {error && <div className="error-message">⚠️ {error}</div>}
      </div>

      {/* Stats Section */}
      {pagination.total !== undefined && (
        <div className="stats-bar">
          <span>📊 Total Jobs: <strong>{pagination.total}</strong></span>
          <span>📄 Page: <strong>{pagination.page} / {pagination.pages}</strong></span>
          <span>📋 Showing: <strong>{jobs.length}</strong> jobs</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-message">
          <p>⏳ Loading jobs...</p>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="jobs-container">
        {jobs.length > 0 ? (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onClick={() => setSelectedJob(job)}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="no-jobs-message">
              <p>😔 No jobs found. Try adjusting your search filters.</p>
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn btn-pagination"
          >
            ← Previous
          </button>
          
          <span className="page-info">
            Page {page} of {pagination.pages}
          </span>
          
          <button 
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="btn btn-pagination"
          >
            Next →
          </button>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetail
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

export default JobsPage;
