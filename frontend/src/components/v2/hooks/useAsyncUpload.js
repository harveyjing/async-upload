import { useCallback } from 'react';
import { uploadFiles, submitJob } from '../services/uploadService';
import { JOB_STATUS } from './useJobQueue';
import { useJobQueueContext } from './JobQueueContext';

export const useAsyncUpload = () => {
  const { updateJobStatus, updateFileStatus, getJob } = useJobQueueContext();

  // Process a single job through the upload pipeline
  const processJob = useCallback(async (job, selectedFiles) => {
    if (!job) {
      console.error('Job not provided');
      return;
    }
    const jobId = job.id;

    try {
      // Step 1: Start uploading files
      updateJobStatus(jobId, JOB_STATUS.UPLOADING);
      
      // Track file upload progress
      const onFileProgress = (fileIndex, progress) => {
        const file = job.files[fileIndex];
        if (file) {
          updateFileStatus(jobId, file.id, {
            status: progress === 100 ? 'completed' : 'uploading',
            progress
          });
        }
      };

      // Upload all files
      const uploadResults = await uploadFiles(
        selectedFiles,
        onFileProgress
      );

      // Check for upload failures
      const failedUploads = uploadResults.filter(result => result.error);
      if (failedUploads.length > 0) {
        // Mark failed files
        failedUploads.forEach(({ index, error }) => {
          const file = job.files[index];
          if (file) {
            updateFileStatus(jobId, file.id, {
              status: 'failed',
              error: error.message
            });
          }
        });

        // If all uploads failed, mark job as failed
        if (failedUploads.length === uploadResults.length) {
          updateJobStatus(jobId, JOB_STATUS.FAILED, 'All file uploads failed');
          return;
        }
      }

      // Step 2: Prepare job submission data
      const successfulUploads = uploadResults.filter(result => result.result);
      const jobSubmissionData = {
        ...job.formData,
        files: successfulUploads.map(({ result }) => ({
          id: result.id,
          url: result.url,
          name: result.name,
          size: result.size
        }))
      };

      // Step 3: Submit job to server
      updateJobStatus(jobId, JOB_STATUS.SUBMITTING);
      
      const submissionResult = await submitJob(jobSubmissionData);
      
      // Step 4: Mark job as completed
      updateJobStatus(jobId, JOB_STATUS.COMPLETED);
      
      // Update successful files with upload info
      successfulUploads.forEach(({ index, result }) => {
        const file = job.files[index];
        if (file) {
          updateFileStatus(jobId, file.id, {
            uploadedFileInfo: result
          });
        }
      });

      console.log('Job completed successfully:', {
        jobId,
        submissionResult,
        uploadedFiles: successfulUploads.length,
        failedFiles: failedUploads.length
      });

    } catch (error) {
      console.error('Job processing failed:', error);
      updateJobStatus(jobId, JOB_STATUS.FAILED, error.message);
    }
  }, [updateJobStatus, updateFileStatus]);

  // Queue a job for background processing
  const queueJob = useCallback((job, selectedFiles) => {
    // Process job asynchronously without blocking UI
    setTimeout(() => {
      processJob(job, selectedFiles);
    }, 100); // Small delay to allow UI to update
  }, [processJob]);

  return {
    queueJob,
    processJob
  };
};
