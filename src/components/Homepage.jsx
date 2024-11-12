
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

const ALLOWED_FILE_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const HomePage = ({ onResumeUpload, onJobTarget }) => {
  const [resume, setResume] = useState(null);
  const [jobTarget, setJobTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    resume: false,
    jobTarget: false,
    fileType: false,
    fileSize: false
  });
  const navigate = useNavigate();

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, fileType: true }));
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFormErrors(prev => ({ ...prev, fileSize: true }));
      return false;
    }
    return true;
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    setFormErrors({
      resume: false,
      jobTarget: false,
      fileType: false,
      fileSize: false
    });

    if (file && validateFile(file)) {
      setResume(file);
      onResumeUpload(file);
    }
  };

  const handleJobTargetChange = (e) => {
    const value = e.target.value.trim();
    setJobTarget(value);
    onJobTarget(value);
    setFormErrors(prev => ({ ...prev, jobTarget: false }));
  };

  const handleSubmit = async () => {
    const errors = {
      resume: !resume,
      jobTarget: !jobTarget.trim(),
    };
    
    setFormErrors(prev => ({ ...prev, ...errors }));

    if (!errors.resume && !errors.jobTarget) {
      setLoading(true);
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('jobTarget', jobTarget.trim());

      try {
        const response = await fetch('http://localhost:5000/api/submit', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();

        if (response.ok) {
          navigate('/resume-score', {
            state: {
              atsScore: result.atsScore,
              questions: result.questions,
              filePath: result.filePath
            },
          });
        } else {
          throw new Error(result.error || 'Submission failed');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.homepage}>
      <div className={styles['upload-container']}>
        <h2>Upload Your Resume</h2>
        
        <div className={styles['file-upload']}>
          <input
            type="file"
            onChange={handleResumeUpload}
            className={`${styles['file-input']} ${
              (formErrors.resume || formErrors.fileType || formErrors.fileSize) 
                ? styles['input-error'] 
                : ''
            }`}
            accept=".pdf"
            disabled={loading}
          />
          {formErrors.resume && (
            <p className={styles['error-message']}>Resume is required</p>
          )}
          {formErrors.fileType && (
            <p className={styles['error-message']}>Only PDF files are allowed</p>
          )}
          {formErrors.fileSize && (
            <p className={styles['error-message']}>File size must be less than 5MB</p>
          )}
        </div>
        
        <div className={styles['input-group']}>
          <input
            type="text"
            placeholder="Target Job Position"
            value={jobTarget}
            onChange={handleJobTargetChange}
            className={`${styles['text-input']} ${
              formErrors.jobTarget ? styles['input-error'] : ''
            }`}
            disabled={loading}
          />
          {formErrors.jobTarget && (
            <p className={styles['error-message']}>Target job position is required</p>
          )}
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className={`${styles['submit-button']} ${loading ? styles['loading'] : ''}`}
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default HomePage;