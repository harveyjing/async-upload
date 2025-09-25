import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Upload, 
  Send, 
  CheckCircle, 
  XCircle, 
  Trash2,
  FileText,
  AlertCircle 
} from 'lucide-react';
import { JOB_STATUS } from './hooks/useJobQueue';

const JobCard = ({ job, onRemove, notifications }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case JOB_STATUS.PENDING:
        return <Clock className="w-4 h-4" />;
      case JOB_STATUS.UPLOADING:
        return <Upload className="w-4 h-4 animate-pulse" />;
      case JOB_STATUS.SUBMITTING:
        return <Send className="w-4 h-4 animate-pulse" />;
      case JOB_STATUS.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case JOB_STATUS.FAILED:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case JOB_STATUS.PENDING:
        return 'secondary';
      case JOB_STATUS.UPLOADING:
        return 'default'; // blue
      case JOB_STATUS.SUBMITTING:
        return 'default'; // blue
      case JOB_STATUS.COMPLETED:
        return 'default'; // green background will be added via className
      case JOB_STATUS.FAILED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const copyJobId = () => {
    navigator.clipboard.writeText(job.id);
    notifications.showSuccess('Job ID copied to clipboard', 2000);
  };

  const getFileStatusIcon = (fileStatus) => {
    switch (fileStatus) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'uploading':
        return <Upload className="w-3 h-3 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'failed':
        return <XCircle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="truncate">{job.formData.jobName}</span>
              <Badge 
                variant={getStatusColor(job.status)}
                className={`flex items-center gap-1 ${
                  job.status === JOB_STATUS.COMPLETED ? 'bg-green-100 text-green-800 border-green-200' : ''
                }`}
              >
                {getStatusIcon(job.status)}
                {job.status}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span 
                className="font-mono text-xs cursor-pointer hover:text-primary"
                onClick={copyJobId}
                title="Click to copy job ID"
              >
                {job.id.slice(0, 8)}...
              </span>
              <span>•</span>
              <span>{formatTimestamp(job.createdAt)}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">
                {job.formData.priority}
              </Badge>
            </div>
            {job.formData.description && (
              <p className="text-sm text-muted-foreground">{job.formData.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {(job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.FAILED) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        {(job.status === JOB_STATUS.UPLOADING || job.status === JOB_STATUS.SUBMITTING) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{job.progress.overallProgress}%</span>
            </div>
            <Progress value={job.progress.overallProgress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {job.progress.filesUploaded} of {job.progress.totalFiles} files uploaded
            </div>
          </div>
        )}

        {/* Error Message */}
        {job.status === JOB_STATUS.FAILED && job.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">{job.error}</div>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Files ({job.files.length})</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {job.files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileStatusIcon(file.status)}
                  <span className="text-sm truncate">{file.name}</span>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {formatFileSize(file.size)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {file.status === 'uploading' && (
                    <span className="text-xs text-muted-foreground">{file.progress}%</span>
                  )}
                  {file.status === 'failed' && file.error && (
                    <span 
                      className="text-xs text-destructive cursor-help" 
                      title={file.error}
                    >
                      Error
                    </span>
                  )}
                  {file.status === 'completed' && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Timestamp */}
        {job.completedAt && (
          <div className="text-xs text-muted-foreground">
            Completed: {formatTimestamp(job.completedAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard;
