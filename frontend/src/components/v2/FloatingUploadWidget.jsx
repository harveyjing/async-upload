import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { JOB_STATUS } from './hooks/useJobQueue';
import { cn } from '@/lib/utils';

// Circular progress component
const CircularProgress = ({ progress, size = 60, strokeWidth = 4, className = "" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-foreground">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

const getStatusIcon = (status, size = 16) => {
  const className = `w-${size/4} h-${size/4}`;
  switch (status) {
    case JOB_STATUS.PENDING:
      return <Clock className={cn(className, "text-blue-500")} />;
    case JOB_STATUS.UPLOADING:
    case JOB_STATUS.SUBMITTING:
      return <Loader2 className={cn(className, "text-orange-500 animate-spin")} />;
    case JOB_STATUS.COMPLETED:
      return <CheckCircle className={cn(className, "text-green-500")} />;
    case JOB_STATUS.FAILED:
      return <AlertCircle className={cn(className, "text-red-500")} />;
    default:
      return <Clock className={cn(className, "text-gray-500")} />;
  }
};

const JobProgressItem = ({ job, onCancel }) => {
  const isActive = job.status === JOB_STATUS.PENDING || 
                   job.status === JOB_STATUS.UPLOADING || 
                   job.status === JOB_STATUS.SUBMITTING;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm mb-2">
      <div className="flex items-center gap-3">
        {/* Circular progress or status icon */}
        <div className="flex-shrink-0">
          {isActive ? (
            <CircularProgress 
              progress={job.progress.overallProgress} 
              size={48} 
              strokeWidth={3}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              {getStatusIcon(job.status, 20)}
            </div>
          )}
        </div>

        {/* Job info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{job.formData.jobName}</div>
          <div className="text-xs text-muted-foreground">
            {job.progress.filesUploaded}/{job.progress.totalFiles} files
          </div>
          {job.status === JOB_STATUS.FAILED && job.error && (
            <div className="text-xs text-red-500 truncate">{job.error}</div>
          )}
        </div>

        {/* Cancel button for active jobs */}
        {isActive && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(job.id)}
            className="flex-shrink-0 w-8 h-8 p-0 hover:bg-red-50 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const FloatingUploadWidget = ({ jobQueue }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get only active jobs (not completed or failed)
  const activeJobs = jobQueue.jobs.filter(job => 
    job.status === JOB_STATUS.PENDING || 
    job.status === JOB_STATUS.UPLOADING || 
    job.status === JOB_STATUS.SUBMITTING
  );

  // Get recent completed/failed jobs (last 3)
  const recentJobs = jobQueue.jobs
    .filter(job => job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.FAILED)
    .slice(0, 3);

  const allDisplayJobs = [...activeJobs, ...recentJobs];

  const handleCancelJob = (jobId) => {
    // TODO: Implement job cancellation logic
    console.log('Cancelling job:', jobId);
    // For now, we'll just update the job status to failed
    jobQueue.updateJobStatus(jobId, JOB_STATUS.FAILED, 'Cancelled by user');
  };

  // Don't show if no jobs
  if (allDisplayJobs.length === 0) {
    return null;
  }

  // If collapsed, show only a floating button
  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsCollapsed(false)}
          className={cn(
            "rounded-full shadow-lg transition-all duration-200",
            activeJobs.length > 0 ? "animate-pulse" : ""
          )}
          size="lg"
        >
          <Upload className="w-4 h-4 mr-2" />
          {activeJobs.length > 0 ? (
            <span>Uploading ({activeJobs.length})</span>
          ) : (
            <span>Jobs ({allDisplayJobs.length})</span>
          )}
          {activeJobs.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-white text-primary">
              {activeJobs.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-sm">Upload Progress</span>
              {activeJobs.length > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {activeJobs.length} active
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="w-6 h-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto p-3">
          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">
                Active Uploads
              </h3>
              {activeJobs.map((job) => (
                <JobProgressItem
                  key={job.id}
                  job={job}
                  onCancel={handleCancelJob}
                />
              ))}
            </div>
          )}

          {/* Recent Jobs */}
          {recentJobs.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Recent Jobs
              </h3>
              {recentJobs.map((job) => (
                <JobProgressItem
                  key={job.id}
                  job={job}
                  onCancel={null}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingUploadWidget;
