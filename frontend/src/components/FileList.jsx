import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Download, FileText, AlertCircle } from 'lucide-react';

const FileList = ({ active = true }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch files from the API
  const fetchFiles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/files`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load files on component mount and set up auto-refresh only when active
  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }

    fetchFiles();
    
    // Auto-refresh every 30 seconds to catch new uploads only when active
    const interval = setInterval(fetchFiles, 30000);
    
    return () => clearInterval(interval);
  }, [active]);

  // Refresh files
  const handleRefresh = () => {
    setRefreshing(true);
    fetchFiles();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Download file
  const handleDownload = (file) => {
    window.open(file.url, '_blank');
  };

  // Show inactive state when not active
  if (!active) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Uploaded Files</CardTitle>
          <CardDescription>Files uploaded to the server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Switch to this tab to view uploaded files</p>
            <p className="text-sm mt-2">Files are fetched only when actively viewing to save bandwidth</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin mr-3" />
          <span className="text-muted-foreground">Loading files...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>
                Manage and download your uploaded files
              </CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="h-8 px-3"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-xs">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading files: {error}
              </AlertDescription>
            </Alert>
          )}

          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
              <p className="text-muted-foreground">Files you upload will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {formatFileSize(file.size)}
                        </Badge>
                        <span>•</span>
                        <span className="truncate">{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(file)}
                    variant="outline"
                    size="sm"
                    className="ml-2 h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {files.length > 0 && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Total: {files.length} file{files.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileList;
