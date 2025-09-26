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
          {/* Key Differences */}
          {/* <Card>
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
          </Card> */}

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
