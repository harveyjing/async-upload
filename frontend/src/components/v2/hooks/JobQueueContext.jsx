import React, { createContext, useContext } from 'react';
import { useJobQueue } from './useJobQueue';

// Create the context
const JobQueueContext = createContext(null);

// Provider component
export const JobQueueProvider = ({ children }) => {
  const jobQueue = useJobQueue();
  
  return (
    <JobQueueContext.Provider value={jobQueue}>
      {children}
    </JobQueueContext.Provider>
  );
};

// Hook to use the job queue context
export const useJobQueueContext = () => {
  const context = useContext(JobQueueContext);
  if (!context) {
    throw new Error('useJobQueueContext must be used within a JobQueueProvider');
  }
  return context;
};
