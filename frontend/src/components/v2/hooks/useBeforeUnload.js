import { useEffect, useRef } from 'react';
import { useJobQueueContext } from './JobQueueContext';
import { JOB_STATUS } from './useJobQueue';

/**
 * Custom hook to warn users before leaving the page when there are active jobs
 * @param {boolean} enabled - Whether the warning is enabled
 * @param {string} customMessage - Custom warning message
 */
export const useBeforeUnload = (enabled = true, customMessage = null) => {
  const { getStats } = useJobQueueContext();
  const isEnabled = useRef(enabled);

  // Update enabled state
  useEffect(() => {
    isEnabled.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Only show warning if enabled
      if (!isEnabled.current) {
        return;
      }

      // Check if there are any active jobs
      const stats = getStats();
      const hasActiveJobs = stats.pending > 0 || stats.uploading > 0 || stats.submitting > 0;

      if (hasActiveJobs) {
        // Create warning message
        const message = customMessage || 
          `You have ${stats.pending + stats.uploading + stats.submitting} active job(s) in progress. ` +
          `Leaving this page will cancel all ongoing uploads and they cannot be resumed. ` +
          `Are you sure you want to leave?`;

        // Set the return value for modern browsers
        event.preventDefault();
        event.returnValue = message;

        // For older browsers
        return message;
      }
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [getStats, customMessage]);

  // Return function to manually check if there are active jobs
  const hasActiveJobs = () => {
    const stats = getStats();
    return stats.pending > 0 || stats.uploading > 0 || stats.submitting > 0;
  };

  return {
    hasActiveJobs
  };
};
