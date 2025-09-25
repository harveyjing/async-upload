import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Zap, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Async Upload Demo</h1>
            <p className="text-xl text-muted-foreground">
              Compare synchronous vs asynchronous file upload implementations
            </p>
          </div>

          {/* Version Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Version 1 Card */}
            <Card className="relative">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  <CardTitle className="text-xl">Version 1</CardTitle>
                </div>
                <CardDescription>
                  Traditional blocking upload approach
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>• Synchronous file uploads</li>
                  <li>• User waits for completion</li>
                  <li>• Form disabled during upload</li>
                  <li>• Progress tracking</li>
                  <li>• Sequential processing</li>
                </ul>
                <Link to="/v1">
                  <Button className="w-full">
                    Try Version 1
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Version 2 Card */}
            <Card className="relative border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-primary" />
                  <CardTitle className="text-xl">Version 2</CardTitle>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    NEW
                  </span>
                </div>
                <CardDescription>
                  Modern async upload with background processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>• ✨ Instant job submission</li>
                  <li>• 🚀 Background file processing</li>
                  <li>• 📋 Job queue management</li>
                  <li>• 🔔 Real-time notifications</li>
                  <li>• 📱 Non-blocking interface</li>
                  <li>• ⚠️ In-memory state (lost on refresh)</li>
                </ul>
                <Link to="/v2">
                  <Button className="w-full" variant="default">
                    Try Version 2
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Key Differences */}
          <Card>
            <CardHeader>
              <CardTitle>Key Differences</CardTitle>
              <CardDescription>
                Understanding the benefits of asynchronous uploads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Feature</th>
                      <th className="text-left p-3">Version 1 (Sync)</th>
                      <th className="text-left p-3">Version 2 (Async)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Job Submission</td>
                      <td className="p-3">After all uploads complete</td>
                      <td className="p-3 text-green-600">✅ Immediate</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">User Experience</td>
                      <td className="p-3">Must wait for uploads</td>
                      <td className="p-3 text-green-600">✅ Continue working</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Multiple Jobs</td>
                      <td className="p-3">One at a time</td>
                      <td className="p-3 text-green-600">✅ Submit multiple</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Progress Tracking</td>
                      <td className="p-3">During upload only</td>
                      <td className="p-3 text-green-600">✅ Full job lifecycle</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">State Persistence</td>
                      <td className="p-3">Lost on refresh</td>
                      <td className="p-3 text-orange-600">⚠️ Lost on refresh</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-muted-foreground">
            <p>
              This demo showcases the difference between traditional blocking uploads
              and modern asynchronous upload patterns for better user experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
