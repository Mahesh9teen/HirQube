import React from 'react';
import '../styles/JobDetail.css';

function JobDetail({ job, onClose }) {
  if (!job) return null;

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="job-detail-overlay" onClick={onClose}>
      <div className="job-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="detail-header">
          {job.companyLogo ? (
            <img 
              src={job.companyLogo} 
              alt={job.company} 
              className="detail-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          <div className="logo-placeholder-detail" style={{display: job.companyLogo ? 'none' : 'flex'}}>
            {job.company.charAt(0).toUpperCase()}
          </div>

          <div className="header-content">
            <h1>{job.title}</h1>
            <p className="company-name-detail">{job.company}</p>
          </div>
        </div>

        <div className="detail-meta">
          <span>📍 {job.location}</span>
          {job.salary && <span>💰 {job.salary}</span>}
          {job.jobType && <span>⏱️ {job.jobType}</span>}
          <span>📅 {formatDate(job.postedDate)}</span>
        </div>

        <div className="detail-body">
          {job.description && (
            <>
              <h3>📝 Job Description</h3>
              <p className="description-text">
                {job.description}
              </p>
            </>
          )}

          {job.requirements && (
            <>
              <h3>✓ Requirements</h3>
              <p className="requirements-text">
                {job.requirements}
              </p>
            </>
          )}

          {job.recruiterName && (
            <div className="recruiter-info">
              <h3>👤 Recruiter</h3>
              <p><strong>{job.recruiterName}</strong></p>
              {job.recruiterLinkedin && (
                <a 
                  href={job.recruiterLinkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="linkedin-link"
                >
                  View on LinkedIn →
                </a>
              )}
            </div>
          )}
        </div>

        <div className="detail-footer">
          <a 
            href={job.applyUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="apply-btn"
          >
            🚀 Apply Now
          </a>
          <p className="source-note">
            Source: <strong>{job.source}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
