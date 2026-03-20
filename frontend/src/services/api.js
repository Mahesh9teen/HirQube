import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all jobs with optional filtering
 */
export const fetchJobs = async (params = {}) => {
  try {
    const response = await apiClient.get('/jobs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

/**
 * Fetch single job by ID
 */
export const fetchJobById = async (jobId) => {
  try {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
};

/**
 * Sync jobs from Adzuna
 */
export const syncJobsFromAdzuna = async (keyword = 'developer', location = 'us') => {
  try {
    const response = await apiClient.post('/jobs/sync-adzuna', {
      keyword,
      location,
    });
    return response.data;
  } catch (error) {
    console.error('Error syncing jobs:', error);
    throw error;
  }
};

/**
 * Get database statistics
 */
export const getStats = async () => {
  try {
    const response = await apiClient.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

/**
 * Delete job by ID
 */
export const deleteJob = async (jobId) => {
  try {
    const response = await apiClient.delete(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

export default apiClient;
