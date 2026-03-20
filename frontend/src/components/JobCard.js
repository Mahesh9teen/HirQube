import React from 'react';
import '../styles/JobCard.css';

function JobCard({ job, onClick }) {
  // Check if job was posted today
  const isNew = job && new Date() - new Date(job.postedDate) < 24 * 60 * 60 * 1000;

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="job-card" onClick={onClick}>
      {isNew && <span className="badge-new">🆕 New</span>}
      
      <div className="job-header">
        {job.companyLogo ? (
          <img 
            src={job.companyLogo} 
            alt={job.company} 
            className="company-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div className="logo-placeholder" style={{display: job.companyLogo ? 'none' : 'flex'}}>
          {job.company.charAt(0).toUpperCase()}
        </div>
        
        <div className="job-title-section">
          <h3 className="job-title">{job.title}</h3>
          <p className="company-name">{job.company}</p>
        </div>
      </div>

      <div className="job-meta">
        <span className="location">📍 {job.location}</span>
        {job.salary && (
          <span className="salary">💰 {job.salary}</span>
        )}
      </div>

      <p className="job-desc">
        {job.description ? job.description.substring(0, 100) : 'No description available'}...
      </p>

      <div className="job-footer">
        <span className="posted-date">
          📅 {formatDate(job.postedDate)}
        </span>
        <span className="source">📌 {job.source}</span>
      </div>
    </div>
  );
}

export default JobCard;
