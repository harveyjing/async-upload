import { useState } from 'react';
import FileUpload from '../FileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Upload, Clock, AlertCircle } from 'lucide-react';
import { useJobQueueContext } from './hooks/JobQueueContext';
import { useAsyncUpload } from './hooks/useAsyncUpload';
import { useNotifications } from './hooks/useNotifications';
import NotificationToast from './NotificationToast';

const UploadFormV2 = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    jobName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom hooks
  const jobQueue = useJobQueueContext();
  const asyncUpload = useAsyncUpload();
  const notifications = useNotifications();

  // Handle file selection
  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (non-blocking async)
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (selectedFiles.length === 0) {
      notifications.showError('Please select at least one file');
      return;
    }

    if (!formData.jobName.trim()) {
      notifications.showError('Please enter a job name');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Step 1: Create job in queue immediately
      const newJob = jobQueue.addJob(formData, selectedFiles);
      
      // Step 2: Show immediate feedback
      notifications.showSuccess(
        `Job "${formData.jobName}" submitted successfully! Job ID: ${newJob.id.slice(0, 8)}...`,
        4000
      );
      
      // Step 3: Queue for background processing
      asyncUpload.queueJob(newJob, selectedFiles);
      
      // Step 4: Reset form for next submission
      setSelectedFiles([]);
      setFormData({
        jobName: ''
      });
      
      // Show info about background processing
      notifications.showInfo(
        'Files are being uploaded in the background. You can submit more jobs.',
        3000
      );
      
    } catch (error) {
      notifications.showError(`Failed to submit job: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.jobName.trim() && selectedFiles.length > 0;
  const stats = jobQueue.getStats();

  return (
    <div className="w-full space-y-6">
      {/* Notification Toasts */}
      <NotificationToast notifications={notifications} />
      
      {/* Job Queue Stats */}
      {stats.total > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Job Queue Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">{stats.uploading}</div>
                <div className="text-xs text-muted-foreground">Uploading</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">{stats.submitting}</div>
                <div className="text-xs text-muted-foreground">Submitting</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">HPC Job Submission v2</CardTitle>
          <CardDescription className="text-center">
            Submit jobs instantly - files upload in the background
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Job (Async)
                </>
              )}
            </Button>

            {/* Info Alert */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Async Upload:</strong> Your job will be submitted immediately and files will upload in the background. 
                You can continue submitting more jobs without waiting.
              </AlertDescription>
            </Alert>

            {/* Warning Alert */}
            <Alert variant="default" className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Note:</strong> Jobs are stored in memory only. If you refresh the page, 
                ongoing uploads will be lost and cannot be resumed.
              </AlertDescription>
            </Alert>
          </form>
        </CardContent>
      </Card>

      {/* Job Queue */}
      {/* <JobQueue jobQueue={jobQueue} notifications={notifications} /> */}

      {/* Floating Upload Widget */}
    </div>
  );
};

export default UploadFormV2;
