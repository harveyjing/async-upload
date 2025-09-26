// Upload a single file with progress tracking
export const uploadSingleFile = async (file, onProgress, jobName = null) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    // Handle completion
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error(`Invalid response format for ${file.name}`));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          
          // Handle specific error cases
          if (xhr.status === 409) {
            reject(new Error(`Job directory already exists: ${errorResponse.error || 'Directory conflict'}`));
          } else if (xhr.status === 400 && errorResponse.error?.includes('X-Job-Name header')) {
            reject(new Error(`Job name is required: ${errorResponse.error}`));
          } else {
            reject(new Error(errorResponse.error || `Upload failed for ${file.name}`));
          }
        } catch (error) {
          if (xhr.status === 409) {
            reject(new Error(`Job directory already exists for ${file.name}`));
          } else if (xhr.status === 400) {
            reject(new Error(`Job name is required for ${file.name}`));
          } else {
            reject(new Error(`Upload failed for ${file.name}: HTTP ${xhr.status}`));
          }
        }
      }
    };

    // Handle network errors
    xhr.onerror = function() {
      reject(new Error(`Network error uploading ${file.name}`));
    };

    // Handle timeouts
    xhr.ontimeout = function() {
      reject(new Error(`Upload timeout for ${file.name}`));
    };

    // Set timeout (30 minutes for large files)
    xhr.timeout = 30 * 60 * 1000;

    // Start upload
    xhr.open('POST', '/api/upload');
    
    // Add job name as header if provided
    if (jobName) {
      xhr.setRequestHeader('X-Job-Name', jobName);
    }
    
    xhr.send(formData);
  });
};

// Submit job data to the server
export const submitJob = async (jobData) => {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle specific error cases
      if (response.status === 409) {
        throw new Error(`Job directory already exists: ${errorData.error || 'Directory conflict'}`);
      } else {
        throw new Error(errorData.error || 'Job submission failed');
      }
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to backend server. Please ensure the server is running.');
    }
    throw error;
  }
};

// Upload multiple files sequentially with individual progress tracking
export const uploadFiles = async (files, onFileProgress, onOverallProgress, jobName = null) => {
  const results = [];
  const totalFiles = files.length;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Update overall progress - starting file upload
      const overallProgress = Math.round((i / totalFiles) * 100);
      onOverallProgress?.(overallProgress, i, totalFiles);
      
      // Upload single file
      const result = await uploadSingleFile(file, (progress) => {
        onFileProgress?.(i, progress);
      }, jobName);
      
      results.push({ index: i, result, error: null });
      
      // Update overall progress - file completed
      const completedProgress = Math.round(((i + 1) / totalFiles) * 100);
      onOverallProgress?.(completedProgress, i + 1, totalFiles);
      
    } catch (error) {
      results.push({ index: i, result: null, error });
      onOverallProgress?.(Math.round(((i + 1) / totalFiles) * 100), i + 1, totalFiles);
    }
  }
  
  return results;
};

// Upload files in parallel (alternative approach for faster uploads)
export const uploadFilesParallel = async (files, onFileProgress, onOverallProgress, jobName = null) => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const result = await uploadSingleFile(file, (progress) => {
        onFileProgress?.(index, progress);
      }, jobName);
      return { index, result, error: null };
    } catch (error) {
      return { index, result: null, error };
    }
  });

  // Track overall progress by monitoring completed promises
  let completed = 0;
  const results = await Promise.allSettled(uploadPromises.map(async (promise) => {
    const result = await promise;
    completed++;
    const overallProgress = Math.round((completed / files.length) * 100);
    onOverallProgress?.(overallProgress, completed, files.length);
    return result;
  }));

  return results.map(result => result.value);
};
