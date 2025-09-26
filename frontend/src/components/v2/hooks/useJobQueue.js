import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Job statuses
export const JOB_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading', 
  SUBMITTING: 'submitting',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Job structure
const createJob = (formData, files) => ({
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  status: JOB_STATUS.PENDING,
  formData: {
    jobName: formData.jobName
  },
  files: files.map((file, index) => ({
    id: uuidv4(),
    name: file.name,
    size: file.size,
    type: file.type,
    localIndex: index,
    status: 'pending', // pending, uploading, completed, failed
    progress: 0,
    uploadedFileInfo: null, // Will contain server response after upload
    error: null
  })),
  progress: {
    filesUploaded: 0,
    totalFiles: files.length,
    overallProgress: 0
  },
  error: null,
  completedAt: null
});

export const useJobQueue = () => {
  const [jobs, setJobs] = useState([]);
  
  console.log('component mounted jobs', jobs);

  // Add a new job to the queue
  const addJob = useCallback((formData, files) => {
    const newJob = createJob(formData, files);
    console.log('addJob', newJob);
    console.log('jobs', jobs);
    
    setJobs(prevJobs => [newJob, ...prevJobs]);
    
    return newJob;  // Return the full job object instead of just ID
  }, [jobs]);

  // Update job status
  const updateJobStatus = useCallback((jobId, status, error = null) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status, 
              error,
              completedAt: (status === JOB_STATUS.COMPLETED || status === JOB_STATUS.FAILED) 
                ? new Date().toISOString() 
                : job.completedAt
            }
          : job
      )
    );
  }, []);

  // Update file status within a job
  const updateFileStatus = useCallback((jobId, fileId, updates) => {
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id !== jobId) return job;
        
        const updatedFiles = job.files.map(file =>
          file.id === fileId ? { ...file, ...updates } : file
        );
        
        // Calculate overall progress using weighted average based on file sizes
        const totalSize = updatedFiles.reduce((sum, file) => sum + file.size, 0);
        let weightedProgress = 0;
        
        if (totalSize > 0) {
          weightedProgress = updatedFiles.reduce((sum, file) => {
            const fileWeight = file.size / totalSize;
            const fileProgress = file.status === 'completed' ? 100 : file.progress || 0;
            return sum + (fileWeight * fileProgress);
          }, 0);
        }
        
        const overallProgress = Math.round(weightedProgress);
        const completedFiles = updatedFiles.filter(f => f.status === 'completed').length;
        const totalFiles = updatedFiles.length;
        
        return {
          ...job,
          files: updatedFiles,
          progress: {
            filesUploaded: completedFiles,
            totalFiles,
            overallProgress
          }
        };
      })
    );
  }, []);

  // Remove a job from the queue
  const removeJob = useCallback((jobId) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  }, []);

  // Clear all completed jobs
  const clearCompletedJobs = useCallback(() => {
    setJobs(prevJobs => 
      prevJobs.filter(job => 
        job.status !== JOB_STATUS.COMPLETED && job.status !== JOB_STATUS.FAILED
      )
    );
  }, []);

  // Auto-clear completed jobs after 5 minutes (since no persistence)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setJobs(prevJobs => {
  //       const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  //       return prevJobs.filter(job => {
  //         if ((job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.FAILED) && job.completedAt) {
  //           return new Date(job.completedAt) > fiveMinutesAgo;
  //         }
  //         return true;
  //       });
  //     });
  //   }, 60000); // Check every minute

  //   return () => clearInterval(interval);
  // }, []);

  // Get job by ID
  const getJob = useCallback((jobId) => {
    console.log('getJob', jobId);
    console.log('jobs', jobs);
    return jobs.find(job => job.id === jobId);
  }, [jobs]);

  // Get jobs by status
  const getJobsByStatus = useCallback((status) => {
    return jobs.filter(job => job.status === status);
  }, [jobs]);

  // Get statistics
  const getStats = useCallback(() => {
    const stats = {
      total: jobs.length,
      pending: 0,
      uploading: 0,
      submitting: 0,
      completed: 0,
      failed: 0
    };
    
    jobs.forEach(job => {
      stats[job.status] = (stats[job.status] || 0) + 1;
    });
    
    return stats;
  }, [jobs]);

  return {
    jobs,
    addJob,
    updateJobStatus,
    updateFileStatus,
    removeJob,
    clearCompletedJobs,
    getJob,
    getJobsByStatus,
    getStats
  };
};
