import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UploadForm from '../components/UploadForm';
import FileList from '../components/FileList';

const V1Page = () => {
  const [activeTab, setActiveTab] = useState('upload');
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Upload System - Version 1</h1>
            <p className="text-muted-foreground">
              Blocking upload - files upload synchronously before job submission
            </p>
          </div>

          {/* Version Info Card */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Version 1 Features</CardTitle>
              <CardDescription>
                Traditional synchronous upload approach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• User waits for all files to upload before job submission</li>
                <li>• Form is disabled during upload process</li>
                <li>• Real-time progress tracking during upload</li>
                <li>• Job submitted only after all files are uploaded</li>
                <li>• Sequential file processing</li>
              </ul>
            </CardContent>
          </Card> */}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="upload">Upload Form</TabsTrigger>
              <TabsTrigger value="files">File List</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-6">
              <div className="max-w-4xl mx-auto">
                <UploadForm />
              </div>
            </TabsContent>
            
            <TabsContent value="files" className="space-y-6">
              <div className="max-w-4xl mx-auto">
                <FileList active={activeTab === 'files'} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default V1Page;
