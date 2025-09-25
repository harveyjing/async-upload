import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, RefreshCw } from 'lucide-react';
import JobCard from './JobCard';

const JobQueue = ({ jobQueue, notifications }) => {
  const { jobs, clearCompletedJobs, removeJob } = jobQueue;

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No jobs in queue. Submit your first job above!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Job Queue ({jobs.length})</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompletedJobs}
            disabled={!jobs.some(job => job.status === 'completed' || job.status === 'failed')}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Completed
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onRemove={() => removeJob(job.id)}
            notifications={notifications}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default JobQueue;
