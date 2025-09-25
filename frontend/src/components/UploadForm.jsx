import { useState } from 'react';
import FileUpload from './FileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react';

const UploadForm = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    jobName: '',
    description: '',
    priority: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [notification, setNotification] = useState(null);

  // Handle file selection
  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
    setUploadProgress({});
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Real API function to upload a single file
  const uploadSingleFile = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress since XMLHttpRequest provides better progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });

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
              reject(new Error(errorResponse.error || `Upload failed for ${file.name}`));
            } catch (error) {
              reject(new Error(`Upload failed for ${file.name}`));
            }
          }
        };

        xhr.onerror = function() {
          reject(new Error(`Network error uploading ${file.name}`));
        };

        xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      throw new Error(`Upload failed for ${file.name}: ${error.message}`);
    }
  };

  // Upload all files
  const uploadFiles = async (files) => {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const result = await uploadSingleFile(file, (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [index]: progress
          }));
        });
        return result;
      } catch (error) {
        setUploadProgress(prev => ({
          ...prev,
          [index]: 'error'
        }));
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  // Real API function to submit job
  const submitJob = async (jobData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Job submission failed');
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please ensure the server is running.');
      }
      throw error;
    }
  };

  // Handle form submission (blocking async upload)
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (selectedFiles.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please select at least one file'
      });
      return;
    }

    try {
      // Step 1: Disable form and show loading state
      setIsSubmitting(true);
      setNotification({
        type: 'info',
        message: 'Uploading files...'
      });
      
      // Step 2: Upload files first (blocking)
      const uploadedFiles = await uploadFiles(selectedFiles);
      
      setNotification({
        type: 'info',
        message: 'Files uploaded successfully. Submitting job...'
      });
      
      // Step 3: Submit form data with file references
      const jobData = {
        ...formData,
        files: uploadedFiles.map(f => ({
          id: f.id,
          url: f.url,
          name: f.name,
          size: f.size
        }))
      };
      
      const jobResult = await submitJob(jobData);
      
      // Step 4: Show success notification
      setNotification({
        type: 'success',
        message: `Job submitted successfully! Job ID: ${jobResult.id}. All ${uploadedFiles.length} files have been uploaded.`
      });
      
      // Reset form
      setSelectedFiles([]);
      setFormData({
        jobName: '',
        description: '',
        priority: 'normal'
      });
      setUploadProgress({});
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Submission failed: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate overall upload progress
  const getOverallProgress = () => {
    const progressValues = Object.values(uploadProgress).filter(p => typeof p === 'number');
    if (progressValues.length === 0) return 0;
    return Math.round(progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length);
  };

  const isFormValid = formData.jobName.trim() && selectedFiles.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center">HPC Job Submission</CardTitle>
        <CardDescription className="text-center">
          Upload files and submit your high-performance computing job
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="jobName" className="text-sm font-medium">
                Job Name *
              </label>
              <Input
                id="jobName"
                name="jobName"
                value={formData.jobName}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Enter job name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows={3}
                placeholder="Enter job description (optional)"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Files *
            </label>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              selectedFiles={selectedFiles}
              disabled={isSubmitting}
            />
          </div>

          {/* Upload Progress */}
          {isSubmitting && Object.keys(uploadProgress).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Upload Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{getOverallProgress()}%</span>
                  </div>
                  <Progress value={getOverallProgress()} className="h-3" />
                </div>

                {/* Individual File Progress */}
                <div className="space-y-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium truncate mr-2">{file.name}</span>
                        <div className="flex items-center space-x-2">
                          {uploadProgress[index] === 'error' ? (
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          ) : uploadProgress[index] === 100 ? (
                            <Badge variant="default" className="text-xs bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {uploadProgress[index] || 0}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={uploadProgress[index] === 'error' ? 100 : (uploadProgress[index] || 0)} 
                        className={`h-2 ${uploadProgress[index] === 'error' ? '[&>div]:bg-destructive' : ''}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification */}
          {notification && (
            <Alert variant={
              notification.type === 'success' ? 'default' :
              notification.type === 'error' ? 'destructive' : 'default'
            }>
              {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
              {notification.type === 'error' && <XCircle className="h-4 w-4" />}
              {notification.type === 'info' && <AlertCircle className="h-4 w-4" />}
              <AlertDescription>
                {notification.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Job
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadForm;
